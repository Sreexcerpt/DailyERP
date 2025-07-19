
// controllers/quotationController.js
const Quotation = require('../models/Quotation');
const QuotationCategory = require('../models/QuotationCategory');

// Replace your existing generateQTNRNumber function and createQuotation function with these updated versions

async function generateQTNRNumber(categoryId) {
    const category = await QuotationCategory.findById(categoryId);
    if (!category) throw new Error('Invalid RFQ Category');
 
    // Find the highest internal quotation number for this category
    const internalQuotations = await Quotation.find({ 
        rfqCategoryId: categoryId,
        quotationGenType: 'internal' // Only count internal quotations
    }).sort({ quotationNumber: -1 });
    
    let nextNumber;
    
    if (internalQuotations.length > 0) {
        // Extract the number from the latest internal quotation
        const latestQuotation = internalQuotations[0];
        const numberPart = latestQuotation.quotationNumber.replace(category.prefix, '');
        const latestNumber = parseInt(numberPart, 10);
        nextNumber = latestNumber + 1;
    } else {
        // No internal quotations found, but we need to check what's the highest existing number
        // to avoid conflicts with external ones
        const allQuotations = await Quotation.find({ 
            rfqCategoryId: categoryId,
            quotationNumber: { $regex: `^${category.prefix}` }
        }).sort({ quotationNumber: -1 });
        
        if (allQuotations.length > 0) {
            // Find the highest number among all quotations and increment
            const latestQuotation = allQuotations[0];
            const numberPart = latestQuotation.quotationNumber.replace(category.prefix, '');
            const latestNumber = parseInt(numberPart, 10);
            nextNumber = latestNumber + 1;
        } else {
            // Truly no quotations exist, start from rangeFrom
            nextNumber = category.rangeFrom;
        }
    }
    
    return `${category.prefix}${nextNumber.toString().padStart(6, '0')}`;
}

exports.createQuotation = async (req, res) => {
    try {
        const { quotationGenType, externalQuotationNumber, rfqCategoryId, ...otherData } = req.body;
        console.log('Received data:', req.body);
        let quotationNumber;
        
        if (quotationGenType === 'external') {
            // Use external quotation number
            if (!externalQuotationNumber || externalQuotationNumber.trim() === '') {
                return res.status(400).json({ error: 'External quotation number is required' });
            }
            
            // Check if external quotation number already exists
            const existingQuotation = await Quotation.findOne({ 
                quotationNumber: externalQuotationNumber.trim() 
            });
            
            if (existingQuotation) {
                return res.status(400).json({ error: 'Quotation number already exists' });
            }
            
            quotationNumber = externalQuotationNumber.trim();
        } else {
            // Generate internal quotation number
            quotationNumber = await generateQTNRNumber(rfqCategoryId);
        }

        const quotation = new Quotation({
            quotationNumber,
            rfqCategoryId,
            quotationGenType: quotationGenType || 'internal', // Store the generation type
            ...otherData
        });

        await quotation.save();
        res.status(201).json({ 
            message: 'Quotation created successfully', 
            quotation,
            generationType: quotationGenType
        });
    } catch (error) {
        console.error('Error creating quotation:', error);
        
        if (error.code === 11000) {
            // Handle duplicate key error
            return res.status(400).json({ error: 'Quotation number already exists' });
        }
        
        res.status(500).json({ error: 'Failed to create quotation' });
    }
};
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find();
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

// Get Quotation by ID
exports.getQuotationById = async (req, res) => {
    try {
      const quotation = await Quotation.findById(req.params.id).populate('rfqCategoryId', 'categoryName prefix');
      if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
      res.json(quotation);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      res.status(500).json({ message: 'Failed to fetch quotation' });
    }
  };
  
// exports.getQuotationById = async (req, res) => {
//   try {
//     const quotation = await Quotation.findById(req.params.id);
//     if (!quotation) {
//       return res.status(404).json({ message: 'Quotation not found' });
//     }
//     res.json(quotation);
//   } catch (error) {
//     console.error('Error fetching quotation:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// PUT - Update quotation by ID
exports.updateQuotationById = async (req, res) => {
  try {
    const {
      indentId,
      categoryId,
      rfqCategoryId,
      vendor,
      vendorName,
      quotationReference,
      vnNo,
      validityDate,
      note,
      location,
      buyerGroup,
      totalPrice,
      items
    } = req.body;

    const calculatedTotalPrice = totalPrice || items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        indentId,
        categoryId,
        rfqCategoryId,
        vendor,
        vendorName,
        quotationReference,
        vnNo,
        validityDate,
        note,
        location,
        buyerGroup,
        totalPrice: calculatedTotalPrice,
        items
      },
      { new: true }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};