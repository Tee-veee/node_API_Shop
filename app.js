require("dotenv").config();

const express = require("express");
const app = express();
const connectDB = require("./db/connect");
const productRouter = require("./routes/products");

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

const port = process.env.PORT || 3000;
const dbURL = process.env.MONGO_URI;
// MIDDLEWARE
app.use(express.json());

// ROUTES
app.get("/", (req, res) => {
  res.send('<h1>Store API</h1><a href="/api/v1/products">Product Route</a>');
});

app.use("/api/v1/products", productRouter);

// PRODUCT ROUTE

// MIDDLEWARE
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(dbURL);
    app.listen(port, console.log(`Server listening on port: ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
