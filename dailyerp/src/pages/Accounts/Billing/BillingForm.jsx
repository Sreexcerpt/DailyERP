import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BillingForm() {
  const today = new Date().toISOString().split("T")[0];

  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [selectedTax, setSelectedTax] = useState({});
  const [discount, setDiscount] = useState(0);
  const [salesOrders, setSalesOrders] = useState([]);

  const [selectedSO, setSelectedSO] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [searchRowIndex, setSearchRowIndex] = useState(null); // for tracking which row to update

  const [formData, setFormData] = useState({
    category: "",
    catdesc: "",
    docnumber: "",
    documentDate: "",
    postingDate: "",
    reference: "",
    BillingRef: "",
    customer: "",
    location: "",
    hsnNo: "",
    priceUnit: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("soNumber");
  const [viewAllClicked, setViewAllClicked] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearchType, setCustomerSearchType] = useState("name1");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerViewAllClicked, setCustomerViewAllClicked] = useState(false);

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialSearchType, setMaterialSearchType] = useState("materialId");
  const [materialSearch, setMaterialSearch] = useState("");
  const [viewAllMaterials, setViewAllMaterials] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/sales-orders")
      .then((res) => setSalesOrders(res.data))
      .catch((err) => console.error("Error fetching sales orders", err));

    axios
      .get("http://localhost:8080/api/customers")
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Error fetching customers", err));

    axios
      .get("http://localhost:8080/api/material")
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error("Error fetching materials:", err));

    axios
      .get("http://localhost:8080/api/billingcategory")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));

    axios
      .get("http://localhost:8080/api/tax")
      .then((res) => setTaxes(res.data))
      .catch((err) => console.error("Error fetching tax:", err));
  }, []);

  const handleSelectSO = (so) => {
    setSelectedSO(so);
    setFormData((prev) => ({
      ...prev,
      customer: so.sales || so.customer || so.customerName,
      location: so.deliveryLocation || "",
    }));
    setShowModal(false);
  };

  const handleSelectCustomer = (cust) => {
    setFormData((prev) => ({
      ...prev,
      customer: cust.name1,
    }));
    setShowCustomerModal(false);
  };
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
          priceUnit: mat.priceUnit || formData.priceUnit, // Use priceUnit from formData if not in material
        };
        setSelectedSO((prev) => ({ ...prev, items: updatedItems }));
      }
    }
    setShowMaterialModal(false);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const selectedCategory = categories.find(
      (cat) => cat.categoryName === value
    );
    setFormData((prev) => ({
      ...prev,
      category: value,
      catdesc: selectedCategory?.description || "",
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedSO.items];
    updatedItems[index][field] = value;
    setSelectedSO({ ...selectedSO, items: updatedItems });
  };
 const totalAmount =
    selectedSO?.items?.reduce((sum, item) => {
      return sum + parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
    }, 0) || 0;

  // Apply discount first
  const discountAmount = parseFloat(discount || 0);
  const netAmount = totalAmount - discountAmount;

  // Now calculate tax on the net amount
  const cgstPercent = parseFloat(selectedTax.cgst || 0);
  const sgstPercent = parseFloat(selectedTax.sgst || 0);
  const igstPercent = parseFloat(selectedTax.igst || 0);

  const cgstAmt = (cgstPercent / 100) * netAmount;
  const sgstAmt = (sgstPercent / 100) * netAmount;
  const igstAmt = (igstPercent / 100) * netAmount;

  const finalTotal = parseFloat(
    (netAmount + cgstAmt + sgstAmt + igstAmt).toFixed(2)
  );
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSO) return alert("Please select a Purchase Order.");

    const billing = {
      ...formData,
      salesOrderId: selectedSO._id,
      items: selectedSO.items,
      receiptDate: today,
      taxCode: selectedTax.taxCode,
      taxName: selectedTax.taxName,
      cgst: cgstAmt,
      sgst: sgstAmt,
      igst: igstAmt,
      totalAmount: totalAmount,
      discount,
      netAmount,
      finalTotal:finalTotal,
    };
