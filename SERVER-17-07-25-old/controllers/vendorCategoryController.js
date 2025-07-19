const VendorCategory = require('../models/VendorCategory');

// Create
exports.createVendorCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeFrom, rangeTo } = req.body;

    const newCategory = new VendorCategory({
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
exports.getAllVendorCategories = async (req, res) => {
  try {
    const categories = await VendorCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get by ID
exports.getVendorCategoryById = async (req, res) => {
  try {
    const category = await VendorCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updateVendorCategory = async (req, res) => {
  try {
    const updated = await VendorCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete
exports.deleteVendorCategory = async (req, res) => {
  try {
    await VendorCategory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
