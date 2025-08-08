import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalLeads: 0,
    totalConversions: 0,
    averageConversionRate: 0,
    totalBudget: 0,
    totalROI: 0,
    topPerformingCampaign: null
  });
  const [loading, setLoading] = useState(false);

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load campaigns
      const campaignsResponse = await fetch(`/api/campaigns?companyId=${companyId}&financialYear=${financialYear}`);
      const campaignData = await campaignsResponse.json();
      setCampaigns(campaignData);

      // Load leads
      const leadsResponse = await fetch(`/api/leads?companyId=${companyId}&financialYear=${financialYear}`);
      const leadData = await leadsResponse.json();
      setLeads(leadData);

      // Calculate analytics
      calculateAnalytics(campaignData, leadData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (campaignData, leadData) => {
    const totalCampaigns = campaignData.length;
    const activeCampaigns = campaignData.filter(c => c.status === 'Active').length;
    const totalLeads = leadData.length;
    const totalConversions = leadData.filter(l => l.leadStatus === 'Closed Won').length;
    const averageConversionRate = totalLeads > 0 ? (totalConversions / totalLeads * 100).toFixed(2) : 0;
    const totalBudget = campaignData.reduce((sum, c) => sum + (c.budget || 0), 0);
    const totalROI = campaignData.reduce((sum, c) => sum + (c.actualROI || 0), 0);
    
    // Find top performing campaign by conversion rate
    const topPerformingCampaign = campaignData.reduce((best, current) => {
      const currentRate = current.leads > 0 ? (current.conversions / current.leads) : 0;
      const bestRate = best && best.leads > 0 ? (best.conversions / best.leads) : 0;
      return currentRate > bestRate ? current : best;
    }, null);

    setAnalytics({
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      totalConversions,
      averageConversionRate,
      totalBudget,
      totalROI,
      topPerformingCampaign
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'secondary',
      'Scheduled': 'info',
      'Active': 'success',
      'Paused': 'warning',
      'Completed': 'primary',
      'Cancelled': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const calculateCampaignROI = (actualROI, budget) => {
    if (!actualROI || !budget || budget === 0) return 0;
    return (((actualROI - budget) / budget) * 100).toFixed(2);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                <i className="fas fa-chart-bar me-2"></i>Campaign Analytics
              </h4>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-3">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="card-title">Total Campaigns</h6>
                              <h3 className="mb-0">{analytics.totalCampaigns}</h3>
                              <small>{analytics.activeCampaigns} Active</small>
                            </div>
                            <div className="align-self-center">
                              <i className="fas fa-bullhorn fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-3">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="card-title">Total Leads</h6>
                              <h3 className="mb-0">{analytics.totalLeads}</h3>
                              <small>{analytics.totalConversions} Conversions</small>
                            </div>
                            <div className="align-self-center">
                              <i className="fas fa-user-plus fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-3">
                      <div className="card bg-warning text-white">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="card-title">Conversion Rate</h6>
                              <h3 className="mb-0">{analytics.averageConversionRate}%</h3>
                              <small>Average across all campaigns</small>
                            </div>
                            <div className="align-self-center">
                              <i className="fas fa-percentage fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-xl-3 col-md-6 mb-3">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="card-title">Total ROI</h6>
                              <h3 className="mb-0">${analytics.totalROI.toLocaleString()}</h3>
                              <small>Budget: ${analytics.totalBudget.toLocaleString()}</small>
                            </div>
                            <div className="align-self-center">
                              <i className="fas fa-dollar-sign fa-2x"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Campaign */}
                  {analytics.topPerformingCampaign && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card border-success">
                          <div className="card-header bg-success text-white">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-trophy me-2"></i>Top Performing Campaign
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-3">
                                <strong>Campaign:</strong><br />
                                {analytics.topPerformingCampaign.campaignName}
                              </div>
                              <div className="col-md-2">
                                <strong>Type:</strong><br />
                                {analytics.topPerformingCampaign.campaignType}
                              </div>
                              <div className="col-md-2">
                                <strong>Leads:</strong><br />
                                {analytics.topPerformingCampaign.leads || 0}
                              </div>
                              <div className="col-md-2">
                                <strong>Conversions:</strong><br />
                                {analytics.topPerformingCampaign.conversions || 0}
                              </div>
                              <div className="col-md-3">
                                <strong>Conversion Rate:</strong><br />
                                {analytics.topPerformingCampaign.leads > 0 
                                  ? ((analytics.topPerformingCampaign.conversions / analytics.topPerformingCampaign.leads) * 100).toFixed(2)
                                  : 0
                                }%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campaign Performance Table */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">Campaign Performance Details</h5>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-striped table-hover">
                              <thead className="table-dark">
                                <tr>
                                  <th>Campaign Name</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                  <th>Budget</th>
                                  <th>Leads</th>
                                  <th>Conversions</th>
                                  <th>Conversion Rate</th>
                                  <th>ROI</th>
                                  <th>ROI %</th>
                                </tr>
                              </thead>
                              <tbody>
                                {campaigns.map((campaign) => {
                                  const conversionRate = campaign.leads > 0 
                                    ? ((campaign.conversions / campaign.leads) * 100).toFixed(2)
                                    : 0;
                                  
                                  return (
                                    <tr key={campaign._id}>
                                      <td className="fw-bold">{campaign.campaignName}</td>
                                      <td>
                                        <span className="badge bg-info">{campaign.campaignType}</span>
                                      </td>
                                      <td>
                                        <span className={`badge bg-${getStatusColor(campaign.status)}`}>
                                          {campaign.status}
                                        </span>
                                      </td>
                                      <td>${(campaign.budget || 0).toLocaleString()}</td>
                                      <td>
                                        <span className="badge bg-primary">{campaign.leads || 0}</span>
                                      </td>
                                      <td>
                                        <span className="badge bg-success">{campaign.conversions || 0}</span>
                                      </td>
                                      <td>
                                        <span className={`badge ${conversionRate >= 10 ? 'bg-success' : conversionRate >= 5 ? 'bg-warning' : 'bg-secondary'}`}>
                                          {conversionRate}%
                                        </span>
                                      </td>
                                      <td>${(campaign.actualROI || 0).toLocaleString()}</td>
                                      <td>
                                        <span className={`badge ${calculateCampaignROI(campaign.actualROI, campaign.budget) > 0 ? 'bg-success' : 'bg-danger'}`}>
                                          {calculateCampaignROI(campaign.actualROI, campaign.budget)}%
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;