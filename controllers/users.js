const passport = require("passport");
const User = require("../models/user");

module.exports.registerForm = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await User.register(
      new User({ username, email }),
      password
    );
    console.log(newUser);
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelpcamp");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.loginForm = (req, res) => {
  res.render("users/login");
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "welcome back");
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((e) => {
    if (e) {
      return next(e);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
