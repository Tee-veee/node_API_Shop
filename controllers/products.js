const asyncWrapper = require("../middleware/async");
const { createCustomError } = require("../errors/custom-error");

const Product = require("../models/product");

// STATIC FOR TESTING
const getAllProductsStatic = asyncWrapper(async (req, res, next) => {
  const products = await Product.find({}).sort("-name price");

  if (!products) {
    next(createCustomError("No products found", 404));
  }

  res.status(200).json({ products, nbHits: products.length });
});

// DYNAMIC
const getAllProducts = asyncWrapper(async (req, res, next) => {
  const { featured, company, name, sort, fields, numFilters } = req.query;

  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const numFilterRegex = /\b(<|>|<=|>=|=)\b/g;

    let filterRegex = numFilters.replace(
      numFilterRegex,
      (match) => `-${operatorMap[match]}`
    );

    const filterOptions = ["price", "rating"];

    filterRegex = filterRegex.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");

      if (filterOptions.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  let results = Product.find(queryObject);

  if (sort) {
    const sortedList = sort.split(",").join(" ");
    results = results.sort(sortedList);
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    results = results.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  results = results.skip(skip).limit(limit);

  const products = await results;

  if (!products) {
    return next(createCustomError("No Products", 404));
  }

  res.status(200).json({ products, nbHits: products.length });
});

module.exports = {
  getAllProductsStatic,
  getAllProducts,
};
