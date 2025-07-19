import React, { useState, useEffect } from "react";
import axios, { isCancel } from "axios";

function GoodsReceipt() {
  const today = new Date().toISOString().split("T")[0];

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedPO, setSelectedPO] = useState(null);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showGRModal, setShowGRModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [searchRowIndex, setSearchRowIndex] = useState(null); // for tracking which row to update


  const [formData, setFormData] = useState({
    category: "",
    catdesc: "",
    docnumber: "",
    documentDate: today,
    postingDate: today,
    reference: "",
    vendor: "",
    location: "",
  });

  const [poSearch, setPoSearch] = useState("");
  const [poSearchType, setPoSearchType] = useState("poNumber");
  const [viewAllPOs, setViewAllPOs] = useState(false);

  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSearchType, setVendorSearchType] = useState("name1");
  const [viewAllVendors, setViewAllVendors] = useState(false);

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialSearchType, setMaterialSearchType] = useState("materialId");
  const [materialSearch, setMaterialSearch] = useState("");
  const [viewAllMaterials, setViewAllMaterials] = useState(false);


  useEffect(() => {
    axios.get('http://localhost:8080/api/purchase-orders')
      .then(res => setPurchaseOrders(res.data))
      .catch(err => console.error('Error fetching POs:', err));

    axios.get('http://localhost:8080/api/vendors')
      .then(res => setVendors(res.data))
      .catch(err => console.error('Error fetching vendors:', err));

    axios.get("http://localhost:8080/api/material")
      .then(res => setMaterials(res.data))
      .catch(err => console.error("Error fetching materials:", err));

    axios.get('http://localhost:8080/api/goodsreceiptcategory')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setFormData(prev => ({
      ...prev,
      vendor: po.vendor || "",
      location: po.deliveryLocation || ""
    }));
    setShowPOModal(false);
  };

  const handleSelectVendor = (vendor) => {
    setFormData(prev => ({
      ...prev,
      vendor: vendor.name1
    }));
    setShowVendorModal(false);
  };
  const handleSelectMaterial = (mat) => {
    if (searchRowIndex !== null && selectedPO?.items) {
      const updatedItems = [...selectedPO.items];
      if (updatedItems[searchRowIndex]) {
        updatedItems[searchRowIndex] = {
          ...updatedItems[searchRowIndex],
          materialId: mat.materialId,
          description: mat.description,
          baseUnit: mat.baseUnit,
          price: mat.price,
        };
        setSelectedPO(prev => ({ ...prev, items: updatedItems }));
      }
    }
    setShowMaterialModal(false);
  };
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [docNumberReadOnly, setDocNumberReadOnly] = useState(false);
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const selectedCategory = categories.find(cat => cat.categoryName === value);
    setFormData(prev => ({
      ...prev,
      category: value,
      catdesc: selectedCategory?.categoryName || "",
    }));
    const lowerCat = selectedCategory?.categoryName?.toLowerCase();
    setDocNumberReadOnly(lowerCat === "cancel");
    setIsDisplayMode(lowerCat === "display");
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedPO.items];
    updatedItems[index][field] = value;
    setSelectedPO({ ...selectedPO, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPO) return alert("Please select a Purchase Order.");

    const receipt = {
      ...formData,
      purchaseOrderId: selectedPO._id,
      items: selectedPO.items,
      receiptDate: today
    };

    try {
      if (categories.find(cat => cat.categoryName === formData.category)?.categoryName.toLowerCase() === "cancel") {
        await axios.patch(`http://localhost:8080/api/goodsreceipt/${selectedPO._id}`, {
          isdelete: true
        });
      }
      else {
        await axios.post("http://localhost:8080/api/goodsreceipt", receipt);
      }
      alert("Goods Receipt saved successfully!");
      setFormData({
        category: "",
        catdesc: "",
        docnumber: "",
        documentDate: today,
        postingDate: today,
        reference: "",
        vendor: "",
        location: "",
      });
      setSelectedPO(null);
    } catch (err) {
      console.error("Error saving goods receipt", err);
      alert("Failed to save goods receipt");
    }
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    if (!viewAllPOs && !poSearch) return false;
    const value = po[poSearchType]?.toLowerCase() || "";
    return value.includes(poSearch.toLowerCase());
  });

  const filteredVendors = vendors.filter((v) => {
    if (!viewAllVendors && !vendorSearch) return false;
    const value = v[vendorSearchType]?.toLowerCase() || "";
    return value.includes(vendorSearch.toLowerCase());
  });
  const filteredMaterials = materials.filter((mat) => {
    if (!viewAllMaterials && !materialSearch) return false;
    const value = mat[materialSearchType]?.toLowerCase() || "";
    return value.includes(materialSearch.toLowerCase());
  });

  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [grSearchType, setGRSearchType] = useState("grNumber");
  const [grSearch, setGRSearch] = useState("");
  const [viewAllGRs, setViewAllGRs] = useState(false);
  useEffect(() => {
    axios.get("http://localhost:8080/api/goodsreceipt")
      .then(res => setGoodsReceipts(res.data))
      .catch(err => console.error("Error fetching goods receipts:", err));
  }, []);
  const filteredGRs = goodsReceipts.filter((gr) => {
    if (!viewAllGRs && !grSearch) return false;
    const value = gr[grSearchType]?.toLowerCase() || "";
    return value.includes(grSearch.toLowerCase());
  });
  const handleSelectGR = (gr) => {
    const lowerCat = gr.category?.toLowerCase();
    const isReadOnlyMode = lowerCat === "cancel";

    setFormData(prev => ({
      ...prev,
      docnumber: gr.docnumber,
      vendor: gr.vendor,
      location: gr.location,
      reference: gr.reference,
      documentDate: gr.documentDate,
      postingDate: gr.postingDate,
    }));

    // Set selectedPO with items if in read-only mode

    // Set selectedPO with items if in read-only mode, but do not set category
    const { category, catdesc, ...poData } = gr;
    setSelectedPO(poData);

    console.log("select ", gr.items)
    setDocNumberReadOnly(!isReadOnlyMode);
    setShowGRModal(false);
  };



  console.log("selectedPO", selectedPO);
  console.log("isReadOnlyMode", docNumberReadOnly);
  return (
    <div className="content p-3">
      <h6>Goods Receipt</h6>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <div className="row mb-2">
              <div className="col-md-3">
                <label>Category</label>
                <select className="form-select" value={formData.category} onChange={handleCategoryChange}>
                  <option value="">Select</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label>Description</label>
                <input type="text" className="form-control form-control-sm" value={formData.catdesc} readOnly />
              </div>
              <div className="col-md-3">
                <label>PO Number</label>
                <div className="input-group">
                  <input type="text" className="form-control form-control-sm" value={selectedPO?.poNumber || ""} readOnly />
                  <button type="button" className="btn btn-outline-primary btn-sm" disabled={docNumberReadOnly || isDisplayMode} onClick={() => setShowPOModal(true)}>Search</button>
                </div>
              </div>
              <div className="col-md-3">
                <label>Document Number</label>
                <div className="input-group">
                  <input type="text" className="form-control form-control-sm" value={formData.docnumber} onChange={(e) =>
                    setFormData(prev => ({ ...prev, docnumber: e.target.value }))
                  }
                    readOnly={!docNumberReadOnly} />
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowGRModal(true)}>Search</button>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-md-2">
                <label>Document Date</label>
                <input type="date" className="form-control" value={formData.documentDate} readOnly={docNumberReadOnly} onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))} />
              </div>
              <div className="col-md-2">
                <label>Posting Date</label>
                <input type="date" className="form-control" value={formData.postingDate} readOnly={docNumberReadOnly} onChange={(e) => setFormData(prev => ({ ...prev, postingDate: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label>Reference</label>
                <input type="text" className="form-control" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} readOnly={isDisplayMode}/>
              </div>
              <div className="col-md-3">
                <label>Vendor</label>
                <div className="input-group">
                  <input type="text" className="form-control form-control-sm" value={formData.vendor} readOnly />
                  <button type="button" className="btn btn-outline-primary btn-sm" disabled={docNumberReadOnly || isDisplayMode} onClick={() => setShowVendorModal(true)}>Search</button>

                </div>
              </div>
              <div className="col-md-2">
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
                  <th>Description</th>
                  <th>QTY</th>
                  <th>UOM</th>
                  <th>Del Date</th>
                  <th>LOT No</th>
                  <th>Price</th>
                  {docNumberReadOnly && !isDisplayMode && <th>Cancel</th>}
                </tr>
              </thead>
              <tbody>
                {(selectedPO?.items?.length ? selectedPO.items : [{}]).map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>

                    <td>
                      <div className="input-group">
                        <input
                          className="form-control form-control-sm"
                          value={item.materialId || ""}
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setSearchRowIndex(idx);
                            setShowMaterialModal(true);
                          }}
                          disabled={docNumberReadOnly||isDisplayMode}
                        >
                          🔍
                        </button>
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.description || ""}
                        readOnly
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        readOnly={docNumberReadOnly||isDisplayMode}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.baseUnit || ""}
                        readOnly
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        className="form-control"
                        value={item.deliveryDate || today}
                        onChange={(e) =>
                          handleItemChange(idx, "deliveryDate", e.target.value)
                        }
                        readOnly={docNumberReadOnly||isDisplayMode}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={item.lotNo || ""}
                        onChange={(e) => handleItemChange(idx, "lotNo", e.target.value)}
                        readOnly={docNumberReadOnly||isDisplayMode}
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={item.price || ""}
                        readOnly
                      />
                    </td>
                    {docNumberReadOnly && !isDisplayMode && <td>
                      <input type="checkbox" onChange={(e) => handleItemChange(idx, "cancel", e.target.checked)} />
                    </td>}
                  </tr>
                ))}
              </tbody>

            </table>
            </div>
          </div>
        </div>

        <div className="text-end mt-3">
          <button type="submit" className="btn btn-success">Save</button>
        </div>
      </form>

      {showVendorModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-users me-2"></i>Select Vendor</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowVendorModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={vendorSearchType} onChange={(e) => setVendorSearchType(e.target.value)}>
                      <option value="name1">Vendor Name</option>
                      <option value="vendorId">Vendor ID</option>
                      <option value="city">City</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${vendorSearchType}`} value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={() => setViewAllVendors(true)}>View All</button>
                      {(vendorSearch || viewAllVendors) && (
                        <button className="btn btn-outline-secondary" onClick={() => { setVendorSearch(""); setViewAllVendors(false); }}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredVendors.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Vendor ID</th>
                          <th>Name</th>
                          <th>City</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVendors.map((vendor, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-secondary">{vendor.vendorId}</span></td>
                            <td>{vendor.name1}</td>
                            <td>{vendor.city}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectVendor(vendor)}>
                                <i className="fas fa-check me-1"></i>Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-users fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {vendorSearch ? `No vendors found for "${vendorSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVendorModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPOModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-search me-2"></i>Select Purchase Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPOModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={poSearchType} onChange={(e) => setPoSearchType(e.target.value)}>
                      <option value="poNumber">PO Number</option>
                      <option value="vendor">Vendor</option>
                      <option value="deliveryLocation">Location</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${poSearchType}`} value={poSearch} onChange={(e) => setPoSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={() => setViewAllPOs(true)}>View All</button>
                      {(poSearch || viewAllPOs) && (
                        <button className="btn btn-outline-secondary" onClick={() => { setPoSearch(""); setViewAllPOs(false); }}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredPOs.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>PO Number</th>
                          <th>Vendor</th>
                          <th>Location</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPOs.map((po, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-primary">{po.poNumber}</span></td>
                            <td>{po.vendor}</td>
                            <td>{po.deliveryLocation}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectPO(po)}>
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
                        {poSearch ? `No purchase orders found for "${poSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPOModal(false)}>
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
      {showGRModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="fas fa-search me-2"></i>Select Goods Receipt</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGRModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select className="form-select" value={grSearchType} onChange={(e) => setGRSearchType(e.target.value)}>
                      <option value="docnumber">GR Number</option>
                      <option value="vendor">Vendor</option>
                      <option value="location">Location</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-search"></i></span>
                      <input type="text" className="form-control" placeholder={`Search by ${grSearchType}`} value={grSearch} onChange={(e) => setGRSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={() => setViewAllGRs(true)}>View All</button>
                      {(grSearch || viewAllGRs) && (
                        <button className="btn btn-outline-secondary" onClick={() => { setGRSearch(""); setViewAllGRs(false); }}>
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredGRs.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>GR Number</th>
                          <th>Vendor</th>
                          <th>Location</th>
                          <th>Reference</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGRs.map((gr, idx) => (
                          <tr key={idx}>
                            <td><span className="badge bg-secondary">{gr.docnumber}</span></td>
                            <td>{gr.vendor}</td>
                            <td>{gr.location}</td>
                            <td>{gr.reference}</td>
                            <td>
                              <button className="btn btn-success btn-sm" onClick={() => handleSelectGR(gr)}>
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
                        {grSearch ? `No receipts found for "${grSearch}"` : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGRModal(false)}>
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

export default GoodsReceipt;
