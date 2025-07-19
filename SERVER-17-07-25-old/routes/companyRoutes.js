const express = require('express');
const router = express.Router();
const companyController = require('../controllers/Company');

router.post('/create', companyController.createCompany);
router.get('/', companyController.getAllCompanies);

module.exports = router;
