const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs')
const cors = require('cors');
const categoryRoutes = require('./routes/MaterialcategoryRoutes');
const connectDB = require('./config/db');
const materialRoutes = require('./routes/Material');
const vendorCategoryRoutes = require('./routes/vendorCategoryRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const customerCategoryRoutes = require('./routes/customerCategoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const vendorPriceRoutes = require('./routes/vendorPriceListRoutes');
const taxRoutes = require('./routes/Tax');
const customerPriceRoutes = require('./routes/customerPriceListRoutes');
const purchaserequest = require('./routes/purchaserequest') // Ensure this is the correct path
const indentRoutes = require('./routes/indentRoutes');
const rfqCategoryRoutes = require('./routes/quotationCategoryRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const contractRoutes = require("./routes/contractRoutes");
const salecategoryRoutes = require('./routes/Salecategory');
const paymentRoutes = require('./routes/paymentRoutes');
const salesRequestRoutes = require('./routes/Salesrequest');
const saleQuotationCategoryRoutes = require('./routes/saleQuotationCategoryRoutes');
const salesQuotationRoutes = require('./routes/salesQuotationRoutes');
const path = require('path');
const poCategoryRoutes = require('./routes/poCategoryRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const salesOrderCategoryRoutes = require('./routes/salesOrderCategoryRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const goodsIssueCategoryRoutes = require('./routes/goodsIssueCategoryRoutes');
const goodsIssueRoutes = require('./routes/goodsissue');
const goodsTransferCategoryRoutes = require('./routes/goodsTransferCategoryRoutes');
const goodsTransferRoutes = require('./routes/goodsTransferRoutes');
const goodsReceiptRoutes = require('./routes/goodsReceiptRoutes');
const goodsReceiptCategoryRoutes = require('./routes/goodsReceiptCategoryRoutes');
const locationRoutes = require('./routes/locationRoutes'); // Ensure this is the correct path
const invoiceCategoryRoutes = require('./routes/invoiceCategoryRoutes');
const billingCategoryRoutes = require('./routes/billingCategoryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const billingRoutes = require('./routes/billingRoutes');
const stockRoutes = require('./routes/stockRoute'); // Ensure this is the correct path
const userRoutes = require('./routes/userRoutes'); // Ensure this is the correct path
const companyRoutes = require('./routes/companyRoutes'); // Ensure this is the correct path
const roleRoutes = require('./routes/Rolebased'); // Ensure this is the correct path
const permissionroutes = require('./routes/permissionRoutes'); // Ensure this is the correct path
const generalConditionRoutes = require('./routes/Generalcondition');
const processRoutes = require('./routes/Processlist');
const saleContractCategoryRoutes = require('./routes/saleContractCategoryRoutes');
const salesContractRoutes = require('./routes/salesContractRoutes');


//CRM
const contactRoutes = require('./routes/contactRoutes'); // Ensure this is the correct path
const leadRoutes = require('./routes/leadRoutes');
const proposalRoutes = require('./routes/ProposalRoutes');




//HRMS

const departmentRoutes = require('./routes/hrms/department')
const employeeRoutes = require('./routes/hrms/employeeroutes')
const designationRoutes = require('./routes/hrms/designation')

const salaryRoutes = require("./routes/hrms/salary"); const leaveRoutes = require('./routes/hrms/Leave');


const app = express();
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));
// In your server.js or app.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// In your server
connectDB();
app.use('/api/users', userRoutes);
// Server side - add logging to your existing endpoint
app.get('/api/image/:filename', (req, res) => {
  console.log('=== IMAGE API CALLED ===');
  console.log('Requested filename:', req.params.filename);

  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  console.log('Full filepath:', filepath);
  console.log('File exists:', fs.existsSync(filepath));

  if (fs.existsSync(filepath)) {
    console.log('Sending file:', filepath);
    res.sendFile(filepath);
  } else {
    console.log('File not found, checking directory contents...');
    try {
      const files = fs.readdirSync(path.join(__dirname, 'uploads'));
      console.log('Files in uploads directory:', files);
    } catch (err) {
      console.log('Error reading uploads directory:', err);
    }
    res.status(404).send('File not found');
  }
});



app.use('/api/category', categoryRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/vendor-categories', vendorCategoryRoutes);
app.use('/api/vendors', vendorRoutes);

app.use('/api/customer-categories', customerCategoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tax', taxRoutes);

app.use('/api/vendor-price-lists', vendorPriceRoutes);
app.use('/api', paymentRoutes);
app.use('/api/customer-price-lists', customerPriceRoutes);
app.use('/api/purchasecategory', purchaserequest);
app.use('/api/rfq-categories', rfqCategoryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/salecategory', salecategoryRoutes);
app.use('/api/salerequest', salesRequestRoutes);
app.use('/api/sale-quotation-categories', saleQuotationCategoryRoutes);
app.use('/api/sale-contract-categories', saleContractCategoryRoutes);
app.use('/api/salescontracts', salesContractRoutes);
app.use('/api/salesquotations', salesQuotationRoutes);
app.use('/api/indent', indentRoutes);
app.use('/api/po-categories', poCategoryRoutes);

app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/sales-order-categories', salesOrderCategoryRoutes);
app.use('/api', salesOrderRoutes);
app.use('/api/goodsissuecategory', goodsIssueCategoryRoutes);
app.use('/api/goodsissue', goodsIssueRoutes);
app.use('/api/goodsTransferCategory', goodsTransferCategoryRoutes);
app.use('/api/goodstransfer', goodsTransferRoutes);
app.use('/api', goodsReceiptRoutes);
app.use('/api/goodsreceiptcategory', goodsReceiptCategoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/invoicecategory', invoiceCategoryRoutes);
app.use('/api/billingcategory', billingCategoryRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', stockRoutes); // Ensure this is the correct path for stock routes
app.use('/api', billingRoutes);
app.use('/api/purchase-contract-categories', require('./routes/PurchaseContractCategoryRoutes'));
app.use('/api/companies', companyRoutes); // Ensure this is the correct path for company routes

app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionroutes); // Ensure this is the correct path for permission routes

app.use('/api/general-conditions', generalConditionRoutes);
app.use('/api/processes', processRoutes);




// CRM routes
app.use('/api/contacts', contactRoutes); // Ensure this is the correct path for contact routes
app.use('/api/leads', leadRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/crm/sources', require('./routes/sources'));
app.use('/api/crm/lost-reasons', require('./routes/lostReasons'));
app.use('/api/crm/contact-stages', require('./routes/contactStages'));
app.use('/api/crm/industries', require('./routes/industries'));
app.use('/api/crm/calls', require('./routes/calls'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/milestones', require('./routes/milestones'));
app.use('/api/time-entries', require('./routes/timeEntries'));
app.use('/api/campaigns', require('./routes/campaigns'));






// HRMS

app.use('/api', departmentRoutes);
app.use("/api/faculties", employeeRoutes);


app.use('/api/designations', designationRoutes);

app.use('/api/leave', leaveRoutes);



app.use("/api/salary-records", salaryRoutes);




const masterDataImportRoutes = require('./routes/master-data-import');

// API Routes
app.use('/api/master-data', masterDataImportRoutes);

app.use(express.static(path.join(__dirname, 'dist')));

// Fallback route for SPA (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
