const SalesRequest = require('../models/Salesrequest');
const Salecategory = require('../models/SalesReuestcat');

exports.createIndent = async (req, res) => {
  try {

    const { indentIdType, externalIndentId, categoryId, items } = req.body;

    let indentId;
    console.log('Received categoryId:', categoryId);
    console.log('Received items:', req.body);

    const category = await Salecategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });


    if (indentIdType === 'external') {
      if (!externalIndentId || externalIndentId.trim() === '') {
        return res.status(400).json({ error: 'External Indent ID is required' });
      }

      if (externalIndentId.length > 50) {
        return res.status(400).json({ error: 'External Indent ID cannot exceed 50 characters' });
      }

      // Optional: Add validation for special characters or format
      const validIdPattern = /^[A-Za-z0-9_-]+$/;
      if (!validIdPattern.test(externalIndentId)) {
        return res.status(400).json({ error: 'External Indent ID can only contain letters, numbers, hyphens, and underscores' });
      }
      indentId = externalIndentId;
    } else if (indentIdType === 'internal') {
      if (!category.prefix || !category.rangeStart) {
        return res.status(400).json({ error: 'Category prefix or range start not defined' });
      }

      const prefix = category.prefix;
      const rangeStart = category.rangeStart;
      console.log('Category prefix:', prefix);
      console.log('Category rangeStart:', rangeStart);
      // Find latest indent for this specific category
      const latest = await SalesRequest.findOne({ categoryId, indentIdType: 'internal' })
        .sort({ createdAt: -1 });
      console.log('Latest indent found:', latest);
      let nextNumber = rangeStart;
      if (latest && latest.indentId) {
        const lastNumber = parseInt(latest.indentId.replace(prefix, ''));
        nextNumber = lastNumber + 1;
      }
      console.log('Next indent number:', nextNumber);
      indentId = `${prefix}${nextNumber}`;
      console.log('Generated internal indentId:', indentId);
    }
    const prefix = category.prefix;
    const rangeStart = category.rangeStart;

    // Find latest indent for this specific category
    const latest = await SalesRequest.findOne({ categoryId })
      .sort({ createdAt: -1 });

    let nextNumber = rangeStart;
    if (latest && latest.indentId) {
      const lastNumber = parseInt(latest.indentId.replace(prefix, ''));
      nextNumber = lastNumber + 1;
    }

     indentId = `${prefix}${nextNumber}`;

    const newIndent = new SalesRequest({
      ...req.body,
      indentId,
      categoryId,
      categoryName: category.categoryName,
      items,
    });

    await newIndent.save();

    res.status(201).json({ message: 'Indent created successfully', indentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};




// controllers/indentController.js
exports.getAllIndents = async (req, res) => { 
  try {
    const { companyId, financialYear } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;
    const allIndents = await SalesRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(allIndents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch indents' });
  }
};
