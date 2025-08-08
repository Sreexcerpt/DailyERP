import React, { useState, useEffect } from 'react';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: '',
    description: '',
    campaignType: 'Email',
    status: 'Draft',
    startDate: '',
    endDate: '',
    budget: '',
    targetAudience: '',
    channels: '',
    objectives: '',
    expectedROI: '',
    actualROI: '',
    leads: 0,
    conversions: 0,
    clickThroughRate: 0,
    openRate: 0,
    assignedTo: '',
    priority: 'Medium'
  });

  const campaignTypes = ['Email', 'Social Media', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Print', 'TV/Radio', 'Event', 'Influencer', 'SEO', 'Other'];
  const statuses = ['Draft', 'Scheduled', 'Active', 'Paused', 'Completed', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setCampaigns(data);
      setError('');
    } catch (err) {
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCampaign(null);
    setFormData({
      campaignName: '',
      description: '',
      campaignType: 'Email',
      status: 'Draft',
      startDate: '',
      endDate: '',
      budget: '',
      targetAudience: '',
      channels: '',
      objectives: '',
      expectedROI: '',
      actualROI: '',
      leads: 0,
      conversions: 0,
      clickThroughRate: 0,
      openRate: 0,
      assignedTo: '',
      priority: 'Medium'
    });
    setShowModal(true);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      campaignName: campaign.campaignName,
      description: campaign.description,
      campaignType: campaign.campaignType,
      status: campaign.status,
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      budget: campaign.budget,
      targetAudience: campaign.targetAudience,
      channels: campaign.channels.join(', '),
      objectives: campaign.objectives.join('\n'),
      expectedROI: campaign.expectedROI,
      actualROI: campaign.actualROI,
      leads: campaign.leads,
      conversions: campaign.conversions,
      clickThroughRate: campaign.clickThroughRate,
      openRate: campaign.openRate,
      assignedTo: campaign.assignedTo,
      priority: campaign.priority
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingCampaign 
        ? `/api/campaigns/${editingCampaign._id}`
        : '/api/campaigns';
      
      const method = editingCampaign ? 'PUT' : 'POST';
      
      const campaignData = {
        ...formData,
        channels: formData.channels.split(',').map(channel => channel.trim()).filter(channel => channel),
        objectives: formData.objectives.split('\n').map(obj => obj.trim()).filter(obj => obj),
        companyId,
        financialYear
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        await loadCampaigns();
        setShowModal(false);
        setError('');
      } else {
        setError('Failed to save campaign');
      }
    } catch (err) {
      setError('Failed to save campaign');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadCampaigns();
          setError('');
        } else {
          setError('Failed to delete campaign');
        }
      } catch (err) {
        setError('Failed to delete campaign');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      'Draft': 'bg-secondary',
      'Scheduled': 'bg-info',
      'Active': 'bg-success',
      'Paused': 'bg-warning',
      'Completed': 'bg-primary',
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

  const calculateROI = (actualROI, budget) => {
    if (!actualROI || !budget || budget === 0) return 0;
    return (((actualROI - budget) / budget) * 100).toFixed(2);
  };

  const calculateConversionRate = (conversions, leads) => {
    if (!conversions || !leads || leads === 0) return 0;
    return ((conversions / leads) * 100).toFixed(2);
  };

  const isActive = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-bullhorn me-2"></i>Campaign Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Campaign
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
                        <th>Campaign Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Period</th>
                        <th>Budget</th>
                        <th>Leads</th>
                        <th>Conversions</th>
                        <th>ROI</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign._id} className={isActive(campaign.startDate, campaign.endDate) && campaign.status === 'Active' ? 'table-success' : ''}>
                          <td>
                            <div>
                              <strong>{campaign.campaignName}</strong>
                              {campaign.description && (
                                <div className="text-muted small">{campaign.description.substring(0, 50)}...</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">{campaign.campaignType}</span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(campaign.priority)}`}>
                              {campaign.priority}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              <div>Start: {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}</div>
                              <div>End: {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'N/A'}</div>
                            </div>
                          </td>
                          <td>
                            {campaign.budget ? `$${Number(campaign.budget).toLocaleString()}` : 'N/A'}
                          </td>
                          <td>
                            <span className="badge bg-primary">{campaign.leads || 0}</span>
                          </td>
                          <td>
                            <div>
                              <span className="badge bg-success">{campaign.conversions || 0}</span>
                              <div className="small text-muted">
                                {calculateConversionRate(campaign.conversions, campaign.leads)}% rate
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">{calculateROI(campaign.actualROI, campaign.budget)}%</div>
                              <div className="small text-muted">
                                ${campaign.actualROI ? Number(campaign.actualROI).toLocaleString() : 0}
                              </div>
                            </div>
                          </td>
                          <td>{campaign.assignedTo}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(campaign)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(campaign._id)}
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
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCampaign ? 'Edit Campaign' : 'Add Campaign'}
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
                        <label className="form-label">Campaign Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.campaignName}
                          onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Campaign Type</label>
                        <select
                          className="form-select"
                          value={formData.campaignType}
                          onChange={(e) => setFormData({ ...formData, campaignType: e.target.value })}
                          required
                        >
                          {campaignTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
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
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
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
                  </div>

                  <div className="row">
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
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Expected ROI ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.expectedROI}
                          onChange={(e) => setFormData({ ...formData, expectedROI: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Actual ROI ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.actualROI}
                          onChange={(e) => setFormData({ ...formData, actualROI: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Leads Generated</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.leads}
                          onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Conversions</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.conversions}
                          onChange={(e) => setFormData({ ...formData, conversions: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Click Through Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.clickThroughRate}
                          onChange={(e) => setFormData({ ...formData, clickThroughRate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Open Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={formData.openRate}
                          onChange={(e) => setFormData({ ...formData, openRate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Target Audience</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.targetAudience}
                          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                          placeholder="Demographics, interests, location, etc."
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
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
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Channels (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.channels}
                      onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                      placeholder="Email, Facebook, Google Ads, Instagram"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Objectives (one per line)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.objectives}
                      onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                      placeholder="Increase brand awareness&#10;Generate 100 leads&#10;Achieve 5% conversion rate"
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
                    {editingCampaign ? 'Update' : 'Create'}
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

export default Campaigns;