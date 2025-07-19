const express = require('express');
const router = express.Router();
const vendorPriceListController = require('../controllers/vendorPriceListController');

router.post('/', vendorPriceListController.createVendorPrice);
router.get('/', vendorPriceListController.getAllVendorPrices);
router.get('/:id', vendorPriceListController.getVendorPriceById);
router.put('/:id', vendorPriceListController.updateVendorPriceList);


module.exports = router;
