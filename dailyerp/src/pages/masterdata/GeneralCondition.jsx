import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function GeneralCondition() {
  const [conditions, setConditions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDeleted: false,
    isBlocked: false,
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/general-conditions');
      setConditions(res.data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData(data);
      setEditingData(data);
    } else {
      setFormData({
        name: '',
        description: '',
        isDeleted: false,
        isBlocked: false,
      });
      setEditingData(null);
    }
    setShowModal(true);
  };

  // Save new or updated data
  const handleSave = async () => {
    try {
      if (editingData) {
        await axios.put(`http://localhost:8080/api/general-conditions/${editingData._id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/general-conditions', formData);
      }
      fetchData();
      setShowModal(false);
      setEditingData(null);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Delete condition
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/general-conditions/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Toggle isDeleted / isBlocked
  const handleStatusChange = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:8080/api/general-conditions/${id}`, { [field]: value });
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2>General Conditions</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenModal()}>Add General Condition</button>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingData ? 'Edit' : 'Add'} General Condition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="General Condition"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
         
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>{editingData ? 'Update' : 'Save'}</Button>
        </Modal.Footer>
      </Modal>

      {/* Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Condition</th>
            <th>Description</th>
            <th>Is Deleted</th>
            <th>Is Blocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conditions.map((mat) => (
            <tr key={mat._id}>
              <td>{mat.name}</td>
              <td>{mat.description}</td>
              <td>
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{ borderColor: 'black' }}
                  checked={mat.isDeleted || false}
                  onChange={(e) => handleStatusChange(mat._id, 'isDeleted', e.target.checked)}
                />
              </td>
              <td>
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{ borderColor: 'black' }}
                  checked={mat.isBlocked || false}
                  onChange={(e) => handleStatusChange(mat._id, 'isBlocked', e.target.checked)}
                />
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleOpenModal(mat)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(mat._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GeneralCondition;
