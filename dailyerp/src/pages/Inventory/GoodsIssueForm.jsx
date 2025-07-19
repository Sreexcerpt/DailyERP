import React, { useState, useEffect } from "react";
import axios from "axios";

function GoodsIssue() {
  const today = new Date().toISOString().split("T")[0];

  const [salesOrders, setSalesOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSO, setSelectedSO] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialSearchType, setMaterialSearchType] = useState("materialId");
  const [materialSearch, setMaterialSearch] = useState("");
  const [viewAllMaterials, setViewAllMaterials] = useState(false);
  // Add this useEffect to properly fetch materials
  useEffect(() => {
    axios.get("http://localhost:8080/api/material")
      .then(res => {
        setMaterials(res.data);
        console.log("Materials loaded:", res.data);
      })
      .catch(err => console.error("Error fetching materials:", err));
  }, []);

  // Add this useEffect to filter materials based on search
  useEffect(() => {
    if (!viewAllMaterials && !materialSearch) {
      setFilteredMaterials([]);
      return;
    }

    const filtered = materials.filter((material) => {
      if (viewAllMaterials && !materialSearch) return true;

      const searchValue = materialSearch.toLowerCase();
      const fieldValue = material[materialSearchType]?.toString().toLowerCase() || "";

      return fieldValue.includes(searchValue);
    });

    setFilteredMaterials(filtered);
  }, [materials, materialSearch, materialSearchType, viewAllMaterials]);

  // Fix the handleSelectMaterial function
  const handleSelectMaterial = (mat) => {
    if (searchRowIndex !== null && selectedSO?.items) {
      const updatedItems = [...selectedSO.items];
      if (updatedItems[searchRowIndex]) {
        updatedItems[searchRowIndex] = {
          ...updatedItems[searchRowIndex],
          materialId: mat.materialId,
          description: mat.description,
          baseUnit: mat.baseUnit,
          price: mat.price,
        };

        setSelectedSO({ ...selectedSO, items: updatedItems });
      }
    }
    setShowMaterialModal(false);
    setSearchRowIndex(null);
  };

  const [searchRowIndex, setSearchRowIndex] = useState(null); // for tracking which row to update
  const [formData, setFormData] = useState({
    category: "",
    catdesc: "",
    docnumber: "",
    documentDate: today,
    postingDate: today,
    reference: "",
    customer: "",
    location: "",
    availableQty: 0,
    isdelete: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("soNumber");
  const [viewAllClicked, setViewAllClicked] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedGI, setSelectedGI] = useState(null); 
  const [customerSearchType, setCustomerSearchType] = useState("name1");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerViewAllClicked, setCustomerViewAllClicked] = useState(false);

  // Document search states
  const [documents, setDocuments] = useState([]);
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentViewAllClicked, setDocumentViewAllClicked] = useState(false);
  const [isDocumentNumberEnabled, setIsDocumentNumberEnabled] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/api/sales-orders')
      .then(res => setSalesOrders(res.data))
      .catch(err => console.error("Error fetching sales orders", err));

    axios.get('http://localhost:8080/api/goodsissuecategory')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories", err));

    axios.get('http://localhost:8080/api/customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.error("Error fetching customers", err));
  }, []);

  // Fetch documents for search
  const fetchDocuments = () => {
    console.log('Fetching documents...'); // Debug log
    axios.get('http://localhost:8080/api/goodsissue')
      .then(res => {
        console.log('Documents fetched:', res.data); // Debug log
        setDocuments(res.data);
      })
      .catch(err => {
        console.error("Error fetching documents", err);
      });
  };
  useEffect(() => {
    console.log('Categories loaded:', categories);
    categories.forEach(cat => {
      console.log(`Category: "${cat.categoryName}" (length: ${cat.categoryName.length})`);
    });
  }, [categories]);
  const handleSelectSO = (so) => {
    setSelectedSO(so);
    setFormData(prev => ({
      ...prev,
      customer: so.sales || so.customer || so.customerName,
      location: so.deliveryLocation || ""
    }));
    setShowModal(false);
  };

  const handleSelectCustomer = (cust) => {
    setFormData(prev => ({
      ...prev,
      customer: cust.name1
    }));
    setShowCustomerModal(false);
  };

  const handleSelectDocument = (doc) => {
    // Set form data from selected document
    setFormData(prev => ({
      ...prev,
      docnumber: doc.docnumber,
      documentDate: doc.documentDate || doc.issueDate || today,
      postingDate: doc.postingDate || today,
      reference: doc.reference || "",
      customer: doc.customer || "",
      location: doc.location || ""
    }));
setSelectedGI(doc);
    // Set selected SO data if available
    if (doc.salesOrderId) {
      const relatedSO = salesOrders.find(so => so._id === doc.salesOrderId);
      if (relatedSO) {
        setSelectedSO(relatedSO);
      }
    } else if (doc.items) {
      // Create a temporary SO object from document items
      setSelectedSO({
        soNumber: doc.docnumber,
        items: doc.items,
        sales: doc.customer,
        deliveryLocation: doc.location
      });
    }

    setShowDocumentModal(false);
  };

  const [isCancelMode, setIsCancelMode] = useState(false);
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    console.log(`Selected category: "${value}" (length: ${value.length})`); // Debug log

    let docnumber = "";
    let isEnabled = false;

    // Normalize the value for comparison (trim whitespace and convert to lowercase)
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "cancel") {
      isEnabled = true;
      setIsCancelMode(true);
      console.log('Cancel category selected - enabling document search'); // Debug log
      // Fetch documents when Display is selected
      fetchDocuments();
    } else if (normalizedValue === "demo") {
      docnumber = `DMP-${Date.now()}`;
    } else if (normalizedValue === "display") {
      isEnabled = true;
      console.log('Display category selected - enabling document search'); // Debug log
      // Fetch documents when Display is selected
      fetchDocuments();
    }

    const selectedCategory = categories.find(cat =>
      cat.categoryName.trim().toLowerCase() === normalizedValue
    );

    console.log('Selected category object:', selectedCategory); // Debug log
    console.log('Document number enabled:', isEnabled); // Debug log

    setFormData((prev) => ({
      ...prev,
      category: value, // Keep original case for display
      catdesc: selectedCategory?.description || "",
      docnumber: isEnabled ? "" : docnumber
    }));

    setIsDocumentNumberEnabled(isEnabled);
  };


  const handleDocumentNumberChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      docnumber: value
    }));

    // Auto-search when typing
    if (value.length > 2) {
      const matchedDoc = documents.find(doc =>
        doc.docnumber && doc.docnumber.toLowerCase().includes(value.toLowerCase())
      );
      if (matchedDoc) {
        handleSelectDocument(matchedDoc);
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedSO.items];
    updatedItems[index][field] = value;
    setSelectedSO({ ...selectedSO, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSO) return alert("Please select a Sales Order.");

    const issue = {
      ...formData,
      salesOrderId: selectedSO._id,
      items: selectedSO.items,
      issueDate: today
    };

    try {

      if (isCancelMode) {
        await axios.patch(`http://localhost:8080/api/goodsissue/${selectedGI._id}`, {
          isdelete: true
        });
        alert("Goods Issue cancelled successfully!");
        return;
      } else {
        await axios.post("http://localhost:8080/api/goodsissue", issue);
        alert("Goods Issue saved successfully!");
        setFormData({
          category: "",
          catdesc: "",
          docnumber: "",
          documentDate: today,
          postingDate: today,
          reference: "",
          customer: "",
          location: "",
          availableQty: 0,
        });
        setSelectedSO(null);
        setIsDocumentNumberEnabled(false);
      }
    } catch (err) {
      console.error("Error saving goods issue", err);
      alert("Failed to save goods issue");
    }
  };

  const filteredSOs = salesOrders.filter((so) => {
    if (!viewAllClicked && !searchQuery) return false;
    const value = so[searchType]?.toLowerCase() || "";
    return value.includes(searchQuery.toLowerCase());
  });

  const filteredCustomers = customers.filter((cust) => {
    if (!customerViewAllClicked && !customerSearch) return false;
    const value = cust[customerSearchType]?.toLowerCase() || "";
    return value.includes(customerSearch.toLowerCase());
  });

  const filteredDocuments = documents.filter((doc) => {
    if (!documentViewAllClicked && !documentSearch) return false;
    const value = doc.docnumber?.toLowerCase() || "";
    return value.includes(documentSearch.toLowerCase());
  });

  const handleViewAll = () => {
    setSearchQuery("");
    setViewAllClicked(true);
  };

  const handleClear = () => {
    setSearchQuery("");
    setViewAllClicked(false);
  };

  const handleCustomerViewAll = () => {
    setCustomerSearch("");
    setCustomerViewAllClicked(true);
  };

  const handleCustomerClear = () => {
    setCustomerSearch("");
    setCustomerViewAllClicked(false);
  };

  const handleDocumentViewAll = () => {
    setDocumentSearch("");
    setDocumentViewAllClicked(true);
    fetchDocuments();
  };

  const handleDocumentClear = () => {
    setDocumentSearch("");
    setDocumentViewAllClicked(false);
  };

  // Check if category is Display (case insensitive)

  const isDisplayCategory = formData.category.trim().toLowerCase() === "display";
  return (
    <div className="content p-3">
      <h6>Goods Issue</h6>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header p-2">
            <div className="row mb-2">
              <div className="col-xl-3">
                <label>Category</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
              <div className="col-xl-3">
                <label>Description</label>
                <input type="text" name="catdesc" className="form-control" value={formData.catdesc} readOnly />
              </div>
              <div className="col-xl-3">
                <label>Sales Order</label>
                <div className="input-group">
                  <input type="text" name="so" value={selectedSO?.soNumber || ""} className="form-control form-control-sm" readOnly />
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowModal(true)}>Search</button>
                </div>
              </div>
              <div className="col-xl-3">
                <label>Document Number</label>
                <div className="input-group">
                  <input
                    type="text"
                    name="docnumber"
                    className="form-control"
                    value={formData.docnumber}
                    onChange={handleDocumentNumberChange}
                    readOnly={!isDocumentNumberEnabled}
                    placeholder={isDocumentNumberEnabled ? "Enter document number..." : ""}
                  />
                  {isDocumentNumberEnabled && (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setShowDocumentModal(true)}
                    >
                      Search
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-xl-2">
                <label>Document Date</label>
                <input type="date" className="form-control" value={formData.documentDate} onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))} />
              </div>
              <div className="col-xl-2">
                <label>Posting Date</label>
                <input type="date" className="form-control" value={formData.postingDate} onChange={(e) => setFormData(prev => ({ ...prev, postingDate: e.target.value }))} />
              </div>
              <div className="col-xl-2">
                <label>DC/LLR/REF</label>
                <input type="text" className="form-control" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} />
              </div>
              <div className="col-xl-3">
                <label>Customer</label>
                <div className="input-group">
                  <input type="text" className="form-control form-control-sm  " value={formData.customer} readOnly />
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowCustomerModal(true)}>Search</button>
                </div>
              </div>
              <div className="col-xl-3">
                <label>Location</label>
                <input type="text" className="form-control" value={formData.location} readOnly />
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>S. No</th>
                  <th>Mat No</th>
                  <th>Mat Desc</th>
                  <th>QTY</th>
                  <th>UOM</th>
                  <th>Del Date</th>
                  <th>LOT No</th>
                  <th>Value</th>
                  <th>Available Qty</th>
                  {isCancelMode && <th>Cancel</th>}
                </tr>
              </thead>
              <tbody>
                {selectedSO?.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="input-group">
                        <input
                          className="form-control"
                          value={item.materialId || ""}
                          readOnly
                        />
                        {!isDisplayCategory && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setSearchRowIndex(idx);
                              setShowMaterialModal(true);
                            }}
                          >
                            🔍
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.description}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                        value={item.quantity}
                        onChange={isDisplayCategory ? undefined : (e) => handleItemChange(idx, "quantity", e.target.value)}
                        readOnly={isDisplayCategory}
                        disabled={isDisplayCategory}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.baseUnit}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                        value={item.deliveryDate}
                        onChange={isDisplayCategory ? undefined : (e) => handleItemChange(idx, "deliveryDate", e.target.value)}
                        readOnly={isDisplayCategory}
                        disabled={isDisplayCategory}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                        value={item.lotNo || ""}
                        onChange={isDisplayCategory ? undefined : (e) => handleItemChange(idx, "lotNo", e.target.value)}
                        readOnly={isDisplayCategory}
                        disabled={isDisplayCategory}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.price}
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                        value={item.availableQty || ""}
                        onChange={isDisplayCategory ? undefined : (e) => handleItemChange(idx, "availableQty", e.target.value)}
                        readOnly={isDisplayCategory}
                        disabled={isDisplayCategory}
                      />
                    </td>
                    {isCancelMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={item.isCancelled}
                          onChange={(e) => handleItemChange(idx, "isCancelled", e.target.checked)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>


            </table>
            </div>
          </div>
        </div>

        {/* Hide Save button for Display category */}
        {!isDisplayCategory && (
          <div className="text-end mt-3">
            <button type="submit" className="btn btn-success">Save</button>
          </div>
        )}
      </form>
      {showMaterialModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-box-open me-2"></i>Select Material</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMaterialModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={materialSearchType} onChange={(e) => setMaterialSearchType(e.target.value)}>
                      <option value="materialId">Material ID</option>
                      <option value="description">Description</option>
                      <option value="baseUnit">Base Unit</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${materialSearchType}`} value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={() => setViewAllMaterials(true)}>View All</button>
                      {(materialSearch || viewAllMaterials) && (
                        <button className="btn btn-outline-secondary" onClick={() => { setMaterialSearch(""); setViewAllMaterials(false); }}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>

                  {filteredMaterials.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Material ID</th>
                          <th>Description</th>
                          <th>Base Unit</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMaterials.map((mat, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-secondary">{mat.materialId}</span></td>
                            <td>{mat.description}</td>
                            <td>{mat.baseUnit}</td>
                            <td>{mat.price}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectMaterial(mat)}>
                                <i className="fas fa-check me-1"></i>Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-box fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {materialSearch ? `No materials found for "${materialSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaterialModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sales Order Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-search me-2"></i>Search Sales Orders</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                      <option value="soNumber">SO Number</option>
                      <option value="sales">Customer</option>
                      <option value="deliveryLocation">Location</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${searchType}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleViewAll}><i className="fas fa-list me-1"></i>View All</button>
                      {(searchQuery || viewAllClicked) && (
                        <button className="btn btn-outline-secondary" onClick={handleClear}><i className="fas fa-times me-1"></i>Clear</button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredSOs.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>SO Number</th>
                          <th>Sales</th>
                          <th>Location</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSOs.map((so, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-primary">{so.soNumber}</span></td>
                            <td>{so.sales || so.customer || so.customerName}</td>
                            <td>{so.deliveryLocation}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectSO(so)}><i className="fas fa-check me-1"></i>Select</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {searchQuery ? `No sales orders found for "${searchQuery}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-users me-2"></i>Select Customer</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCustomerModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={customerSearchType} onChange={(e) => setCustomerSearchType(e.target.value)}>
                      <option value="name1">Customer Name</option>
                      <option value="customerId">Customer ID</option>
                      <option value="city">City</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${customerSearchType}`} value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleCustomerViewAll}><i className="fas fa-list me-1"></i>View All</button>
                      {(customerSearch || customerViewAllClicked) && (
                        <button className="btn btn-outline-secondary" onClick={handleCustomerClear}><i className="fas fa-times me-1"></i>Clear</button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredCustomers.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Customer ID</th>
                          <th>Name</th>
                          <th>City</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((cust, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-secondary">{cust.customerId}</span></td>
                            <td>{cust.name1}</td>
                            <td>{cust.city}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectCustomer(cust)}><i className="fas fa-check me-1"></i>Select</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-users fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {customerSearch ? `No customers found for "${customerSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Document Search Modal */}
      {showDocumentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-file-alt me-2"></i>Search Documents</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDocumentModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value="docnumber" readOnly>
                      <option value="docnumber">Document Number</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Document Number"
                        value={documentSearch}
                        onChange={(e) => setDocumentSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleDocumentViewAll}><i className="fas fa-list me-1"></i>View All</button>
                      {(documentSearch || documentViewAllClicked) && (
                        <button className="btn btn-outline-secondary" onClick={handleDocumentClear}><i className="fas fa-times me-1"></i>Clear</button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredDocuments.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Document Number</th>
                          <th>Category</th>
                          <th>Customer</th>
                          <th>Document Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-primary">{doc.docnumber}</span></td>
                            <td><span className="badge bg-info">{doc.category}</span></td>
                            <td>{doc.customer}</td>
                            <td>{doc.documentDate || doc.issueDate}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectDocument(doc)}><i className="fas fa-check me-1"></i>Select</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {documentSearch ? `No documents found for "${documentSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDocumentModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default GoodsIssue;