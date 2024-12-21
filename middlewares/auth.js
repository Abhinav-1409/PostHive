const jwt = require("jsonwebtoken");
const { secretKey } = require("../controllers/user");
const Users = require("../models/user");

async function restrictToLoggedInUsersOnly(req, res, next) {
  const token = req.cookies?.uid;
  if (!token) {
    res.redirect('login/?error="Login to Continue."');
  }
  const user = jwt.verify(token, secretKey);
  const validateUser = Users.findById(user.id);
  if (validateUser) {
    req.user = {
      id: user._id,
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
    };
    next();
  } else {
    res.redirect('login/?error="Login to Continue."');
  }
}

module.exports = restrictToLoggedInUsersOnly;