const mongoose = require('mongoose');

const SalesOrderCategorySchema = new mongoose.Schema({
  categoryName: String,
  prefix: String,
  rangeFrom: String,
  rangeTo: String
},{timestamps: true});

module.exports = mongoose.model('SalesOrderCategory', SalesOrderCategorySchema);
