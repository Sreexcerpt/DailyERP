const express = require('express');
const getAllItems = require('../controllers/stockController').getAllItems; // Importing the controller function
const router = express.Router();

// Example GET route for fetching stock data
router.get('/stock', getAllItems);

module.exports = router;