const Company = require('../models/Company');

exports.createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const company = new Company({ name });
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(500).json({ error: 'Company creation failed' });
  }
};

exports.getAllCompanies = async (req, res) => {
  const companies = await Company.find();
  res.json(companies);
};
