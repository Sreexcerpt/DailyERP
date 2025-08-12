import React, { useState, useEffect } from "react";
import axios from "axios";
import DataImportModal from "../../components/DataImportModal";
function CustomerPriceListForm() {
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const [formData, setFormData] = useState({
    _id: "", // for edit tracking
    categoryId: "",
    customerId: "",
    materialId: "",
    unit: "",
    bum: "",
    price: "",
    orderUnit: "",
    salesGroup: "",
    taxId: "",
    tandc: "",
  });
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [conversionValue, setConversionValue] = useState(1);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [allData, setAllData] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('materialId');
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
  };
  useEffect(() => {
    fetchCategories();
    fetchCustomers();
    fetchMaterials();
    fetchTaxes();
    fetchAllPriceLists();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(
      "http://localhost:8080/api/customer-categories"
    );
    setCategories(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:8080/api/customers");
    setCustomers(res.data);
    console.log("cut", res.data);
  };

  const fetchMaterials = async () => {
    const res = await axios.get("http://localhost:8080/api/material");
    setMaterials(res.data);
  };

  const fetchTaxes = async () => {
    const res = await axios.get("http://localhost:8080/api/tax");
    setTaxes(res.data);
  };

  const fetchAllPriceLists = async () => {
    const res = await axios.get(
      "http://localhost:8080/api/customer-price-lists", {
      params: { companyId, financialYear }
    }
    );
    setAllData(res.data);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (name === "materialId") {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/material/${value}`
        );
        const conv = res.data.conversionValue || 1;
        setConversionValue(conv);
        const bum = parseFloat(formData.bum) || 0;
        updatedForm.orderUnit = (bum * conv).toFixed(2);
      } catch {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      companyId,
      financialYear
    };
    try {
      if (formData._id) {
        await axios.put(
          `http://localhost:8080/api/customer-price-lists/${formData._id}`,
          dataToSubmit
        );
        alert("Updated successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/customer-price-lists`,
          dataToSubmit
        );
        alert("Saved successfully");
      }

      setFormData({
        _id: "",
        categoryId: "",
        customerId: "",
        materialId: "",
        unit: "",
        bum: "",
        price: "",
        orderUnit: "",
        salesGroup: "",
        taxId: "",
        tandc: "",
      });

      setConversionValue(1);
      handleCloseModal();
      fetchAllPriceLists(); // refresh table
    } catch (err) {
      alert("Error saving data");
      console.error("Submit error:", err);
    }
  };
  const handleEdit = (item) => {

    // Helper function to safely extract ID
    const extractId = (field) => {
      if (!field) return ""; // Handle null, undefined, or empty values
      if (typeof field === "object" && field._id) return field._id;
      if (typeof field === "string") return field;
      return "";
    };

    // Extract IDs from nested objects or use the ID directly
    const categoryId = extractId(item.categoryId);
    const customerId = extractId(item.customerId);
    const materialId = extractId(item.materialId);
    const taxId = extractId(item.taxId);
    const tandc = extractId(item.tandc);

    const newFormData = {
      _id: item._id,
      categoryId: categoryId,
      customerId: customerId,
      materialId: materialId,
      unit: item.unit || "",
      bum: item.bum || "",
      orderUnit: item.orderUnit || "",
      salesGroup: item.salesGroup || "",
      taxId: taxId,
      tandc: tandc,
      price: price,
    };

    setFormData(newFormData);
    setShowModal(true);

    // Set conversion value if material exists
    if (materialId) {
      axios
        .get(`http://localhost:8080/api/material/${materialId}`)
        .then((res) => {
          const conv = res.data.conversionValue || 1;
          setConversionValue(conv);
          console.log("Conversion value set to:", conv);
        })
        .catch((error) => {
          console.error("Error fetching material conversion:", error);
          setConversionValue(1);
        });
    }
  };

  const [showModal, setShowModal] = useState(false);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedData = allData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(allData.length / itemsPerPage);
  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = allData.filter((item) => {
    const customerName = item.customerId?.name1?.toLowerCase() || "";
    const categoryName = item.categoryId?.categoryName?.toLowerCase() || "";
    const materialDesc = item.materialId?.description?.toLowerCase() || "";

    return (
      customerName.includes(searchQuery.toLowerCase()) ||
      categoryName.includes(searchQuery.toLowerCase()) ||
      materialDesc.includes(searchQuery.toLowerCase())
    );
  });


  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [showdropdown, setShowdropdown] = useState(false);

  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);

  const openSearchModal = () => {
    setCurrentEditIndex();
    setShowSearchModal(true);
    setSearchQuery('');
    // handleCloseModal();
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setCurrentEditIndex(null);
    setSearchQuery('');
    setSearchResults([]);
  };
  const selectMaterialFromSearch = (material) => {
    console.log("Selected material:", material);
    // Trigger handleChange with name as "materialId" and value as material._id
    handleChange({ target: { name: "materialId", value: material._id } });

    closeSearchModal();
  };
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    console.log('Searching with query:', searchQuery, 'Type:', searchType);
    console.log('Available materials:', materials);

    if (searchType === 'materialId') {
      let searchTerm = searchQuery;

      if (/^\d+$/.test(searchQuery)) {
        searchTerm = MATERIAL_PREFIX + searchQuery;
      }

      const filtered = materials.filter(material => {
        const materialId = material.materialId || '';
        return materialId.toLowerCase().includes(searchTerm.toLowerCase());
      });

      console.log('Filtered results for materialId:', filtered);
      setSearchResults(filtered);
    } else {
      const filtered = materials.filter(material => {
        const description = material.description || '';
        return description.toLowerCase().includes(searchQuery.toLowerCase());
      });

      console.log('Filtered results for description:', filtered);
      setSearchResults(filtered);
    }
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, materials]);

  const handleViewAll = () => {
    setSearchResults(materials);
    setSearchQuery('');
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchType, setCustomerSearchType] = useState('customerId');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const openCustomerSearchModal = () => {
    setShowCustomerSearchModal(true);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };

  const closeCustomerSearchModal = () => {
    setShowCustomerSearchModal(false);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };

  const handleCustomerSearchInputChange = (e) => {
    const value = e.target.value;
    setCustomerSearchQuery(value);
  };

  const handleCustomerSearch = () => {
    if (!customerSearchQuery.trim()) {
      setCustomerSearchResults([]);
      return;
    }

    if (customerSearchType === 'customerId') {
      const filtered = customers.filter(customer => {
        const customerId = customer.customerId || '';
        return customerId.toLowerCase().includes(customerSearchQuery.toLowerCase());
      });
      setCustomerSearchResults(filtered);
    } else {
      const filtered = customers.filter(customer => {
        const name = customer.name1 || '';
        return name.toLowerCase().includes(customerSearchQuery.toLowerCase());
      });
      setCustomerSearchResults(filtered);
    }
  };

  const handleViewAllCustomers = () => {
    setCustomerSearchResults(customers);
    setCustomerSearchQuery('');
  };

  const handleClearCustomerResults = () => {
    setCustomerSearchResults([]);
    setCustomerSearchQuery('');
  };

  const selectCustomerFromSearch = (customer) => {
    handleChange({ target: { name: "customerId", value: customer._id } });
    closeCustomerSearchModal();
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customerSearchQuery.trim()) {
        handleCustomerSearch();
      } else {
        setCustomerSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [customerSearchQuery, customerSearchType, customers]);
  return (
    <div className="content content-two">
      <h4>Customer-Price-List</h4>
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3 mt-3">
        <div>
          <button className="btn btn-outline-primary" onClick={() => setShowDataImportModal(true)}>
            <i className="isax isax-import me-1"></i>Import
          </button>
        </div>
        <div>
          <div className="input-group">
            <span className="input-group-text">
              <i className="ti ti-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <div className="dropdown">
            <a
              href="#"
              className="btn btn-outline-primary d-inline-flex align-items-center"
              data-bs-toggle="dropdown"
            >
              <i className="isax isax-export-1 me-1"></i>Export
            </a>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#">
                  Download as PDF
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Download as Excel
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div>
              <a
                onClick={() => {
                  handleOpenModal();
                }}
                className="btn btn-primary d-flex align-items-center"
              >
                <i className="isax isax-add-circle5 me-1"></i>New Customer Price
                List
              </a>
            </div>
          </div>
        </div>
      </div>

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImportSuccess={handleImportSuccess}
        masterDataType="customerPriceList"
      />

      <div className="table-responsive">
        <table className="table table-bordered datatable">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Category</th>
              <th>Material</th>
              <th>Location</th>
              <th>BUM</th>
              <th>Order Unit</th>
              <th>Price</th>
              <th>Sales Group</th>
              <th>Tax</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row._id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <h6 className="fs-14 fw-medium mb-0">
                        <a href="#">{row.customerId?.name1}</a>
                      </h6>
                    </div>
                  </div>
                </td>
                <td>{row.categoryId?.categoryName}</td>
                <td>{row.materialId?.description}</td>
                <td className="text-dark">{row.unit}</td>
                <td className="text-dark">{row.bum}</td>
                <td className="text-dark">{row.orderUnit}</td>
                <td className="text-dark">{row.orderUnit}</td>
                <td className="text-dark">{row.salesGroup}</td>
                <td className="text-dark">{row.taxId?.taxName}</td>
                <td style={{ cursor: "pointer" }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      handleEdit(row);
                      handleOpenModal();
                    }}
                  >
                    Edit
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
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" id="myLargeModalLabel">
                    Customer Price
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      handleCloseModal();
                      setFormData({
                        _id: "",
                        categoryId: "",
                        customerId: "",
                        materialId: "",
                        location: "",
                        bum: "",
                        orderUnit: "",
                        price: "",
                        salesGroup: "",
                        taxId: "",
                        tandc: "",
                      });
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Category:</label>
                            </div>
                            <div className="col-8">
                              <select
                                name="categoryId"
                                className="form-select"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select</option>
                                {categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.categoryName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Customer:</label>
                            </div>
                            <div className="col-8 d-flex">
                              <select
                                name="customerId"
                                className="form-select me-2"
                                value={formData.customerId}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select</option>
                                {customers.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.name1}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={openCustomerSearchModal}
                                title="Search Customer"
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Material:</label>
                            </div>
                            <div className="col-8 d-flex">
                              <select
                                name="materialId"
                                className="form-select me-2"
                                value={formData.materialId}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select</option>
                                {materials.map((m) => (
                                  <option key={m._id} value={m._id}>
                                    {m.description}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={openSearchModal}
                                title="Search Material"
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Unit:</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="unit"
                                className="form-control"
                                placeholder="Enter unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">BUM (Base Unit):</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="number"
                                name="bum"
                                className="form-control"
                                placeholder="Enter BUM"
                                value={formData.bum}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Sales Group:</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="salesGroup"
                                className="form-control"
                                placeholder="Enter Sales Group"
                                value={formData.salesGroup}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Order Unit:</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="orderUnit"
                                className="form-control"
                                placeholder="Enter Order Unit"
                                value={formData.orderUnit}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">T&amp;C:</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="tandc"
                                className="form-control"
                                placeholder="Enter T&amp;C"
                                value={formData.tandc}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Tax:</label>
                            </div>
                            <div className="col-8">
                              <select
                                name="taxId"
                                className="form-select"
                                value={formData.taxId}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                {taxes.map((tax) => (
                                  <option key={tax._id} value={tax._id}>
                                    {tax.taxName} (CGST: {tax.cgst}%, SGST:{" "}
                                    {tax.sgst}%, IGST: {tax.igst}%)
                                  </option>
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
                        {formData._id ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showSearchModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Search Materials
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeSearchModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Search Controls */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
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
                          searchType === "materialId"
                            ? "Enter Material ID (e.g., MMNR-100000 or 100000)"
                            : "Search by Description..."
                        }
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
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleClearResults}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {searchResults.length > 0 ? (
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
                        {searchResults.map((material, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="badge ">
                                {material.materialId}
                              </span>
                            </td>
                            <td>{material.description}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {material.baseUnit}
                              </span>
                            </td>
                            <td>{material.location}</td>
                            <td>
                              <span className="badge bg-info">
                                {material.materialgroup}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  selectMaterialFromSearch(material)
                                }
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
                          ? "No materials loaded from API"
                          : searchQuery
                            ? `No materials found matching "${searchQuery}"`
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
                  onClick={closeSearchModal}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCustomerSearchModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Search Customers
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeCustomerSearchModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Search Controls */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search Type</label>
                    <select
                      className="form-select"
                      value={customerSearchType}
                      onChange={(e) => setCustomerSearchType(e.target.value)}
                    >
                      <option value="customerId">Customer ID</option>
                      <option value="name">Customer Name</option>
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
                          customerSearchType === "customerId"
                            ? "Enter Customer ID..."
                            : "Search by Customer Name..."
                        }
                        value={customerSearchQuery}
                        onChange={handleCustomerSearchInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-info"
                        onClick={handleViewAllCustomers}
                      >
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {customerSearchResults.length > 0 && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleClearCustomerResults}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {customerSearchResults.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Customer ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerSearchResults.map((customer, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="badge">
                                {customer.customerId}
                              </span>
                            </td>
                            <td>{customer.name1}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() =>
                                  selectCustomerFromSearch(customer)
                                }
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
                        {customers.length === 0
                          ? "No customers loaded from API"
                          : customerSearchQuery
                            ? `No customers found matching "${customerSearchQuery}"`
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
                  onClick={closeCustomerSearchModal}
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

export default CustomerPriceListForm;
