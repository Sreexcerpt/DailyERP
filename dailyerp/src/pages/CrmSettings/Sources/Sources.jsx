import React, { useState, useEffect } from 'react';

const Sources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/crm/sources?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setSources(data);
      setError('');
    } catch (err) {
      setError('Failed to load sources');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSource(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (source) => {
    setEditingSource(source);
    setFormData({ name: source.name, description: source.description });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingSource 
        ? `http://localhost:8080/api/crm/sources/${editingSource._id}`
        : 'http://localhost:8080/api/crm/sources';

      const method = editingSource ? 'PUT' : 'POST';
      
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
        await loadSources();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save source');
      }
    } catch (err) {
      setError('Failed to save source');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this source?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/crm/sources/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadSources();
          setError('');
        } else {
          setError('Failed to delete source');
        }
      } catch (err) {
        setError('Failed to delete source');
      }
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Sources Management</h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Source
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
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source) => (
                        <tr key={source._id}>
                          <td className="fw-bold">{source.name}</td>
                          <td>{source.description}</td>
                          <td>
                            <span className={`badge ${source.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {source.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(source.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(source)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(source._id)}
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
                  {editingSource ? 'Edit Source' : 'Add Source'}
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
                    <label className="form-label">Source Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
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
                    {editingSource ? 'Update' : 'Create'}
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

export default Sources;