import React, { useState, useEffect } from 'react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Planning',
    priority: 'Medium',
    projectManager: '',
    teamMembers: '',
    technologies: '',
    category: ''
  });

  const statuses = ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Web Development', 'Mobile App', 'Desktop App', 'API Development', 'Data Analysis', 'Other'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/projects?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setProjects(data);
      setError('');
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProject(null);
    setFormData({
      projectName: '',
      description: '',
      clientName: '',
      startDate: '',
      endDate: '',
      budget: '',
      status: 'Planning',
      priority: 'Medium',
      projectManager: '',
      teamMembers: '',
      technologies: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      description: project.description,
      clientName: project.clientName,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget,
      status: project.status,
      priority: project.priority,
      projectManager: project.projectManager,
      teamMembers: project.teamMembers.join(', '),
      technologies: project.technologies.join(', '),
      category: project.category
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingProject 
        ? `http://localhost:8080/api/projects/${editingProject._id}`
        : 'http://localhost:8080/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const projectData = {
        ...formData,
        teamMembers: formData.teamMembers.split(',').map(member => member.trim()).filter(member => member),
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
        companyId,
        financialYear
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        await loadProjects();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      setError('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadProjects();
          setError('');
        } else {
          setError('Failed to delete project');
        }
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      'Planning': 'bg-info',
      'In Progress': 'bg-primary',
      'Testing': 'bg-warning',
      'Completed': 'bg-success',
      'On Hold': 'bg-secondary',
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

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-project-diagram me-2"></i>Projects Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Project
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
                        <th>Project Name</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Progress</th>
                        <th>Budget</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Project Manager</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id}>
                          <td>
                            <div>
                              <strong>{project.projectName}</strong>
                              {project.category && (
                                <div className="text-muted small">{project.category}</div>
                              )}
                            </div>
                          </td>
                          <td>{project.clientName}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
                              {project.priority}
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{height: '20px'}}>
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{width: `${calculateProgress(project.startDate, project.endDate)}%`}}
                              >
                                {calculateProgress(project.startDate, project.endDate)}%
                              </div>
                            </div>
                          </td>
                          <td>
                            {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A'}
                          </td>
                          <td>
                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>{project.projectManager}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(project)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(project._id)}
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
                  {editingProject ? 'Edit Project' : 'Add Project'}
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
                        <label className="form-label">Project Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.projectName}
                          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Client Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          required
                        />
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
                    <div className="col-md-4">
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
                    <div className="col-md-4">
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
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
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
                    <label className="form-label">Project Manager</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.projectManager}
                      onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Team Members (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.teamMembers}
                      onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
                      placeholder="John Doe, Jane Smith, Bob Johnson"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      placeholder="React, Node.js, MongoDB"
                    />
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
                    {editingProject ? 'Update' : 'Create'}
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

export default Projects;