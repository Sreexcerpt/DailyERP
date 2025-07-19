const CustomerCategory = require('../models/CustomerCategory');

// Create
exports.createCustomerCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeFrom, rangeTo } = req.body;

    const newCategory = new CustomerCategory({
      categoryName,
      prefix,
      rangeFrom,
      rangeTo
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all
exports.getAllCustomerCategories = async (req, res) => {
  try {
    const categories = await CustomerCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
exports.getCustomerCategoryById = async (req, res) => {
  try {
    const category = await CustomerCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateCustomerCategory = async (req, res) => {
  try {
    const updated = await CustomerCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
exports.deleteCustomerCategory = async (req, res) => {
  try {
    await CustomerCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
