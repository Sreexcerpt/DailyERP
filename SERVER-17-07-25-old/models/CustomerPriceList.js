const mongoose = require('mongoose');

const customerPriceListSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerCategory', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  location: { type: String, required: true },
  bum: { type: Number, required: true },
  orderUnit: { type: String, required: true },
  price:{type:String,required:true},
  salesGroup: { type: String, required: true },
  taxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax', default: null },
  tandc:String
}, { timestamps: true });

module.exports = mongoose.model('CustomerPriceList', customerPriceListSchema);
