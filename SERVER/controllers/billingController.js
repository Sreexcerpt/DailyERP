const Billing = require('../models/Billing');
const BillingCategory = require('../models/BillingCategory');

// POST /api/Billingform
const createBilling = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await BillingCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const BillingCount = await Billing.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + BillingCount;

    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    const docnumber = `${category.prefix}-${nextNumber}`;

//     // Calculate totalAmount & finalTotal
//     const totalAmount = data.items?.reduce((sum, item) => {
//       return sum + ((item.quantity || 0) * (item.price || 0));
//     }, 0);

//   const cgstPercent = parseFloat(data.cgst || 0);
// const sgstPercent = parseFloat(data.sgst || 0);
// const igstPercent = parseFloat(data.igst || 0);
// const discount = parseFloat(data.discount || 0);

// const cgstAmt = (cgstPercent / 100) * totalAmount;
// const sgstAmt = (sgstPercent / 100) * totalAmount;
// const igstAmt = (igstPercent / 100) * totalAmount;

// const finalTotal = parseFloat((totalAmount + cgstAmt + sgstAmt + igstAmt - discount).toFixed(2));

//     const newBilling = new Billing({
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

    const cgstPercent = parseFloat(data.cgst || 0);
    const sgstPercent = parseFloat(data.sgst || 0);
    const igstPercent = parseFloat(data.igst || 0);

    // ✅ 3. Calculate tax on discounted amount
    const cgstAmt = (cgstPercent / 100) * netAmount;
    const sgstAmt = (sgstPercent / 100) * netAmount;
    const igstAmt = (igstPercent / 100) * netAmount;

    // ✅ 4. Final total
    const finalTotal = netAmount + cgstAmt + sgstAmt + igstAmt;

    const newBilling = new Billing({
      ...data,
      docnumber,
      finalTotal: parseFloat(finalTotal.toFixed(2))  // Optional rounding
    })

    await newBilling.save();
    res.status(201).json({ message: "Billing created", docnumber });
  } catch (err) {
    console.error("Error creating Billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// GET /api/Billingform
const getAllBillings = async (req, res) => {
  try {
    const Billings = await Billing.find().sort({ createdAt: -1 });
    res.json(Billings);
  } catch (err) {
    console.error("Error fetching Billings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createBilling,
  getAllBillings
};
