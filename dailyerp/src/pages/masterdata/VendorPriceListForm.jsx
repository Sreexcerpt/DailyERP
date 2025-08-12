import React, { useState, useEffect } from "react";
import DataImportModal from "../../components/DataImportModal";
function VendorPriceListForm() {
  const [formData, setFormData] = useState({
    categoryId: "",
    vendorId: "",
    materialId: "",
    unit: "",
    bum: "",
    price: "",
    orderUnit: "",
    buyer: "",
    taxId: "",
  });

  // Add these state variables
  const [showVendorSearchModal, setShowVendorSearchModal] = useState(false);
  const [showMaterialSearchModal, setShowMaterialSearchModal] = useState(false);
  const [vendorSearchResults, setVendorSearchResults] = useState([]);
  const [materialSearchResults, setMaterialSearchResults] = useState([]);
  const [vendorSearchType, setVendorSearchType] = useState('vendorId');
  const [materialSearchType, setMaterialSearchType] = useState('materialId');
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [priceList, setPriceList] = useState([]);
  const [conversionValue, setConversionValue] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  useEffect(() => {
    fetchCategories();
    fetchVendors();
    fetchMaterials();
    fetchTaxes();
    fetchPriceList();
  }, []);

  const fetchCategories = async () => {
    try {

      const res = await fetch("http://localhost:8080/api/vendor-categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/vendors");
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/material");
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tax");
      const data = await res.json();
      setTaxes(data);
    } catch (err) {
      console.error("Error fetching taxes:", err);
    }
  };
  const fetchPriceList = async () => {
    try {
      const companyId = localStorage.getItem('selectedCompanyId');
      const financialYear = localStorage.getItem('financialYear');
      console.log("comanyvendorpl", companyId, financialYear);

      const queryParams = new URLSearchParams({
        companyId,
        financialYear
      }).toString();

      const res = await fetch(`http://localhost:8080/api/vendor-price-lists?${queryParams}`);

      const data = await res.json();
      setPriceList(data);
    } catch (err) {
      console.error("Error fetching price list:", err);
    }
  };


  const handleChange = async (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (name === "materialId") {
      try {
        const res = await fetch(`http://localhost:8080/api/material/${value}`);
        const mat = await res.json();
        const conv = mat.conversionValue || 1;
        setConversionValue(conv);

        const bum = parseFloat(formData.bum) || 0;
        updatedForm.orderUnit = (bum * conv).toFixed(2);
      } catch (err) {
        console.error("Error fetching material:", err);
        setConversionValue(1);
      }
    }

    if (name === "bum") {
      const bum = parseFloat(value);
      if (!isNaN(bum)) {
        updatedForm.orderUnit = (bum * conversionValue).toFixed(2);
      } else {
        updatedForm.orderUnit = "";
      }
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async () => {
    const errors = [];
    if (!formData.unit.trim()) errors.push("Unit (Location) is required.");
    if (!formData.categoryId) errors.push("Category is required.");
    if (!formData.vendorId) errors.push("Vendor is required.");
    if (!formData.materialId) errors.push("Material is required.");
    if (!formData.bum) errors.push("BUM (Base Unit Multiplier) is required.");
    if (!formData.buyer.trim()) errors.push("Buyer is required.");

    const dataToSubmit = {
      ...formData,
      companyId,
      financialYear
    };
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    try {
      if (editingId) {
        // Update existing record
        console.log("Updating with ID:", editingId);
        console.log("Form data:", formData);

        const res = await fetch(
          `http://localhost:8080/api/vendor-price-lists/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSubmit),
          }
        );

        console.log("Update response status:", res.status);

        if (res.ok) {
          alert("Vendor Price List Updated Successfully!");
          setEditingId(null);
        } else {
          const errorText = await res.text();
          console.error("Update failed:", errorText);
          throw new Error(`Update failed: ${res.status} - ${errorText}`);
        }
      } else {
        // Create new record
        const res = await fetch(
          "http://localhost:8080/api/vendor-price-lists",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSubmit),
          }
        );

        if (res.ok) {
          alert("Vendor Price List Saved Successfully!");
        } else {
          const errorText = await res.text();
          console.error("Save failed:", errorText);
          throw new Error(`Save failed: ${res.status} - ${errorText}`);
        }
      }

      resetForm();
      setShowForm(false);
      fetchPriceList(); // Refresh the list

    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save Vendor Price List: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: "",
      vendorId: "",
      materialId: "",
      unit: "",
      bum: "",
      price: "",
      orderUnit: "",
      buyer: "",
      taxId: "",
    });
    setConversionValue(1);
    setEditingId(null);
  };

  const handleEdit = async (id) => {
    try {
      console.log("Editing ID:", id);
      const res = await fetch(
        `http://localhost:8080/api/vendor-price-lists/${id}`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();


      // Extract ID from ObjectId format or use as string
      const extractId = (idField) => {
        if (!idField) return "";
        if (typeof idField === "string") return idField;
        if (typeof idField === "object") {
          return idField.$oid || idField._id || idField.toString();
        }
        return idField.toString();
      };

      setFormData({
        categoryId: extractId(data.categoryId),
        vendorId: extractId(data.vendorId),
        materialId: extractId(data.materialId),
        unit: data.unit,
        bum: data.bum,
        orderUnit: data.orderUnit,
        price: data.price,
        buyer: data.buyer,
        taxId: extractId(data.taxId),
      });

      setEditingId(id);
      setShowForm(true);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching record for edit:", err);
      alert("Failed to load record for editing: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const res = await fetch(
          `http://localhost:8080/api/vendor-price-lists/${id}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          alert("Record deleted successfully!");
          fetchPriceList();
        } else {
          throw new Error("Delete failed");
        }
      } catch (err) {
        console.error("Error deleting record:", err);
        alert("Failed to delete record");
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  // Helper function to extract ID from ObjectId format
  const extractId = (idField) => {
    if (!idField) return null;
    if (typeof idField === "string") return idField;
    if (typeof idField === "object") {
      return idField.$oid || idField._id || idField.toString();
    }
    return idField.toString();
  };

  const getCategoryName = (categoryId) => {
    const id = extractId(categoryId);
    const category = categories.find((cat) => cat._id === id);
    return category ? category.categoryName : "Unknown";
  };

  const getVendorName = (vendorId) => {
    const id = extractId(vendorId);
    const vendor = vendors.find((v) => v._id === id);
    return vendor ? vendor.name1 : "Unknown";
  };

  const getMaterialName = (materialId) => {
    const id = extractId(materialId);
    const material = materials.find((m) => m._id === id);
    return material ? material.description : "Unknown";
  };

  const getTaxName = (taxId) => {
    if (!taxId) return "No Tax";
    const id = extractId(taxId);
    const tax = taxes.find((t) => t._id === id);
    return tax ? tax.taxName : "Unknown";
  };

  const [showModal, setShowModal] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = priceList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(priceList.length / itemsPerPage);
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  // Vendor Search Handlers
  const openVendorSearchModal = () => {
    setShowVendorSearchModal(true);
    setVendorSearchQuery('');
    setVendorSearchResults([]);
  };

  const closeVendorSearchModal = () => {
    setShowVendorSearchModal(false);
    setVendorSearchQuery('');
    setVendorSearchResults([]);
  };

  const handleVendorSearchInputChange = (e) => {
    setVendorSearchQuery(e.target.value);
  };

  const handleVendorSearch = () => {
    if (!vendorSearchQuery.trim()) {
      setVendorSearchResults([]);
      return;
    }

    if (vendorSearchType === 'vendorId') {
      const filtered = vendors.filter(vendor => {
        const vendorId = vendor.vendorId || '';
        return vendorId.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      });
      setVendorSearchResults(filtered);
    } else {
      const filtered = vendors.filter(vendor => {
        const name = vendor.name1 || '';
        return name.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      });
      setVendorSearchResults(filtered);
    }
  };

  const handleViewAllVendors = () => {
    setVendorSearchResults(vendors);
    setVendorSearchQuery('');
  };

  const handleClearVendorResults = () => {
    setVendorSearchResults([]);
    setVendorSearchQuery('');
  };

  const selectVendorFromSearch = (vendor) => {
    handleChange({ target: { name: "vendorId", value: vendor._id } });
    closeVendorSearchModal();
  };

  // Material Search Handlers
  const openMaterialSearchModal = () => {
    setShowMaterialSearchModal(true);
    setMaterialSearchQuery('');
    setMaterialSearchResults([]);
  };

  const closeMaterialSearchModal = () => {
    setShowMaterialSearchModal(false);
    setMaterialSearchQuery('');
    setMaterialSearchResults([]);
  };

  const handleMaterialSearchInputChange = (e) => {
    setMaterialSearchQuery(e.target.value);
  };

  const handleMaterialSearch = () => {
    if (!materialSearchQuery.trim()) {
      setMaterialSearchResults([]);
      return;
    }

    if (materialSearchType === 'materialId') {
      const filtered = materials.filter(material => {
        const materialId = material.materialId || '';
        return materialId.toLowerCase().includes(materialSearchQuery.toLowerCase());
      });
      setMaterialSearchResults(filtered);
    } else {
      const filtered = materials.filter(material => {
        const description = material.description || '';
        return description.toLowerCase().includes(materialSearchQuery.toLowerCase());
      });
      setMaterialSearchResults(filtered);
    }
  };

  const handleViewAllMaterials = () => {
    setMaterialSearchResults(materials);
    setMaterialSearchQuery('');
  };

  const handleClearMaterialResults = () => {
    setMaterialSearchResults([]);
    setMaterialSearchQuery('');
  };

  const selectMaterialFromSearch = (material) => {
    handleChange({ target: { name: "materialId", value: material._id } });
    closeMaterialSearchModal();
  };

  // Add these useEffect hooks
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (vendorSearchQuery.trim()) {
        handleVendorSearch();
      } else {
        setVendorSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [vendorSearchQuery, vendorSearchType, vendors]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (materialSearchQuery.trim()) {
        handleMaterialSearch();
      } else {
        setMaterialSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [materialSearchQuery, materialSearchType, materials]);

  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
  };

  return (
    <>
      <div className="content content-two">
        <h4>Vendor-Price-List</h4>
        <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3 mt-3">
          <div>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ti ti-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search"

              />
            </div>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
            <button
              className="btn btn-outline-primary d-inline-flex align-items-center"
              onClick={() => setShowDataImportModal(true)}
            >
              <i className="isax isax-import-1 me-1"></i>Import
            </button>
            <div className="dropdown">
              <a
                href="javascript:void(0);"
                className="btn btn-outline-primary d-inline-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <i className="isax isax-export-1 me-1"></i>Export
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="javascript:void(0);">
                    Download as PDF
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="javascript:void(0);">
                    Download as Excel
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <a
                href="javascript:void(0);"
                className="btn btn-primary d-flex align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#add_modal"
                onClick={() => {
                  setShowModal(true);
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: "",
                    customerId: "",
                    materialId: "",
                    unit: "",
                    bum: "",
                    orderUnit: "",
                    salesGroup: "",
                    taxId: "",
                    tandc: "",
                  }));

                  setEditingId(null);
                }}
              >
                <i className="isax isax-add-circle5 me-1"></i>New Price List
              </a>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered datatable">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vendor</th>
                <th>Material</th>
                <th>Unit</th>
                <th>BUM</th>
                <th>Order Unit</th>
                <th>Buyer</th>
                <th>Tax</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={extractId(item._id)}>

                  <td>
                    <div className="d-flex align-items-center">
                      <h6 className="fs-14 fw-medium mb-0">
                        <a href="javascript:void(0);">
                          {getCategoryName(item.categoryId)}
                        </a>
                      </h6>
                    </div>
                  </td>
                  <td>{getVendorName(item.vendorId)}</td>
                  <td>{getMaterialName(item.materialId)}</td>
                  <td className="text-dark">{item.unit}</td>
                  <td className="text-dark">{item.bum}</td>
                  <td className="text-dark">{item.orderUnit}</td>
                  <td className="text-dark">{item.buyer}</td>
                  <td className="text-dark">{getTaxName(item.taxId)}</td>
                  <td style={{ cursor: "pointer" }}>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={() => handleEdit(extractId(item._id))}
                    >Edit
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="dataTables_paginate paging_simple_numbers"
            id="DataTables_Table_0_paginate"
          >
            <ul className="pagination">
              <li
                className={`paginate_button page-item previous ${currentPage === 1 ? "disabled" : ""
                  }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(currentPage - 1);
                  }}
                >
                  <i className="isax isax-arrow-left"></i>
                </a>
              </li>

              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`paginate_button page-item ${currentPage === i + 1 ? "active" : ""
                    }`}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageClick(i + 1);
                    }}
                  >
                    {i + 1}
                  </a>
                </li>
              ))}

              <li
                className={`paginate_button page-item next ${currentPage === totalPages ? "disabled" : ""
                  }`}
              >
                <a
                  href="#"
                  className="page-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageClick(currentPage + 1);
                  }}
                >
                  <i className="isax isax-arrow-right-1"></i>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div
          id="add_modal"
          className={`modal fade ${showModal ? "show" : ""}`}
          style={{ display: showModal ? "block" : "none" }}
          role="dialog"
          aria-hidden={!showModal}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">
                  {editingId ? "Edit Entry" : "Add New Entry"}
                </h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close btn-close-modal"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                >
                  <i className="fa-solid fa-x"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    {/* Unit */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Unit (Location):</label></div>
                        <div className="col-8">
                          <input
                            type="text"
                            name="unit"
                            className="form-control"
                            placeholder="Enter Unit (Location)"
                            value={formData.unit}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Category:</label></div>
                        <div className="col-8">
                          <select
                            name="categoryId"
                            className="form-select"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Vendor:</label></div>
                        <div className="col-8 d-flex">
                          <select
                            name="vendorId"
                            className="form-select me-2"
                            value={formData.vendorId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Vendor</option>
                            {vendors.map((v) => (
                              <option key={v._id} value={v._id}>{v.name1}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={openVendorSearchModal}
                            title="Search Vendor"
                          >
                            <i className="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Material */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Material:</label></div>
                        <div className="col-8 d-flex">
                          <select
                            name="materialId"
                            className="form-select me-2"
                            value={formData.materialId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Material</option>
                            {materials.map((m) => (
                              <option key={m._id} value={m._id}>{m.description}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={openMaterialSearchModal}
                            title="Search Material"
                          >
                            <i className="fas fa-search"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* BUM */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Base Unit (BUM):</label></div>
                        <div className="col-8">
                          <input
                            type="number"
                            name="bum"
                            className="form-control"
                            placeholder="Enter Base Unit (BUM)"
                            value={formData.bum}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Buyer */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Buyer:</label></div>
                        <div className="col-8">
                          <input
                            type="text"
                            name="buyer"
                            className="form-control"
                            placeholder="Enter Buyer"
                            value={formData.buyer}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Unit */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Order Unit:</label></div>
                        <div className="col-8">
                          <input
                            type="text"
                            name="orderUnit"
                            className="form-control"
                            placeholder="Enter Order Unit"
                            value={formData.orderUnit}
                            readOnly
                            style={{ backgroundColor: "#e9e9e9" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tax */}
                    <div className="col-md-4 mb-2">
                      <div className="row">
                        <div className="col-4"><label className="form-label">Tax:</label></div>
                        <div className="col-8">
                          <select
                            name="taxId"
                            className="form-select"
                            value={formData.taxId}
                            onChange={handleChange}
                          >
                            <option value="">Select Tax</option>
                            {taxes.map((tax) => (
                              <option key={tax._id} value={tax._id}>{tax.taxName}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="modal-footer d-flex align-items-center justify-content-between gap-1">
                  <button
                    type="button"
                    className="btn btn-outline-white"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

        {/* Vendor Search Modal */}
        {showVendorSearchModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-search me-2"></i>Search Vendors
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeVendorSearchModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Search Controls */}
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Search Type</label>
                      <select
                        className="form-select"
                        value={vendorSearchType}
                        onChange={(e) => setVendorSearchType(e.target.value)}
                      >
                        <option value="vendorId">Vendor ID</option>
                        <option value="name">Vendor Name</option>
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
                          placeholder={
                            vendorSearchType === 'vendorId'
                              ? 'Enter Vendor ID...'
                              : 'Search by Vendor Name...'
                          }
                          value={vendorSearchQuery}
                          onChange={handleVendorSearchInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <div className="d-flex gap-2">
                        <button className="btn btn-info" onClick={handleViewAllVendors}>
                          <i className="fas fa-list me-1"></i>View All
                        </button>
                        {vendorSearchResults.length > 0 && (
                          <button className="btn btn-outline-secondary" onClick={handleClearVendorResults}>
                            <i className="fas fa-times me-1"></i>Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Results */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {vendorSearchResults.length > 0 ? (
                      <table className="table table-hover">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Vendor ID</th>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Location</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorSearchResults.map((vendor, idx) => (
                            <tr key={idx}>
                              <td><span className="badge">{vendor.vendorId}</span></td>
                              <td>{vendor.name1}</td>
                              <td>{vendor.contact}</td>
                              <td>{vendor.location}</td>
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
                          {vendors.length === 0
                            ? 'No vendors loaded from API'
                            : vendorSearchQuery
                              ? `No vendors found matching "${vendorSearchQuery}"`
                              : 'Enter search term or click "View All"'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeVendorSearchModal}
                  >
                    <i className="fas fa-times me-1"></i>Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Material Search Modal */}
        {/* Material Search Modal */}
        {showMaterialSearchModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-search me-2"></i>Search Materials
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeMaterialSearchModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Search Controls */}
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
                          placeholder={
                            materialSearchType === 'materialId'
                              ? 'Enter Material ID (e.g., MMNR-100000 or 100000)'
                              : 'Search by Description...'
                          }
                          value={materialSearchQuery}
                          onChange={handleMaterialSearchInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <div className="d-flex gap-2">
                        <button className="btn btn-info" onClick={handleViewAllMaterials}>
                          <i className="fas fa-list me-1"></i>View All
                        </button>
                        {materialSearchResults.length > 0 && (
                          <button className="btn btn-outline-secondary" onClick={handleClearMaterialResults}>
                            <i className="fas fa-times me-1"></i>Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Search Results */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {materialSearchResults.length > 0 ? (
                      <table className="table table-hover">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Material ID</th>
                            <th>Description</th>
                            <th>Base Unit</th>
                            <th>Location</th>
                            <th>Material Group</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialSearchResults.map((material, idx) => (
                            <tr key={idx}>
                              <td><span className="badge">{material.materialId}</span></td>
                              <td>{material.description}</td>
                              <td><span className="badge bg-secondary">{material.baseUnit}</span></td>
                              <td>{material.location}</td>
                              <td><span className="badge bg-info">{material.materialgroup}</span></td>
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
                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                        <p className="text-muted">
                          {materials.length === 0
                            ? 'No materials loaded from API'
                            : materialSearchQuery
                              ? `No materials found matching "${materialSearchQuery}"`
                              : 'Enter search term or click "View All"'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeMaterialSearchModal}
                  >
                    <i className="fas fa-times me-1"></i>Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <DataImportModal
          show={showDataImportModal}
          onClose={() => setShowDataImportModal(false)}
          onImportSuccess={handleImportSuccess}
          masterDataType="vendorPriceList"
        />
      </div>
    </>
  );
}

export default VendorPriceListForm;
