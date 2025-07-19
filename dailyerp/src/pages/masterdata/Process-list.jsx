import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

function ProcessList() {
  const [processes, setProcesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    processId: '',
    processDescription: '',
    isDeleted: false,
    isBlocked: false,
  });

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/processes');
      setProcesses(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData(data);
      setEditingData(data);
    } else {
      setFormData({
        processId: '',
        processDescription: '',
        isDeleted: false,
        isBlocked: false,
      });
      setEditingData(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingData) {
        await axios.put(`http://localhost:8080/api/processes/${editingData._id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/processes', formData);
      }
      fetchData();
      setShowModal(false);
      setEditingData(null);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/processes/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleStatusChange = async (id, field, value) => {
    try {
      await axios.put(`http://localhost:8080/api/processes/${id}`, { [field]: value });
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
      <h2>Process Master</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenModal()}>Add Process</button>

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingData ? 'Edit' : 'Add'} Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Process ID"
            value={formData.processId}
            onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Process Description"
            value={formData.processDescription}
            onChange={(e) => setFormData({ ...formData, processDescription: e.target.value })}
          />
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={formData.isDeleted}
              onChange={(e) => setFormData({ ...formData, isDeleted: e.target.checked })}
            />
            <label className="form-check-label">Is Deleted</label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={formData.isBlocked}
              onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
            />
            <label className="form-check-label">Is Blocked</label>
          </div>
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
            <th>Process ID</th>
            <th>Description</th>
            <th>Is Deleted</th>
            <th>Is Blocked</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((proc) => (
            <tr key={proc._id}>
              <td>{proc.processId}</td>
              <td>{proc.processDescription}</td>
              <td>
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{ borderColor: 'black' }}
                  checked={proc.isDeleted || false}
                  onChange={(e) => handleStatusChange(proc._id, 'isDeleted', e.target.checked)}
                />
              </td>
              <td>
                <input
                  className="form-check-input"
                  type="checkbox"
                  style={{ borderColor: 'black' }}
                  checked={proc.isBlocked || false}
                  onChange={(e) => handleStatusChange(proc._id, 'isBlocked', e.target.checked)}
                />
              </td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleOpenModal(proc)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(proc._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProcessList;
