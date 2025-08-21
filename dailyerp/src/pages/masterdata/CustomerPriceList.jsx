import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DataImportModal from "../../components/DataImportModal";

function CustomerPriceListForm() {
  // Constants
  const MATERIAL_PREFIX = "MMNR-"; // Define the material prefix
  const [locations, setLocations] = useState([]);
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
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [showdropdown, setShowdropdown] = useState(false);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [customerSearchType, setCustomerSearchType] = useState('customerId');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
  };

  // Export to Excel Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredData.map(item => ({
      'Customer Name': item.customerId?.name1 || '',
      'Customer ID': item.customerId?.cnNo || '',
      'Category': item.categoryId?.categoryName || '',
      'Material ID': item.materialId?.materialId || '',
      'Material Description': item.materialId?.description || '',
      'Unit': item.unit || '',
      'BUM (Base Unit Measure)': item.bum || '',
      'Order Unit': item.orderUnit || '',
      'Price': item.price || '',
      'Sales Group': item.salesGroup || '',
      'Tax Name': item.taxId?.taxName || '',
      'CGST %': item.taxId?.cgst || '',
      'SGST %': item.taxId?.sgst || '',
      'IGST %': item.taxId?.igst || '',
      'Terms & Conditions': item.tandc || '',
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
      { wch: 25 }, // Customer Name
      { wch: 15 }, // Customer ID
      { wch: 20 }, // Category
      { wch: 20 }, // Material ID
      { wch: 35 }, // Material Description
      { wch: 10 }, // Unit
      { wch: 15 }, // BUM
      { wch: 15 }, // Order Unit
      { wch: 12 }, // Price
      { wch: 15 }, // Sales Group
      { wch: 15 }, // Tax Name
      { wch: 10 }, // CGST %
      { wch: 10 }, // SGST %
      { wch: 10 }, // IGST %
      { wch: 25 }, // Terms & Conditions
      { wch: 15 }, // Company ID
      { wch: 15 }, // Financial Year
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Customer Price List');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const filename = `Customer-Price-List-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file exported successfully as: ${filename}`);
  };
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/locations", {
        params: { companyId, financialYear }
      })
      .then((res) => setLocations(res.data));
  }, []);
  useEffect(() => {
    fetchCategories();
    fetchCustomers();
    fetchMaterials();
    fetchTaxes();
    fetchAllPriceLists();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/customer-categories", {
        params: { companyId, financialYear }
      });
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Error loading categories");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/customers", {
        params: { companyId, financialYear }
      });
      setCustomers(res.data);
      console.log("customers", res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Error loading customers");
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/material", {
        params: { companyId, financialYear }
      });
      setMaterials(res.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      alert("Error loading materials");
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tax", {
        params: { companyId, financialYear }
      });
      setTaxes(res.data);
    } catch (error) {
      console.error("Error fetching taxes:", error);
      alert("Error loading taxes");
    }
  };

  const fetchAllPriceLists = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/customer-price-lists", {
        params: { companyId, financialYear }
      });
      setAllData(res.data);
    } catch (error) {
      console.error("Error fetching price lists:", error);
      alert("Error loading price lists");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (name === "materialId") {
      try {
        const res = await axios.get(`http://localhost:8080/api/material/${value}`);
        const conv = res.data.conversionValue || 1;
        setConversionValue(conv);
      } catch (error) {
        console.error("Error fetching material conversion:", error);
        setConversionValue(1);
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
      price: item.price || "", // Fixed: use item.price instead of undefined price
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

  // Filter data based on search query
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

  // Calculate paginated data from filtered data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      _id: "",
      categoryId: "",
      customerId: "",
      materialId: "",
      unit: "", // Fixed: use unit instead of location
      bum: "",
      orderUnit: "",
      price: "",
      salesGroup: "",
      taxId: "",
      tandc: "",
    });
  };



  const openSearchModal = () => {
    setCurrentEditIndex(null);
    setShowSearchModal(true);
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setCurrentEditIndex(null);
    setSearchResults([]);
  };

  const selectMaterialFromSearch = (material) => {
    console.log("Selected material:", material);
    handleChange({ target: { name: "materialId", value: material._id } });
    closeSearchModal();
  };



  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    console.log('Searching with query:', query, 'Type:', searchType);
    console.log('Available materials:', materials);

    if (searchType === 'materialId') {
      let searchTerm = query;

      if (/^\d+$/.test(query)) {
        searchTerm = MATERIAL_PREFIX + query;
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
        return description.toLowerCase().includes(query.toLowerCase());
      });

      console.log('Filtered results for description:', filtered);
      setSearchResults(filtered);
    }
  };

  // Fixed useEffect for material search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]); // Removed materials dependency to avoid infinite loop

  const handleViewAll = () => {
    setSearchResults(materials);
    setSearchQuery('');
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  // Customer search functions
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

  // Fixed useEffect for customer search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customerSearchQuery.trim()) {
        handleCustomerSearch();
      } else {
        setCustomerSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [customerSearchQuery, customerSearchType]); // Removed customers dependency

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Customer Price List</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Master
              </li>
              <li className="breadcrumb-item active" aria-current="page">Customer Price List</li>
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
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <div>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setShowDataImportModal(true)}>
                  <i className="ti ti-file-import me-1"></i>Import
                </button>
              </div>

              {/* Updated Export Button - Direct Excel Export */}
              <button
                className="btn btn-outline-success btn-sm"
                onClick={exportToExcel}
                title="Export to Excel"
              >
                <i className="ti ti-file-export me-1"></i>Export
              </button>

              <div>
                <div>
                  <a
                    onClick={handleOpenModal}
                    className="btn btn-primary btn-sm"
                  >
                    <i className="ti ti-circle-plus me-1"></i>Add New Customer Price List
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Category</th>
                <th>Material</th>
                <th>Unit</th>
                <th>BUM</th>
                <th>Order Unit</th>
                <th>Price</th>
                <th>Sales Group</th>
                <th>Tax</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
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
                  <td className="text-dark">Rs{row.price}</td> {/* Fixed: show price instead of orderUnit */}
                  <td className="text-dark">{row.salesGroup}</td>
                  <td className="text-dark">{row.taxId?.taxName}</td>
                  <td style={{ cursor: "pointer" }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        handleEdit(row);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="dataTables_paginate paging_simple_numbers" id="DataTables_Table_0_paginate">
            <ul className="pagination">
              <li className={`paginate_button page-item previous ${currentPage === 1 ? "disabled" : ""}`}>
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
                  className={`paginate_button page-item ${currentPage === i + 1 ? "active" : ""}`}
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

              <li className={`paginate_button page-item next ${currentPage === totalPages ? "disabled" : ""}`}>
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
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" id="myLargeModalLabel">
                    Customer Price
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
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
                              <label className="form-label">Location</label>
                            </div>
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




                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-5">
                              <label className="form-label">BUM (Base Unit):</label>
                            </div>
                            <div className="col-7">
                              <input
                                type="number"
                                name="bum"
                                className="form-control"
                                placeholder="Enter BUM"
                                value={formData.bum}
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                  handleChange(e)
                                }}
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
                                type="number"
                                name="orderUnit"
                                className="form-control"
                                placeholder="Enter Order Unit"
                                value={formData.orderUnit}
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                                  handleChange(e)
                                }}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Added Price Field */}
                        <div className="col-md-4 mb-2">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">Price:</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="number"
                                step="0.01"
                                name="price"
                                className="form-control"
                                placeholder="Enter price"
                                value={formData.price}
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
                                    {tax.taxName} (CGST: {tax.cgst}%, SGST: {tax.sgst}%, IGST: {tax.igst}%)
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
                        className="btn btn-outline-secondary"
                        onClick={handleCloseModal}
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

      {/* Material Search Modal */}
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

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {searchResults.length > 0 ? (
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
                        {searchResults.map((material, idx) => (
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

      {/* Customer Search Modal */}
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

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {customerSearchResults.length > 0 ? (
                    <table className="table table-sm table-bordered">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Customer ID</th>
                          <th>Name</th>
                          <th>City</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerSearchResults.map((customer, idx) => (
                          <tr key={idx}>
                            <td className="text-wrap">{customer.cnNo}</td>
                            <td className="text-wrap">{customer.name1}</td>
                            <td className="text-wrap">{customer.city}</td>
                            <td className="text-wrap">{customer.email}</td>
                            <td className="text-wrap">{customer.contactNo}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => selectCustomerFromSearch(customer)}
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

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImportSuccess={handleImportSuccess}
        masterDataType="customerPriceList"
      />
    </div>
  );
}

export default CustomerPriceListForm;