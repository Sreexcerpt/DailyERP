import React, { useState, useEffect } from 'react';

const TimeTracking = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    description: '',
    startTime: '',
    endTime: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadTimeEntries();
    loadProjects();
    loadTasks();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && currentTimer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentTimer]);

  const loadTimeEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/time-entries?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setTimeEntries(data);
      setError('');
    } catch (err) {
      setError('Failed to load time entries');
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

  const loadTasks = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/tasks?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks');
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setCurrentTimer(0);
    const now = new Date();
    setFormData({ 
      ...formData, 
      startTime: now.toTimeString().slice(0, 5),
      date: now.toISOString().split('T')[0]
    });
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    const now = new Date();
    const hours = (currentTimer / 3600).toFixed(2);
    setFormData({ 
      ...formData, 
      endTime: now.toTimeString().slice(0, 5),
      hours: hours
    });
    setShowModal(true);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAdd = () => {
    setEditingEntry(null);
    setFormData({
      projectId: '',
      taskId: '',
      description: '',
      startTime: '',
      endTime: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
      billable: true
    });
    setShowModal(true);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      projectId: entry.projectId._id || entry.projectId,
      taskId: entry.taskId?._id || entry.taskId || '',
      description: entry.description,
      startTime: entry.startTime,
      endTime: entry.endTime,
      hours: entry.hours,
      date: entry.date ? entry.date.split('T')[0] : '',
      billable: entry.billable
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingEntry 
        ? `http://localhost:8080/api/time-entries/${editingEntry._id}`
        : 'http://localhost:8080/api/time-entries';
      
      const method = editingEntry ? 'PUT' : 'POST';
      
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
        await loadTimeEntries();
        setShowModal(false);
        setError('');
        setCurrentTimer(0);
      } else {
        setError('Failed to save time entry');
      }
    } catch (err) {
      setError('Failed to save time entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/time-entries/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadTimeEntries();
          setError('');
        } else {
          setError('Failed to delete time entry');
        }
      } catch (err) {
        setError('Failed to delete time entry');
      }
    }
  };

  const getTotalHours = () => {
    return timeEntries.reduce((total, entry) => total + parseFloat(entry.hours || 0), 0).toFixed(2);
  };

  const getBillableHours = () => {
    return timeEntries
      .filter(entry => entry.billable)
      .reduce((total, entry) => total + parseFloat(entry.hours || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="container-fluid py-4">
      {/* Timer Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body text-center">
              <h3 className="display-4 mb-3">{formatTime(currentTimer)}</h3>
              <div className="btn-group">
                {!isTimerRunning ? (
                  <button className="btn btn-success btn-lg" onClick={startTimer}>
                    <i className="fas fa-play me-2"></i>Start Timer
                  </button>
                ) : (
                  <button className="btn btn-danger btn-lg" onClick={stopTimer}>
                    <i className="fas fa-stop me-2"></i>Stop Timer
                  </button>
                )}
                <button 
                  className="btn btn-secondary btn-lg" 
                  onClick={() => {setCurrentTimer(0); setIsTimerRunning(false);}}
                >
                  <i className="fas fa-redo me-2"></i>Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Hours</h5>
              <h3>{getTotalHours()}h</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Billable Hours</h5>
              <h3>{getBillableHours()}h</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Entries</h5>
              <h3>{timeEntries.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-clock me-2"></i>Time Tracking
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Entry
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
                        <th>Date</th>
                        <th>Project</th>
                        <th>Task</th>
                        <th>Description</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Hours</th>
                        <th>Billable</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeEntries.map((entry) => (
                        <tr key={entry._id}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.projectId?.projectName || 'No Project'}</td>
                          <td>{entry.taskId?.taskName || 'No Task'}</td>
                          <td>{entry.description}</td>
                          <td>{entry.startTime}</td>
                          <td>{entry.endTime}</td>
                          <td className="fw-bold">{entry.hours}h</td>
                          <td>
                            <span className={`badge ${entry.billable ? 'bg-success' : 'bg-secondary'}`}>
                              {entry.billable ? 'Billable' : 'Non-billable'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(entry)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(entry._id)}
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
                  {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
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
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Task (Optional)</label>
                        <select
                          className="form-select"
                          value={formData.taskId}
                          onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                        >
                          <option value="">Select Task</option>
                          {tasks
                            .filter(task => task.projectId._id === formData.projectId)
                            .map((task) => (
                            <option key={task._id} value={task._id}>{task.taskName}</option>
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
                      required
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Start Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">End Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Hours</label>
                        <input
                          type="number"
                          step="0.25"
                          className="form-control"
                          value={formData.hours}
                          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.billable}
                            onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                          />
                          <label className="form-check-label">
                            Billable
                          </label>
                        </div>
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
                    {editingEntry ? 'Update' : 'Create'}
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

export default TimeTracking;