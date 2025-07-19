const StockItem = require('../models/StockItemModel');

// Controller to get all items
const getAllItems = async (req, res) => {
    try {
        const items = await StockItem.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

module.exports = {
    getAllItems,
};