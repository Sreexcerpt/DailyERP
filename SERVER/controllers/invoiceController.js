const Invoice = require('../models/Invoice');
const InvoiceCategory = require('../models/InvoiceCategory');

// POST /api/invoiceform
const createInvoice = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await InvoiceCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const invoiceCount = await Invoice.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + invoiceCount;

    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    const docnumber = `${category.prefix}-${nextNumber}`;

//     // Calculate totalAmount & finalTotal
//     const totalAmount = data.items?.reduce((sum, item) => {
//       return sum + ((item.quantity || 0) * (item.price || 0));
//     }, 0);

//     const cgstPercent = parseFloat(data.cgst || 0);
// const sgstPercent = parseFloat(data.sgst || 0);
// const igstPercent = parseFloat(data.igst || 0);
// const discount = parseFloat(data.discount || 0);

// const cgstAmt = (cgstPercent / 100) * totalAmount;
// const sgstAmt = (sgstPercent / 100) * totalAmount;
// const igstAmt = (igstPercent / 100) * totalAmount;

// const finalTotal = parseFloat((totalAmount + cgstAmt + sgstAmt + igstAmt - discount).toFixed(2));



//     const newInvoice = new Invoice({
//       ...data,
//       docnumber,
//       finalTotal
//     });

// ✅ 1. Calculate totalAmount
    const totalAmount = data.items?.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);

    const discount = parseFloat(data.discount || 0);

    // ✅ 2. Net amount after discount
    const netAmount = totalAmount - discount;

    // const cgstPercent = parseFloat(data.cgst || 0);
    // const sgstPercent = parseFloat(data.sgst || 0);
    // const igstPercent = parseFloat(data.igst || 0);

    // // ✅ 3. Calculate tax on discounted amount
    // const cgstAmt = (cgstPercent / 100) * netAmount;
    // const sgstAmt = (sgstPercent / 100) * netAmount;
    // const igstAmt = (igstPercent / 100) * netAmount;

    // // ✅ 4. Final total
    // const finalTotal = netAmount + cgstAmt + sgstAmt + igstAmt;

    const newInvoice = new Invoice({
      ...data,
      docnumber,
    });

    await newInvoice.save();
    res.status(201).json({ message: "Invoice created", docnumber });
  } catch (err) {
    console.error("Error creating invoice:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// GET /api/invoiceform
const getAllInvoices = async (req, res) => {
  try {
         const { companyId, financialYear } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices
};
