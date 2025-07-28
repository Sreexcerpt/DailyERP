import { useEffect, useState } from "react";
import axios from "axios";

function MRP() {
    const [materials, setMaterials] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [selectedActions, setSelectedActions] = useState({});
    const [showIndentModal, setShowIndentModal] = useState(false);
    const [modalMaterial, setModalMaterial] = useState(null);
    const [actionType, setActionType] = useState(''); // "PE" or "PO"
    const [indentCategories, setIndentCategories] = useState([]);
    const [poCategories, setPoCategories] = useState([]);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [vendors, setVendors] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendorSearchQuery, setVendorSearchQuery] = useState("");
    const [vendorSearchResults, setVendorSearchResults] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [indentIdType, setIndentIdType] = useState('internal');
    const [externalIndentId, setExternalIndentId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [location, setLocation] = useState('');
    const [buyerGroup, setBuyerGroup] = useState('');
    const [taxes, setTaxes] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);
    const [taxDiscount, setTaxDiscount] = useState(0);
    const [contactPerson, setContactPerson] = useState('');
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [selectedProcesses, setSelectedProcesses] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [approvedby, setApprovedby] = useState('');
    const [preparedby, setPreparedby] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchMaterials = async () => {
        try {
            const companyId = localStorage.getItem("selectedCompanyId");
            const financialYear = localStorage.getItem("financialYear");

            const res = await axios.get("http://localhost:8080/api/material", {
                params: { companyId, financialYear },
            });

            const sortedMaterials = res.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setMaterials(sortedMaterials);
            setTotalItems(sortedMaterials.length);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/stock");
            setInventory(response.data);
            console.log("Stock data fetched:", response.data);
        } catch (error) {
            console.error("Failed to fetch stock:", error);
        }
    };

    useEffect(() => {
        fetchMaterials();
        fetchInventory();
        axios.get("http://localhost:8080/api/vendors")
            .then((res) => setVendors(res.data));
        axios.get("http://localhost:8080/api/tax")
            .then((res) => setTaxes(res.data));
    }, []);

    // Combine materials with inventory stock and calculate reorderPoint
    const enrichedMaterials = materials.map((material) => {
        const stockItem = inventory.find(
            (inv) => inv.materialId === material.materialId
        );

        const inventoryStock = stockItem?.quantityAvailable || 0;
        const safetyStock = material.safetyStock || 0;

        // Calculate reorder point based on safety stock
        const reorderPoint = Math.abs(safetyStock - inventoryStock);
        const reorderQuantity = Math.abs(safetyStock - inventoryStock);


        return {
            ...material,
            inventoryStock,
            reorderPoint,
            reorderQuantity,
        };
    });

    // Pagination logic
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = enrichedMaterials.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pageNumbers.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pageNumbers.push(i);
                }
            }
        }

        return pageNumbers;
    };

    const handleModalIndentSubmit = async () => {
        if (!modalMaterial || !selectedCategory || !location || !buyerGroup) {
            alert("Please fill in all required fields");
            return;
        }

        // Additional validation for PO
        if (actionType === "PO") {
            if (!vendor) {
                alert("Please select a vendor for Purchase Order");
                return;
            }
            if (!selectedTax) {
                alert("Please select tax for Purchase Order");
                return;
            }
        }

        console.log("modalMaterial", modalMaterial);

        const companyId = localStorage.getItem("selectedCompanyId");
        const financialYear = localStorage.getItem("financialYear");

        // Ensure unitPrice has a default value
        const unitPrice = parseFloat(modalMaterial.unitPrice) || 0;
        const quantity = parseFloat(modalMaterial.reorderQuantity) || 0;

        if (actionType === "PE") {
            // Existing PE creation logic
            const categoryObj = indentCategories.find(cat => cat._id === selectedCategory);

            const item = {
                materialId: modalMaterial.materialId,
                description: modalMaterial.description,
                qty: quantity,
                baseUnit: modalMaterial.baseUnit,
                orderUnit: modalMaterial.orderUnit,
            };

            const payload = {
                indentIdType,
                categoryId: categoryObj._id,
                categoryName: categoryObj.name || categoryObj.categoryName,
                location,
                buyerGroup,
                deliveryDate,
                documentDate: new Date().toISOString().split('T')[0],
                items: [item],
            };

            if (indentIdType === 'external') {
                if (!externalIndentId.trim()) {
                    alert("Please enter External Indent ID");
                    return;
                }
                payload.indentId = externalIndentId.trim();
            }

            try {
                const res = await axios.post('http://localhost:8080/api/indent/create', payload);
                alert(`Indent created with ID: ${res.data.indentId}`);
                resetModal();
            } catch (err) {
                console.error("Indent creation failed", err);
                alert("Failed to create indent");
            }

        } else if (actionType === "PO") {
            // New PO creation logic - Match backend controller structure
            const categoryObj = poCategories.find(cat => cat._id === selectedCategory);

            // Calculate total amount with proper validation
            const totalAmount = quantity * unitPrice;

            // Ensure totalAmount is a valid number
            if (isNaN(totalAmount)) {
                alert("Please enter valid quantity and unit price");
                return;
            }

            // Get tax rates with default values
            const cgstRate = parseFloat(selectedTax?.cgst) || 0;
            const sgstRate = parseFloat(selectedTax?.sgst) || 0;
            const igstRate = parseFloat(selectedTax?.igst) || 0;

            // Calculate tax amounts
            const calculatedCgst = (totalAmount * cgstRate) / 100;
            const calculatedSgst = (totalAmount * sgstRate) / 100;
            const calculatedIgst = (totalAmount * igstRate) / 100;

            const totalTax = calculatedCgst + calculatedSgst + calculatedIgst;
            const discountAmount = parseFloat(taxDiscount) || 0;
            const finalTotalAmount = totalAmount + totalTax - discountAmount;

            // Format item to match backend expectations
            const item = {
                materialId: modalMaterial.materialId,
                description: modalMaterial.description,
                quantity: quantity, // Backend expects 'quantity', not 'qty'
                price: unitPrice,   // Backend expects 'price', not 'unitPrice'
                baseUnit: modalMaterial.baseUnit,
                orderUnit: modalMaterial.orderUnit,
            };

            // Create payload matching your backend controller structure
            const poPayload = {
                companyId,
                financialYear,
                categoryId: categoryObj._id,
                category: categoryObj.name || categoryObj.categoryName, // Backend expects 'category'
                date: new Date().toISOString().split('T')[0], // Backend expects 'date'
                vendor: vendor, // Backend expects 'vendor'
                deliveryLocation: deliveryLocation || "",
                deliveryAddress: deliveryAddress || "",
                items: [item],
                notes: notes || "",
                remarks: remarks || "",
                preparedby: preparedby || "",
                approvedby: approvedby || "",
                taxName: selectedTax?.taxName || "",
                cgst: calculatedCgst,
                sgst: calculatedSgst,
                igst: calculatedIgst,
                taxDiscount: discountAmount,
                finalTotal: finalTotalAmount,
                processes: selectedProcesses || [], // Add if you have this data
                generalConditions: selectedConditions || [], // Add if you have this data
                poGenerationType: indentIdType, // Backend expects 'poGenerationType', not 'indentIdType'
            };

            // Add external PO number if needed
            if (indentIdType === 'external') {
                if (!externalIndentId.trim()) {
                    alert("Please enter External PO ID");
                    return;
                }
                poPayload.poNumber = externalIndentId.trim(); // Backend expects 'poNumber'
            }

            // Debug log to check values
            console.log("PO Payload:", poPayload);

            try {
                const res = await axios.post('http://localhost:8080/api/purchase-orders', poPayload);
                alert(`Purchase Order created with ID: ${res.data.poNumber}`);
                resetModal();
            } catch (err) {
                console.error("Purchase Order creation failed", err);
                alert(`Failed to create Purchase Order: ${err.response?.data?.error || err.message}`);
            }
        }
    };

    const resetModal = () => {
        setShowIndentModal(false);
        setModalMaterial(null);
        setSelectedCategory('');
        setLocation('');
        setBuyerGroup('');
        setDeliveryDate('');
        setExternalIndentId('');
        setVendor('');
        setSelectedTax(null);
        setNotes('');
        setContactPerson('');
        setRemarks('');
        setPreparedby('');
        setApprovedby('');
        setDeliveryLocation(''); // Reset delivery location
        setDeliveryAddress('');  // Reset delivery address
        setTaxDiscount(0);
    };

    const handleRadioToggle = (materialId, actionType) => {
        setSelectedActions((prev) => {
            const newState = { ...prev };

            // Clear both options for this material first
            newState[`${materialId}_PE`] = false;
            newState[`${materialId}_PO`] = false;

            // Set the selected option
            newState[`${materialId}_${actionType}`] = true;

            return newState;
        });
    };

    useEffect(() => {
        axios.get("http://localhost:8080/api/purchasecategory").then(res => setIndentCategories(res.data));
        axios.get("http://localhost:8080/api/po-categories").then(res => setPoCategories(res.data));
    }, []);

    const VendorSearchModal = () => (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-search me-2"></i>Search Vendors
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={closeVendorModal}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Search Vendor</label>
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by vendor name or code..."
                                        value={vendorSearchQuery}
                                        onChange={(e) => handleVendorSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">&nbsp;</label>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-info"
                                        onClick={handleViewAllVendors}
                                    >
                                        <i className="fas fa-list me-1"></i>View All
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                            {vendorSearchResults.length > 0 ? (
                                <table className="table table-hover">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Vendor Code</th>
                                            <th>Vendor Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendorSearchResults.map((vendor, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <span className="badge bg-info">{vendor.vnNo}</span>
                                                </td>
                                                <td>{vendor.name1}</td>
                                                <td>{vendor.email}</td>
                                                <td>{vendor.phone}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => selectVendorFromSearch(vendor)}
                                                    >
                                                        <i className="fas fa-check me-1"></i>Select
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">
                                        {vendorSearchQuery
                                            ? `No vendors found matching "${vendorSearchQuery}"`
                                            : 'Enter search term or click "View All"'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeVendorModal}
                        >
                            <i className="fas fa-times me-1"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleVendorSearch = (query) => {
        setVendorSearchQuery(query);
        if (query.trim()) {
            const filtered = vendors.filter(
                (v) =>
                    v.vendorName.toLowerCase().includes(query.toLowerCase()) ||
                    v.vendorCode.toLowerCase().includes(query.toLowerCase())
            );
            setVendorSearchResults(filtered);
        } else {
            setVendorSearchResults([]);
        }
    };

    const handleViewAllVendors = () => {
        setVendorSearchResults(vendors);
    };

    const selectVendorFromSearch = (selectedVendor) => {
        setVendor(selectedVendor.name1 || selectedVendor.vendorName);
        setShowVendorModal(false);
        setVendorSearchQuery("");
        setVendorSearchResults([]);
    };

    const closeVendorModal = () => {
        setShowVendorModal(false);
        setVendorSearchQuery("");
        setVendorSearchResults([]);
    };

    // Add this CSS to your component or stylesheet
    const checkboxStyles = `
.checkbox-radio {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #ccc;
    border-radius: 3px;
    background-color: white;
    cursor: pointer;
    position: relative;
    vertical-align: middle;
}

.checkbox-radio:checked {
    background-color: #007bff;
    border-color: #007bff;
}

.checkbox-radio:checked::after {
    content: '✓';
    position: absolute;
    top: -2px;
    left: 2px;
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.checkbox-radio:hover {
    border-color: #007bff;
}

.checkbox-radio:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.pagination-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
    flex-wrap: wrap;
    gap: 10px;
}

.pagination-info {
    color: #6c757d;
    font-size: 14px;
}

.pagination-controls .form-select {
    width: auto;
    min-width: 80px;
}

.page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
}

.page-link {
    color: #007bff;
    border: 1px solid #dee2e6;
    padding: 0.375rem 0.75rem;
}

.page-link:hover {
    color: #0056b3;
    background-color: #e9ecef;
    border-color: #dee2e6;
}

.page-item.disabled .page-link {
    color: #6c757d;
    background-color: #fff;
    border-color: #dee2e6;
}
`;

    return (
        <div className="content">
            <style>{checkboxStyles}</style>
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                <div className="my-auto mb-2">
                    <h2 className="mb-1">Material Requirements Planning</h2>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                            </li>
                            <li className="breadcrumb-item">
                                Master
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Material Requirements Planning</li>
                        </ol>
                    </nav>
                </div>

            </div>


            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-sm table-bordered text-wrap">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Mat No</th>
                                    <th>Mat Desc</th>
                                    <th>Min Stock</th>
                                    <th>Max Stock</th>
                                    <th>Safety Stock</th>
                                    <th>INV Stock</th>
                                    <th>ROP</th>
                                    <th className="wrap-header">PE</th>
                                    <th style={{ whiteSpace: "normal", wordWrap: "break-word" }}>PO</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((material, index) => (
                                    <tr key={material._id || index}>
                                        <td>{startIndex + index + 1}</td>
                                        <td>{material.materialId || "-"}</td>
                                        <td>{material.description || "-"}</td>
                                        <td>{material.minstock || 0}</td>
                                        <td>{material.maxstock || 0}</td>
                                        <td>{material.safetyStock || 0}</td>
                                        <td>{material.inventoryStock}</td>
                                        <td
                                            style={{
                                                color:
                                                    material.inventoryStock < material.safetyStock
                                                        ? material.inventoryStock < material.minstock
                                                            ? "red"
                                                            : "orange"
                                                        : "green",
                                                fontWeight:
                                                    material.reorderQuantity < material.safetyStock ? "bold" : "normal"
                                            }}
                                        >
                                            {material.reorderQuantity}
                                        </td>

                                        <td>
                                            <input
                                                type="radio"
                                                name={`action_${material.materialId}`}
                                                value="PE"
                                                className="checkbox-radio"
                                                checked={!!selectedActions[`${material.materialId}_PE`]}
                                                onChange={() => handleRadioToggle(material.materialId, "PE")}

                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="radio"
                                                name={`action_${material.materialId}`}
                                                value="PO"
                                                className="checkbox-radio"
                                                checked={!!selectedActions[`${material.materialId}_PO`]}
                                                onChange={() => handleRadioToggle(material.materialId, "PO")}

                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary"

                                                onClick={() => {
                                                    const isPE = selectedActions[`${material.materialId}_PE`];
                                                    const isPO = selectedActions[`${material.materialId}_PO`];

                                                    if (!isPE && !isPO) {
                                                        alert("Please select PE or PO before creating.");
                                                        return;
                                                    }

                                                    const type = isPE ? "PE" : "PO";
                                                    setActionType(type);
                                                    setModalMaterial(material);
                                                    setShowIndentModal(true);
                                                }}
                                            >
                                                Create
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: "center" }}>
                                            No materials found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            {totalPages > 1 && (

                <div className="mt-2">
                    <nav aria-label="Page navigation">
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fas fa-angle-double-left"></i>
                                </button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fas fa-angle-left"></i>
                                </button>
                            </li>

                            {getPageNumbers().map(number => (
                                <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(number)}
                                    >
                                        {number}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="fas fa-angle-right"></i>
                                </button>
                            </li>
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="fas fa-angle-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

            )}

            {showIndentModal && modalMaterial && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Create {actionType === "PE" ? "Purchase Enquiry" : "Purchase Order"} for {modalMaterial.description}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowIndentModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="row gap-2">
                                        <div className="col-lg-3 row">
                                            <div className="col-xl-6">
                                                <label>ID Type</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <select className="form-select" value={indentIdType} onChange={(e) => setIndentIdType(e.target.value)}>
                                                    <option value="internal">Internal</option>
                                                    <option value="external">External</option>
                                                </select>
                                            </div>
                                        </div>

                                        {indentIdType === "external" && (
                                            <div className="col-lg-3 row">
                                                <div className="col-xl-6">
                                                    <label>External {actionType} ID</label>
                                                </div>
                                                <div className="col-xl-6">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={externalIndentId}
                                                        onChange={(e) => setExternalIndentId(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {actionType === "PE" && (
                                            <div className="col-lg-3 row">
                                                <div className="col-xl-6">
                                                    <label>PE Category</label>
                                                </div>
                                                <div className="col-xl-6">
                                                    <select
                                                        className="form-select"
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {indentCategories.map((cat) => (
                                                            <option key={cat._id} value={cat._id}>
                                                                {cat.name || cat.categoryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {actionType === "PO" && (
                                            <div className="col-lg-3 row">
                                                <div className="col-xl-6">
                                                    <label>PO Category</label>
                                                </div>
                                                <div className="col-xl-6">
                                                    <select
                                                        className="form-select"
                                                        value={selectedCategory}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {poCategories.map((cat) => (
                                                            <option key={cat._id} value={cat._id}>
                                                                {cat.name || cat.categoryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {actionType === "PO" && (
                                            <>
                                                {/* Unit Price Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Unit Price *</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            value={modalMaterial?.unitPrice || 0}
                                                            onChange={(e) => {
                                                                const value = parseFloat(e.target.value) || 0;
                                                                setModalMaterial(prev => ({
                                                                    ...prev,
                                                                    unitPrice: value
                                                                }));
                                                            }}
                                                            placeholder="Enter unit price"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Vendor Field */}
                                                <div className="col-lg-3 row">
                                                    <div className="col-xl-3">
                                                        <label className="form-label">Vendor *</label>
                                                    </div>
                                                    <div className="col-xl-9">
                                                        <div className="input-group">
                                                            <input
                                                                className="form-control form-control-sm"
                                                                value={vendor}
                                                                onChange={(e) => setVendor(e.target.value)}
                                                                placeholder="Enter vendor name"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm"
                                                                onClick={() => setShowVendorModal(true)}
                                                            >
                                                                <i className="ti ti-search"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Tax Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-3">
                                                        <label>Tax *</label>
                                                    </div>
                                                    <div className="col-xl-6">
                                                        <select
                                                            className="form-select"
                                                            value={selectedTax?._id || ""}
                                                            onChange={(e) => {
                                                                const selected = taxes.find(t => t._id === e.target.value);
                                                                setSelectedTax(selected);
                                                            }}
                                                        >
                                                            <option value="">Select Tax</option>
                                                            {taxes.map((tax) => (
                                                                <option key={tax._id} value={tax._id}>
                                                                    {tax.taxName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Delivery Location Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Delivery Location</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={deliveryLocation}
                                                            onChange={(e) => setDeliveryLocation(e.target.value)}
                                                            placeholder="Enter delivery location"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Delivery Address Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-3">
                                                        <label>Delivery Address</label>
                                                    </div>
                                                    <div className="col-xl-9">
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={deliveryAddress}
                                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                                            placeholder="Enter delivery address"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contact Person Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Contact Person</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={contactPerson}
                                                            onChange={(e) => setContactPerson(e.target.value)}
                                                            placeholder="Enter contact person"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Prepared By Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Prepared By</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={preparedby}
                                                            onChange={(e) => setPreparedby(e.target.value)}
                                                            placeholder="Enter prepared by"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Approved By Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Approved By</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={approvedby}
                                                            onChange={(e) => setApprovedby(e.target.value)}
                                                            placeholder="Enter approved by"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Tax Discount Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-4">
                                                        <label>Discount</label>
                                                    </div>
                                                    <div className="col-xl-8">
                                                        <input
                                                            type="number"
                                                            
                                                            className="form-control"
                                                            value={taxDiscount}
                                                            onChange={(e) => setTaxDiscount(parseFloat(e.target.value) || 0)}
                                                            placeholder="Enter discount amount"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Notes Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-2">
                                                        <label>Notes</label>
                                                    </div>
                                                    <div className="col-xl-10">
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            placeholder="Enter notes"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Remarks Field */}
                                                <div className="col-xl-3 row form-group">
                                                    <div className="col-xl-3">
                                                        <label>Remarks</label>
                                                    </div>
                                                    <div className="col-xl-9">
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            value={remarks}
                                                            onChange={(e) => setRemarks(e.target.value)}
                                                            placeholder="Enter remarks"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Common fields for both PE and PO */}
                                        <div className="col-xl-3 row form-group">
                                            <div className="col-xl-6">
                                                <label>Location *</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="Enter location"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="col-xl-3 row form-group">
                                            <div className="col-xl-5">
                                                <label>Buyer Group *</label>
                                            </div>
                                            <div className="col-xl-7">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={buyerGroup}
                                                    onChange={(e) => setBuyerGroup(e.target.value)}
                                                    placeholder="Enter buyer group"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="col-xl-3 row form-group">
                                            <div className="col-xl-6">
                                                <label>Delivery Date</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={deliveryDate}
                                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer gap-2">
                                    <button className="btn btn-secondary" onClick={() => setShowIndentModal(false)}>Cancel</button>
                                    <button className="btn btn-primary" onClick={handleModalIndentSubmit}>
                                        Create {actionType === "PE" ? "Purchase Enquiry" : "Purchase Order"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {showVendorModal && <VendorSearchModal />}
        </div>
    );
}

export default MRP;