console.log(billing.finalTotal)
    try {
      await axios.post("http://localhost:8080/api/billingform", billing);
      alert("billing saved successfully!");
      // navigate("/BillingDisplay");
      // ✅ Reset form
      setFormData({
        category: "",
        catdesc: "",
        docnumber: "",
        documentDate: "",
        postingDate: "",
        reference: "",
        BillingRef: "",
        customer: "",
        location: "",
        priceUnit: "",
      });
      setSelectedSO(null);
      setSelectedTax({});
      setDiscount(0);
    } catch (err) {
      console.error("Error saving biiling:", err);
      alert("Failed to save billing");
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
  const filteredMaterials = materials.filter((mat) => {
    if (!viewAllMaterials && !materialSearch) return false;
    const value = mat[materialSearchType]?.toLowerCase() || "";
    return value.includes(materialSearch.toLowerCase());
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

 

  return (
    <div className="content p-3">
      <h6>Billing Form </h6>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            {/* <div className="row mb-2">
              <div className="col-md-6">
              <div className="col-md-3">
                <label>Category</label>
                <select className="form-select" value={formData.category} onChange={handleCategoryChange}>
                  <option value="">Select</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>

              <div className="col-xl-3">
                <label>Sales Order</label>
                <div className="input-group">
                  <input type="text" name="so" value={selectedSO?.soNumber || ""} className="form-control" readOnly />
                  <button type="button" className="btn btn-outline-primary" onClick={() => setShowModal(true)}>Search</button>
                </div>
              </div>
              <div className="col-xl-3">
                <label>Customer</label>
                <div className="input-group">
                  <input type="text" className="form-control" value={formData.customer} readOnly />
                  <button type="button" className="btn btn-outline-primary" onClick={() => setShowCustomerModal(true)}>Search</button>
                </div>
              </div>
              <div className="col-md-2">
                <label>Tax Code</label>
                <select className="form-select" value={selectedTax.taxCode || ""} onChange={(e) => {
                  const t = taxes.find(t => t.taxCode === e.target.value);
                  setSelectedTax(t || {});
                }}>
                  <option value="">Select</option>
                  {taxes.map(t => (
                    <option key={t._id} value={t.taxCode}>{t.taxCode} - {t.taxName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label>Tax Name</label>
                <input type="text" className="form-control" value={selectedTax.taxName || ""} onChange={(e) => setSelectedTax(prev => ({ ...prev, taxName: e.target.value }))} />
              </div>
              </div>

              <div className="col-md-6">
                       <div className="col-md-2">
                <label>Document Date</label>
                <input type="date" className="form-control" value={formData.documentDate} onChange={(e) => setFormData(prev => ({ ...prev, documentDate: e.target.value }))} />
              </div>
              <div className="col-md-2">
                <label>Posting Date</label>
                <input type="date" className="form-control" value={formData.postingDate} onChange={(e) => setFormData(prev => ({ ...prev, postingDate: e.target.value }))} />
              </div>
              <div className="col-md-3">
                <label>Reference</label>
                <input type="text" className="form-control" value={formData.reference} onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))} />
              </div>

              <div className="col-md-2">
                <label>Location</label>
                <input type="text" className="form-control" value={formData.location} readOnly />
              </div>
              <div className="col-md-2">
                <label>Billing Ref</label>
                <input type="text" className="form-control" value={formData.BillingRef} onChange={(e) => setFormData(prev => ({ ...prev, BillingRef: e.target.value }))} />
              </div>

              </div>

            </div> */}

            <div className="row mb-3">
              {/* LEFT GRID */}
              <div className="col-md-6">
                <div className="row g-3">
                  {/* Category */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Category :
                      </label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={handleCategoryChange}
                      >
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.categoryName}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sales Order */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Sales Order :
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="so"
                          placeholder="Search Sales Order"
                          value={selectedSO?.soNumber || ""}
                          className="form-control form-control-sm"
                          readOnly
                        />
                        <button
                          type="button"
                          // style={{ width: "40px",height:"25px",padding:"0px 0px 0px 0px"}}
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setShowModal(true)}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Customer :
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search Customer"
                          value={formData.customer}
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setShowCustomerModal(true)}
                          // style={{ width: "40px",height:"25px",padding:"0px 0px 0px 0px"}}
                        >
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tax Code */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Tax Code :
                      </label>
                      <select
                        className="form-select"
                        value={selectedTax.taxCode || ""}
                        onChange={(e) => {
                          const t = taxes.find(
                            (t) => t.taxCode === e.target.value
                          );
                          setSelectedTax(t || {});
                        }}
                      >
                        <option value="">Select</option>
                        {taxes.map((t) => (
                          <option key={t._id} value={t.taxCode}>
                            {t.taxCode} - {t.taxName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tax Name */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Tax Name :
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tax Name"
                        value={selectedTax.taxName || ""}
                        onChange={(e) =>
                          setSelectedTax((prev) => ({
                            ...prev,
                            taxName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT GRID */}
              <div className="col-md-6">
                <div className="row g-3">
                  {/* Document Date */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Document Date :
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.documentDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            documentDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Posting Date */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Posting Date: 
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.postingDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            postingDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Reference */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Reference :
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Reference"
                        value={formData.reference}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            reference: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Location :
                      </label>
                      <input
                        type="text"
                        placeholder="Location"
                        className="form-control"
                        value={formData.location}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Billing Ref */}
                  <div className="col-md-8">
                    <div className="d-flex align-items-center">
                      <label className="form-label" style={{ width: "120px" }}>
                        Billing Ref :
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Billing Reference"
                        value={formData.BillingRef}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            BillingRef: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Item No</th>
                    <th>Mat No</th>
                    <th>Description</th>
                    <th>HSN NO</th>
                    <th>QTY</th>
                    <th>UOM</th>
                    <th>Del Date</th>
                    <th>LOT No</th>
                    <th>Price</th>
                    <th>PriceUnit</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedSO?.items?.length ? selectedSO.items : [{}]).map(
                    (item, idx) => (
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
                              className="btn btn-outline-primary btn-sm"
                              // style={{ width: "40px",height:"25px",padding:"0px 0px 0px 0px"}}
                              onClick={() => {
                                setSearchRowIndex(idx);
                                setShowMaterialModal(true);
                              }}
                            >
                              <i className="fas fa-search"></i>
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
                            value={item.hsnNo || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "hsnNo", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", e.target.value)
                            }
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
                            value={item.deliveryDate}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "deliveryDate",
                                e.target.value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={item.lotNo || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "lotNo", e.target.value)
                            }
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
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={item.priceUnit || ""}
                            readOnly
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="row justify-content-end mt-3">
              <div className="col-md-4">
                <div className="card p-3">
                  <h6 className="mb-3">Billing Summary</h6>

                  <div className="mb-2">
                    <label>Total Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={totalAmount.toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="mb-2">
                    <label>Discount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <label>Net Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={netAmount.toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="mb-2">
                    <label>CGST (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedTax.cgst || ""}
                      onChange={(e) =>
                        setSelectedTax((prev) => ({
                          ...prev,
                          cgst: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <label>SGST (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedTax.sgst || ""}
                      onChange={(e) =>
                        setSelectedTax((prev) => ({
                          ...prev,
                          sgst: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mb-2">
                    <label>IGST (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedTax.igst || ""}
                      onChange={(e) =>
                        setSelectedTax((prev) => ({
                          ...prev,
                          igst: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <hr />

                  <div className="mb-0 fw-bold">
                    <label>Final Total</label>
                    <input
                      type="number"
                      className="form-control"
                      value={finalTotal}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-end mt-3">
          <button type="submit" className="btn btn-success">
            Save
          </button>
        </div>
      </form>

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Search Sales Orders
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="soNumber">SO Number</option>
                      <option value="sales">Customer</option>
                      <option value="deliveryLocation">Location</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${searchType}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleViewAll}>
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {(searchQuery || viewAllClicked) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleClear}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <td>
                              <span className="badge bg-primary">
                                {so.soNumber}
                              </span>
                            </td>
                            <td>
                              {so.sales || so.customer || so.customerName}
                            </td>
                            <td>{so.deliveryLocation}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectSO(so)}
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
                        {searchQuery
                          ? `No sales orders found for "${searchQuery}"`
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
                  onClick={() => setShowModal(false)}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Customer Modal */}
      {showCustomerModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-users me-2"></i>Select Customer
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCustomerModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={customerSearchType}
                      onChange={(e) => setCustomerSearchType(e.target.value)}
                    >
                      <option value="name1">Customer Name</option>
                      <option value="customerId">Customer ID</option>
                      <option value="city">City</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${customerSearchType}`}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info"
                        onClick={handleCustomerViewAll}
                      >
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {(customerSearch || customerViewAllClicked) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleCustomerClear}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <td>
                              <span className="badge bg-secondary">
                                {cust.customerId}
                              </span>
                            </td>
                            <td>{cust.name1}</td>
                            <td>{cust.city}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectCustomer(cust)}
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
                      <i className="fas fa-users fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {customerSearch
                          ? `No customers found for "${customerSearch}"`
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
                  onClick={() => setShowCustomerModal(false)}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMaterialModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-box-open me-2"></i>Select Material
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowMaterialModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={materialSearchType}
                      onChange={(e) => setMaterialSearchType(e.target.value)}
                    >
                      <option value="materialId">Material ID</option>
                      <option value="description">Description</option>
                      <option value="baseUnit">Base Unit</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${materialSearchType}`}
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info"
                        onClick={() => setViewAllMaterials(true)}
                      >
                        View All
                      </button>
                      {(materialSearch || viewAllMaterials) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setMaterialSearch("");
                            setViewAllMaterials(false);
                          }}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <td>
                              <span className="badge bg-secondary">
                                {mat.materialId}
                              </span>
                            </td>
                            <td>{mat.description}</td>
                            <td>{mat.baseUnit}</td>
                            <td>{mat.price}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectMaterial(mat)}
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
                        {materialSearch
                          ? `No materials found for "${materialSearch}"`
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
                  onClick={() => setShowMaterialModal(false)}
                >
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

export default BillingForm;
