const GoodsReceiptCategory = require('../models/GoodsReceiptCategory');

// @desc    Create new goods receipt category
// @route   POST /api/goodsreceiptcategory
// @access  Public
const createGoodsReceiptCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    if (!categoryName || !prefix || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new GoodsReceiptCategory({ categoryName, prefix, rangeStart, rangeEnd });
    await category.save();

    res.status(201).json({ message: 'Goods Receipt Category created successfully', category });
  } catch (error) {
    console.error('Error creating goods receipt category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all goods receipt categories
// @route   GET /api/goodsreceiptcategory
const getAllGoodsReceiptCategories = async (req, res) => {
  try {
    const categories = await GoodsReceiptCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update a goods receipt category
// @route   PUT /api/goodsreceiptcategory/:id
const updateGoodsReceiptCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    const updated = await GoodsReceiptCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, prefix, rangeStart, rangeEnd },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

module.exports = {
  createGoodsReceiptCategory,
  getAllGoodsReceiptCategories,
  updateGoodsReceiptCategory
};
