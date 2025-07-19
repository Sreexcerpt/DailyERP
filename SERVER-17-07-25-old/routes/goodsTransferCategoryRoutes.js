const express = require('express');
const router = express.Router();
const {
  createGoodsTransferCategory,
  getAllGoodsTransferCategories,
  updateGoodsTransferCategory
} = require('../controllers/goodsTransferCategoryController');

// POST - Create
router.post('/', createGoodsTransferCategory);

// GET - All
router.get('/', getAllGoodsTransferCategories);

// PUT - Update by ID
router.put('/:id', updateGoodsTransferCategory);

module.exports = router;
