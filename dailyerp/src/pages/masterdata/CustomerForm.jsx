import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DataImportModal from "../../components/DataImportModal";

function CustomerForm() {
  const [formData, setFormData] = useState({
    categoryId: '',
    name1: '',
    name2: '',
    search: '',
    address1: '',
    address2: '',
    extraAddresses: [],
    city: '',
    pincode: '',
    region: '',
    country: '',
    contactNo: '',
    name: '',
    email: ''
  });
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cnNo, setCnNo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  // New states for customer type selection
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);
  const [customerType, setCustomerType] = useState(''); // 'external' or 'internal'
  const [externalCustomerId, setExternalCustomerId] = useState('');
  const [showMainModal, setShowMainModal] = useState(false);

  const regions = ['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'West Bengal', 'Odisha', 'Bihar', 'Jharkhand', 'Madhya Pradesh', 'Chhattisgarh', 'Uttar Pradesh'];
  const countries = ['India', 'USA', 'Germany', 'France', 'UK'];

  // Define mandatory fields
  const mandatoryFields = ['categoryId', 'name1', 'search', 'address1', 'contactNo', 'region', 'country'];

  useEffect(() => {
    fetchCategories();
    fetchCustomers();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/customer-categories', {
        params: { companyId, financialYear }
      });
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/customers', {
        params: { companyId, financialYear }
      });
      const sortedcustomer = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setCustomers(sortedcustomer);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Email validation for email field
    if (name === 'email' && value) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        e.target.setCustomValidity('Please enter a valid email address');
      } else {
        e.target.setCustomValidity('');
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check mandatory fields
    if (!formData.categoryId) newErrors.categoryId = "Category is required.";
    if (!formData.name1.trim()) newErrors.name1 = "Name 1 is required.";
    if (!formData.search.trim()) newErrors.search = "Search term is required.";
    if (!formData.address1.trim()) newErrors.address1 = "Address 1 is required.";
    if (!formData.region) newErrors.region = "Region is required.";
    if (!formData.country) newErrors.country = "Country is required.";

    // Contact number validation
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact No is required.";
    } else if (!/^[0-9]{10}$/.test(formData.contactNo.trim())) {
      newErrors.contactNo = "Contact No must be exactly 10 digits.";
    }

    // Email validation (optional field but validate format if provided)
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Pincode validation (optional field but validate format if provided)
    if (formData.pincode.trim() && !/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be exactly 6 digits.";
    }

    // External customer ID validation
    if (customerType === 'external' && !externalCustomerId.trim()) {
      newErrors.externalCustomerId = "External Customer ID is required.";
    }

    if (customerType === 'external' && externalCustomerId.length > 50) {
      newErrors.externalCustomerId = "External Customer ID cannot exceed 50 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(error => error);
      alert(errorMessages.join("\n"));
      return;
    }

    // Show the customer type selection first
    setShowCustomerTypeModal(true);
    setShowMainModal(false);
  };

  // Fixed finalSubmit function to accept customerType as parameter
  const finalSubmit = async (submissionCustomerType = customerType) => {
    try {
      const submitData = {
        ...formData,
        customerType: submissionCustomerType, // Use parameter instead of state
        companyId: companyId,
        financialYear: financialYear,
        externalCustomerId: submissionCustomerType === 'external' ? externalCustomerId : null
      };

      if (editingId) {
        await axios.put(`http://localhost:8080/api/customers/${editingId}`, submitData);
        alert('Customer updated successfully!');
      } else {
        const res = await axios.post('http://localhost:8080/api/customers', submitData);
        setCnNo(res.data.cnNo);
        alert(`Customer saved successfully! CNNo: ${res.data.cnNo}`);
      }

      fetchCustomers();
      resetForm();
      setShowMainModal(false);
      setShowCustomerTypeModal(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      name1: '',
      name2: '',
      search: '',
      address1: '',
      address2: '',
      extraAddresses: [],
      city: '',
      pincode: '',
      region: '',
      country: '',
      contactNo: '',
      name: '',
      email: ''
    });
    setEditingId(null);
    setErrors({});
    setCnNo('');
    setCustomerType('');
    setExternalCustomerId('');
  };

  const handleEdit = (customer) => {
    setFormData({
      categoryId: customer.categoryId?._id || '',
      name1: customer.name1 || '',
      name2: customer.name2 || '',
      search: customer.search || '',
      address1: customer.address1 || '',
      address2: customer.address2 || '',
      city: customer.city || '',
      pincode: customer.pincode || '',
      region: customer.region || '',
      country: customer.country || '',
      contactNo: customer.contactNo || '',
      name: customer.name || '',
      email: customer.email || ''
    });
    setEditingId(customer._id);
    setCnNo(customer.cnNo);
    setCustomerType(customer.customerType || 'internal');
    setExternalCustomerId(customer.externalCustomerId || '');
    setErrors({});
    setShowMainModal(true);
  };

  // Customer Type Modal handlers
  const handleOpenCustomerTypeModal = () => {
    setShowCustomerTypeModal(true);
  };

  const handleCloseCustomerTypeModal = () => {
    setShowCustomerTypeModal(false);
    setCustomerType('');
    setExternalCustomerId('');
  };

  // Fixed handleCustomerTypeSelect function
  const handleCustomerTypeSelect = (type) => {
    setCustomerType(type); // Update state for UI purposes
    if (type === 'internal') {
      finalSubmit('internal'); // Pass the type directly to avoid state delay
    }
    // For external, we keep the existing flow to collect external customer ID
  };

  const handleExternalCustomerIdSubmit = () => {
    if (!externalCustomerId.trim()) {
      alert('Please enter External Customer ID');
      return;
    }
    if (externalCustomerId.length > 50) {
      alert('External Customer ID cannot exceed 50 characters');
      return;
    }
    finalSubmit('external'); // Pass 'external' directly
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const filteredCustomers = customers
    .filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.cnNo?.toLowerCase().includes(term) ||
        c.name1?.toLowerCase().includes(term) ||
        c.categoryId?.categoryName?.toLowerCase().includes(term) ||
        c.search?.toLowerCase().includes(term) ||
        c.address1?.toLowerCase().includes(term) ||
        c.city?.toLowerCase().includes(term) ||
        c.pincode?.toLowerCase().includes(term) ||
        c.region?.toLowerCase().includes(term) ||
        c.country?.toLowerCase().includes(term) ||
        c.contactNo?.includes(term) ||
        c.email?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first

  const indexOfLastItem = currentPage * customersPerPage;
  const indexOfFirstItem = indexOfLastItem - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Main Modal handlers
  const handleCloseMainModal = () => {
    setShowMainModal(false);
    resetForm();
  };

  const [showdropdown, setShowdropdown] = useState(false);

  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);

  // Export to Excel Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredCustomers.map(customer => ({
      'Customer No': customer.cnNo || '',
      'Name 1': customer.name1 || '',
      'Name 2': customer.name2 || '',
      'Category': customer.categoryId?.categoryName || '',
      'Search Term': customer.search || '',
      'Address 1': customer.address1 || '',
      'Address 2': customer.address2 || '',
      'Extra Addresses': customer.extraAddresses ? customer.extraAddresses.join(', ') : '',
      'City': customer.city || '',
      'Pincode': customer.pincode || '',
      'Region': customer.region || '',
      'Country': customer.country || '',
      'Contact No': customer.contactNo || '',
      'Email': customer.email || '',
      'Contact Person': customer.name || '',
      'Customer Type': customer.customerType || 'internal',
      'External Customer ID': customer.externalCustomerId || '',
      'Is Deleted': customer.isDeleted ? 'Yes' : 'No',
      'Is Blocked': customer.isBlocked ? 'Yes' : 'No',
      'Created Date': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '',
      'Updated Date': customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Customer No
      { wch: 25 }, // Name 1
      { wch: 25 }, // Name 2
      { wch: 20 }, // Category
      { wch: 20 }, // Search Term
      { wch: 30 }, // Address 1
      { wch: 30 }, // Address 2
      { wch: 40 }, // Extra Addresses
      { wch: 15 }, // City
      { wch: 10 }, // Pincode
      { wch: 15 }, // Region
      { wch: 15 }, // Country
      { wch: 15 }, // Contact No
      { wch: 25 }, // Email
      { wch: 20 }, // Contact Person
      { wch: 15 }, // Customer Type
      { wch: 20 }, // External Customer ID
      { wch: 12 }, // Is Deleted
      { wch: 12 }, // Is Blocked
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const filename = `Customer-Master-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
    handleClosedropdown();

    // Show success message
    alert(`Excel file exported successfully as: ${filename}`);
  };

  const addExtraAddress = () => {
    setFormData(prev => ({
      ...prev,
      extraAddresses: [...prev.extraAddresses, '']
    }));
  };

  const handleExtraAddressChange = (index, value) => {
    const updated = [...formData.extraAddresses];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      extraAddresses: updated
    }));
  };

  const removeExtraAddress = (index) => {
    const updated = [...formData.extraAddresses];
    updated.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      extraAddresses: updated
    }));
  };

  const handleCustomerStatusChange = async (customerId, statusType, isChecked) => {
    try {
      const updateData = {
        [statusType]: isChecked,
      };

      await axios.put(`http://localhost:8080/api/customers/status/${customerId}`, updateData);

      setCustomers(customers.map((customer) =>
        customer._id === customerId
          ? { ...customer, [statusType]: isChecked }
          : customer
      ));

      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status!');
    }
  };

  const handleImportSuccess = (result) => {
    console.log('Import successful:', result);
    fetchCustomers();
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Customer Master</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">Master</li>
              <li className="breadcrumb-item active" aria-current="page">Customer Master</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <div>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <button
                onClick={() => setShowDataImportModal(true)}
                className="btn btn-outline-primary btn-sm"
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
                  onClick={() => setShowMainModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  New Customer
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>CNNo</th>
                  <th>Name 1</th>
                  <th>Category</th>
                  <th>Search</th>
                  <th>Address 1</th>
                  <th>City</th>
                  <th>Pincode</th>
                  <th>Region</th>
                  <th>Contact No</th>
                  <th>Email</th>
                  <th>Delete</th>
                  <th>Block</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="13">No customers found</td>
                  </tr>
                ) : (
                  currentCustomers.map((c) => (
                    <tr key={c._id}>
                      <td className="text-wrap">{c.cnNo}</td>
                      <td className="text-wrap">{c.name1}</td>
                      <td className="text-wrap">{c.categoryId?.categoryName || "N/A"}</td>
                      <td className="text-wrap">{c.search}</td>
                      <td className="text-wrap">{c.address1}</td>
                      <td className="text-wrap">{c.city}</td>
                      <td className="text-wrap">{c.pincode}</td>
                      <td className="text-wrap">{c.region}</td>
                      <td className="text-wrap">{c.contactNo}</td>
                      <td className="text-wrap">{c.email}</td>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={c.isDeleted || false}
                            onChange={(e) =>
                              handleCustomerStatusChange(c._id, "isDeleted", e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={c.isBlocked || false}
                            onChange={(e) =>
                              handleCustomerStatusChange(c._id, "isBlocked", e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(c)} className="btn btn-primary btn-sm">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Showing {filteredCustomers.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} entries
              {searchTerm && ` (filtered from ${customers.length} total entries)`}
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? "btn-primary" : "btn-outline-primary"
                    }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>

          {/* Customer Type Selection Modal */}
          {showCustomerTypeModal && (
            <>
              <div className="modal-backdrop fade show"></div>
              <div
                className="modal fade show"
                style={{ display: "block" }}
                tabIndex="-1"
                aria-modal="true"
                role="dialog"
              >
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title">Select Customer Type</h4>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCloseCustomerTypeModal}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p className="mb-4">
                        Choose how you want to create the ID:
                      </p>
                      <div className="row">
                        <div className="col-xl-6">
                          <button
                            className="btn btn-outline-primary btn-md"
                            onClick={() => handleCustomerTypeSelect("internal")}
                          >
                            <i className="ti ti-user me-2"></i>
                            Internal (Auto-generate)
                          </button>
                        </div>
                        <div className="col-xl-6">
                          <button
                            className="btn btn-outline-secondary btn-md"
                            onClick={() => handleCustomerTypeSelect("external")}
                          >
                            <i className="ti ti-edit me-2"></i>
                            External (Manual Entry)
                          </button>
                        </div>
                      </div>
                      {customerType === "external" && (
                        <div className="mt-4">
                          <label className="form-label">External Customer ID</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter External Customer ID (max 50 characters)"
                            value={externalCustomerId}
                            onChange={(e) => setExternalCustomerId(e.target.value)}
                            maxLength={50}
                          />
                          <div className="form-text">{externalCustomerId.length}/50 characters</div>
                          <div className="mt-3">
                            <button className="btn btn-primary me-2" onClick={handleExternalCustomerIdSubmit}>
                              Continue
                            </button>
                            <button className="btn btn-secondary" onClick={() => setCustomerType("")}>
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Customer Form Modal */}
          {showMainModal && (
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
                        {editingId ? "Edit Customer" : "Add New Customer"}
                        {customerType && (
                          <span className="badge bg-info ms-2">
                            {customerType === "internal" ? "Internal" : "External"}
                          </span>
                        )}
                      </h4>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCloseMainModal}
                        aria-label="Close"
                      ></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit}>
                        {customerType === "external" && (
                          <div className="alert alert-info mb-3">
                            <strong>External Customer ID:</strong> {externalCustomerId}
                          </div>
                        )}

                        <div className="row">
                          {/* Category */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Category <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="form-select"
                              >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.categoryName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Name1 */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Name1 <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="name1"
                                placeholder="Enter Name 1"
                                value={formData.name1}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Name2 */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">Name2</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="name2"
                                placeholder="Enter Name 2 (Optional)"
                                value={formData.name2}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Search Term */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                SearchTerm <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="search"
                                placeholder="Enter Search Term"
                                value={formData.search}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Address1 */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Address1 <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="address1"
                                placeholder="Enter Address 1"
                                value={formData.address1}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Address2 */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">Address2</label>
                            </div>
                            <div className="col-6">
                              <input
                                type="text"
                                name="address2"
                                placeholder="Enter Address 2"
                                value={formData.address2}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                            <div className="col-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={addExtraAddress}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Extra Addresses */}
                          {formData?.extraAddresses?.map((address, index) => (
                            <div className="row col-md-4 mb-2" key={index}>
                              <div className="col-4">
                                <label className="form-label">{`Address ${index + 3}`}</label>
                              </div>
                              <div className="col-6">
                                <input
                                  type="text"
                                  placeholder={`Enter Address ${index + 3}`}
                                  value={address}
                                  onChange={(e) =>
                                    handleExtraAddressChange(index, e.target.value)
                                  }
                                  className="form-control"
                                />
                              </div>
                              <div className="col-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeExtraAddress(index)}
                                >
                                  <i className="ti ti-x"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* City */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">City</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="city"
                                placeholder="Enter City"
                                value={formData.city}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Pincode */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">Pincode</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="pincode"
                                placeholder="Enter 6-digit Pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Region */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Region <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <select
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                className="form-select"
                              >
                                <option value="">Select Region</option>
                                {regions.map((region) => (
                                  <option key={region} value={region}>
                                    {region}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Country */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Country <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="form-select"
                              >
                                <option value="">Select Country</option>
                                {countries.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Contact No */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">
                                Contact No <span className="text-danger">*</span>
                              </label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="contactNo"
                                placeholder="Enter 10-digit Contact No"
                                value={formData.contactNo}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">Email</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="email"
                                name="email"
                                placeholder="Enter Email (Optional)"
                                value={formData.email}
                                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                                title="Please enter a valid email address (e.g., user@example.com)"
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>

                          {/* Contact Person */}
                          <div className="row col-md-4 mb-2">
                            <div className="col-4">
                              <label className="form-label">Contact Person</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="text"
                                name="name"
                                placeholder="Enter name (Optional)"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <button type="submit" className="btn btn-success">
                            {editingId ? "Update Customer" : "Save Customer"}
                          </button>

                          {editingId && (
                            <button
                              type="button"
                              onClick={resetForm}
                              className="btn btn-danger ms-2"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImport={handleImportSuccess}
        masterDataType="customer"
        apiEndpoint="/api/customers/import"
      />
    </div>
  );
}

export default CustomerForm;