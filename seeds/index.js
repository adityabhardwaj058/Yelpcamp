const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randomPrice = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "67209c286607ab733c924dd7",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dbynnftwi/image/upload/v1730291730/YelpCamp/mdxl5fbwfx5jnky2b7bv.jpg",
          filename: "YelpCamp/vrqvjakputjsnfu49erw",
        },
        {
          url: "https://res.cloudinary.com/dbynnftwi/image/upload/v1730292007/YelpCamp/lrt3mlilkjm6fdi7v0yz.jpg",
          filename: "YelpCamp/voko7jecenbfn6h3xck9",
        },
      ],
      description: `    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sint expedita mollitia esse culpa, numquam cupiditate. Ab reiciendis hic aut amet molestias possimus, exercitationem nostrum quia sequi et enim non cumque.`,
      price: randomPrice,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
