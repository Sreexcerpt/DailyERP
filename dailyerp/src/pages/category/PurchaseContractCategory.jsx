import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PurchaseContractCategoryForm() {
  const [formData, setFormData] = useState({
    categoryName: '',
    prefix: '',
    rangeFrom: '',
    rangeTo: ''
  });

  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let temp = {};
    const sixDigitRegex = /^\d{6}$/;

    temp.categoryName = formData.categoryName ? '' : 'Required';
    temp.prefix = formData.prefix ? '' : 'Required';

    temp.rangeFrom = formData.rangeFrom
      ? sixDigitRegex.test(formData.rangeFrom)
        ? ''
        : 'Must be 6 digits'
      : 'Required';

    temp.rangeTo = formData.rangeTo
      ? sixDigitRegex.test(formData.rangeTo)
        ? (+formData.rangeTo >= +formData.rangeFrom ? '' : 'Must be ≥ Range From')
        : 'Must be 6 digits'
      : 'Required';

    setErrors(temp);
    return Object.values(temp).every((x) => x === '');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/purchase-contract-categories/${editId}`, formData);
        alert('Purchase contract category updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/purchase-contract-categories', formData);
        alert('Purchase contract category added successfully!');
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      console.error('Error saving purchase contract category:', err);
      alert('Error saving purchase contract category. Please try again.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/purchase-contract-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching purchase contract categories:', err);
      alert('Error loading purchase contract categories');
    }
  };

  const handleEdit = (cat) => {
    setFormData(cat);
    setEditId(cat._id);
    setErrors({});
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this purchase contract category?')) {
      try {
        await axios.delete(`http://localhost:8080/api/purchase-contract-categories/${categoryId}`);
        alert('Purchase contract category deleted successfully!');
        fetchCategories();
      } catch (err) {
        console.error('Error deleting purchase contract category:', err);
        alert('Error deleting purchase contract category. It may be in use.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoryName: '',
      prefix: '',
      rangeFrom: '',
      rangeTo: ''
    });
    setEditId(null);
    setErrors({});
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [showdropdown, setShowdropdown] = useState(false);

  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);

  const exportToPDF = () => {
    // Add PDF export functionality here
    alert('PDF export feature coming soon!');
    handleClosedropdown();
  };

  const exportToExcel = () => {
    // Add Excel export functionality here
    alert('Excel export feature coming soon!');
    handleClosedropdown();
  };

  return (
    <div className='content'>
      {/* Page Header */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Purchase Contract Categories</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">Purchase</li>
              <li className="breadcrumb-item active" aria-current="page">Contract Categories</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h6>
            <i className="fas fa-file-contract me-2"></i>
            Purchase Contract Category Management
          </h6>
          <p className="text-muted mb-0">Create and manage purchase contract categories with number ranges</p>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <div className="dropdown">
            <a href="#" onClick={handleOpendropdown} className="btn btn-outline-primary d-inline-flex align-items-center" data-bs-toggle="dropdown">
              <i className="fas fa-download me-1"></i>Export
            </a>
            <ul className={showdropdown ? `dropdown-menu show` : "dropdown-menu"}>
              <li>
                <a className="dropdown-item" href="#" onClick={exportToPDF}>
                  <i className="fas fa-file-pdf me-2"></i>Download as PDF
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#" onClick={exportToExcel}>
                  <i className="fas fa-file-excel me-2"></i>Download as Excel
                </a>
              </li>
            </ul>
          </div>
          <div>
            <a onClick={() => { handleOpenModal() }} className="btn btn-primary d-flex align-items-center">
              <i className="fas fa-plus me-1"></i>New Contract Category
            </a>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="contractCategoryModalLabel" aria-modal="true" role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h4 className="modal-title" id="contractCategoryModalLabel">
                    <i className="fas fa-file-contract me-2"></i>
                    {editId ? 'Edit' : 'Create'} Purchase Contract Category
                  </h4>
                  <button type="button" className="btn-close btn-close-white" onClick={() => { handleCloseModal(); resetForm(); }} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className='col-xl-6 mb-3'>
                        <label className="form-label">Category Name <span className="text-danger">*</span></label>
                        <input
                          name="categoryName"
                          value={formData.categoryName}
                          onChange={handleChange}
                          className={`form-control ${errors.categoryName ? 'is-invalid' : ''}`}
                          placeholder="Enter category name (e.g., Procurement Contracts)"
                        />
                        {errors.categoryName && <div className="invalid-feedback">{errors.categoryName}</div>}
                      </div>

                      <div className='col-xl-6 mb-3'>
                        <label className="form-label">Prefix <span className="text-danger">*</span></label>
                        <input
                          name="prefix"
                          value={formData.prefix}
                          onChange={handleChange}
                          placeholder="Enter prefix (e.g., PC, PO)"
                          className={`form-control ${errors.prefix ? 'is-invalid' : ''}`}
                          style={{ textTransform: 'uppercase' }}
                        />
                        {errors.prefix && <div className="invalid-feedback">{errors.prefix}</div>}
                      </div>

                      <div className='col-xl-6 mb-3'>
                        <label className="form-label">Range From <span className="text-danger">*</span></label>
                        <input
                          name="rangeFrom"
                          type="number"
                          value={formData.rangeFrom}
                          onChange={handleChange}
                          className={`form-control ${errors.rangeFrom ? 'is-invalid' : ''}`}
                          placeholder="Enter start range (6 digits)"
                          min="100000"
                          max="999999"
                        />
                        {errors.rangeFrom && <div className="invalid-feedback">{errors.rangeFrom}</div>}
                        <div className="form-text">Example: 200000</div>
                      </div>

                      <div className='col-xl-6 mb-3'>
                        <label className="form-label">Range To <span className="text-danger">*</span></label>
                        <input
                          name="rangeTo"
                          type="number"
                          className={`form-control ${errors.rangeTo ? 'is-invalid' : ''}`}
                          value={formData.rangeTo}
                          onChange={handleChange}
                          placeholder="Enter end range (6 digits)"
                          min="100000"
                          max="999999"
                        />
                        {errors.rangeTo && <div className="invalid-feedback">{errors.rangeTo}</div>}
                        <div className="form-text">Example: 299999</div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      {editId && (
                        <button type="button" className='btn btn-outline-secondary' onClick={resetForm}>
                          <i className="fas fa-times me-1"></i>Cancel
                        </button>
                      )}
                      <button type="submit" className='btn btn-success'>
                        <i className={`fas ${editId ? 'fa-save' : 'fa-plus'} me-1`}></i>
                        {editId ? 'Update' : 'Create'} Category
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Categories Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-list me-2"></i>
            Purchase Contract Categories ({categories.length})
          </h5>
        </div>
        <div className="card-body">
          {categories.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-file-contract fa-3x text-muted mb-3"></i>
              <p className="text-muted">No purchase contract categories found. Create your first category!</p>
              <button onClick={handleOpenModal} className="btn btn-success">
                <i className="fas fa-plus me-1"></i>Create First Category
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className='table table-hover table-bordered'>
                <thead className="table-dark">
                  <tr>
                    <th width="5%">#</th>
                    <th width="25%">Category Name</th>
                    <th width="15%">Prefix</th>
                    <th width="15%">Range From</th>
                    <th width="15%">Range To</th>
                    <th width="10%">Available Numbers</th>
                    <th width="15%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-file-contract text-success me-2"></i>
                          <span className="fw-medium">{cat.categoryName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-success">{cat.prefix}</span>
                      </td>
                      <td>{cat.rangeFrom?.toLocaleString()}</td>
                      <td>{cat.rangeTo?.toLocaleString()}</td>
                      <td>
                        <span className="text-success fw-medium">
                          {((cat.rangeTo - cat.rangeFrom) + 1).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button 
                            className='btn btn-sm btn-outline-success' 
                            onClick={() => { handleEdit(cat); handleOpenModal(); }}
                            title="Edit Category"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className='btn btn-sm btn-outline-danger' 
                            onClick={() => handleDelete(cat._id)}
                            title="Delete Category"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PurchaseContractCategoryForm;