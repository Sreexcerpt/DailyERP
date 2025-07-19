const express = require('express');
const router = express.Router();
const {
  createBilling,
  getAllBillings
} = require('../controllers/billingController');

router.post('/billingform', createBilling);
router.get('/billingform', getAllBillings);

module.exports = router;
