const POCategory = require('../models/POCategory');

// Create PO Category
exports.createCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeFrom, rangeTo } = req.body;
    const newCategory = new POCategory({ categoryName, prefix, rangeFrom, rangeTo });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create PO category' });
  }
};

// Get All PO Categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await POCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PO categories' });
  }
};

// Update PO Category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await POCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PO category' });
  }
};
