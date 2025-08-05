import React, { useState, useEffect } from "react";
import axios from "axios";

function GoodsTransfer() {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    category: "",
    catdesc: "",
    docnumber: "",
    docDate: today,
    postDate: today,
    reference: "",
    location: "",
  });
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [items, setItems] = useState([
    {
      materialId: "",
      description: "",
      baseUnit: "",
      price: "",
      quantity: "",
      deliveryDate: "",
      lotNo: "",
      text: "",
    },
  ]);

  // Document search states
  const [documents, setDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentViewAllClicked, setDocumentViewAllClicked] = useState(false);
  const [isDocumentNumberEnabled, setIsDocumentNumberEnabled] = useState(false);

  // Material search states
  const [searchRowIndex, setSearchRowIndex] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState("materialId");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Check if category is Display (case insensitive)
  const isDisplayCategory = formData.category.trim().toLowerCase() === "display";
 const companyId = localStorage.getItem("selectedCompanyId");
    const financialYear = localStorage.getItem("financialYear");
  useEffect(() => {
   
    axios.get("http://localhost:8080/api/material", {
      params: { companyId, financialYear }
    })
      .then(res => setMaterials(res.data))
      .catch(err => console.error("Error fetching materials:", err));

    axios.get("http://localhost:8080/api/locations")
      .then((res) => setLocations(res.data));
    axios.get("http://localhost:8080/api/goodsTransferCategory", {
      params: { companyId, financialYear },
    })
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Debug categories
  useEffect(() => {
    console.log('Categories loaded:', categories);
    categories.forEach(cat => {
      console.log(`Category: "${cat.categoryName}" (length: ${cat.categoryName.length})`);
    });
  }, [categories]);

  // Fetch documents for search
  const fetchDocuments = () => {
    console.log('Fetching documents...'); // Debug log
    axios.get('http://localhost:8080/api/goodsTransfer', {
      params: { companyId, financialYear },
    })
      .then(res => {
        console.log('Documents fetched:', res.data); // Debug log
        setDocuments(res.data);
      })
      .catch(err => {
        console.error("Error fetching documents", err);
      });
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    console.log(`Selected category: "${value}" (length: ${value.length})`); // Debug log

    let docnumber = "";
    let isEnabled = false;

    // Normalize the value for comparison (trim whitespace and convert to lowercase)
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === "cancel") {
      docnumber = `CNL-${Date.now()}`;
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

    setFormData(prev => ({
      ...prev,
      category: value, // Keep original case for display
      catdesc: selectedCategory?.description || "",
      docnumber: isEnabled ? "" : docnumber
    }));

    setIsDocumentNumberEnabled(isEnabled);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentNumberChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      docnumber: value
    }));

    // Auto-search when typing (minimum 2 characters)
    if (value.length >= 2) {
      const matchedDoc = documents.find(doc =>
        doc.docnumber && doc.docnumber.toLowerCase().includes(value.toLowerCase())
      );
      if (matchedDoc) {
        // Auto-populate form with matched document data
        handleSelectDocument(matchedDoc);
      }
    }
  };

  // Handle input field click to fetch documents
  const handleDocumentNumberClick = () => {
    if (isDocumentNumberEnabled && documents.length === 0) {
      console.log('Input field clicked - fetching documents');
      fetchDocuments();
    }
  };

  const handleSelectDocument = (doc) => {
    console.log('Selected document:', doc); // Debug log

    // Set form data from selected document
    setFormData(prev => ({
      ...prev,
      docnumber: doc.docnumber || "",
      docDate: doc.docDate || today,
      postDate: doc.postDate || today,
      reference: doc.reference || "",
      location: doc.location || ""
    }));

    // Set items from document if available
    if (doc.items && doc.items.length > 0) {
      setItems(doc.items);
    }

    setShowDocumentModal(false);
  };

  const handleItemChange = (i, field, val) => {
    const updated = [...items];
    updated[i][field] = val;
    setItems(updated);
  };

  const handleAddRow = () => {
    setItems([...items, {
      materialId: "",
      description: "",
      baseUnit: "",
      price: "",
      quantity: "",
      deliveryDate: "",
      lotNo: "",
      text: "",
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const doc = {
      ...formData,
      items,
      date: today, // system-generated date
    };

    try {
      await axios.post("http://localhost:8080/api/goodsTransfer", doc);
      alert("Goods Transfer Saved Successfully!");

      // Reset form
      setFormData({
        category: "",
        catdesc: "",
        docnumber: "",
        docDate: today,
        postDate: today,
        reference: "",
        location: "",
      });
      setItems([{
        materialId: "",
        description: "",
        baseUnit: "",
        price: "",
        quantity: "",
        deliveryDate: "",
        lotNo: "",
        text: "",
      }]);
      setIsDocumentNumberEnabled(false);
      setDocuments([]); // Clear documents
    } catch (err) {
      alert("Failed to save. See console for error.");
      console.error(err);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    const filtered = materials.filter((mat) =>
      mat[searchType]?.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleViewAll = () => {
    setSearchResults(materials);
  };

  const handleClearResults = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const selectMaterialFromSearch = (material) => {
    const updated = [...items];
    updated[searchRowIndex] = {
      ...updated[searchRowIndex],
      materialId: material.materialId,
      description: material.description,
      baseUnit: material.baseUnit,
      price: material.price,
    };
    setItems(updated);
    closeSearchModal();
  };

  // Document search helper functions
  const filteredDocuments = documents.filter((doc) => {
    if (!documentViewAllClicked && !documentSearch) return false;
    const value = doc.docnumber?.toLowerCase() || "";
    return value.includes(documentSearch.toLowerCase());
  });

  const handleDocumentViewAll = () => {
    setDocumentSearch("");
    setDocumentViewAllClicked(true);
    if (documents.length === 0) {
      fetchDocuments();
    }
  };

  const handleDocumentClear = () => {
    setDocumentSearch("");
    setDocumentViewAllClicked(false);
  };

  const handleDocumentSearchChange = (e) => {
    setDocumentSearch(e.target.value);
    setDocumentViewAllClicked(false);
  };

  return (
    <div className="container p-3">
      <h6>Matrial Transfer</h6>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="row mb-2">
          <div className="col-md-3">
            <label>Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={handleCategoryChange}
            >
              <option value="">Select</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat.categoryName}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label>Description</label>
            <input className="form-control" value={formData.catdesc} readOnly />
          </div>
          <div className="col-md-3">
            <label>Document No</label>
            <div className="input-group">
              <input
                className="form-control"
                value={formData.docnumber}
                onChange={handleDocumentNumberChange}
                onClick={handleDocumentNumberClick}
                readOnly={!isDocumentNumberEnabled}
                placeholder={isDocumentNumberEnabled ? "Enter document number..." : ""}
              />
              {isDocumentNumberEnabled && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    if (documents.length === 0) {
                      fetchDocuments();
                    }
                    setShowDocumentModal(true);
                  }}
                >
                  Search
                </button>
              )}
            </div>
          </div>
          <div className="col-md-3">
            <label>Document Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.docDate}
              onChange={(e) => handleInputChange("docDate", e.target.value)}
            />
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-3">
            <label>Posting Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.postDate}
              onChange={(e) => handleInputChange("postDate", e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label>REF</label>
            <input
              className="form-control"
              value={formData.reference}
              onChange={(e) => handleInputChange("reference", e.target.value)}
            />
          </div>
          <div className="col-lg-3">

            <label >Location:</label>
            <select
              className="form-select"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            >
              <option value="">-- Select Location --</option>
              {locations.map((loc) => (
                <option
                  key={loc._id || loc.id || loc.name}
                  value={
                    loc.name || loc.locationName || loc._id
                  }
                >
                  {loc.name || loc.locationName || loc._id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item Table */}
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Material ID</th>
                <th>Description</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Del Date</th>
                <th>Lot No</th>
                <th>Price</th>
                <th>Text</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="input-group">
                      <input className="form-control form-control-sm" value={item.materialId} readOnly />
                      {!isDisplayCategory && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setSearchRowIndex(i);
                            setShowSearchModal(true);
                          }}
                        >
                          🔍
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={item.description}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                      value={item.quantity}
                      onChange={isDisplayCategory ? undefined : (e) => handleItemChange(i, "quantity", e.target.value)}
                      readOnly={isDisplayCategory}
                      disabled={isDisplayCategory}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={item.baseUnit}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                      type="date"
                      value={item.deliveryDate}
                      onChange={isDisplayCategory ? undefined : (e) => handleItemChange(i, "deliveryDate", e.target.value)}
                      readOnly={isDisplayCategory}
                      disabled={isDisplayCategory}
                    />
                  </td>
                  <td>
                    <input
                      className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                      value={item.lotNo}
                      onChange={isDisplayCategory ? undefined : (e) => handleItemChange(i, "lotNo", e.target.value)}
                      readOnly={isDisplayCategory}
                      disabled={isDisplayCategory}
                    />
                  </td>
                  <td>
                    <input
                      className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                      value={item.price}
                      onChange={isDisplayCategory ? undefined : (e) => handleItemChange(i, "price", e.target.value)}
                      readOnly={isDisplayCategory}
                      disabled={isDisplayCategory}
                    />
                  </td>
                  <td>
                    <input
                      className={`form-control ${isDisplayCategory ? 'bg-light' : ''}`}
                      value={item.text}
                      onChange={isDisplayCategory ? undefined : (e) => handleItemChange(i, "text", e.target.value)}
                      readOnly={isDisplayCategory}
                      disabled={isDisplayCategory}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hide Add Row button for Display category */}
        {!isDisplayCategory && (
          <button type="button" className="btn btn-sm btn-secondary mb-2" onClick={handleAddRow}>+ Add Row</button>
        )}

        {/* Hide Save button for Display category */}
        {!isDisplayCategory && (
          <div className="text-end">
            <button type="submit" className="btn btn-success">Save</button>
          </div>
        )}
      </form>

      {/* Material Search Modal */}
      {showSearchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-box-open me-2"></i>Search Materials</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeSearchModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                      <option value="materialId">Material ID</option>
                      <option value="description">Description</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${searchType}`}
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleViewAll}>
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {searchResults.length > 0 && (
                        <button className="btn btn-outline-secondary" onClick={handleClearResults}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {searchResults.length > 0 ? (
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
                        {searchResults.map((material, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-secondary">{material.materialId}</span></td>
                            <td>{material.description}</td>
                            <td>{material.baseUnit}</td>
                            <td>{material.price}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => selectMaterialFromSearch(material)}
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
                      <i className="fas fa-box fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {searchQuery ? `No materials found for "${searchQuery}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeSearchModal}>
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
                        onChange={handleDocumentSearchChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleDocumentViewAll}>
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {(documentSearch || documentViewAllClicked) && (
                        <button className="btn btn-outline-secondary" onClick={handleDocumentClear}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
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
                          <th>Location</th>
                          <th>Document Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-primary">{doc.docnumber}</span></td>
                            <td><span className="badge bg-info">{doc.category}</span></td>
                            <td>{doc.location}</td>
                            <td>{doc.docDate}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectDocument(doc)}
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

export default GoodsTransfer;