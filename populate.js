require("dotenv").config();

const connectDB = require("./db/connect");
const Product = require("./models/product");
const data = require("./products.json");
const url = process.env.MONGO_URI;
const start = async () => {
  try {
    await connectDB(url);
    await Product.deleteMany();
    await Product.create(data);
    console.log("Success");
  } catch (error) {
    console.log(error);
  }
};

start();
