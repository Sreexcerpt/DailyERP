const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  materialId: String,
  description: String,
  quantity: Number,
  baseUnit: String,
  unit: String,
  orderUnit: String,
  price: Number,
  priceUnit: String,
  deliveryDate: String,
});

const SalesOrderSchema = new mongoose.Schema({
  soNumber: String,
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesQuotation' },
  quotationNumber: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrderCategory' },
  category: String,
  date: String,
  customerName: String,
  deliveryLocation: String,
  deliveryAddress: String,
  items: [ItemSchema],
  total: Number,
  taxName: String,
  cgst: Number,
  sgst: Number,
  igst: Number,
  taxDiscount: Number,
  finalTotal: Number,
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', SalesOrderSchema);