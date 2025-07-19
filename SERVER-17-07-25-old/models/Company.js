const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
  name: String
});
module.exports = mongoose.model('Company', companySchema);

