import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InvoiceForm() {
  const today = new Date().toISOString().split("T")[0];

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [selectedTax, setSelectedTax] = useState({});
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const [selectedPO, setSelectedPO] = useState(null);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [searchRowIndex, setSearchRowIndex] = useState(null); // for tracking which row to update

  const [formData, setFormData] = useState({
    category: "",
    catdesc: "",
    docnumber: "",
    documentDate: "",
    postingDate: "",
    reference: "",
    invoiceRef: "",
    vendor: "",
    location: "",
    hsnNo: "",
    priceUnit: "",
    balance: ""
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
    axios
      .get("http://localhost:8080/api/purchase-orders")
      .then((res) => setPurchaseOrders(res.data))
      .catch((err) => console.error("Error fetching POs:", err));

    axios
      .get("http://localhost:8080/api/vendors")
      .then((res) => setVendors(res.data))
      .catch((err) => console.error("Error fetching vendors:", err));

    axios
      .get("http://localhost:8080/api/material")
      .then((res) => setMaterials(res.data))
      .catch((err) => console.error("Error fetching materials:", err));

    axios
      .get("http://localhost:8080/api/invoicecategory")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));

    axios
      .get("http://localhost:8080/api/tax")
      .then((res) => setTaxes(res.data))
      .catch((err) => console.error("Error fetching tax:", err));
  }, []);

  const handleSelectPO = (po) => {
    console.log("Selected PO:", po);
    setSelectedPO(po);
    setFormData((prev) => ({
      ...prev,
      vendor: po.vendor || "",
      location: po.deliveryLocation || "",
      priceUnit: po.priceUnit || "",
    }));
    setShowPOModal(false);
  };

  const handleSelectVendor = (vendor) => {
    setFormData((prev) => ({
      ...prev,
      vendor: vendor.name1,
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
          priceUnit: mat.priceUnit || formData.priceUnit, // Use priceUnit from formData if not in material
        };
        setSelectedPO((prev) => ({ ...prev, items: updatedItems }));
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
    const updatedItems = [...selectedPO.items];
    updatedItems[index][field] = value;
    setSelectedPO({ ...selectedPO, items: updatedItems });
  };

  // const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!selectedPO) return alert("Please select a Purchase Order.");

  //     const invoice = {
  //       ...formData,
  //       purchaseOrderId: selectedPO._id,
  //       items: selectedPO.items,
  //       receiptDate: today,
  //       taxCode: selectedTax.taxCode,
  //       taxName: selectedTax.taxName,
  //       cgst: selectedTax.cgst,
  //       sgst: selectedTax.sgst,
  //       igst: selectedTax.igst,
  //       totalAmount: totalAmount,
  //       discount,
  //       netAmount,
  //       finalTotal,
  //     };

  //     try {
  //       await axios.post("http://localhost:8080/api/invoiceform", invoice);
  //       alert("Invoice saved successfully!");
  //       navigate("/InvoiceList");

  //       // ✅ Reset form
  //       setFormData({
  //         category: "",
  //         catdesc: "",
  //         docnumber: "",
  //         documentDate: "",
  //         postingDate: "",
  //         reference: "",
  //         invoiceRef: "",
  //         vendor: "",
  //         location: "",
  //         priceUnit: "",
  //       });
  //       setSelectedPO(null);
  //       setSelectedTax({});
  //       setDiscount(0);
  //     } catch (err) {
  //       console.error("Error saving invoice:", err);
  //       alert("Failed to save invoice");
  //     }
  //   };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPO) return alert("Please select a Purchase Order.");

    const invoice = {
      ...formData,
      purchaseOrderId: selectedPO._id,
      items: selectedPO.items,
      receiptDate: today,
      taxCode: selectedTax.taxCode,
      taxName: selectedTax.taxName,
      cgst: cgstAmt,
      sgst: sgstAmt,
      igst: igstAmt,



      totalAmount,
      discount,
      netAmount,
      finalTotal,
      balance: finalTotal
    };

    try {
      await axios.post("http://localhost:8080/api/invoiceform", invoice);
      alert("Invoice saved successfully!");
      navigate("/InvoiceList");

      // ✅ Reset form
      setFormData({
        category: "",
        catdesc: "",
        docnumber: "",
        documentDate: "",
        postingDate: "",
        reference: "",
        invoiceRef: "",
        vendor: "",
        location: "",
        priceUnit: "",
        balance: ""
      });
      setSelectedPO(null);
      setSelectedTax({});
      setDiscount(0);
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice");
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
  const totalAmount =
    selectedPO?.items?.reduce((sum, item) => {
      return sum + parseFloat(item.quantity || 0) * parseFloat(item.price || 0);
    }, 0) || 0;

  //  const cgstPercent = parseFloat(selectedTax.cgst || 0);
  // const sgstPercent = parseFloat(selectedTax.sgst || 0);
  // const igstPercent = parseFloat(selectedTax.igst || 0);

  // const cgstAmt = (cgstPercent / 100) * totalAmount;
  // const sgstAmt = (sgstPercent / 100) * totalAmount;
  // const igstAmt = (igstPercent / 100) * totalAmount;

  // const finalTotal = totalAmount + cgstAmt + sgstAmt + igstAmt - discount;
  // Apply discount first
  const discountAmount = parseFloat(discount || 0);
  const netAmount = totalAmount - discountAmount;

  // Now calculate tax on the net amount
  const cgstPercent = parseFloat(selectedTax.cgst || 0);
  const sgstPercent = parseFloat(selectedTax.sgst || 0);
  const igstPercent = parseFloat(selectedTax.igst || 0);

  const cgstAmt = parseFloat(((cgstPercent / 100) * netAmount).toFixed(2));
  const sgstAmt = parseFloat(((sgstPercent / 100) * netAmount).toFixed(2));
  const igstAmt = parseFloat(((igstPercent / 100) * netAmount).toFixed(2));
  console.log(cgstAmt, sgstAmt, igstAmt)
  const finalTotal = parseFloat(
    (netAmount + cgstAmt + sgstAmt + igstAmt).toFixed(2)
  );

  return (
    <div className="content p-3">
      <h6>Invoice Form </h6>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <div className="row mb-2">
              {/* Left Column */}
              <div className="col-md-6">
                {/* Category */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Category :</label>
                  </div>
                  <div className="col-md-7">
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

                {/* PO Number */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">PO Number:</label>
                  </div>
                  <div className="col-md-7">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter PO Number"
                        className="form-control form-control-sm"
                        value={selectedPO?.poNumber || ""}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        //  style={{ width: "40px",height:"25px",padding:"0px 0px 0px 0px"}}
                        onClick={() => setShowPOModal(true)}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vendor */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Vendor :</label>
                  </div>
                  <div className="col-md-7">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Enter Vendor Name"
                        value={formData.vendor}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        // style={{ width: "40px",height:"25px",padding:"0px 0px 0px 0px"}}
                        onClick={() => setShowVendorModal(true)}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tax Code */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Tax Code :</label>
                  </div>
                  <div className="col-md-7">
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
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Tax Name :</label>
                  </div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Tax Name"
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

              {/* Right Column */}
              <div className="col-md-6">
                {/* Document Date */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Document Date :</label>
                  </div>
                  <div className="col-md-7">
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
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Posting Date :</label>
                  </div>
                  <div className="col-md-7">
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
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Reference :</label>
                  </div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Reference"
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
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Location :</label>
                  </div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      placeholder="Enter Location"
                      className="form-control"
                      value={formData.location}
                      readOnly
                    />
                  </div>
                </div>

                {/* Invoice Ref */}
                <div className="row mb-2">
                  <div className="col-md-2">
                    <label className="form-label">Invoice Ref :</label>
                  </div>
                  <div className="col-md-7">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Invoice Reference"
                      value={formData.invoiceRef}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          invoiceRef: e.target.value,
                        }))
                      }
                    />
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
                  {(selectedPO?.items?.length ? selectedPO.items : [{}]).map(
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
                              <i className="ti ti-search"></i>
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
                            type="text"
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

            {/* Summary Section */}
            <div className="row justify-content-end mt-3">
              <div className="col-md-4">
                {/* <div className="card p-3">
                  <h6 className="mb-3">Invoice Summary</h6>

                  <div className="mb-2">
                    <label className="form-label">Total Amount</label>
                    <input type="number" className="form-control" value={totalAmount.toFixed(2)} readOnly />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">CGST</label>
                    <input type="number" className="form-control" value={selectedTax.cgst || ""} onChange={(e) => setSelectedTax(prev => ({ ...prev, cgst: e.target.value }))} />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">SGST</label>
                    <input type="number" className="form-control" value={selectedTax.sgst || ""} onChange={(e) => setSelectedTax(prev => ({ ...prev, sgst: e.target.value }))} />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">IGST</label>
                    <input type="number" className="form-control" value={selectedTax.igst || ""} onChange={(e) => setSelectedTax(prev => ({ ...prev, igst: e.target.value }))} />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Discount</label>
                    <input type="number" className="form-control" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>

                  <hr />

                  <div className="mb-0 fw-bold">
                    <label className="form-label">Final Total</label>
                    <input type="number" className="form-control" value={finalTotal.toFixed(2)} readOnly />
                  </div>
                </div> */}
                <div className="card p-3">
                  <h6 className="mb-3">Billing Summary</h6>

                  <div className="mb-2">
                    <label className="form-label">Total Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={totalAmount.toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Discount</label>
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
                    <label className="form-label">Net Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      value={netAmount.toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">CGST (%)</label>
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
                    <label className="form-label">SGST (%)</label>
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
                    <label className="form-label">IGST (%)</label>
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
                    <label className="form-label">Final Total</label>
                    <input
                      type="number"
                      className="form-control"
                      value={finalTotal.toFixed(2)}
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

      {showVendorModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-users me-2"></i>Select Vendor
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowVendorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={vendorSearchType}
                      onChange={(e) => setVendorSearchType(e.target.value)}
                    >
                      <option value="name1">Vendor Name</option>
                      <option value="vendorId">Vendor ID</option>
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
                        placeholder={`Search by ${vendorSearchType}`}
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info"
                        onClick={() => setViewAllVendors(true)}
                      >
                        View All
                      </button>
                      {(vendorSearch || viewAllVendors) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setVendorSearch("");
                            setViewAllVendors(false);
                          }}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <td>
                              <span className="badge bg-secondary">
                                {vendor.vendorId}
                              </span>
                            </td>
                            <td>{vendor.name1}</td>
                            <td>{vendor.city}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectVendor(vendor)}
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
                        {vendorSearch
                          ? `No vendors found for "${vendorSearch}"`
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
                  onClick={() => setShowVendorModal(false)}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPOModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Select Purchase Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPOModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={poSearchType}
                      onChange={(e) => setPoSearchType(e.target.value)}
                    >
                      <option value="poNumber">PO Number</option>
                      <option value="vendor">Vendor</option>

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
                        placeholder={`Search by ${poSearchType}`}
                        value={poSearch}
                        onChange={(e) => setPoSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info"
                        onClick={() => setViewAllPOs(true)}
                      >
                        View All
                      </button>
                      {(poSearch || viewAllPOs) && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setPoSearch("");
                            setViewAllPOs(false);
                          }}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
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
                            <td>
                              <span className="badge bg-primary">
                                {po.poNumber}
                              </span>
                            </td>
                            <td>{po.vendor}</td>

                            <td>{po.deliveryLocation}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleSelectPO(po)}
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
                        {poSearch
                          ? `No purchase orders found for "${poSearch}"`
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
                  onClick={() => setShowPOModal(false)}
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

export default InvoiceForm;
