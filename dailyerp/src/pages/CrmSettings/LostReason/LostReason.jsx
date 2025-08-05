import React, { useState, useEffect } from 'react';

const LostReason = () => {
  const [lostReasons, setLostReasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReason, setEditingReason] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    category: '',
    description: ''
  });

  const categories = ['Price', 'Competition', 'Timeline', 'Budget', 'Feature', 'Service', 'Other'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadLostReasons();
  }, []);

  const loadLostReasons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/crm/lost-reasons?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setLostReasons(data);
      setError('');
    } catch (err) {
      setError('Failed to load lost reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReason(null);
    setFormData({ reason: '', category: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (reason) => {
    setEditingReason(reason);
    setFormData({ 
      reason: reason.reason, 
      category: reason.category,
      description: reason.description 
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingReason 
        ? `http://localhost:8080/api/crm/lost-reasons/${editingReason._id}`
        : 'http://localhost:8080/api/crm/lost-reasons';
      
      const method = editingReason ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId,
          financialYear
        })
      });

      if (response.ok) {
        await loadLostReasons();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save lost reason');
      }
    } catch (err) {
      setError('Failed to save lost reason');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lost reason?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/crm/lost-reasons/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadLostReasons();
          setError('');
        } else {
          setError('Failed to delete lost reason');
        }
      } catch (err) {
        setError('Failed to delete lost reason');
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    const badges = {
      'Price': 'bg-danger',
      'Competition': 'bg-warning',
      'Timeline': 'bg-info',
      'Budget': 'bg-danger',
      'Feature': 'bg-primary',
      'Service': 'bg-secondary',
      'Other': 'bg-dark'
    };
    return badges[category] || 'bg-secondary';
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Lost Reasons Management</h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Lost Reason
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Reason</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lostReasons.map((reason) => (
                        <tr key={reason._id}>
                          <td className="fw-bold">{reason.reason}</td>
                          <td>
                            <span className={`badge ${getCategoryBadgeClass(reason.category)}`}>
                              {reason.category}
                            </span>
                          </td>
                          <td>{reason.description}</td>
                          <td>
                            <span className={`badge ${reason.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {reason.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(reason.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(reason)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(reason._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingReason ? 'Edit Lost Reason' : 'Add Lost Reason'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Lost Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingReason ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostReason;