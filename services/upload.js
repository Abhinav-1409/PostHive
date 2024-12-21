const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { secretKey } = require("../controllers/user");

// Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Resolve the path for the uploads directory
    const uploadPath = path.resolve(__dirname, "../public/uploads/");

    // Ensure the directory exists, create it if not
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create directory recursively
    }

    cb(null, uploadPath); // Directory where files will be saved
  },
  filename: function (req, file, cb) {
    // Use the email as part of the filename
    var uniqueSuffix = `${req.body.email}`;
    if (req.cookies?.uid) {
      uniqueSuffix = `${jwt.verify(req.cookies.uid, secretKey).email}`;
    }
    const fileExtension = path.extname(file.originalname); // Extract file extension
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension); // Add extension to filename
  },
});

// Configure multer
const upload = multer({ storage: storage });

module.exports = upload;
