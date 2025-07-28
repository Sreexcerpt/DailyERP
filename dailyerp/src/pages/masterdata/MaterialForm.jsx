import React, { useEffect, useState } from "react";
import axios from "axios";

const baseUnits = ["Piece", "Box", "Kg", "Ltr"];

const MaterialPage = () => {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    description: '',
    baseUnit: '',
    orderUnit: '',
    conversionValue: '',
    dimension: '',
    minstock: '',
    safetyStock: "",
    maxstock: "",
    pdt: "",
    mpn: "",
    location: "",
    materialgroup: "",
    hsn: ""
  });

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showMaterialIdModal, setShowMaterialIdModal] = useState(false);

  // Material ID selection states
  const [materialIdType, setMaterialIdType] = useState('');
  const [externalMaterialId, setExternalMaterialId] = useState('');
  const [pendingFormData, setPendingFormData] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchMaterials();
  }, []);

  // Filter materials based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMaterials(materials);
    } else {
      const filtered = materials.filter(material => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (material.materialId || '').toLowerCase().includes(searchLower) ||
          (material.description || '').toLowerCase().includes(searchLower) ||
          (material.baseUnit || '').toLowerCase().includes(searchLower) ||
          (material.orderUnit || '').toLowerCase().includes(searchLower) ||
          (material.conversionValue || '').toString().toLowerCase().includes(searchLower) ||
          (material.dimension || '').toLowerCase().includes(searchLower) ||
          (material.mpn || '').toLowerCase().includes(searchLower) ||
          (material.hsn || '').toLowerCase().includes(searchLower) ||
          (material.location || '').toLowerCase().includes(searchLower) ||
          (material.materialgroup || '').toLowerCase().includes(searchLower)
        );
      });
      setFilteredMaterials(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, materials]);

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:8080/api/category');
    setCategories(res.data);
  };

  const fetchMaterials = async () => {
    const companyId = localStorage.getItem('selectedCompanyId');
    const financialYear = localStorage.getItem('financialYear');

    const res = await axios.get('http://localhost:8080/api/material', {
      params: { companyId, financialYear }
    });
    console.log(res)
    // Sort by createdAt in descending order (latest first)
    const sortedMaterials = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setMaterials(sortedMaterials);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const startEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      categoryId: material.categoryId?._id || material.categoryId,
      description: material.description,
      baseUnit: material.baseUnit,
      orderUnit: material.orderUnit,
      conversionValue: material.conversionValue || '',
      dimension: material.dimension || '',
      mpn: material.mpn || '',
      location: material.location || '',
      materialgroup: material.materialgroup || '',
      hsn: material.hsn || '',
      minstock: material.minstock || '',
      safetyStock: material.safetyStock || "",
      maxstock: material.maxstock || "",
      pdt: material.pdt || "",
    });
  };

  const cancelEdit = () => {
    setEditingMaterial(null);
    setFormData({
      categoryId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      conversionValue: '',
      dimension: '',
      hsn: "",
      mpn: "",
      location: "",
      materialgroup: "",
      minstock: '',
      safetyStock: "",
      maxstock: "",
      pdt: "",
    });
    setMaterialIdType('');
    setExternalMaterialId('');
    setPendingFormData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingMaterial) {
        await axios.put(`http://localhost:8080/api/material/${editingMaterial._id}`, formData);
        alert('Material updated!');
        fetchMaterials();
        cancelEdit();
        handleCloseModal();
      } else {
        setPendingFormData(formData);
        setShowModal(false);
        setShowMaterialIdModal(true);
      }
    } catch (err) {
      console.error(err);
      alert('Operation failed!');
    }
  };

  const handleCreateMaterial = async () => {
    try {
      let materialId;
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      const financialYear = localStorage.getItem('financialYear');

      if (materialIdType === 'external') {
        materialId = externalMaterialId;
      } else {
        const idRes = await axios.post('http://localhost:8080/api/material/generate-id', {
          categoryId: pendingFormData.categoryId
        });
        materialId = idRes.data.materialId;
      }

      await axios.post('http://localhost:8080/api/material', {
        ...pendingFormData,
        materialId,
        materialIdType,
        companyId: selectedCompanyId,
        financialYear: financialYear
      });

      alert('Material added!');
      fetchMaterials();
      cancelEdit();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Operation failed!');
    }
  };

  const handleStatusChange = async (materialId, statusType, isChecked) => {
    try {
      const updateData = {
        [statusType]: isChecked
      };

      await axios.put(`http://localhost:8080/api/material/status/${materialId}`, updateData);

      setMaterials(materials.map(material =>
        material._id === materialId
          ? { ...material, [statusType]: isChecked }
          : material
      ));

      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status!');
    }
  };

  // Modal functions
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setShowMaterialIdModal(false);
    setPendingFormData(null);
  };

  const handleCloseMaterialIdModal = () => {
    setShowMaterialIdModal(false);
    setMaterialIdType('');
    setExternalMaterialId('');
    setPendingFormData(null);
    setShowModal(true);
  };

  const handleMaterialIdTypeSelection = (type) => {
    setMaterialIdType(type);
    if (type === 'internal') {
      handleCreateMaterial();
    }
  };

  const [showdropdown, setShowdropdown] = useState(false);
  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);

  const [locations, setLocations] = useState([]);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/locations');
        setLocations(res.data);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };
  return (
    <div className="content">
      <h4>Material Master</h4>
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-2 mt-3">
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
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <div className="dropdown">
            <a
              href="#"
              onClick={handleOpendropdown}
              className="btn btn-outline-primary d-inline-flex align-items-center"
              data-bs-toggle="dropdown"
            >
              <i className="isax isax-export-1 me-1"></i>Export
            </a>
            <ul
              className={showdropdown ? `dropdown-menu show` : "dropdown-menu"}
            >
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={handleClosedropdown}
                >
                  Download as PDF
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={handleClosedropdown}
                >
                  Download as Excel
                </a>
              </li>
            </ul>
          </div>
          <div>
            <a
              onClick={() => {
                handleOpenModal();
                cancelEdit();
              }}
              className="btn btn-primary d-flex align-items-center"
            >
              <i className="isax isax-add-circle5 me-1"></i>New Material
            </a>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Material ID</th>
              <th>Description</th>
              <th>Base</th>
              <th>Order</th>
              <th>Conversion</th>
              <th>Dimension</th>
              <th>MPN</th>
              <th>HSN</th>
              <th>Min Stock</th>
              <th>safety Stock</th>
              <th>Max Stock</th>
              <th>PDT</th>
              <th>Location</th>
              <th>Delete</th>
              <th>Block</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center">
                  {searchTerm
                    ? "No materials found matching your search"
                    : "No materials found"}
                </td>
              </tr>
            ) : (
              currentItems.map((mat) => (
                <tr key={mat._id}>
                  <td>{mat.materialId}</td>
                  <td>{mat.description}</td>
                  <td>{mat.baseUnit}</td>
                  <td>{mat.orderUnit}</td>
                  <td>{mat.conversionValue || "-"}</td>
                  <td>{mat.dimension || "-"}</td>
                  <td>{mat.mpn || "_"}</td>
                  <td>{mat.hsn || "_"}</td>
                  <td>{mat.minstock||"_"}</td>
                  <td>{mat.safetyStock||"_"}</td>
                  <td>{mat.maxstock||"_"}</td>
                  <td>{mat.pdt||"_"}</td>
                  <td>{mat.location || "_"}</td>
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        style={{ borderColor: "black" }}
                        checked={mat.isDeleted || false}
                        onChange={(e) =>
                          handleStatusChange(
                            mat._id,
                            "isDeleted",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        style={{ borderColor: "black" }}
                        checked={mat.isBlocked || false}
                        onChange={(e) =>
                          handleStatusChange(
                            mat._id,
                            "isBlocked",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        startEdit(mat);
                        handleOpenModal();
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="col-md-8 d-flex align-items-center">
        <span className="text-muted">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredMaterials.length)} of{" "}
          {filteredMaterials.length} entries
          {searchTerm && ` (filtered from ${materials.length} total entries)`}
        </span>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="row mb-3">
          <div className="col-md-12">
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>

                {getPageNumbers().map((number) => (
                  <li
                    key={number}
                    className={`page-item ${currentPage === number ? "active" : ""
                      }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""
                    }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Material ID Selection Modal */}
      {showMaterialIdModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Select Material ID Type</h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseMaterialIdModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="mb-4">
                    Choose how you want to create the Material ID:
                  </p>

                  {materialIdType === "external" ? (
                    <div>
                      <div className="mb-3 ">
                        <label className="form-label">
                          External Material ID
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={externalMaterialId}
                          onChange={(e) =>
                            setExternalMaterialId(e.target.value)
                          }
                          maxLength={50}
                          required
                          placeholder="Enter custom material ID (max 50 characters)"
                        />
                        <small className="form-text text-muted">
                          {externalMaterialId.length}/50 characters
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={handleCreateMaterial}
                          disabled={!externalMaterialId.trim()}
                        >
                          Create Material
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setMaterialIdType("")}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="d-flex justify-content-center gap-3">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={() =>
                            handleMaterialIdTypeSelection("internal")
                          }
                        >
                          <i className="isax isax-setting-2 me-2"></i>
                          Internal
                          <small className="d-block mt-1">
                            Auto-generated ID
                          </small>
                        </button>
                        <button
                          className="btn btn-secondary btn-lg"
                          onClick={() =>
                            handleMaterialIdTypeSelection("external")
                          }
                        >
                          <i className="isax isax-edit me-2"></i>
                          External
                          <small className="d-block mt-1">Custom ID</small>
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

      {/* Main Material Form Modal */}
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
                  <h4 className="modal-title" id="myLargeModalLabel">
                    {editingMaterial ? "Edit Material" : "Add New Material"}
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
                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Category</label>
                            </div>
                            <div className="col-8">
                              <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="form-select"

                                placeholder="Select Category"
                                required
                              >
                                <option value="">-- Select --</option>
                                {categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.categoryName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Description</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Description"
                                maxLength={100}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Base Unit</label>
                            </div>
                            <div className="col-8">
                              <select
                                name="baseUnit"
                                value={formData.baseUnit}
                                onChange={handleChange}
                                className="form-select"
                                required
                              >
                                <option value="">-- Select --</option>
                                {baseUnits.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Order Unit</label>
                            </div>
                            <div className="col-8">
                              <select
                                name="orderUnit"
                                value={formData.orderUnit}
                                onChange={handleChange}
                                className="form-select"
                                required
                              >
                                <option value="">-- Select --</option>
                                {baseUnits.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {formData.baseUnit &&
                          formData.orderUnit &&
                          formData.baseUnit !== formData.orderUnit && (
                            <div className="col-md-4 mb-3">
                              <div className="row">
                                <div className="col-4">
                                  <label>
                                    1 {formData.orderUnit} = how many{" "}
                                    {formData.baseUnit}?
                                  </label>
                                </div>
                                <div className="col-8">
                                  <input
                                    name="conversionValue"
                                    value={formData.conversionValue}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Dimension</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="dimension"
                                value={formData.dimension}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>MPN</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="mpn"
                                value={formData.mpn}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>HSN</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="hsn"
                                value={formData.hsn}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>MIN Stock</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="number"
                                name="minstock"
                                value={formData.minstock}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>safety Stock</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="number"
                                name="safetyStock"
                                value={formData.safetyStock}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Max Stock</label>
                            </div>
                            <div className="col-8">
                              <input
                                type="number"
                                name="maxstock"
                                value={formData.maxstock}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Plan Delivery Time</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="pdt"
                                type="number"
                                value={formData.pdt}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Location</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-4 mb-3">
                          <div className="row">
                            <div className="col-4">
                              <label>Material Group</label>
                            </div>
                            <div className="col-8">
                              <input
                                name="materialgroup"
                                value={formData.materialgroup}
                                onChange={handleChange}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                      </div>


                    </div>

                    <div className="modal-footer d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={cancelEdit}
                      >
                        clear
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingMaterial ? "Update Material" : "Save Material"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MaterialPage;
