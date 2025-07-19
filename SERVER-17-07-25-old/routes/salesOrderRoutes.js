// routes/salesOrderRoutes.js
const express = require('express');
const router = express.Router();
const salesOrderController = require('../controllers/salesOrderController');

router.post('/sales-orders', salesOrderController.createSalesOrder);
router.get('/sales-orders', salesOrderController.getAllSalesOrders);

module.exports = router;