const Campground = require("./models/campground");
const Review = require("./models/review");
const {
  campgroundValidationSchema,
  reviewValidationSchema,
} = require("./validationSchemas");
const ExpressError = require("./utils/ExpressError");

const isLoggedIn = (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const isAuthorized = campground.author.equals(req.user._id);
  if (!isAuthorized) {
    req.flash("error", "You do not have permission");
    return res.redirect(`/campgrounds/${campground._id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  const isAuthorized = review.author.equals(req.user._id);
  if (!isAuthorized) {
    req.flash("error", "You do not have permission");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const validateCampground = (req, res, next) => {
  const result = campgroundValidationSchema.validate(req.body);
  const { error } = result;

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};

const validateReview = (req, res, next) => {
  const result = reviewValidationSchema.validate(req.body);
  const { error } = result;
  if (error) {
    const msg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(msg, 400);
  } else next();
};

module.exports = {
  isLoggedIn,
  storeReturnTo,
  isAuthor,
  validateCampground,
  validateReview,
  isReviewAuthor,
};
