const crypto = require("crypto");
const path = require("path");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = "PostHiveDev@AAA";

async function handleUserLogIn(req, res) {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: email });
  if (user == null) {
    return res.redirect('signup/?error="Invalid Username or Password"');
  }

  const salt = user.salt;
  const hash = crypto.createHash("sha256", salt);
  const hashedPassword = hash.update(password).digest("hex");

  if (hashedPassword == user.password) {
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
      },
      secretKey
    );
    res.cookie("uid", token, { maxAge: 24 * 60 * 1000 });
    return res.redirect("/");
  } else {
    res.redirect('login/?error="Invalid Username or Password"');
  }
}

async function handleUserSignUp(req, res) {
  try {
    const uniqueSuffix = `${req.body.email}`;
    const profileImageUrl = req.file
      ? `/uploads/${req.file.fieldname}-${uniqueSuffix}${path.extname(
          req.file.originalname
        )}`
      : null;
    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      profileImageUrl: profileImageUrl,
    });
    await user.save();
  } catch (err) {
    return res.redirect(`login/?error=${encodeURIComponent(err.message)}`); // Redirect on error with encoded message
  }
  return res.redirect(
    "login/?error='Successfully Registered. Login in to Continue'"
  );
}

async function handleGetUserProfile(req, res) {
  try {
    var userId = jwt.verify(req.cookies?.uid, secretKey).id;
  } catch (err) {
    res.clearCookie("uid");
    return res.redirect("login/?error='Login in to Continue'");
  }
  const userData = await Users.findById(userId);
  if (userData == null) {
    res.clearCookie("uid");
    return res.redirect("login/?error='Login in to Continue'");
  }
  const data = {
    name: userData.name,
    email: userData.email,
    profileImageUrl: userData.profileImageUrl,
  };
  res.render("profilePage", { data: data, error: req.query.error });
}

async function handleEditUserProfile(req, res) {
  try {
    var user = jwt.verify(req.cookies?.uid, secretKey);
  } catch (err) {
    res.clearCookie("uid");
    return res.redirect("login/?error='Login in to Continue'");
  }
  const uniqueSuffix = `${user.email}`;
  const profileImageUrl = req.file
    ? `/uploads/${req.file.fieldname}-${uniqueSuffix}${path.extname(
        req.file.originalname
      )}`
    : null;
  await Users.findByIdAndUpdate(user.id, {
    name: req.body.newName,
    profileImageUrl: profileImageUrl,
  });
  return res.redirect("profile?error='Profile Updated Successfully.'");
}

async function handleDeleteUser(req, res) {
  const userId = jwt.verify(req.cookies?.uid, secretKey).id;
  await Users.findByIdAndDelete(userId);
  // delete all post related to user -- implementation pending
  res.redirect('login/?error="Account Deleted Successfully"');
}

async function handleChangePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  try {
    var userId = jwt.verify(req.cookies?.uid, secretKey).id;
  } catch (err) {
    res.clearCookie("uid");
    return res.redirect("login/?error='Login in to Continue'");
  }
  const user = await Users.findById(userId);
  const salt = user.salt;
  const hash = crypto.createHash("sha256", salt);
  const hashedPassword = hash.update(currentPassword).digest("hex");
  if (hashedPassword == user.password) {
    const hash = crypto.createHash("sha256", salt);
    const password = hash.update(newPassword).digest("hex");
    await Users.findByIdAndUpdate(userId, { password: password });
    res.redirect("profile?error='Password Updated Successfully.'");
  } else {
    res.redirect("profile?error='Wrong Current Password. Failed to Update.'");
  }
}

async function handleLogout (req, res) {
  res.clearCookie("uid");
  res.redirect("login/?error='Logged Out Successfully'");
};

module.exports = {
  handleGetUserProfile,
  handleEditUserProfile,
  handleUserLogIn,
  handleUserSignUp,
  handleDeleteUser,
  handleChangePassword,
  handleLogout,
  secretKey,
};
