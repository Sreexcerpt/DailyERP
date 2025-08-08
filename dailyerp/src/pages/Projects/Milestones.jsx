import React, { useState, useEffect } from 'react';

const Milestones = () => {
  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    milestoneName: '',
    description: '',
    projectId: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
    deliverables: '',
    budget: '',
    completionPercentage: 0
  });

  const statuses = ['Pending', 'In Progress', 'Completed', 'Delayed', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadMilestones();
    loadProjects();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/milestones?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setMilestones(data);
      setError('');
    } catch (err) {
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/projects?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects');
    }
  };

  const handleAdd = () => {
    setEditingMilestone(null);
    setFormData({
      milestoneName: '',
      description: '',
      projectId: '',
      dueDate: '',
      status: 'Pending',
      priority: 'Medium',
      deliverables: '',
      budget: '',
      completionPercentage: 0
    });
    setShowModal(true);
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      milestoneName: milestone.milestoneName,
      description: milestone.description,
      projectId: milestone.projectId._id || milestone.projectId,
      dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
      status: milestone.status,
      priority: milestone.priority,
      deliverables: milestone.deliverables.join('\n'),
      budget: milestone.budget,
      completionPercentage: milestone.completionPercentage
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingMilestone 
        ? `http://localhost:8080/api/milestones/${editingMilestone._id}`
        : 'http://localhost:8080/api/milestones';
      
      const method = editingMilestone ? 'PUT' : 'POST';
      
      const milestoneData = {
        ...formData,
        deliverables: formData.deliverables.split('\n').filter(item => item.trim()),
        companyId,
        financialYear
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestoneData)
      });

      if (response.ok) {
        await loadMilestones();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save milestone');
      }
    } catch (err) {
      setError('Failed to save milestone');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/milestones/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadMilestones();
          setError('');
        } else {
          setError('Failed to delete milestone');
        }
      } catch (err) {
        setError('Failed to delete milestone');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      'Pending': 'bg-secondary',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Delayed': 'bg-warning',
      'Cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const badges = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-dark'
    };
    return badges[priority] || 'bg-secondary';
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-flag-checkered me-2"></i>Milestones Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Milestone
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
                        <th>Milestone Name</th>
                        <th>Project</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Progress</th>
                        <th>Due Date</th>
                        <th>Budget</th>
                        <th>Deliverables</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((milestone) => (
                        <tr key={milestone._id} className={isOverdue(milestone.dueDate) && milestone.status !== 'Completed' ? 'table-danger' : ''}>
                          <td>
                            <div>
                              <strong>{milestone.milestoneName}</strong>
                              {milestone.description && (
                                <div className="text-muted small">{milestone.description.substring(0, 50)}...</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {milestone.projectId?.projectName || 'No Project'}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(milestone.status)}`}>
                              {milestone.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(milestone.priority)}`}>
                              {milestone.priority}
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{height: '20px', width: '100px'}}>
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{width: `${milestone.completionPercentage}%`}}
                              >
                                {milestone.completionPercentage}%
                              </div>
                            </div>
                          </td>
                          <td>
                            {milestone.dueDate ? (
                              <div>
                                {new Date(milestone.dueDate).toLocaleDateString()}
                                {isOverdue(milestone.dueDate) && milestone.status !== 'Completed' && (
                                  <div className="text-danger small">
                                    <i className="fas fa-exclamation-triangle"></i> Overdue
                                  </div>
                                )}
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td>
                            {milestone.budget ? `$${Number(milestone.budget).toLocaleString()}` : 'N/A'}
                          </td>
                          <td>
                            <span className="badge bg-info">{milestone.deliverables?.length || 0} items</span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(milestone)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(milestone._id)}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
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
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label className="form-label">Milestone Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.milestoneName}
                          onChange={(e) => setFormData({ ...formData, milestoneName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Project</label>
                        <select
                          className="form-select"
                          value={formData.projectId}
                          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                          required
                        >
                          <option value="">Select Project</option>
                          {projects.map((project) => (
                            <option key={project._id} value={project._id}>{project.projectName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
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
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          required
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Due Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Budget ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Completion Percentage</label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={formData.completionPercentage}
                      onChange={(e) => setFormData({ ...formData, completionPercentage: e.target.value })}
                    />
                    <div className="text-center">{formData.completionPercentage}%</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Deliverables (one per line)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.deliverables}
                      onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                      placeholder="Design mockups&#10;Database schema&#10;API documentation"
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
                    {editingMilestone ? 'Update' : 'Create'}
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

export default Milestones;