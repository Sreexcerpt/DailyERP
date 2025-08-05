const PurchaseOrder = require('../models/PurchaseOrder');
const POCategory = require('../models/POCategory');
const Quotation = require('../models/Quotation');

async function generatePONumber(categoryId) {
  try {
    const category = await POCategory.findById(categoryId);
    if (!category) throw new Error('PO Category not found');
    
    const prefix = category.prefix;
    console.log('Category prefix:', prefix);
    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);
    
    // Find ALL POs for this category to determine the highest number
    const existingPOs = await PurchaseOrder.find({ 
      categoryId,
      poNumber: { $regex: `^${prefix}-` } // Only get POs with the correct prefix
    }).select('poNumber');
    
    let nextNumber = category.rangeFrom;
    
    if (existingPOs.length > 0) {
      console.log('Found existing POs:', existingPOs.length);
      
      // Extract all numbers and find the maximum
      const usedNumbers = existingPOs
        .map(po => {
          const numberPart = po.poNumber.split('-').pop();
          return parseInt(numberPart, 10);
        })
        .filter(num => !isNaN(num)); // Filter out invalid numbers
      
      if (usedNumbers.length > 0) {
        const maxUsedNumber = Math.max(...usedNumbers);
        console.log('Highest used number:', maxUsedNumber);
        nextNumber = maxUsedNumber + 1;
      }
    }
    
    console.log('Next number to use:', nextNumber);
    
    if (nextNumber > category.rangeTo) {
      throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }
    
    const generatedPONumber = `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
    console.log('Generated PO Number:', generatedPONumber);
    
    // Optional: Add a check to ensure this number doesn't already exist
    const existingPO = await PurchaseOrder.findOne({ poNumber: generatedPONumber });
    if (existingPO) {
      throw new Error(`PO number ${generatedPONumber} already exists`);
    }
    
    return generatedPONumber;
  } catch (error) {
    console.error('Error in generatePONumber:', error);
    throw error;
  }
}


// Alternative approach: Use a counter field in the category
async function generatePONumberWithCounter(categoryId) {
  try {
    const category = await POCategory.findById(categoryId);
    if (!category) throw new Error('PO Category not found');
    
    // Initialize counter if it doesn't exist
    if (!category.currentCounter) {
      category.currentCounter = category.rangeFrom;
    }
    
    const nextNumber = category.currentCounter;
    
    if (nextNumber > category.rangeTo) {
      throw new Error(`PO number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeTo}`);
    }
    
    // Increment counter for next use
    category.currentCounter = nextNumber + 1;
    await category.save();
    
    const generatedPONumber = `${category.prefix}-${nextNumber.toString().padStart(6, '0')}`;
    console.log('Generated PO Number:', generatedPONumber);
    
    return generatedPONumber;
  } catch (error) {
    console.error('Error in generatePONumberWithCounter:', error);
    throw error;
  }
}

// Updated createPO function with better error handling
exports.createPO = async (req, res) => {
  try {
    const {
      quotationNumber,
      categoryId,
      category,
      date,
      deliveryLocation,
      deliveryAddress,
      taxName,
      cgst,
      sgst,
      igst,
      notes,
      remarks,
      preparedby,
      approvedby,
      processes,
      items,
      generalConditions,
      taxDiscount,
      finalTotal,
      companyId,
      financialYear,
      vendor,
      poGenerationType,
      poNumber: externalPONumber
    } = req.body;

    console.log("Purchase order request:", req.body);

    // ✅ Step 1: Find quotation by quotationNumber
    // const quotation = await Quotation.findOne({ quotationNumber });
    // if (!quotation) return res.status(404).json({ error: 'Quotation not found' });

    // ✅ Step 2: Generate or use PO number based on type
    let poNumber;

    if (poGenerationType === 'external') {
      // Use external PO number
      if (!externalPONumber) {
        return res.status(400).json({ error: 'External PO number is required' });
      }
      
      poNumber = externalPONumber;

      // Check if external PO number already exists
      const existingPO = await PurchaseOrder.findOne({ poNumber });
      if (existingPO) {
        return res.status(400).json({ error: 'PO number already exists' });
      }
    } else {
      // Generate internal PO number
      if (!categoryId) {
        return res.status(400).json({ error: 'Category ID is required for internal PO generation' });
      }
      
      try {
        poNumber = await generatePONumber(categoryId);
        console.log('Generated PO Number:', poNumber);
      } catch (error) {
        console.error('Error generating PO number:', error);
        return res.status(500).json({ error: `Failed to generate PO number: ${error.message}` });
      }
    }



    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // ✅ Step 4: Save PO with additional fields
    const newPO = new PurchaseOrder({
      poNumber,
      categoryId,
      category,
      date,
      vendor,
      notes,
      deliveryLocation: deliveryLocation  || '',
      deliveryAddress,
      // quotationId: quotation._id,
      quotationNumber,
      items,
      total,
      processes,
      generalConditions,
      remarks,
      preparedby,
      approvedby,
      taxName,
      cgst,
      sgst,
      igst,
      taxDiscount,
      finalTotal,
      financialYear,
      companyId,
      poGenerationType
    });

    const saved = await newPO.save();
    console.log('PO saved successfully:', saved.poNumber);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating PO:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Purchase Orders
exports.getAllPOs = async (req, res) => {
  try {
     const { companyId, financialYear } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

  
    const pos = await PurchaseOrder.find(filter).populate('categoryId quotationId companyId');
    res.status(200).json(pos);
    console.log("pos",pos)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

// Optional: Get Single PO by ID
exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id).populate('categoryId quotationId');
    if (!po) return res.status(404).json({ message: 'PO not found' });
    res.json(po);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PO' });
  }
};
