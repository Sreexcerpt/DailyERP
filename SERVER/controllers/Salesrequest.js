// const IndentRequest = require('../models/IndentRequestModel');
// const PurchaseCategory = require('../models/purchaserequestmodel');

// exports.createIndent = async (req, res) => {
//   try {
//     const { categoryId, items } = req.body;

//     console.log('Received categoryId:', categoryId);
//     console.log('Received items:', items);
//     const category = await PurchaseCategory.findById(categoryId);
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const prefix = category.prefix;

//     const latest = await IndentRequest.findOne({ indentId: { $regex: `^${prefix}-` } })
//       .sort({ createdAt: -1 });

//     let nextNumber = 1;
//     if (latest && latest.indentId) {
//       const lastId = latest.indentId.split('-')[1];
//       nextNumber = parseInt(lastId) + 1;
//     }

//     const indentId = `${prefix}-${String(nextNumber).padStart(4, '0')}`;

//     const newIndent = new IndentRequest({
//       indentId,
//       categoryId,
//       categoryName: category.name,
//       items
//     });

//     await newIndent.save();

//     res.status(201).json({ message: 'Indent created', indentId });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const SalesRequest = require('../models/Salesrequest');
const Salecategory = require('../models/SalesReuestcat');

exports.createIndent = async (req, res) => {
  try {
    const { categoryId, items } = req.body;

    console.log('Received categoryId:', categoryId);
    console.log('Received items:', items);

    const category = await Salecategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

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

    const indentId = `${prefix}${nextNumber}`;

    const newIndent = new SalesRequest({
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
    const allIndents = await SalesRequest.find().sort({ createdAt: -1 });
    res.status(200).json(allIndents);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch indents' });
  }
};
