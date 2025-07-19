const QuotationCategory = require('../models/QuotationCategory');

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeFrom, rangeTo } = req.body;
    const newCategory = new QuotationCategory({ categoryName, prefix, rangeFrom, rangeTo });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create RFQ category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await QuotationCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch RFQ categories' });
  }
};
exports.updateCategory = async (req, res) => {
    try {
      const updated = await QuotationCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  };
  
