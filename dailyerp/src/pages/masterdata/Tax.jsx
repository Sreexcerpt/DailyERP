import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaxForm = () => {
  const [formData, setFormData] = useState({
    taxCode: '',
    taxName: '',
    cgst: '',
    sgst: '',
    igst: '',
  });

  const [errors, setErrors] = useState({});
  const [taxes, setTaxes] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    const res = await axios.get('http://localhost:8080/api/tax');
    setTaxes(res.data);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'taxCode':
        if (!value) return 'Required';
        if (value.length > 4) return 'Max 4 characters';
        break;
      case 'taxName':
        if (!value) return 'Required';
        if (value.length > 25) return 'Max 25 characters';
        break;
      case 'cgst':
      case 'sgst':
      case 'igst':
        if (!value) return 'Required';
        if (value.length > 2) return 'Max 2 digits';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleaned = value;

    switch (name) {
      case 'taxCode':
        cleaned = value.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 4);
        break;
      case 'taxName':
        cleaned = value.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 25);
        break;
      case 'cgst':
      case 'sgst':
      case 'igst':
        cleaned = value.replace(/[^0-9]/g, '').slice(0, 2);
        break;
      default:
        break;
    }

    const error = validateField(name, cleaned);
    setFormData({ ...formData, [name]: cleaned });
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return Object.keys(formData).every((key) => !validateField(key, formData[key]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/tax/${editId}`, formData);
        alert('Tax updated!');
      } else {
        await axios.post('http://localhost:8080/api/tax', formData);
        alert('Tax added!');
      }

      setFormData({ taxCode: '', taxName: '', cgst: '', sgst: '', igst: '' });
      setErrors({});
      setEditId(null);
      fetchTaxes();
      handleCloseModal()
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const handleEdit = (tax) => {
    setFormData({
      taxCode: tax.taxCode,
      taxName: tax.taxName,
      cgst: tax.cgst,
      sgst: tax.sgst,
      igst: tax.igst,
    });
    setEditId(tax._id);
  };
  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [showdropdown, setShowdropdown] = useState(false);

  const handleOpendropdown = () => setShowdropdown(true);
  const handleClosedropdown = () => setShowdropdown(false);
  return (
   
        <div className="content">
          <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div>
              <h4>Taxes Master</h4>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
              <div className="dropdown">
                <a href="#" onClick={handleOpendropdown} className="btn btn-outline-primary d-inline-flex align-items-center" data-bs-toggle="dropdown">
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
                <a onClick={() => { handleOpenModal() }} className="btn btn-primary d-flex align-items-center"><i className="isax isax-add-circle5 me-1"></i>New Tax</a>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>CGST</th>
                  <th>SGST</th>
                  <th>IGST</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {taxes.map((tax) => (
                  <tr key={tax._id}>
                    <td>{tax.taxCode}</td>
                    <td>{tax.taxName}</td>
                    <td>{tax.cgst}</td>
                    <td>{tax.sgst}</td>
                    <td>{tax.igst}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => {handleEdit(tax),handleOpenModal()}}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showModal && (
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="myLargeModalLabel" aria-modal="true" role="dialog">
              <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title" id="myLargeModalLabel"> {editId ? 'Edit' : 'Add'} Tax</h4>
                    <button type="button" className="btn-close" onClick={() => { handleCloseModal(), resetForm() }} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {/* <form onSubmit={handleSubmit}>
                      <div className="row">
                      {['taxCode', 'taxName', 'cgst', 'sgst', 'igst'].map((field) => (
                        <div className="mb-3 col-xl-2" key={field}>
                          <label className="form-label text-uppercase">{field === "taxCode" || field === "taxName" ? field : `${field} %`}</label>
                          <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                          />
                          {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
                        </div>
                      ))}</div>
                      <button className="btn btn-primary" type="submit" disabled={!isFormValid()}>
                        {editId ? 'Update Tax' : 'Save Tax'}
                      </button>
                    </form> */}

                    <form onSubmit={handleSubmit}>
  <div className="modal-body">
    <div className="row">
      {['taxCode', 'taxName', 'cgst', 'sgst', 'igst'].map((field) => (
        <div className="col-md-4 mb-3" key={field}>
          <div className="row">
            <div className="col-4">
              <label className="form-label text-uppercase">
                {field === "taxCode" || field === "taxName" ? field : `${field} %`}
              </label>
            </div>
            <div className="col-8">
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
              />
              {errors[field] && (
                <div className="invalid-feedback">{errors[field]}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="modal-footer d-flex justify-content-between">
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowModal(false)}
    >
      Cancel
    </button>
    <button
      className="btn btn-primary"
      type="submit"
      disabled={!isFormValid()}
    >
      {editId ? 'Update Tax' : 'Save Tax'}
    </button>
  </div>
</form>

                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
  );
};

export default TaxForm;
