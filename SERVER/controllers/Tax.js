const Tax = require('../models/Tax');

// Create new tax entry
exports.createTax = async (req, res) => {
  try {
    const { taxCode, taxName, cgst, sgst, igst } = req.body;

    if (!taxCode || !taxName || !cgst || !sgst || !igst) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const tax = new Tax({ taxCode, taxName, cgst, sgst, igst });
    await tax.save();
    res.status(201).json({ message: 'Tax added successfully', tax });
  } catch (err) {
    console.error('Create Tax Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all tax entries
exports.getTaxes = async (req, res) => {
  try {
    const taxes = await Tax.find().sort({ createdAt: -1 });
    res.json(taxes);
  } catch (err) {
    console.error('Get Taxes Error:', err);
    res.status(500).json({ error: 'Failed to fetch taxes' });
  }
};

// Update tax by ID
exports.updateTax = async (req, res) => {
  try {
    const { taxCode, taxName, cgst, sgst, igst } = req.body;

    const tax = await Tax.findByIdAndUpdate(
      req.params.id,
      { taxCode, taxName, cgst, sgst, igst },
      { new: true }
    );

    if (!tax) return res.status(404).json({ error: 'Tax not found' });

    res.json({ message: 'Tax updated successfully', tax });
  } catch (err) {
    console.error('Error updating tax:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};
