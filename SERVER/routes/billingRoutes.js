const express = require('express');
const router = express.Router();
const {
  createBilling,
  getAllBillings
} = require('../controllers/billingController');
const billingController = require('../controllers/billingController');
router.post('/billingform', createBilling);
router.get('/billingform', getAllBillings);
router.get('/billingform/:id', billingController.getBillingById);
router.put('/billingform/:id', billingController.updateBilling);
module.exports = router;
