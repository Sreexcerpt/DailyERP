import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AddDesignation = () => {
  const [departments, setDepartments] = useState([]);
  const [designName, setDesignName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [designations, setDesignations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const modalRef = useRef();

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchDepartments = () => {
    axios.get('http://localhost:8080/api/departments')
      .then(res => setDepartments(res.data))
      .catch(err => console.error('Error fetching departments', err));
  };

  const fetchDesignations = () => {
    axios.get('http://localhost:8080/api/designations')
      .then(res => setDesignations(res.data))
      .catch(err => console.error('Error fetching designations', err));
  };

  const openModal = () => {
    setIsEditing(false);
    setDesignName('');
    setSelectedDeptId('');
    const modal = new window.bootstrap.Modal(modalRef.current);
    modal.show();
  };

  const closeModal = () => {
    const modal = window.bootstrap.Modal.getInstance(modalRef.current);
    modal.hide();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      designName,
      departmentId: selectedDeptId,
    };

    const request = isEditing
      ? axios.put(`http://localhost:8080/api/designations/${editId}`, payload)
      : axios.post('http://localhost:8080/api/designations', payload);

    request
      .then(() => {
        fetchDesignations();
        closeModal();
        resetForm();
      })
      .catch(err => console.error('Error saving designation', err));
  };

  const handleEdit = (designation) => {
    setIsEditing(true);
    setEditId(designation._id);
    setDesignName(designation.designName);
    setSelectedDeptId(designation.departmentId?._id || '');

    const modal = new window.bootstrap.Modal(modalRef.current);
    modal.show();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      axios.delete(`http://localhost:8080/api/designations/${id}`)
        .then(() => fetchDesignations())
        .catch(err => console.error('Error deleting designation', err));
    }
  };

  const resetForm = () => {
    setDesignName('');
    setSelectedDeptId('');
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-primary">Material Master</h4>

      <div className="mb-3">
        <button className="btn btn-primary" onClick={openModal}>
          Add Designation
        </button>
      </div>

      <div className="card p-4">
        <h5 className="card-title mb-3">All Designations</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {designations.map((d, index) => (
                <tr key={d._id}>
                  <td>{index + 1}</td>
                  <td>{d.designName}</td>
                  <td>{d.departmentId?.departmentName || 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(d)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {designations.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">No designations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <div
        className="modal fade"
        ref={modalRef}
        tabIndex="-1"
        aria-labelledby="designationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="designationModalLabel">
                  {isEditing ? 'Edit' : 'Add'} Designation
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Designation Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Update' : 'Add'}
                </button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDesignation;
