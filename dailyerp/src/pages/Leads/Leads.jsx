import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

function Leads() {
    const [leads, setLeads] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        companyName: '',
        contactPersonName: '',
        email: '',
        phoneNumber: '',
        leadSource: 'Website',
        leadStatus: 'New',
        industry: 'Technology',
        companySize: '1-10',
        annualRevenue: '',
        leadScore: 50,
        assignedSalesRep: '',
        notes: '',
        expectedDealValue: '',
        expectedCloseDate: ''
    });

    // Fetch all leads
    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/leads`, { method: 'GET' });

            if (!response.ok) throw new Error('Failed to fetch leads');
            const data = await response.json();
            console.log('Fetched leads:', data);
            setLeads(data.leads || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new lead
    const createLead = async (leadData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create lead');
            }
            const newLead = await response.json();
            setLeads([...leads, newLead]);
            resetForm();
            setIsFormOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // Update lead
    const updateLead = async (id, leadData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update lead');
            }
            const updatedLead = await response.json();
            setLeads(leads.map(lead => lead._id === id ? updatedLead : lead));
            resetForm();
            setIsFormOpen(false);
            setEditingLead(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete lead
    const deleteLead = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete lead');
            setLeads(leads.filter(lead => lead._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            companyName: '',
            contactPersonName: '',
            email: '',
            phoneNumber: '',
            leadSource: 'Website',
            leadStatus: 'New',
            industry: 'Technology',
            companySize: '1-10',
            annualRevenue: '',
            leadScore: 50,
            assignedSalesRep: '',
            notes: '',
            expectedDealValue: '',
            expectedCloseDate: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingLead) {
            await updateLead(editingLead._id, formData);
        } else {
            await createLead(formData);
        }
    };

    const handleEdit = (lead) => {
        setFormData({
            companyName: lead.companyName,
            contactPersonName: lead.contactPersonName,
            email: lead.email,
            phoneNumber: lead.phoneNumber,
            leadSource: lead.leadSource,
            leadStatus: lead.leadStatus,
            industry: lead.industry,
            companySize: lead.companySize,
            annualRevenue: lead.annualRevenue || '',
            leadScore: lead.leadScore,
            assignedSalesRep: lead.assignedSalesRep || '',
            notes: lead.notes || '',
            expectedDealValue: lead.expectedDealValue || '',
            expectedCloseDate: lead.expectedCloseDate ? lead.expectedCloseDate.split('T')[0] : ''
        });
        setEditingLead(lead);
        setIsFormOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter leads based on search and status - Fixed logic
    const filteredLeads = Array.isArray(leads) ? leads.filter(lead => {
        const matchesSearch = lead.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || lead.leadStatus === filterStatus;
        return matchesSearch && matchesStatus;
    }) : [];

    useEffect(() => {
        fetchLeads();
    }, []);

    const leadSources = ['Website', 'Social Media', 'Referral', 'Cold Call', 'Advertisement'];
    const leadStatuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Other'];
    const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

    return (
        <div className="content">
            {isFormOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{editingLead ? 'Edit Lead' : 'Add New Lead'}</h2>
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Close"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingLead(null);
                                        resetForm();
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="row g-2">
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Company Name*</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    className="form-control form-control-sm"
                                                    value={formData.companyName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Contact Person*</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="text"
                                                    name="contactPersonName"
                                                    className="form-control form-control-sm"
                                                    value={formData.contactPersonName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-3">
                                                <label className="form-label">Email*</label>
                                            </div>
                                            <div className="col-xl-9">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control form-control-sm"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Phone Number*</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    className="form-control form-control-sm"
                                                    value={formData.phoneNumber}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Lead Source</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <select
                                                    name="leadSource"
                                                    className="form-control form-control-sm"
                                                    value={formData.leadSource}
                                                    onChange={handleInputChange}
                                                >
                                                    {leadSources.map(source => (
                                                        <option key={source} value={source}>{source}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Lead Status</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <select
                                                    name="leadStatus"
                                                    className="form-control form-control-sm"
                                                    value={formData.leadStatus}
                                                    onChange={handleInputChange}
                                                >
                                                    {leadStatuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Industry</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <select
                                                    name="industry"
                                                    className="form-control form-control-sm"
                                                    value={formData.industry}
                                                    onChange={handleInputChange}
                                                >
                                                    {industries.map(industry => (
                                                        <option key={industry} value={industry}>{industry}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Company Size</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <select
                                                    name="companySize"
                                                    className="form-control form-control-sm"
                                                    value={formData.companySize}
                                                    onChange={handleInputChange}
                                                >
                                                    {companySizes.map(size => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Annual Revenue</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="number"
                                                    name="annualRevenue"
                                                    className="form-control form-control-sm"
                                                    value={formData.annualRevenue}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Lead Score (1-100)</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="number"
                                                    name="leadScore"
                                                    className="form-control form-control-sm"
                                                    value={formData.leadScore}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    max="100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Assigned Sales Rep</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="text"
                                                    name="assignedSalesRep"
                                                    className="form-control form-control-sm"
                                                    value={formData.assignedSalesRep}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Expected Deal Value</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="number"
                                                    name="expectedDealValue"
                                                    className="form-control form-control-sm"
                                                    value={formData.expectedDealValue}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="row align-items-center">
                                            <div className="col-xl-6">
                                                <label className="form-label">Expected Close Date</label>
                                            </div>
                                            <div className="col-xl-6">
                                                <input
                                                    type="date"
                                                    name="expectedCloseDate"
                                                    className="form-control form-control-sm"
                                                    value={formData.expectedCloseDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="row align-items-center">
                                            <div className="col-xl-3">
                                                <label className="form-label">Notes</label>
                                            </div>
                                            <div className="col-xl-9">
                                                <textarea
                                                    name="notes"
                                                    className="form-control form-control-sm"
                                                    value={formData.notes}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col-auto">
                                        <button
                                            type="button"
                                            className="btn btn-secondary me-2"
                                            onClick={() => {
                                                setIsFormOpen(false);
                                                setEditingLead(null);
                                                resetForm();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editingLead ? 'Update Lead' : 'Create Lead'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Leads Table */}
            <div className='card mt-3'>
                <div className="card-header">
                    <div className="row justify-content-end g-2">
                        <div className="col-auto">
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control form-control-sm"
                            />
                        </div>
                        <div className="col-auto">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-select form-select-sm"
                            >
                                <option value="">All Statuses</option>
                                {leadStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-auto">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    resetForm();
                                    setEditingLead(null);
                                    setIsFormOpen(true);
                                }}
                            >
                                Add New Lead
                            </button>
                        </div>
                    </div>
                </div>


                <div className="card-body">
                    <table className="table table-bordered table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Company</th>
                                <th>Contact Person</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Source</th>
                                <th>Industry</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map(lead => (
                                    <tr key={lead._id}>
                                        <td>{lead.companyName}</td>
                                        <td>{lead.contactPersonName}</td>
                                        <td>{lead.email}</td>
                                        <td>{lead.phoneNumber}</td>
                                        <td>
                                            <span className={`badge bg-${getStatusColor(lead.leadStatus)}`}>
                                                {lead.leadStatus}
                                            </span>
                                        </td>
                                        <td>{lead.leadSource}</td>
                                        <td>{lead.industry}</td>
                                        <td>{lead.leadScore}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-warning me-1"
                                                onClick={() => handleEdit(lead)}
                                            >
                                                <i className="ti ti-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => deleteLead(lead._id)}
                                            >
                                                <i className="ti ti-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center">
                                        {leads.length === 0 ? 'No leads available' : 'No leads match your search criteria'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Helper function for status badge colors
const getStatusColor = (status) => {
    switch (status) {
        case 'New': return 'primary';
        case 'Contacted': return 'info';
        case 'Qualified': return 'success';
        case 'Proposal': return 'warning';
        case 'Negotiation': return 'secondary';
        case 'Closed Won': return 'success';
        case 'Closed Lost': return 'danger';
        default: return 'secondary';
    }
};

export default Leads;