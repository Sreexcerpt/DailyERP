import React, { useState, useEffect } from 'react';

const ContactStage = () => {
  const [contactStages, setContactStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [formData, setFormData] = useState({
    stageName: '',
    description: '',
    probability: 0,
    color: '#007bff'
  });

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadContactStages();
  }, []);

  const loadContactStages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/crm/contact-stages?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setContactStages(data.sort((a, b) => a.order - b.order));
      setError('');
    } catch (err) {
      setError('Failed to load contact stages');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStage(null);
    setFormData({ stageName: '', description: '', probability: 0, color: '#007bff' });
    setShowModal(true);
  };

  const handleEdit = (stage) => {
    setEditingStage(stage);
    setFormData({ 
      stageName: stage.stageName, 
      description: stage.description,
      probability: stage.probability,
      color: stage.color
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingStage 
        ? `http://localhost:8080/api/crm/contact-stages/${editingStage._id}`
        : 'http://localhost:8080/api/crm/contact-stages';
      
      const method = editingStage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId,
          financialYear,
          order: editingStage ? editingStage.order : contactStages.length + 1
        })
      });

      if (response.ok) {
        await loadContactStages();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save contact stage');
      }
    } catch (err) {
      setError('Failed to save contact stage');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact stage?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/crm/contact-stages/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadContactStages();
          setError('');
        } else {
          setError('Failed to delete contact stage');
        }
      } catch (err) {
        setError('Failed to delete contact stage');
      }
    }
  };

  const moveStage = async (id, direction) => {
    try {
      const response = await fetch(`http://localhost:8080/api/crm/contact-stages/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });

      if (response.ok) {
        await loadContactStages();
      } else {
        setError('Failed to reorder contact stage');
      }
    } catch (err) {
      setError('Failed to reorder contact stage');
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Contact Stages Management</h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Contact Stage
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
                        <th>Order</th>
                        <th>Stage Name</th>
                        <th>Description</th>
                        <th>Probability %</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactStages.map((stage, index) => (
                        <tr key={stage._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{stage.order}</span>
                              <div className="btn-group-vertical btn-group-sm">
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => moveStage(stage._id, 'up')}
                                  disabled={index === 0}
                                >
                                  <i className="fas fa-chevron-up"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => moveStage(stage._id, 'down')}
                                  disabled={index === contactStages.length - 1}
                                >
                                  <i className="fas fa-chevron-down"></i>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span 
                              className="badge text-white"
                              style={{ backgroundColor: stage.color }}
                            >
                              {stage.stageName}
                            </span>
                          </td>
                          <td>{stage.description}</td>
                          <td>{stage.probability}%</td>
                          <td>
                            <span className={`badge ${stage.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {stage.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(stage.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(stage)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(stage._id)}
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
                  {editingStage ? 'Edit Contact Stage' : 'Add Contact Stage'}
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
                    <label className="form-label">Stage Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.stageName}
                      onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Probability (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={formData.probability}
                          onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Color</label>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                      </div>
                    </div>
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
                    {editingStage ? 'Update' : 'Create'}
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

export default ContactStage;