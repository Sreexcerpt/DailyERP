import React, { useState, useEffect } from 'react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    projectId: '',
    assignedTo: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: '',
    actualHours: '',
    category: ''
  });

  const statuses = ['To Do', 'In Progress', 'Review', 'Testing', 'Done', 'Blocked'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Development', 'Testing', 'Design', 'Documentation', 'Bug Fix', 'Research', 'Other'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadTasks();
    loadProjects();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/tasks?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks');
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
    setEditingTask(null);
    setFormData({
      taskName: '',
      description: '',
      projectId: '',
      assignedTo: '',
      status: 'To Do',
      priority: 'Medium',
      dueDate: '',
      estimatedHours: '',
      actualHours: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      taskName: task.taskName,
      description: task.description,
      projectId: task.projectId._id || task.projectId,
      assignedTo: task.assignedTo,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      category: task.category
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingTask 
        ? `http://localhost:8080/api/tasks/${editingTask._id}`
        : 'http://localhost:8080/api/tasks';
      
      const method = editingTask ? 'PUT' : 'POST';
      
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
        await loadTasks();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save task');
      }
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadTasks();
          setError('');
        } else {
          setError('Failed to delete task');
        }
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      'To Do': 'bg-secondary',
      'In Progress': 'bg-primary',
      'Review': 'bg-warning',
      'Testing': 'bg-info',
      'Done': 'bg-success',
      'Blocked': 'bg-danger'
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
                <i className="fas fa-tasks me-2"></i>Tasks Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Task
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
                        <th>Task Name</th>
                        <th>Project</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Category</th>
                        <th>Due Date</th>
                        <th>Hours</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task._id} className={isOverdue(task.dueDate) && task.status !== 'Done' ? 'table-danger' : ''}>
                          <td>
                            <div>
                              <strong>{task.taskName}</strong>
                              {task.description && (
                                <div className="text-muted small">{task.description.substring(0, 50)}...</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {task.projectId?.projectName || 'No Project'}
                          </td>
                          <td>{task.assignedTo}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info">{task.category}</span>
                          </td>
                          <td>
                            {task.dueDate ? (
                              <div>
                                {new Date(task.dueDate).toLocaleDateString()}
                                {isOverdue(task.dueDate) && task.status !== 'Done' && (
                                  <div className="text-danger small">
                                    <i className="fas fa-exclamation-triangle"></i> Overdue
                                  </div>
                                )}
                              </div>
                            ) : 'N/A'}
                          </td>
                          <td>
                            <div className="small">
                              <div>Est: {task.estimatedHours || 0}h</div>
                              <div>Act: {task.actualHours || 0}h</div>
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(task)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(task._id)}
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
                  {editingTask ? 'Edit Task' : 'Add Task'}
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
                        <label className="form-label">Task Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.taskName}
                          onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
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
                        <label className="form-label">Assigned To</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.assignedTo}
                          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
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
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Estimated Hours</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.estimatedHours}
                          onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Actual Hours</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.actualHours}
                      onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
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
                    {editingTask ? 'Update' : 'Create'}
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

export default Tasks;