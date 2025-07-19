const mongoose = require('mongoose');

const taxSchema = new mongoose.Schema({
  taxCode: { type: String, required: true, maxlength: 4 },
  taxName: { type: String, required: true, maxlength: 25 },
  cgst: { type: String, required: true, maxlength: 2 },
  sgst: { type: String, required: true, maxlength: 2 },
  igst: { type: String, required: true, maxlength: 2 },
}, { timestamps: true });

module.exports = mongoose.model('Tax', taxSchema);
