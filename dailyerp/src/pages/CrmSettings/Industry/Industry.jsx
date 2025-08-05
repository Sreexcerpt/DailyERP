import React, { useState, useEffect } from 'react';

const Industry = () => {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [formData, setFormData] = useState({
    industryName: '',
    category: '',
    description: ''
  });

  const categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Transportation',
    'Energy',
    'Media',
    'Hospitality',
    'Construction',
    'Agriculture',
    'Other'
  ];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/crm/industries?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setIndustries(data);
      setError('');
    } catch (err) {
      setError('Failed to load industries');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingIndustry(null);
    setFormData({ industryName: '', category: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (industry) => {
    setEditingIndustry(industry);
    setFormData({ 
      industryName: industry.industryName, 
      category: industry.category,
      description: industry.description 
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingIndustry 
        ? `http://localhost:8080/api/crm/industries/${editingIndustry._id}`
        : 'http://localhost:8080/api/crm/industries';
      
      const method = editingIndustry ? 'PUT' : 'POST';
      
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
        await loadIndustries();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save industry');
      }
    } catch (err) {
      setError('Failed to save industry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this industry?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/crm/industries/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadIndustries();
          setError('');
        } else {
          setError('Failed to delete industry');
        }
      } catch (err) {
        setError('Failed to delete industry');
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    const badges = {
      'Technology': 'bg-primary',
      'Healthcare': 'bg-success',
      'Finance': 'bg-warning',
      'Manufacturing': 'bg-info',
      'Retail': 'bg-secondary',
      'Education': 'bg-primary',
      'Real Estate': 'bg-success',
      'Transportation': 'bg-info',
      'Energy': 'bg-warning',
      'Media': 'bg-secondary',
      'Hospitality': 'bg-primary',
      'Construction': 'bg-info',
      'Agriculture': 'bg-success',
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
              <h4 className="card-title mb-0">
                <i className="fas fa-building me-2"></i>Industry Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Industry
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
                        <th>Industry Name</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {industries.map((industry) => (
                        <tr key={industry._id}>
                          <td className="fw-bold">{industry.industryName}</td>
                          <td>
                            <span className={`badge ${getCategoryBadgeClass(industry.category)}`}>
                              {industry.category}
                            </span>
                          </td>
                          <td>{industry.description}</td>
                          <td>
                            <span className={`badge ${industry.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {industry.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(industry.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(industry)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(industry._id)}
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
                  {editingIndustry ? 'Edit Industry' : 'Add Industry'}
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
                    <label className="form-label">Industry Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.industryName}
                      onChange={(e) => setFormData({ ...formData, industryName: e.target.value })}
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
                    {editingIndustry ? 'Update' : 'Create'}
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

export default Industry;