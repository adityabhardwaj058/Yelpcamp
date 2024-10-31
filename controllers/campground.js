const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    {
      limit: 1,
    }
  );
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a new campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  console.log(campground);
  if (!campground) {
    req.flash("error", "Cannot find Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditCampgroundForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    {
      limit: 1,
    }
  );
  camp.geometry = geoData.features[0].geometry;
  images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.images.push(...images);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(camp);
  }
  req.flash("success", "successfully updated campground");
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  for (let image of campground.images) {
    await cloudinary.uploader.destroy(image.filename);
  }
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Deleted Campground");
  res.redirect("/campgrounds");
};
