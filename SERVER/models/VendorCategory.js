const mongoose = require('mongoose');

const vendorCategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    required: true
  },
  rangeFrom: {
    type: Number,
    required: true
  },
  rangeTo: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('VendorCategory', vendorCategorySchema);
