const CustomerPriceList = require('../models/CustomerPriceList');

exports.createCustomerPrice = async (req, res) => {
  try {
    const { categoryId, customerId, materialId, unit, bum, orderUnit, salesGroup, taxId,tandc, companyId,financialYear} = req.body;

    if (!categoryId || !customerId || !materialId || !unit || !bum || !orderUnit || !salesGroup) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const newEntry = new CustomerPriceList({
      categoryId,
      customerId,
      materialId,
      unit,
      bum,
      orderUnit,
      salesGroup,
      taxId,tandc,
      companyId,
      financialYear
    });

    await newEntry.save();
    res.status(201).json({ message: 'Customer Price List saved successfully', data: newEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getCustomerPrices = async (req, res) => {
  try {
     const { companyId, financialYear } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

  
    const list = await CustomerPriceList.find(filter).populate('customerId categoryId materialId taxId');
    res.status(200).json(list);
    console.log("list", list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
};

exports.getCustomerPriceById = async (req, res) => {
  try {
    const price = await CustomerPriceList.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Not found' });
    res.json(price);
    console.log("pric",price);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching record' });
  }
};

exports.updateCustomerPrice = async (req, res) => {
  try {
    const updated = await CustomerPriceList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Updated successfully', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};