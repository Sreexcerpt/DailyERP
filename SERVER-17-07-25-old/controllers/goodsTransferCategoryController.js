const GoodsTransferCategory = require('../models/GoodsTransferCategory');

// Create new category
const createGoodsTransferCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    if (!categoryName || !prefix || rangeStart == null || rangeEnd == null) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newCategory = new GoodsTransferCategory({
      categoryName,
      prefix,
      rangeStart,
      rangeEnd
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all categories
const getAllGoodsTransferCategories = async (req, res) => {
  try {
    const categories = await GoodsTransferCategory.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update category
const updateGoodsTransferCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    const updated = await GoodsTransferCategory.findByIdAndUpdate(
      id,
      { categoryName, prefix, rangeStart, rangeEnd },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Category not found' });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGoodsTransferCategory,
  getAllGoodsTransferCategories,
  updateGoodsTransferCategory
};
