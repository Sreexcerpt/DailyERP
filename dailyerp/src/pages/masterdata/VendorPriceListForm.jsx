import React, { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import DataImportModal from "../../components/DataImportModal";
import axios from "axios";
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
  const [locations, setLocations] = useState([]);
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
    axios
      .get("http://localhost:8080/api/locations", {
        params: { companyId, financialYear }
      })
      .then((res) => setLocations(res.data));
  }, []);

  // Export to Excel Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = priceList.map(item => ({
      'Category': getCategoryName(item.categoryId),
      'Vendor Name': getVendorName(item.vendorId),
      'Vendor ID': getVendorId(item.vendorId),
      'Material ID': getMaterialId(item.materialId),
      'Material Description': getMaterialName(item.materialId),
      'Unit (Location)': item.unit || '',
      'BUM (Base Unit Measure)': item.bum || '',
      'Order Unit': item.orderUnit || '',
      'Price': item.price || '',
      'Buyer': item.buyer || '',
      'Tax Name': getTaxName(item.taxId),
      'Tax Details': getTaxDetails(item.taxId),
      'Company ID': item.companyId || '',
      'Financial Year': item.financialYear || '',
      'Created Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
      'Updated Date': item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Category
      { wch: 25 }, // Vendor Name
      { wch: 15 }, // Vendor ID
      { wch: 20 }, // Material ID
      { wch: 35 }, // Material Description
      { wch: 15 }, // Unit (Location)
      { wch: 15 }, // BUM
      { wch: 15 }, // Order Unit
      { wch: 12 }, // Price
      { wch: 20 }, // Buyer
      { wch: 15 }, // Tax Name
      { wch: 25 }, // Tax Details
      { wch: 15 }, // Company ID
      { wch: 15 }, // Financial Year
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Vendor Price List');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const filename = `Vendor-Price-List-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file exported successfully as: ${filename}`);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/vendor-categories", {
        params: { companyId, financialYear }
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/vendors", {
        params: { companyId, financialYear }
      });
      setVendors(res.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/material", {
        params: { companyId, financialYear }
      });
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tax", {
        params: { companyId, financialYear }
      });
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
      } catch (err) {
        console.error("Error fetching material:", err);
        setConversionValue(1);
      }
    }



    setFormData(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      setShowModal(false);
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

  const getVendorId = (vendorId) => {
    const id = extractId(vendorId);
    const vendor = vendors.find((v) => v._id === id);
    return vendor ? vendor.vnNo || vendor.vendorId : "Unknown";
  };

  const getMaterialName = (materialId) => {
    const id = extractId(materialId);
    const material = materials.find((m) => m._id === id);
    return material ? material.description : "Unknown";
  };

  const getMaterialId = (materialId) => {
    const id = extractId(materialId);
    const material = materials.find((m) => m._id === id);
    return material ? material.materialId : "Unknown";
  };

  const getTaxName = (taxId) => {
    if (!taxId) return "No Tax";
    const id = extractId(taxId);
    const tax = taxes.find((t) => t._id === id);
    return tax ? tax.taxName : "Unknown";
  };

  const getTaxDetails = (taxId) => {
    if (!taxId) return "No Tax";
    const id = extractId(taxId);
    const tax = taxes.find((t) => t._id === id);
    return tax ? `CGST: ${tax.cgst}%, SGST: ${tax.sgst}%, IGST: ${tax.igst}%` : "Unknown";
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
      <div className="content">
        {/* Header Section */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Vendor Price List</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Master
                </li>
                <li className="breadcrumb-item active" aria-current="page">Vendor Price List</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3">
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
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowDataImportModal(true)}
                >
                  <i className="ti ti-file-import me-1"></i>Import
                </button>

                {/* Updated Export Button - Direct Excel Export */}
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={exportToExcel}
                  title="Export to Excel"
                >
                  <i className="ti ti-file-export me-1"></i>Export
                </button>

                <div>
                  <a
                    href="javascript:void(0);"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setShowModal(true);
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
                      setEditingId(null);
                    }}
                  >
                    <i className="ti ti-circle-plus me-1"></i>Add New Vendor Price List
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-bordered datatable">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Category</th>
                    <th>Material</th>
                    <th>Unit</th>
                    <th>BUM</th>
                    <th>Order Unit</th>
                    <th>Price</th>
                    <th>Buyer</th>
                    <th>Tax</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={extractId(item._id)}>
                      <td>{getVendorName(item.vendorId)}</td>
                      <td>{getCategoryName(item.categoryId)}</td>

                      <td>{getMaterialName(item.materialId)}</td>
                      <td className="text-wrap">{item.unit}</td>
                      <td className="text-wrap">{item.bum}</td>
                      <td className="text-wrap">{item.orderUnit}</td>
                      <td className="text-wrap">Rs{item.price || 0}</td>
                      <td className="text-wrap">{item.buyer}</td>
                      <td className="text-wrap">{getTaxName(item.taxId)}</td>
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
            </div>
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
                    <i className="ti ti-arrow-left"></i>
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
                    <i className="ti ti-arrow-right"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {showModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex="-1"
              aria-labelledby="myLargeModalLabel"
              aria-modal="true"
              role="dialog"
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
                              <select
                                name="unit"
                                className="form-select form-select-sm"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select</option>
                                {locations.map((loc) => (
                                  <option key={loc.name} value={loc.name}>
                                    {loc.name}
                                  </option>
                                ))}
                              </select>
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
                            <div className="col-5"><label className="form-label">Base Unit (BUM):</label></div>
                            <div className="col-7">
                              <input
                                type="number"
                                name="bum"
                                className="form-control"
                                placeholder="Enter Base Unit (BUM)"
                                value={formData.bum}
                                onChange={(e) => {
                                  e.target.value = Math.max(0, e.target.value);
                                  handleChange(e);
                                }}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4"><label className="form-label">Price:</label></div>
                            <div className="col-8">
                              <input
                                type="number"
                                step="0.01"
                                name="price"
                                className="form-control"
                                placeholder="Enter Price"
                                value={formData.price}
                                onChange={handleChange}
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
                                type="number"
                                name="orderUnit"
                                className="form-control"
                                placeholder="Auto-calculated"
                                value={formData.orderUnit}
                                onChange={(e) => {
                                  e.target.value = Math.max(0, e.target.value);
                                  handleChange(e);
                                }}
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
                        className="btn btn-outline-secondary"
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
          </>)}
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
                      <table className="table table-sm table-bordered">
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
                              <td className="text-wrap">{vendor.vnNo}</td>
                              <td className="text-wrap">{vendor.name1}</td>
                              <td className="text-wrap">{vendor.contactNo}</td>
                              <td className="text-wrap">{vendor.city}</td>
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
                      <table className="table table-sm table-bordered">
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
                              <td className="text-wrap">{material.materialId}</td>
                              <td className="text-wrap">{material.description}</td>
                              <td className="text-wrap">{material.baseUnit}</td>
                              <td className="text-wrap">{material.location}</td>
                              <td className="text-wrap">{material.materialgroup}</td>
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