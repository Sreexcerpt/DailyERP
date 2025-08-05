import React, { useState, useEffect } from 'react';

const Calls = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCall, setEditingCall] = useState(null);
  const [formData, setFormData] = useState({
    callType: '',
    purpose: '',
    outcome: '',
    description: ''
  });

  const callTypes = ['Inbound', 'Outbound', 'Missed', 'Voicemail'];
  const purposes = ['Sales', 'Support', 'Follow-up', 'Demo', 'Meeting', 'Consultation', 'Other'];
  const outcomes = ['Successful', 'No Answer', 'Busy', 'Follow-up Required', 'Completed', 'Cancelled', 'Rescheduled'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/crm/calls?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setCalls(data);
      setError('');
    } catch (err) {
      setError('Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCall(null);
    setFormData({ callType: '', purpose: '', outcome: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (call) => {
    setEditingCall(call);
    setFormData({ 
      callType: call.callType, 
      purpose: call.purpose,
      outcome: call.outcome,
      description: call.description 
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingCall 
        ? `http://localhost:8080/api/crm/calls/${editingCall._id}`
        : 'http://localhost:8080/api/crm/calls';
      
      const method = editingCall ? 'PUT' : 'POST';
      
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
        await loadCalls();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save call');
      }
    } catch (err) {
      setError('Failed to save call');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this call setting?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/crm/calls/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadCalls();
          setError('');
        } else {
          setError('Failed to delete call');
        }
      } catch (err) {
        setError('Failed to delete call');
      }
    }
  };

  const getCallIcon = (callType) => {
    switch (callType) {
      case 'Inbound':
        return 'fas fa-phone-alt text-success';
      case 'Outbound':
        return 'fas fa-phone text-primary';
      case 'Missed':
        return 'fas fa-phone-slash text-danger';
      case 'Voicemail':
        return 'fas fa-voicemail text-warning';
      default:
        return 'fas fa-phone';
    }
  };

  const getOutcomeBadgeClass = (outcome) => {
    switch (outcome) {
      case 'Successful':
      case 'Completed':
        return 'bg-success';
      case 'Follow-up Required':
      case 'Rescheduled':
        return 'bg-warning';
      case 'No Answer':
      case 'Busy':
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getPurposeBadgeClass = (purpose) => {
    switch (purpose) {
      case 'Sales':
        return 'bg-success';
      case 'Support':
        return 'bg-info';
      case 'Follow-up':
        return 'bg-warning';
      case 'Demo':
        return 'bg-primary';
      case 'Meeting':
        return 'bg-secondary';
      default:
        return 'bg-dark';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-phone me-2"></i>Call Settings Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Call Setting
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
                        <th>Call Type</th>
                        <th>Purpose</th>
                        <th>Outcome</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map((call) => (
                        <tr key={call._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className={getCallIcon(call.callType)}></i>
                              <span className="ms-2">{call.callType}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getPurposeBadgeClass(call.purpose)}`}>
                              {call.purpose}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getOutcomeBadgeClass(call.outcome)}`}>
                              {call.outcome}
                            </span>
                          </td>
                          <td>{call.description}</td>
                          <td>
                            <span className={`badge ${call.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {call.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(call.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(call)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(call._id)}
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
                  {editingCall ? 'Edit Call Setting' : 'Add Call Setting'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Call Type</label>
                        <select
                          className="form-select"
                          value={formData.callType}
                          onChange={(e) => setFormData({ ...formData, callType: e.target.value })}
                          required
                        >
                          <option value="">Select Call Type</option>
                          {callTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Purpose</label>
                        <select
                          className="form-select"
                          value={formData.purpose}
                          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          required
                        >
                          <option value="">Select Purpose</option>
                          {purposes.map((purpose) => (
                            <option key={purpose} value={purpose}>{purpose}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Outcome</label>
                    <select
                      className="form-select"
                      value={formData.outcome}
                      onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                      required
                    >
                      <option value="">Select Outcome</option>
                      {outcomes.map((outcome) => (
                        <option key={outcome} value={outcome}>{outcome}</option>
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
                    {editingCall ? 'Update' : 'Create'}
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

export default Calls;