const mongoose = require('mongoose');

const saleQuotationCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  prefix: { type: String, required: true },
  rangeFrom: { type: Number, required: true },
  rangeTo: { type: Number, required: true }
});

module.exports = mongoose.model('SaleQuotationCategory', saleQuotationCategorySchema);
