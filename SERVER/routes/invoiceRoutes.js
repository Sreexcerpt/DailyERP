const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices
} = require('../controllers/invoiceController');

router.post('/invoiceform', createInvoice);
router.get('/invoiceform', getAllInvoices);

module.exports = router;
