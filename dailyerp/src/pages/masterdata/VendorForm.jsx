import React, { useState, useEffect } from "react";
import axios from "axios";
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

  useEffect(() => {
    fetchCategories();
    fetchVendors();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8080/api/vendor-categories");
    setCategories(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get("http://localhost:8080/api/vendors", {
      params: { companyId, financialYear }
    });
    const sortedVendors = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setVendors(sortedVendors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = vendors.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(vendors.length / itemsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageClick = (pageNumber) => {
    goToPage(pageNumber);
  };

  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="content content-two">
      <h4>Vendor List</h4>
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3 mt-3">
        <div>
          <div>
            <div className="input-group">
              <span className="input-group-text">
                <i className="ti ti-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <button
            className="btn btn-outline-primary d-inline-flex align-items-center"
            onClick={() => setShowDataImportModal(true)}
          >
            <i className="ti ti-import me-1"></i>Import
          </button>
          <div className="dropdown">
            <a
              href="javascript:void(0);"
              className="btn btn-outline-primary d-inline-flex align-items-center"
              data-bs-toggle="dropdown"
            >
              <i className="ti ti-export-1 me-1"></i>Export
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



      <div className="table-responsive">
        <table className="table table-nowrap datatable">
          <thead>
            <tr>

              <th>VNNo</th>
              <th>Name1</th>
              <th>Category</th>
              <th>Contact</th>
              <th>City</th>
              <th>Delete Status</th>
              <th>Block Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredVendors.map((v) => (
              <tr key={v._id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div>
                      <h6 className="fs-14 fw-medium mb-0">
                        {v.vnNo}
                      </h6>
                    </div>
                  </div>
                </td>

                <td>{v.name1}</td>
                <td>{v.categoryId?.categoryName}</td>
                <td className="text-dark">{v.contactNo}</td>
                <td className="text-dark">{v.city}</td>

                <td>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={v.isDeleted || false}
                      onChange={(e) =>
                        handleVendorStatusChange(v._id, 'isDeleted', e.target.checked)
                      }
                    />
                    <label className="form-check-label">
                      {v.isDeleted ? 'Deleted' : 'Active'}
                    </label>
                  </div>
                </td>

                <td>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={v.isBlocked || false}
                      onChange={(e) =>
                        handleVendorStatusChange(v._id, 'isBlocked', e.target.checked)
                      }
                    />
                    <label className="form-check-label">
                      {v.isBlocked ? 'Blocked' : 'Unblocked'}
                    </label>
                  </div>
                </td>

                <td >
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(v)}>
                    <i className="ti ti-edit me-2"></i>Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="dataTables_paginate paging_simple_numbers">
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
              <li key={i} className={`paginate_button page-item ${currentPage === i + 1 ? "active" : ""}`}>
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

      {/* Main Vendor Form Modal */}
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
                              {cat.categoryName} ({cat.prefix})
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
                      <div className="col-4"><label>Address1:</label></div>
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
                      <div className="col-4"><label>Address2:</label></div>
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
                  {formData.extraAddresses.map((address, index) => (
                    <div key={index} className="col-md-4 mb-2 position-relative">
                      <div className="row">
                        <div className="col-4">
                          <label>{`Address${index + 3}`}:</label>
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

                  {/* Add Address Button */}
                  {/* <div className="col-md-4 mb-2 d-flex align-items-end">
        <button type="button" className="btn btn-outline-primary" onClick={addExtraAddress}>
          + Add Address
        </button>
      </div> */}

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

      {/* Vendor ID Selection Modal */}
      <div
        className={`modal fade ${showVendorIdModal ? "show" : ""}`}
        style={{ display: showVendorIdModal ? "block" : "none" }}
        role="dialog"
        aria-hidden={!showVendorIdModal}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Select Vendor ID Type</h4>
              <button
                type="button"
                className="btn-close custom-btn-close btn-close-modal"
                onClick={() => {
                  setShowVendorIdModal(false);
                  setVendorIdError("");
                  setExternalVendorId("");
                  setVendorIdType("internal");
                }}
              >
                <i className="fa-solid fa-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Choose Vendor ID Generation Method:</label>
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="vendorIdType"
                    id="internal"
                    value="internal"
                    checked={vendorIdType === "internal"}
                    onChange={(e) => setVendorIdType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="internal">
                    Internal (Auto-generated)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="vendorIdType"
                    id="external"
                    value="external"
                    checked={vendorIdType === "external"}
                    onChange={(e) => setVendorIdType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="external">
                    External (Custom)
                  </label>
                </div>
              </div>

              {vendorIdType === "external" && (
                <div className="mb-3">
                  <label className="form-label">Enter Custom Vendor ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={externalVendorId}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setExternalVendorId(e.target.value);
                        setVendorIdError("");
                      }
                    }}
                    placeholder="Enter custom vendor ID (max 50 characters)"
                    maxLength={50}
                  />
                  <div className="form-text">
                    {externalVendorId.length}/50 characters
                  </div>
                </div>
              )}

              {vendorIdError && (
                <div className="alert alert-danger" role="alert">
                  {vendorIdError}
                </div>
              )}

              {vendorIdType === "internal" && (
                <div className="alert alert-info" role="alert">
                  Vendor ID will be automatically generated based on the selected category.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowVendorIdModal(false);
                  setVendorIdError("");
                  setExternalVendorId("");
                  setVendorIdType("internal");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVendorIdSubmit}
                disabled={vendorIdType === "external" && !externalVendorId}
              >
                Confirm & Save Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
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