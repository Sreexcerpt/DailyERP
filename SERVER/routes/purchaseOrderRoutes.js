const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.post('/', purchaseOrderController.createPO);
router.get('/', purchaseOrderController.getAllPOs);
router.get('/:id', purchaseOrderController.getPOById);

module.exports = router;
