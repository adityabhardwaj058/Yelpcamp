const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const users = require("../controllers/users.js");
const passport = require("passport");
const { storeReturnTo } = require("../middleware.js");

router
  .route("/register")
  .get(users.registerForm)
  .post(catchAsync(users.registerUser));

router
  .route("/login")
  .get(users.loginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loginUser
  );

router.get("/logout", users.logoutUser);

module.exports = router;
