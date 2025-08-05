const Contract = require('../models/Contract')
const ContractCategory = require('../models/PurchaseContractCategoryModel');

// Generate Contract Number
async function generateCTNRNumber(categoryId) {
    const category = await ContractCategory.findById(categoryId);
    if (!category) throw new Error('Invalid Contract Category');

    const internalContracts = await Contract.find({
        contractCategoryId: categoryId,
        contractGenType: 'internal'
    }).sort({ contractNumber: -1 });

    let nextNumber;

    if (internalContracts.length > 0) {
        const latestContract = internalContracts[0];
        const numberPart = latestContract.contractNumber.replace(category.prefix, '');
        const latestNumber = parseInt(numberPart, 10);
        nextNumber = latestNumber + 1;
    } else {
        const allContracts = await Contract.find({
            contractCategoryId: categoryId,
            contractNumber: { $regex: `^${category.prefix}` }
        }).sort({ contractNumber: -1 });

        if (allContracts.length > 0) {
            const latestContract = allContracts[0];
            const numberPart = latestContract.contractNumber.replace(category.prefix, '');
            const latestNumber = parseInt(numberPart, 10);
            nextNumber = latestNumber + 1;
        } else {
            nextNumber = category.rangeFrom;
        }
    }

    return `${category.prefix}${nextNumber.toString().padStart(6, '0')}`;
}

// Create Contract
exports.createContract = async (req, res) => {
    try {
        const { contractGenType, externalContractNumber, ...otherData } = req.body;
        const contractCategoryId = req.body.categoryId;
        console.log('Received data:', req.body);
        let contractNumber;

        if (contractGenType === 'external') {
            if (!externalContractNumber || externalContractNumber.trim() === '') {
                return res.status(400).json({ error: 'External contract number is required' });
            }

            const existingContract = await Contract.findOne({
                contractNumber: externalContractNumber.trim()
            });

            if (existingContract) {
                return res.status(400).json({ error: 'Contract number already exists' });
            }

            contractNumber = externalContractNumber.trim();
        } else {
            contractNumber = await generateCTNRNumber(contractCategoryId);
        }

        const contract = new Contract({
            contractNumber,
            contractCategoryId,
            contractGenType: contractGenType || 'internal',
            ...otherData
        });
console.log('Contract data:', contract);
        await contract.save();
        res.status(201).json({
            message: 'Contract created successfully',
            contract,
            generationType: contractGenType
        });
    } catch (error) {
        console.error('Error creating contract:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'Contract number already exists' });
        }

        res.status(500).json({ error: 'Failed to create contract' });
    }
};

// Get All Contracts
exports.getAllContracts = async (req, res) => {
    try {
        const { companyId, financialYear } = req.query;

    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;

        const contracts = await Contract.find(filter)

        res.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
};

// Get Contract by ID
exports.getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id).populate('contractCategoryId', 'categoryName prefix');
        if (!contract) return res.status(404).json({ message: 'Contract not found' });
        res.json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        res.status(500).json({ message: 'Failed to fetch contract' });
    }
};

// Update Contract
exports.updateContractById = async (req, res) => {
    try {
        const {
            indentId,
            categoryId,
            contractCategoryId,
            vendor,
            vendorName,
            contractReference,
            cnNo,
            validityFDate,
            validityTDate,
            note,
            location,
            buyerGroup,
            totalPrice,
            items
        } = req.body;

        const calculatedTotalPrice = totalPrice || items.reduce((sum, item) => {
            return sum + (parseFloat(item.price) || 0);
        }, 0);

        const updatedContract = await Contract.findByIdAndUpdate(
            req.params.id,
            {
                indentId,
                categoryId,
                contractCategoryId,
                vendor,
                vendorName,
                contractReference,
                cnNo,
                validityFDate,
                validityTDate,
                note,
                location,
                buyerGroup,
                totalPrice: calculatedTotalPrice,
                items
            },
            { new: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        res.json(updatedContract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
