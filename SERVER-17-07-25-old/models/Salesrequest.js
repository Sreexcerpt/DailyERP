const mongoose = require('mongoose');

const SalesItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  baseUnit: String,
  orderUnit: String,
  qty: Number,
  deliveryDate: String,
  location: String,
  salesGroup: String,
  materialgroup: String,
})
const SaleRequestSchema = new mongoose.Schema({
  indentId: String,
  categoryId: String,
  categoryName: String,
  items: [SalesItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('SalesRequest', SaleRequestSchema );

