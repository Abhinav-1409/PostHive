const mongoose = require("mongoose");
const crypto = require("crypto");

const uri =
  "mongodb+srv://PostHive:PostHiveDev@data.5veo4.mongodb.net/PostHive?retryWrites=true&w=majority&appName=data";

mongoose
  .connect(uri)
  .then(() => {
    console.log("User DataBase Connected");
  })
  .catch((err) => {
    console.log("Error");
  });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  salt: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: "/images/defaultProfileImage.png",
  },
});

//Encrypting password
userSchema.pre("save", function (next) { 
    const user = this;
    if (!this.isModified("password")) return next(); //isModified is In-built Mongoose Function

    const salt = crypto.randomBytes(10);
    const hash = crypto.createHash("sha256",salt);
    const hashedPassword = hash.update(user.password).digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    next();
});


const User = mongoose.model("User", userSchema);
module.exports = User;
