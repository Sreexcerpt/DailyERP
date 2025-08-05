import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

function Proposals() {
    const [proposals, setProposals] = useState([]);
    const [leads, setLeads] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState(null);
    const [viewingProposal, setViewingProposal] = useState(null);
    const [selectedProposals, setSelectedProposals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        leadId: '',
        title: '',
        description: '',
        proposalValue: '',
        currency: 'USD',
        validityPeriod: 30,
        status: 'Draft',
        priority: 'Medium',
        businessObjective: '',
        proposedSolution: '',
        timeline: '',
        paymentTerms: '',
        deliveryTerms: '',
        warrantyTerms: '',
        projectDuration: '',
        teamComposition: '',
        riskAssessment: '',
        companyCredentials: '',
        technicalRequirements: '',
        proposedTechnology: '',
        internalNotes: ''
    });

    // Print Functions - FIXED
    const generatePrintContent = (proposal) => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Proposal - ${proposal.proposalNumber}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #333;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #2c3e50;
                        font-size: 28px;
                    }
                    .header h2 {
                        margin: 5px 0;
                        color: #34495e;
                        font-size: 20px;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section h3 {
                        color: #2c3e50;
                        border-bottom: 2px solid #bdc3c7;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                        font-size: 18px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 20px;
                    }
                    .info-item {
                        margin-bottom: 10px;
                    }
                    .info-item strong {
                        color: #2c3e50;
                    }
                    .description {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-left: 4px solid #3498db;
                        margin: 15px 0;
                    }
                    .value-highlight {
                        background-color: #e8f6f3;
                        padding: 15px;
                        border-radius: 5px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .value-highlight .amount {
                        font-size: 24px;
                        font-weight: bold;
                        color: #27ae60;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        border-top: 2px solid #bdc3c7;
                        padding-top: 20px;
                        color: #7f8c8d;
                    }
                    .terms-section {
                        background-color: #f8f9fa;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    @media print {
                        body { margin: 0; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BUSINESS PROPOSAL</h1>
                    <h2>${proposal.proposalNumber}</h2>
                    <p>Date: ${currentDate}</p>
                </div>

                <div class="section">
                    <h3>Client Information</h3>
                    <div class="info-grid">
                        <div>
                            <div class="info-item"><strong>Company:</strong> ${proposal.leadId?.companyName || 'N/A'}</div>
                            <div class="info-item"><strong>Contact Person:</strong> ${proposal.leadId?.contactPersonName || 'N/A'}</div>
                        </div>
                        <div>
                            <div class="info-item"><strong>Email:</strong> ${proposal.leadId?.email || 'N/A'}</div>
                            <div class="info-item"><strong>Phone:</strong> ${proposal.leadId?.phoneNumber || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h3>Proposal Overview</h3>
                    <div class="info-item"><strong>Title:</strong> ${proposal.title}</div>
                    <div class="description">
                        <strong>Description:</strong><br>
                        ${proposal.description}
                    </div>
                    
                    <div class="value-highlight">
                        <div class="amount">${proposal.currency} ${proposal.proposalValue?.toLocaleString()}</div>
                        <div>Total Proposal Value</div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-item"><strong>Priority:</strong> ${proposal.priority}</div>
                        <div class="info-item"><strong>Validity:</strong> ${proposal.validityPeriod} days</div>
                    </div>
                </div>

                ${proposal.businessObjective ? `
                    <div class="section">
                        <h3>Business Objective</h3>
                        <p>${proposal.businessObjective}</p>
                    </div>
                ` : ''}

                ${proposal.proposedSolution ? `
                    <div class="section">
                        <h3>Proposed Solution</h3>
                        <p>${proposal.proposedSolution}</p>
                    </div>
                ` : ''}

                ${proposal.timeline || proposal.projectDuration ? `
                    <div class="section">
                        <h3>Project Timeline</h3>
                        ${proposal.timeline ? `<p>${proposal.timeline}</p>` : ''}
                        ${proposal.projectDuration ? `<div class="info-item"><strong>Duration:</strong> ${proposal.projectDuration} days</div>` : ''}
                    </div>
                ` : ''}

                ${proposal.teamComposition ? `
                    <div class="section">
                        <h3>Team Composition</h3>
                        <p>${proposal.teamComposition}</p>
                    </div>
                ` : ''}

                ${proposal.technicalRequirements ? `
                    <div class="section">
                        <h3>Technical Requirements</h3>
                        <p>${proposal.technicalRequirements}</p>
                    </div>
                ` : ''}

                ${proposal.proposedTechnology ? `
                    <div class="section">
                        <h3>Proposed Technology</h3>
                        <p>${proposal.proposedTechnology}</p>
                    </div>
                ` : ''}

                ${proposal.paymentTerms || proposal.deliveryTerms || proposal.warrantyTerms ? `
                    <div class="terms-section">
                        <h3>Commercial Terms</h3>
                        ${proposal.paymentTerms ? `
                            <div class="info-item">
                                <strong>Payment Terms:</strong><br>
                                ${proposal.paymentTerms}
                            </div>
                        ` : ''}
                        ${proposal.deliveryTerms ? `
                            <div class="info-item">
                                <strong>Delivery Terms:</strong><br>
                                ${proposal.deliveryTerms}
                            </div>
                        ` : ''}
                        ${proposal.warrantyTerms ? `
                            <div class="info-item">
                                <strong>Warranty Terms:</strong><br>
                                ${proposal.warrantyTerms}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${proposal.riskAssessment ? `
                    <div class="section">
                        <h3>Risk Assessment</h3>
                        <p>${proposal.riskAssessment}</p>
                    </div>
                ` : ''}

                ${proposal.companyCredentials ? `
                    <div class="section">
                        <h3>Company Credentials</h3>
                        <p>${proposal.companyCredentials}</p>
                    </div>
                ` : ''}

                <div class="footer">
                    <p><strong>Valid until:</strong> ${proposal.expiryDate ?
                new Date(proposal.expiryDate).toLocaleDateString() :
                `${proposal.validityPeriod} days from submission`}</p>
                    <br>
                    <p>Thank you for considering our proposal.</p>
                    <p><strong>Prepared by:</strong> ${proposal.createdBy || ''}</p>
                </div>
            </body>
            </html>
        `;
    };

    const generateBulkPrintContent = (proposalsData) => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const proposalsHtml = proposalsData.map(proposal => `
            <div class="proposal-item">
                <h3>${proposal.proposalNumber} - ${proposal.title}</h3>
                <div class="info-grid">
                    <div>
                        <div class="info-item"><strong>Company:</strong> ${proposal.leadId?.companyName || 'N/A'}</div>
                        <div class="info-item"><strong>Contact:</strong> ${proposal.leadId?.contactPersonName || 'N/A'}</div>
                        <div class="info-item"><strong>Value:</strong> ${proposal.currency} ${proposal.proposalValue?.toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="info-item"><strong>Status:</strong> ${proposal.status}</div>
                        <div class="info-item"><strong>Priority:</strong> ${proposal.priority}</div>
                        <div class="info-item"><strong>Created:</strong> ${new Date(proposal.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="description">
                    <strong>Description:</strong> ${proposal.description}
                </div>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Proposals Summary Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #333;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        color: #2c3e50;
                        font-size: 28px;
                    }
                    .proposal-item {
                        margin-bottom: 30px;
                        padding: 20px;
                        border: 1px solid #bdc3c7;
                        border-radius: 5px;
                        page-break-inside: avoid;
                    }
                    .proposal-item h3 {
                        color: #2c3e50;
                        margin-top: 0;
                        border-bottom: 1px solid #bdc3c7;
                        padding-bottom: 10px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        margin-bottom: 15px;
                    }
                    .info-item {
                        margin-bottom: 8px;
                    }
                    .info-item strong {
                        color: #2c3e50;
                    }
                    .description {
                        background-color: #f8f9fa;
                        padding: 10px;
                        border-left: 4px solid #3498db;
                        margin-top: 10px;
                    }
                    @media print {
                        body { margin: 0; }
                        .proposal-item { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>PROPOSALS SUMMARY REPORT</h1>
                    <p>Generated on: ${currentDate}</p>
                    <p>Total Proposals: ${proposalsData.length}</p>
                </div>
                ${proposalsHtml}
                <div style="text-align: center; margin-top: 30px; border-top: 2px solid #bdc3c7; padding-top: 20px;">
                    <p><strong>Report generated by:</strong> sreevatsa-B-R</p>
                </div>
            </body>
            </html>
        `;
    };

    const handlePrintProposal = async (proposal) => {
        try {
            // Fetch complete proposal data
            const response = await fetch(`${API_BASE_URL}/proposals/${proposal._id}`);
            if (!response.ok) throw new Error('Failed to fetch proposal details');
            const data = await response.json();

            // Generate print content
            const printContent = generatePrintContent(data);

            // Open new window and print
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();

            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };

        } catch (err) {
            setError('Failed to print proposal: ' + err.message);
        }
    };

    const handleBulkPrint = () => {
        if (selectedProposals.length === 0) {
            alert('Please select proposals to print');
            return;
        }

        const selectedData = proposals.filter(p => selectedProposals.includes(p._id));
        const printContent = generateBulkPrintContent(selectedData);

        // Open new window and print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const handleSelectProposal = (proposalId) => {
        setSelectedProposals(prev =>
            prev.includes(proposalId)
                ? prev.filter(id => id !== proposalId)
                : [...prev, proposalId]
        );
    };

    const handleSelectAll = () => {
        if (selectedProposals.length === filteredProposals.length) {
            setSelectedProposals([]);
        } else {
            setSelectedProposals(filteredProposals.map(p => p._id));
        }
    };

    // Fetch all proposals
    const fetchProposals = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/proposals`);
            if (!response.ok) throw new Error('Failed to fetch proposals');
            const data = await response.json();
            setProposals(data.proposals || data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch qualified leads for proposal creation
    const fetchQualifiedLeads = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/leads?status=Qualified`);
            if (!response.ok) throw new Error('Failed to fetch leads');
            const data = await response.json();
            setLeads(data.leads || data);
        } catch (err) {
            console.error('Error fetching leads:', err);
        }
    };

    // Update the createProposal function with debug logging
    const createProposal = async (proposalData) => {
        try {
            console.log('Sending proposal data:', proposalData);

            const response = await fetch(`${API_BASE_URL}/proposals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proposalData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to create proposal');
            }

            const newProposal = await response.json();
            console.log('Created proposal:', newProposal);

            setProposals([...proposals, newProposal]);
            resetForm();
            setIsFormOpen(false);
        } catch (err) {
            console.error('Create proposal error:', err);
            setError(err.message);
        }
    };

    // Update proposal
    const updateProposal = async (id, proposalData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proposalData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update proposal');
            }
            const updatedProposal = await response.json();
            setProposals(proposals.map(proposal => proposal._id === id ? updatedProposal : proposal));
            resetForm();
            setIsFormOpen(false);
            setEditingProposal(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Submit proposal
    const submitProposal = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/proposals/${id}/submit`, {
                method: 'PUT',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit proposal');
            }
            const updatedProposal = await response.json();
            setProposals(proposals.map(proposal => proposal._id === id ? updatedProposal : proposal));
        } catch (err) {
            setError(err.message);
        }
    };

    // Delete proposal
    const deleteProposal = async (id) => {
        if (!window.confirm('Are you sure you want to delete this proposal?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete proposal');
            setProposals(proposals.filter(proposal => proposal._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            leadId: '',
            title: '',
            description: '',
            proposalValue: '',
            currency: 'USD',
            validityPeriod: 30,
            status: 'Draft',
            priority: 'Medium',
            businessObjective: '',
            proposedSolution: '',
            timeline: '',
            paymentTerms: '',
            deliveryTerms: '',
            warrantyTerms: '',
            projectDuration: '',
            teamComposition: '',
            riskAssessment: '',
            companyCredentials: '',
            technicalRequirements: '',
            proposedTechnology: '',
            internalNotes: ''
        });
        setActiveTab('basic');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingProposal) {
            await updateProposal(editingProposal._id, formData);
        } else {
            await createProposal(formData);
        }
    };

    const handleEdit = (proposal) => {
        setFormData({
            leadId: proposal.leadId?._id || '',
            title: proposal.title || '',
            description: proposal.description || '',
            proposalValue: proposal.proposalValue || '',
            currency: proposal.currency || 'USD',
            validityPeriod: proposal.validityPeriod || 30,
            status: proposal.status || 'Draft',
            priority: proposal.priority || 'Medium',
            businessObjective: proposal.businessObjective || '',
            proposedSolution: proposal.proposedSolution || '',
            timeline: proposal.timeline || '',
            paymentTerms: proposal.paymentTerms || '',
            deliveryTerms: proposal.deliveryTerms || '',
            warrantyTerms: proposal.warrantyTerms || '',
            projectDuration: proposal.projectDuration || '',
            teamComposition: proposal.teamComposition || '',
            riskAssessment: proposal.riskAssessment || '',
            companyCredentials: proposal.companyCredentials || '',
            technicalRequirements: proposal.technicalRequirements || '',
            proposedTechnology: proposal.proposedTechnology || '',
            internalNotes: proposal.internalNotes || ''
        });
        setEditingProposal(proposal);
        setIsFormOpen(true);
    };

    const handleView = async (proposal) => {
        try {
            const response = await fetch(`${API_BASE_URL}/proposals/${proposal._id}`);
            if (!response.ok) throw new Error('Failed to fetch proposal details');
            const data = await response.json();
            setViewingProposal(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter proposals based on search and status
    const filteredProposals = Array.isArray(proposals) ? proposals.filter(proposal => {
        const matchesSearch = proposal.proposalNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.leadId?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === '' || proposal.status === filterStatus;
        const matchesPriority = filterPriority === '' || proposal.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    }) : [];

    useEffect(() => {
        fetchProposals();
        fetchQualifiedLeads();
    }, []);

    const proposalStatuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired', 'Withdrawn'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const currencies = ['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'secondary';
            case 'Submitted': return 'primary';
            case 'Under Review': return 'warning';
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Expired': return 'dark';
            case 'Withdrawn': return 'secondary';
            default: return 'secondary';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Low': return 'success';
            case 'Medium': return 'warning';
            case 'High': return 'danger';
            case 'Critical': return 'dark';
            default: return 'secondary';
        }
    };

    return (
        <div className="content">
            
 <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Proposals</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">Proposals</li>
            </ol>
          </nav>
        </div>
        <div>
           <div className="d-flex gap-2">
                    {selectedProposals.length > 0 && (
                        <button
                            className="btn btn-info"
                            onClick={handleBulkPrint}
                        >
                            <i className="fas fa-print"></i> Print Selected ({selectedProposals.length})
                        </button>
                    )}
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm();
                            setEditingProposal(null);
                            setIsFormOpen(true);
                        }}
                    >
                        Create New Proposal
                    </button>
                </div>
        </div>
      </div>
            <h1 className="mb-4"></h1>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <input
                                type="text"
                                placeholder="Search proposals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-select"
                            >
                                <option value="">All Statuses</option>
                                {proposalStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="form-select"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map(priority => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('');
                                    setFilterPriority('');
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of your existing JSX for forms and modals... */}
            {/* I'm keeping the existing form and modal code unchanged */}

            {/* Proposal Form Modal */}
            {isFormOpen && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    {editingProposal ? 'Edit Proposal' : 'Create New Proposal'}
                                </h2>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setIsFormOpen(false);
                                        setEditingProposal(null);
                                        resetForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {/* Tab Navigation */}
                                <ul className="nav nav-tabs mb-3">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('basic')}
                                        >
                                            Basic Info
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'business' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('business')}
                                        >
                                            Business Details
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'technical' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('technical')}
                                        >
                                            Technical
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'commercial' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('commercial')}
                                        >
                                            Commercial
                                        </button>
                                    </li>
                                </ul>

                                <form onSubmit={handleSubmit}>
                                    {/* Basic Info Tab */}
                                    {activeTab === 'basic' && (
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Select Lead *</label>
                                                <select
                                                    name="leadId"
                                                    className="form-select"
                                                    value={formData.leadId}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={editingProposal}
                                                >
                                                    <option value="">Select a qualified lead...</option>
                                                    {leads.map(lead => (
                                                        <option key={lead._id} value={lead._id}>
                                                            {lead.companyName} - {lead.contactPersonName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Proposal Title *</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter proposal title"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Description *</label>
                                                <textarea
                                                    name="description"
                                                    className="form-control"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    required
                                                    rows="4"
                                                    placeholder="Enter proposal description"
                                                ></textarea>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Proposal Value *</label>
                                                <input
                                                    type="number"
                                                    name="proposalValue"
                                                    className="form-control"
                                                    value={formData.proposalValue}
                                                    onChange={handleInputChange}
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Currency</label>
                                                <select
                                                    name="currency"
                                                    className="form-select"
                                                    value={formData.currency}
                                                    onChange={handleInputChange}
                                                >
                                                    {currencies.map(currency => (
                                                        <option key={currency} value={currency}>{currency}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Validity Period (Days)</label>
                                                <input
                                                    type="number"
                                                    name="validityPeriod"
                                                    className="form-control"
                                                    value={formData.validityPeriod}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    max="365"
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Status</label>
                                                <select
                                                    name="status"
                                                    className="form-select"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                >
                                                    {proposalStatuses.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Priority</label>
                                                <select
                                                    name="priority"
                                                    className="form-select"
                                                    value={formData.priority}
                                                    onChange={handleInputChange}
                                                >
                                                    {priorities.map(priority => (
                                                        <option key={priority} value={priority}>{priority}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label">Created By</label>
                                                <input
                                                    type="text"
                                                    name="createdBy"
                                                    className="form-control"
                                                    value={formData.createdBy}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Business Details Tab */}
                                    {activeTab === 'business' && (
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label">Business Objective</label>
                                                <textarea
                                                    name="businessObjective"
                                                    className="form-control"
                                                    value={formData.businessObjective}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Describe the business objective"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Proposed Solution</label>
                                                <textarea
                                                    name="proposedSolution"
                                                    className="form-control"
                                                    value={formData.proposedSolution}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    placeholder="Describe the proposed solution"
                                                ></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Project Timeline</label>
                                                <textarea
                                                    name="timeline"
                                                    className="form-control"
                                                    value={formData.timeline}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Project timeline and milestones"
                                                ></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Project Duration (Days)</label>
                                                <input
                                                    type="number"
                                                    name="projectDuration"
                                                    className="form-control"
                                                    value={formData.projectDuration}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Team Composition</label>
                                                <textarea
                                                    name="teamComposition"
                                                    className="form-control"
                                                    value={formData.teamComposition}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Describe the project team composition"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Risk Assessment</label>
                                                <textarea
                                                    name="riskAssessment"
                                                    className="form-control"
                                                    value={formData.riskAssessment}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Risk assessment and mitigation strategies"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Company Credentials</label>
                                                <textarea
                                                    name="companyCredentials"
                                                    className="form-control"
                                                    value={formData.companyCredentials}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    placeholder="Company credentials and past experience"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {/* Technical Tab */}
                                    {activeTab === 'technical' && (
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label">Technical Requirements</label>
                                                <textarea
                                                    name="technicalRequirements"
                                                    className="form-control"
                                                    value={formData.technicalRequirements}
                                                    onChange={handleInputChange}
                                                    rows="5"
                                                    placeholder="Detailed technical requirements"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Proposed Technology</label>
                                                <textarea
                                                    name="proposedTechnology"
                                                    className="form-control"
                                                    value={formData.proposedTechnology}
                                                    onChange={handleInputChange}
                                                    rows="4"
                                                    placeholder="Technology stack and tools to be used"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    {/* Commercial Tab */}
                                    {activeTab === 'commercial' && (
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Payment Terms</label>
                                                <textarea
                                                    name="paymentTerms"
                                                    className="form-control"
                                                    value={formData.paymentTerms}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Payment terms and conditions"
                                                ></textarea>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Delivery Terms</label>
                                                <textarea
                                                    name="deliveryTerms"
                                                    className="form-control"
                                                    value={formData.deliveryTerms}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Delivery terms and conditions"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Warranty Terms</label>
                                                <textarea
                                                    name="warrantyTerms"
                                                    className="form-control"
                                                    value={formData.warrantyTerms}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Warranty and support terms"
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label">Internal Notes</label>
                                                <textarea
                                                    name="internalNotes"
                                                    className="form-control"
                                                    value={formData.internalNotes}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    placeholder="Internal notes (not visible to client)"
                                                ></textarea>
                                            </div>
                                        </div>
                                    )}

                                    <div className="row mt-4">
                                        <div className="col-12 d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setIsFormOpen(false);
                                                    setEditingProposal(null);
                                                    resetForm();
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                {editingProposal ? 'Update Proposal' : 'Create Proposal'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposal View Modal */}
            {viewingProposal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title">
                                    Proposal Details - {viewingProposal.proposalNumber}
                                </h2>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setViewingProposal(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <strong>Company:</strong> {viewingProposal.leadId?.companyName}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Contact:</strong> {viewingProposal.leadId?.contactPersonName}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Title:</strong> {viewingProposal.title}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Value:</strong> {viewingProposal.currency} {viewingProposal.proposalValue?.toLocaleString()}
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Status:</strong>
                                        <span className={`badge bg-${getStatusColor(viewingProposal.status)} ms-2`}>
                                            {viewingProposal.status}
                                        </span>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Priority:</strong>
                                        <span className={`badge bg-${getPriorityColor(viewingProposal.priority)} ms-2`}>
                                            {viewingProposal.priority}
                                        </span>
                                    </div>
                                    <div className="col-12">
                                        <strong>Description:</strong>
                                        <p>{viewingProposal.description}</p>
                                    </div>
                                    {viewingProposal.businessObjective && (
                                        <div className="col-12">
                                            <strong>Business Objective:</strong>
                                            <p>{viewingProposal.businessObjective}</p>
                                        </div>
                                    )}
                                    {viewingProposal.proposedSolution && (
                                        <div className="col-12">
                                            <strong>Proposed Solution:</strong>
                                            <p>{viewingProposal.proposedSolution}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setViewingProposal(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proposals Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Proposals</h5>
                </div>
                <div className="card-body p-0">
                    <div>
                        <table className="table table-sm table-bordered mb-2 mt-2">
                            <thead className="table-dark">
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedProposals.length === filteredProposals.length && filteredProposals.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th>Proposal #</th>
                                    <th>Company</th>
                                    <th>Title</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProposals.length > 0 ? (
                                    filteredProposals.map(proposal => (
                                        <tr key={proposal._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProposals.includes(proposal._id)}
                                                    onChange={() => handleSelectProposal(proposal._id)}
                                                />
                                            </td>
                                            <td>
                                                <strong>{proposal.proposalNumber}</strong>
                                            </td>
                                            <td>{proposal.leadId?.companyName || 'N/A'}</td>
                                            <td>{proposal.title}</td>
                                            <td>
                                                {proposal.currency} {proposal.proposalValue?.toLocaleString()}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${getStatusColor(proposal.status)}`}>
                                                    {proposal.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${getPriorityColor(proposal.priority)}`}>
                                                    {proposal.priority}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(proposal.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleView(proposal)}
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => handlePrintProposal(proposal)}
                                                        title="Print"
                                                    >
                                                        <i className="fas fa-print"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-warning"
                                                        onClick={() => handleEdit(proposal)}
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    {proposal.status === 'Draft' && (
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => submitProposal(proposal._id)}
                                                            title="Submit"
                                                        >
                                                            <i className="fas fa-paper-plane"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => deleteProposal(proposal._id)}
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            {proposals.length === 0 ? 'No proposals available' : 'No proposals match your search criteria'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Proposals;