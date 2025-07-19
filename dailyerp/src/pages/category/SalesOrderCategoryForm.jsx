import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesOrderCategoryForm() {
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
        await axios.put(`http://localhost:8080/api/sales-order-categories/${editId}`, formData);
        alert('Sales Order Category updated!');
      } else {
        await axios.post(`http://localhost:8080/api/sales-order-categories`, formData);
        alert('Sales Order Category added!');
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      alert('Error saving category');
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:8080/api/sales-order-categories');
    setCategories(res.data);
  };

  const handleEdit = (cat) => {
    setFormData(cat);
    setEditId(cat._id);
    setErrors({});
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
  return (
    <div className='content'>
      <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h6>Material Category</h6>
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
            <a onClick={() => { handleOpenModal() }} className="btn btn-primary d-flex align-items-center"><i className="isax isax-add-circle5 me-1"></i>Material Category</a>
          </div>
        </div>
      </div>
      {showModal && (<>
        <div className="modal-backdrop fade show"></div>
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="myLargeModalLabel" aria-modal="true" role="dialog">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="myLargeModalLabel"> {editId ? 'Edit' : 'Create'} Sales Order Category</h4>
                <button type="button" className="btn-close" onClick={() => { handleCloseModal(), resetForm() }} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <h2></h2>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className='col-xl-3'>
                      <input
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                        placeholder="Category Name"
                        className='form-control'
                      />
                      <div style={{ color: 'red' }}>{errors.categoryName}</div>
                    </div>

                    <div className='col-xl-3'>
                      <input
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        placeholder="Prefix"
                        className='form-control'
                      />
                      <div style={{ color: 'red' }}>{errors.prefix}</div>
                    </div>

                    <div className='col-xl-3'>
                      <input
                        name="rangeFrom"
                        type="number"
                        value={formData.rangeFrom}
                        onChange={handleChange}
                        placeholder="Range From (6 digits)"
                        className='form-control'
                      />
                      <div style={{ color: 'red' }}>{errors.rangeFrom}</div>
                    </div>

                    <div className='col-xl-3'>
                      <input
                        name="rangeTo"
                        type="number"
                        value={formData.rangeTo}
                        onChange={handleChange}
                        className='form-control'
                        placeholder="Range To (6 digits)"
                      />
                      <div style={{ color: 'red' }}>{errors.rangeTo}</div>
                    </div>
                  </div>
                  <button className='btn btn-sm btn-success mt-2 mb-2' type="submit">{editId ? 'Update' : 'Add'} Category</button>
                  {editId && (
                    <button className='btn btn-danger' type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
      )}
      <h3>Existing Sales Order Categories</h3>
      <div className="table-responsive">
      <table className='table table-bordered'>
        <thead>
          <tr>
            <th>#</th>
            <th>Category</th>
            <th>Prefix</th>
            <th>RangeFrom</th>
            <th>RangeTo</th>
            <th>Action</th>
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
                <button className='btn btn-sm btn-primary' onClick={() => {handleEdit(cat),handleOpenModal()}}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default SalesOrderCategoryForm;
