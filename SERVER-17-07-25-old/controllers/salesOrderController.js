const SalesOrder = require('../models/SalesOrder');
const SalesOrderCategory = require('../models/SalesOrderCategory');

// 1. ADD THIS NEW ROUTE (add this route in your routes file)
// exports.generateSONumber = async (req, res) => {
//   try {
//     const { categoryId } = req.body;
//     const soNumber = await generateSONumber(categoryId);
//     res.status(200).json({ soNumber });
//   } catch (error) {
//     console.error('Error generating SO number:', error);
//     res.status(500).json({ error: 'Failed to generate SO number' });
//   }
// };
async function generateSONumber(categoryId) {
  const category = await SalesOrderCategory.findById(categoryId);
  if (!category) throw new Error('SO Category not found');

  const prefix = category.prefix;
  const lastPO = await SalesOrder.find({ categoryId })
    .sort({ soNumber: -1 })
    .limit(1);

  let nextNumber = category.rangeFrom;
  console.log("next number", prefix, lastPO[0].soNumber)
  if (lastPO.length > 0) {
    const lastNumber = parseInt(lastPO[0].soNumber.replace(prefix, ''));
    nextNumber = lastNumber + 1;
    console.log("last number", lastNumber)
  }

  if (nextNumber > category.rangeTo) {
    throw new Error('PO number exceeded category range.');
  }
  console.log("next number2".nextNumber)
  return `${prefix}-${nextNumber.toString().padStart(6, '0')}`;
}
// 2. UPDATE YOUR EXISTING createSalesOrder FUNCTION (replace the existing one)
exports.createSalesOrder = async (req, res) => {
  try {
    const { categoryId, soNumberType, customSONumber } = req.body;

    let soNumber;

    if (soNumberType === 'external' && customSONumber) {
      // Check if external SO number already exists
      const existingSO = await SalesOrder.findOne({ soNumber: customSONumber });
      if (existingSO) {
        return res.status(400).json({ error: 'SO number already exists' });
      }
      soNumber = customSONumber;
    } else {
      // Generate internal SO number
      soNumber = await generateSONumber(categoryId);
    }
    console.log('req for sales order:', req.body);
    const salesOrder = new SalesOrder({
      ...req.body,
      soNumber,
      soNumberType: soNumberType || 'internal'
    });

    const saved = await salesOrder.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Failed to create sales order' });
  }
};



// 4. ADD THIS ROUTE TO YOUR ROUTER (add this line in your routes file)
// router.post('/generate-so-number', generateSONumber);


exports.getAllSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales orders' });
  }
};
