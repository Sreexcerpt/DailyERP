import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RFQCategoryForm() {
  const [formData, setFormData] = useState({
    categoryName: '',
    prefix: '',
    rangeFrom: '',
    rangeTo: ''
  });

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/rfq-categories/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/rfq-categories', formData);
      }
      setFormData({ categoryName: '', prefix: '', rangeFrom: '', rangeTo: '' });
      setEditingId(null);
      fetchCategories();
      handleClosedropdown();
    } catch (err) {
      console.error('Error submitting category:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/rfq-categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleEdit = (cat) => {
    setFormData({
      categoryName: cat.categoryName,
      prefix: cat.prefix,
      rangeFrom: cat.rangeFrom,
      rangeTo: cat.rangeTo
    });
    setEditingId(cat._id);
  };

  const handleCancelEdit = () => {
    setFormData({ categoryName: '', prefix: '', rangeFrom: '', rangeTo: '' });
    setEditingId(null);
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
  return (
    <div className='content'>
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h6>RFQ Category</h6>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
          <div className="dropdown">
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
          </div>
          <div>
            <a onClick={() => { handleOpenModal() }} className="btn btn-primary d-flex align-items-center"><i className="isax isax-add-circle5 me-1"></i>Vendor Category</a>
          </div>
        </div>
      </div>
      <h2></h2>
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
                  <form onSubmit={handleSubmit} >
                    <div className='row'>
                      <div className="col-xl-3 mb-2">
                        <label htmlFor="categoryName">Category Name</label>
                        <input
                          name="categoryName"
                          placeholder="Category Name"
                          value={formData.categoryName}
                          onChange={handleChange}
                          required
                          className='form-control'
                        />
                      </div>
                      <div className="col-xl-3 mb-2">
                        <label htmlFor="prefix">Prefix</label>
                        <input
                          name="prefix"
                          placeholder="Prefix"
                          value={formData.prefix}
                          onChange={handleChange}
                          required
                          className='form-control'
                        /></div>
                      <div className="col-xl-3 mb-2">
                        <label htmlFor="rangeFrom">Range From</label>

                        <input
                          name="rangeFrom"
                          placeholder="Range From"
                          value={formData.rangeFrom}
                          onChange={handleChange}
                          required
                          type="number"
                          className='form-control'
                        /></div>
                      <div className="col-xl-3 mb-2">
                        <label htmlFor="rangeTo">Range To</label>
                        <input
                          name="rangeTo"
                          placeholder="Range To"
                          value={formData.rangeTo}
                          onChange={handleChange}
                          required
                          type="number"
                          className='form-control'
                        />
                      </div>
                    </div>
                    <div>
                      <button type="submit" className='btn btn-sm btn-success'>
                        {editingId ? 'Update Category' : 'Add Category'}
                      </button>
                      {editingId && (
                        <button type="button" className='btn btn-sm btn-secondary ms-3' onClick={handleCancelEdit}>
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

      <div className="table-responsive">
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Prefix</th>
              <th>Range From</th>
              <th>Range To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id}>
                <td>{index + 1}</td>
                <td>{cat.categoryName}</td>
                <td>{cat.prefix}</td>
                <td>{cat.rangeFrom}</td>
                <td>{cat.rangeTo}</td>
                <td>
                  <button onClick={() => { handleEdit(cat),handleOpenModal() }} className='btn btn-sm btn-primary'>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RFQCategoryForm;






