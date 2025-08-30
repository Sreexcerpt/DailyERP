import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VendorCategoryForm() {
  const [formData, setFormData] = useState({
    categoryName: '',
    // prefix: '',
    rangeFrom: '',
    rangeTo: '',
        companyId:  localStorage.getItem('selectedCompanyId'),
       financialYear : localStorage.getItem('financialYear')
  });

  const [vendorCategories, setVendorCategories] = useState([]);
  const [editingId, setEditingId] = useState(null); // 🆕 ID of the category being edited
const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'rangeFrom' || name === 'rangeTo') {
      // Remove any non-digit characters
      const cleanValue = value.replace(/\D/g, '');

      // Check if it's exactly 6 digits and within range
      if (cleanValue.length <= 6) {
        const numValue = parseInt(cleanValue);
        if (cleanValue.length === 6 && numValue >= 100000 && numValue <= 999999) {
          setFormData(prev => ({ ...prev, [name]: cleanValue }));
        } else if (cleanValue.length < 6) {
          // Allow partial input while typing
          setFormData(prev => ({ ...prev, [name]: cleanValue }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // ✅ Update
        const res = await axios.put(`http://localhost:8080/api/vendor-categories/${editingId}`, formData);
        alert('Vendor Category Updated!');
        setVendorCategories(prev =>
          prev.map(cat => (cat._id === editingId ? res.data : cat))
        );
        setEditingId(null);
      } else {
        // ✅ Add
        const res = await axios.post('http://localhost:8080/api/vendor-categories', formData);
        alert('Vendor Category Added!');
        setVendorCategories([...vendorCategories, res.data]);
      }
      // ✅ Reset form
      setFormData({ categoryName: '', rangeFrom: '', rangeTo: '' });
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error adding/updating category');
    }
  };

  const fetchCategories = async () => {
    try {
       const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  

      const res = await axios.get('http://localhost:8080/api/vendor-categories',{    params: { companyId, financialYear }});
      setVendorCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName,
      // prefix: category.prefix,
      rangeFrom: category.rangeFrom,
      rangeTo: category.rangeTo
    });
    setEditingId(category._id);
  };
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [showdropdown, setShowdropdown] = useState(false);

  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);
  return (
    <div className="">

      <div className="content">
        <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-2">
          <div>
            <h6>Vendor Category</h6>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
            {/* <div className="dropdown">
              <a href="#" onClick={handleOpendropdown} className="btn btn-outline-white d-inline-flex align-items-center" data-bs-toggle="dropdown">
                <i className="isax isax-export-1 me-1"></i>Export
              </a>
              <ul className={showdropdown ? `dropdown-menu show` : "dropdown-menu"}>
                <li>
                  <a className="dropdown-item" href="#" onClick={handleClosedropdown}>Download as PDF</a>
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={handleClosedropdown}>Download as Excel</a>
                </li>
              </ul>
            </div> */}
            <div>
              <a onClick={() => { handleOpenModal() }} className="btn btn-primary d-flex align-items-center"><i className="ti ti-plus me-1"></i>Add Vendor Category</a>
            </div>
          </div>
        </div>
        <div>
          {showModal && (
            <>
              <div className="modal-backdrop fade show"></div>
              <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="myLargeModalLabel" aria-modal="true" role="dialog">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title" id="myLargeModalLabel">  {editingId ? 'Edit Vendor Category' : 'Add Vendor Category'}</h4>
                      <button type="button" className="btn-close" onClick={() => { setEditingId(null); handleCloseModal(), setFormData({ categoryName: '', prefix: '', rangeFrom: '', rangeTo: '' }); }} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-xl-3 mb-2">
                            <label>Category Name</label>
                            <input
                              type="text"
                              name="categoryName"
                              placeholder="e.g., Hardware"
                              value={formData.categoryName}
                              onChange={handleChange}
                              required
                              className='form-control'
                            />
                          </div>
                          {/* <div className="col-xl-3 mb-2">
                              <label>Prefix</label>
                              <input
                                type="text"
                                name="prefix"
                                placeholder="e.g., HW"
                                value={formData.prefix}
                                onChange={handleChange}
                                required
                                className='form-control'
                              />
                            </div> */}
                          <div className="col-xl-3 mb-2">
                            <label>Range From</label>
                            <input
                              type="text"
                              name="rangeFrom"
                              placeholder="e.g., 100000"
                              value={formData.rangeFrom}
                              onChange={handleChange}
                              required
                              className='form-control'
                            /></div>
                          <div className="col-xl-3 mb-2">
                            <label>Range To</label>
                            <input
                              type="text"
                              name="rangeTo"
                              placeholder="e.g., 999999"
                              value={formData.rangeTo}
                              onChange={handleChange}
                              required
                              className='form-control'
                            /></div>
                        </div>
                        <button type="submit" className='btn btn-sm btn-primary'>
                          {editingId ? 'Update Category' : 'Add Category'}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="card">
            <div className="card-body"><div className='table-responsive'>
            <table className='table table-sm table-bordered'>
              <thead>
                <tr>
                  <th>Category Name</th>
                  {/* <th>Prefix</th> */}
                  <th>Range From</th>
                  <th>Range To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorCategories.map(cat => (
                  <tr key={cat._id} >
                    <td>{cat.categoryName}</td>
                    {/* <td>{cat.prefix}</td> */}
                    <td>{cat.rangeFrom}</td>
                    <td>{cat.rangeTo}</td>
                    <td>
                      <button
                        onClick={() => { handleEdit(cat), handleOpenModal() }}
                        className='btn btn-sm btn-primary'
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default VendorCategoryForm;

