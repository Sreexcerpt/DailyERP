import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DataImportModal from "../../components/DataImportModal";

function VendorForm() {
  const [formData, setFormData] = useState({
    categoryId: "",
    name1: "",
    name2: "",
    search: "",
    address1: "",
    address2: "",
    extraAddresses: [],
    city: "",
    pincode: "",
    region: "",
    country: "",
    contactNo: "",
    contactname: "",
    email: "",
  });
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vnNo, setVnNo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [extraAddresses, setExtraAddresses] = useState([]);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  // New states for VendorID popup
  const [showVendorIdModal, setShowVendorIdModal] = useState(false);
  const [vendorIdType, setVendorIdType] = useState("internal"); // internal or external
  const [externalVendorId, setExternalVendorId] = useState("");
  const [vendorIdError, setVendorIdError] = useState("");

  const regions = [
    "Karnataka",
    "Kerala",
    "Tamil Nadu",
    "Andhra Pradesh",
    "Telangana",
    "Maharashtra",
    "Gujarat",
    "Rajasthan",
    "Punjab",
    "Haryana",
  ];
  const countries = ["India", "USA", "Germany", "France", "UK"];

  // Pagination states
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10; // Changed from 1 to 10 for better UX

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8080/api/vendor-categories", {
      params: { companyId, financialYear }
    });
    setCategories(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://localhost:8080/api/vendors", {
      params: { companyId, financialYear }
    });
    const sortedVendors = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setVendors(sortedVendors);
  };

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((v) => {
    const vnNo = v.vnNo?.toLowerCase() || "";
    const name1 = v.name1?.toLowerCase() || "";
    const category = v.categoryId?.categoryName?.toLowerCase() || "";
    const keyword = searchTerm.toLowerCase();

    return (
      vnNo.includes(keyword) ||
      name1.includes(keyword) ||
      category.includes(keyword)
    );
  });

  // Pagination calculations based on filtered data
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Export to Excel Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredVendors.map(vendor => ({
      'Vendor No': vendor.vnNo || '',
      'Name 1': vendor.name1 || '',
      'Name 2': vendor.name2 || '',
      'Category': vendor.categoryId?.categoryName || '',
      'Search Term': vendor.search || '',
      'Address 1': vendor.address1 || '',
      'Address 2': vendor.address2 || '',
      'Extra Addresses': vendor.extraAddresses ? vendor.extraAddresses.join(', ') : '',
      'City': vendor.city || '',
      'Pincode': vendor.pincode || '',
      'Region': vendor.region || '',
      'Country': vendor.country || '',
      'Contact No': vendor.contactNo || '',
      'Contact Person': vendor.contactname || '',
      'Email': vendor.email || '',
      'Vendor Type': vendor.vendorIdType || 'internal',
      'External Vendor ID': vendor.externalVendorId || '',
      'Is Deleted': vendor.isDeleted ? 'Yes' : 'No',
      'Is Blocked': vendor.isBlocked ? 'Yes' : 'No',
      'Created Date': vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '',
      'Updated Date': vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Vendor No
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
      { wch: 20 }, // Contact Person
      { wch: 25 }, // Email
      { wch: 15 }, // Vendor Type
      { wch: 20 }, // External Vendor ID
      { wch: 12 }, // Is Deleted
      { wch: 12 }, // Is Blocked
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const filename = `Vendor-Master-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file exported successfully as: ${filename}`);
  };

  // Handle VendorID popup submit
  const handleVendorIdSubmit = async () => {
    try {
      const vendorData = {
        ...formData,
        companyId,
        financialYear,
        vendorIdType: vendorIdType,
        externalVendorId: vendorIdType === 'external' ? externalVendorId : null
      };

      if (editingId) {
        await axios.put(`http://localhost:8080/api/vendors/${editingId}`, vendorData);
        alert("Vendor updated!");
      } else {
        const res = await axios.post("http://localhost:8080/api/vendors", vendorData);
        setVnNo(res.data.vnNo);
        alert(`Vendor saved! VNNo: ${res.data.vnNo}`);
      }

      fetchVendors();
      setFormData({
        categoryId: "",
        name1: "",
        name2: "",
        search: "",
        address1: "",
        address2: "",
        extraAddresses: [],
        city: "",
        pincode: "",
        region: "",
        country: "",
        contactNo: "",
        contactname: "",
        email: "",
      });
      setEditingId(null);
      setShowVendorIdModal(false);
      setShowModal(false);
      setExternalVendorId('');
      setVendorIdType('internal');
    } catch (error) {
      console.error(error);
      alert("Error saving vendor");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form first
    if (!formData.categoryId || !formData.name1) {
      alert("Please fill in required fields");
      return;
    }

    // Show VendorID popup
    setShowVendorIdModal(true);
  };

  const handleEdit = (vendor) => {
    setFormData({
      categoryId: vendor.categoryId?._id,
      name1: vendor.name1,
      name2: vendor.name2,
      search: vendor.search,
      address1: vendor.address1,
      address2: vendor.address2,
      city: vendor.city,
      pincode: vendor.pincode,
      region: vendor.region,
      country: vendor.country,
      contactNo: vendor.contactNo,
      contactname: vendor.contactname,
      email: vendor.email,
    });
    setEditingId(vendor._id);
    setVnNo(vendor.vnNo);
    setShowModal(true);
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

  const handleVendorStatusChange = async (vendorId, statusType, isChecked) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/vendors/status/${vendorId}`,
        { [statusType]: isChecked }
      );

      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendorId ? { ...v, [statusType]: isChecked } : v
        )
      );

      alert(`${statusType} updated successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update vendor status');
    }
  };

  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb ">
        <div className="my-auto">
          <h2 className="mb-1">Vendor Master</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Master
              </li>
              <li className="breadcrumb-item active" aria-current="page">Vendor Master</li>
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
                    placeholder="Search Vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
                  href="#"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowModal(true);
                    setFormData({
                      categoryId: "",
                      name1: "",
                      name2: "",
                      search: "",
                      address1: "",
                      address2: "",
                      extraAddresses: [],
                      city: "",
                      pincode: "",
                      region: "",
                      country: "",
                      contactNo: "",
                      contactname: "",
                      email: "",
                    });
                    setEditingId(null);
                  }}
                >
                  <i className="ti ti-add-circle5 me-1"></i>New Vendor
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          {/* Show total records info */}

          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>VNNo</th>
                  <th>Name1</th>
                  <th>Category</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Search</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Delete</th>
                  <th>Block</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentVendors.length > 0 ? (
                  currentVendors.map((v) => (
                    <tr key={v._id}>
                      <td>{v.vnNo}</td>
                      <td className="text-wrap">{v.name1}</td>
                      <td>{v.categoryId?.categoryName}</td>
                      <td className="text-wrap">{v.contactNo}</td>
                      <td className="text-wrap">{v.email}</td>
                      <td className="text-wrap">{v.search}</td>
                      <td className="text-wrap">{v.address1}</td>
                      <td className="text-wrap">{v.city}</td>

                      <td>
                        <input
                          type="checkbox"
                          checked={v.isDeleted || false}
                          onChange={(e) =>
                            handleVendorStatusChange(v._id, 'isDeleted', e.target.checked)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={v.isBlocked || false}
                          onChange={(e) =>
                            handleVendorStatusChange(v._id, 'isBlocked', e.target.checked)
                          }
                        />
                      </td>

                      <td>
                        <button className="btn btn-sm btn-primary" onClick={() => handleEdit(v)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center text-muted py-4">
                      {searchTerm ? 'No vendors found matching your search criteria' : 'No vendors available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination - Only show if there are records and more than one page */}
      {filteredVendors.length > 0 && totalPages > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <a
                className="page-link"
                href="javascript:void(0);"
                aria-label="Previous"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(currentPage - 1);
                }}
              >
                <span aria-hidden="true"><i className="fas fa-angle-left"></i></span>
              </a>
            </li>

            {(() => {
              const delta = 2; // Number of pages to show on each side of current page
              const range = [];
              const rangeWithDots = [];

              // Always show first page
              range.push(1);

              // Add pages around current page
              for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                range.push(i);
              }

              // Always show last page if there are more than 1 page
              if (totalPages > 1) {
                range.push(totalPages);
              }

              // Remove duplicates and sort
              const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

              let prev;
              for (let i of uniqueRange) {
                if (prev) {
                  if (i - prev === 2) {
                    rangeWithDots.push(prev + 1);
                  } else if (i - prev !== 1) {
                    rangeWithDots.push('...');
                  }
                }
                rangeWithDots.push(i);
                prev = i;
              }

              return rangeWithDots.map((number, index) => {
                if (number === '...') {
                  return (
                    <li key={`ellipsis-${index}`} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }

                return (
                  <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                    <a
                      className="page-link"
                      href="javascript:void(0);"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageClick(number);
                      }}
                    >
                      {number}
                    </a>
                  </li>
                );
              });
            })()}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <a
                className="page-link"
                href="javascript:void(0);"
                aria-label="Next"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(currentPage + 1);
                }}
              >
                <span aria-hidden="true"><i className="fas fa-angle-right"></i></span>
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Main Vendor Form Modal */}
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
                  <h4 className="modal-title">{editingId ? "Edit Vendor" : "Add New Vendor"}</h4>
                  <button
                    type="button"
                    className="btn-close custom-btn-close btn-close-modal"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fa-solid fa-x"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
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
                                <option key={cat._id} value={cat._id}>
                                  {cat.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Name 1 */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Name1:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="name1"
                              className="form-control"
                              placeholder="Enter Name 1"
                              value={formData.name1}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Name 2 */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Name2:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="name2"
                              placeholder="Enter Name 2"
                              className="form-control"
                              value={formData.name2}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Search Term */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Search Term:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="search"
                              placeholder="Enter Search Term"
                              className="form-control"
                              value={formData.search}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address 1 */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Address1:</label></div>
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
                      </div>

                      {/* Address 2 */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Address2:</label></div>
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
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={addExtraAddress}>
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Extra Addresses */}
                      {formData.extraAddresses?.map((address, index) => (
                        <div key={index} className="col-md-4 mb-2 position-relative">
                          <div className="row">
                            <div className="col-4">
                              <label className="form-label">{`Address${index + 3}`}:</label>
                            </div>
                            <div className="col-8 d-flex align-items-center">
                              <input
                                type="text"
                                placeholder={`Enter Address ${index + 3}`}
                                value={address}
                                onChange={(e) => handleExtraAddressChange(index, e.target.value)}
                                className="form-control me-2"
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeExtraAddress(index)}
                              >
                                <i className="ti ti-x"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* City */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">City:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="city"
                              placeholder="Enter City"
                              className="form-control"
                              value={formData.city}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pincode */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Pincode:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="pincode"
                              placeholder="Enter Pincode"
                              className="form-control"
                              value={formData.pincode}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Region */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Region:</label></div>
                          <div className="col-8">
                            <select
                              name="region"
                              className="form-select"
                              placeholder="Select Region"
                              value={formData.region}
                              onChange={handleChange}
                            >
                              <option value="">Select Region</option>
                              {regions.map((region) => (
                                <option key={region} value={region}>{region}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Country */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Country:</label></div>
                          <div className="col-8">
                            <select
                              name="country"
                              className="form-select"
                              value={formData.country}
                              onChange={handleChange}
                            >
                              <option value="">Select Country</option>
                              {countries.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Contact No */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">ContactNo:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="contactNo"
                              placeholder="Enter Contact No"
                              className="form-control"
                              value={formData.contactNo}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Person Name */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Contact Person:</label></div>
                          <div className="col-8">
                            <input
                              type="text"
                              name="contactname"
                              placeholder="Enter Contact Person Name"
                              className="form-control"
                              value={formData.contactname}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-4 mb-2">
                        <div className="row">
                          <div className="col-4"><label className="form-label">Email:</label></div>
                          <div className="col-8">
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter Email"
                              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                              title="Please enter a valid email address (e.g., user@example.com)"
                              className="form-control"
                              value={formData.email}
                              onChange={handleChange}
                            />
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

      {/* Vendor ID Selection Modal */}
      {showVendorIdModal && (
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
                  <h4 className="modal-title">Select Vendor ID Type</h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowVendorIdModal(false);
                      setVendorIdError("");
                      setExternalVendorId("");
                      setVendorIdType("internal");
                    }}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-4">
                    Choose how you want to create the Vendor ID:
                  </p>
                  <div className="row">
                    <div className="col-xl-6">
                      <button
                        className="btn btn-outline-primary btn-md"
                        onClick={() => {
                          setVendorIdType("internal");
                          handleVendorIdSubmit();
                        }}
                      >
                        <i className="ti ti-user me-2"></i>
                        Internal (Auto-generate)
                      </button>
                    </div>
                    <div className="col-xl-6">
                      <button
                        className="btn btn-outline-secondary btn-md"
                        onClick={() => setVendorIdType("external")}
                      >
                        <i className="ti ti-edit me-2"></i>
                        External (Manual Entry)
                      </button>
                    </div>
                  </div>
                  {vendorIdType === "external" && (
                    <div className="mt-4">
                      <label className="form-label">External Vendor ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter External Vendor ID (max 50 characters)"
                        value={externalVendorId}
                        onChange={(e) => {
                          if (e.target.value.length <= 50) {
                            setExternalVendorId(e.target.value);
                            setVendorIdError("");
                          }
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && externalVendorId) {
                            handleVendorIdSubmit();
                          }
                        }}
                        maxLength={50}
                      />
                      <div className="form-text">{externalVendorId.length}/50 characters</div>
                      {vendorIdError && (
                        <div className="alert alert-danger mt-2" role="alert">
                          {vendorIdError}
                        </div>
                      )}
                      <div className="mt-3">
                        <button
                          className="btn btn-primary"
                          onClick={handleVendorIdSubmit}
                          disabled={!externalVendorId}
                        >
                          Confirm & Save Vendor
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

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onSuccess={handleImportSuccess}
        masterDataType="vendor"
      />
    </div>
  );
}

export default VendorForm;