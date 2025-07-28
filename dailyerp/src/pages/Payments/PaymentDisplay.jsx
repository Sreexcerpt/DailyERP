import React, { useState, useEffect } from "react";
import axios from "axios";

function PaymentDisplay() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        recordType: "",
        status: "",
        paymentMethod: "",
        entityName: "",
        startDate: "",
        endDate: "",
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
    });
    const [summary, setSummary] = useState({
        byType: [],
        byMethod: []
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editPayment, setEditPayment] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchPayments();
        fetchSummary();
    }, [filters.page]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setFilters(prev => ({ ...prev, page: 1 }));
            fetchPayments();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [
        filters.recordType,
        filters.status,
        filters.paymentMethod,
        filters.entityName,
        filters.startDate,
        filters.endDate,
        filters.limit
    ]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await axios.get(`http://localhost:8080/api/payment?${queryParams}`);
            setPayments(response.data.payments || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/payment-summary");
            setSummary(response.data);
        } catch (error) {
            console.error("Error fetching summary:", error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            recordType: "",
            status: "",
            paymentMethod: "",
            entityName: "",
            startDate: "",
            endDate: "",
            page: 1,
            limit: 10
        });
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const viewPaymentDetails = (payment) => {
        setSelectedPayment(payment);
        setShowModal(true);
    };

    const editPaymentDetails = (payment) => {
        setEditPayment({
            ...payment,
            paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0]
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditPayment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                paymentAmount: parseFloat(editPayment.paymentAmount),
                paymentMethod: editPayment.paymentMethod,
                status: editPayment.status,
                description: editPayment.description,
                paymentDate: editPayment.paymentDate,
                paymentDetails: editPayment.paymentDetails || {}
            };

            await axios.put(`http://localhost:8080/api/payment/${editPayment._id}`, updateData);

            setMessage({
                type: "success",
                text: "Payment updated successfully!"
            });

            setShowEditModal(false);
            fetchPayments();

            setTimeout(() => {
                setMessage({ type: "", text: "" });
            }, 3000);
        } catch (error) {
            console.error("Error updating payment:", error);
            setMessage({
                type: "error",
                text: "Failed to update payment. Please try again."
            });
        }
    };

    const cancelPayment = async (paymentId) => {
        if (window.confirm("Are you sure you want to cancel this payment?")) {
            try {
                await axios.delete(`http://localhost:8080/api/payment/${paymentId}`);

                setMessage({
                    type: "success",
                    text: "Payment cancelled successfully!"
                });

                fetchPayments();

                setTimeout(() => {
                    setMessage({ type: "", text: "" });
                }, 3000);
            } catch (error) {
                console.error("Error cancelling payment:", error);
                setMessage({
                    type: "error",
                    text: "Failed to cancel payment. Please try again."
                });
            }
        }
    };

    const printReceipt = (payment) => {
        const printWindow = window.open('', '_blank');
        const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${payment.paymentDocNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px;
          }
          .receipt-title { 
            font-size: 18px; 
            color: #666;
          }
          .details { 
            margin: 20px 0; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px dotted #ccc;
          }
          .detail-label { 
            font-weight: bold; 
            width: 40%;
          }
          .detail-value { 
            width: 60%;
            text-align: right;
          }
          .amount { 
            font-size: 20px; 
            font-weight: bold; 
            color: #28a745;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-cleared { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-bounced { background: #f8d7da; color: #721c24; }
          .status-cancelled { background: #e2e3e5; color: #383d41; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Your Company Name</div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Receipt Number:</span>
            <span class="detail-value">${payment.paymentDocNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date & Time:</span>
            <span class="detail-value">${formatDate(payment.paymentDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Type:</span>
            <span class="detail-value">${payment.recordType.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">${payment.recordType === 'vendor' ? 'Vendor' : 'Customer'} Name:</span>
            <span class="detail-value">${payment.entityName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Original Document:</span>
            <span class="detail-value">${payment.docnumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span class="detail-value">${payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge status-${payment.status}">${payment.status.toUpperCase()}</span>
            </span>
          </div>
        </div>

        <div class="amount">
          AMOUNT PAID: ${formatCurrency(payment.paymentAmount)}
        </div>

        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Previous Balance:</span>
            <span class="detail-value">${formatCurrency(payment.previousBalance)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">New Balance:</span>
            <span class="detail-value">${formatCurrency(payment.newBalance)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Balance Reduction:</span>
            <span class="detail-value">${formatCurrency(payment.previousBalance - payment.newBalance)}</span>
          </div>
        </div>

        ${payment.description ? `
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${payment.description}</span>
            </div>
          </div>
        ` : ''}

        ${payment.paymentDetails ? `
          <div class="details">
            <h4>Payment Details:</h4>
            ${payment.paymentMethod === 'cheque' && payment.paymentDetails.chequeNumber ? `
              <div class="detail-row">
                <span class="detail-label">Cheque Number:</span>
                <span class="detail-value">${payment.paymentDetails.chequeNumber}</span>
              </div>
            ` : ''}
            ${payment.paymentMethod === 'bank_transfer' && payment.paymentDetails.transactionId ? `
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${payment.paymentDetails.transactionId}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>This is a computer-generated receipt. No signature required.</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.focus();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: "warning",
            cleared: "success",
            bounced: "danger",
            cancelled: "secondary"
        };
        return `badge bg-${statusColors[status] || "secondary"}`;
    };

    const getMethodIcon = (method) => {
        const icons = {
            cash: "ti ti-cash",
            cheque: "ti ti-file-text",
            bank_transfer: "ti ti-building-bank",
            upi: "ti ti-qrcode",
            card: "ti ti-credit-card",
            other: "ti ti-dots"
        };
        return icons[method] || "ti-payment";
    };

    const exportToCSV = () => {
        if (payments.length === 0) {
            alert("No data to export");
            return;
        }

        const csvData = payments.map(payment => ({
            'Payment Doc': payment.paymentDocNumber,
            'Date': formatDate(payment.paymentDate),
            
            'Type': payment.recordType,
            'Entity': payment.entityName,
            'Doc Number': payment.docnumber,
            'Amount': payment.paymentAmount,
            'Method': payment.paymentMethod,
            'Status': payment.status,
            'Previous Balance': payment.previousBalance,
            'New Balance': payment.newBalance
        }));

        const csvContent = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="content">
            {/* Message Alert */}
            {message.text && (
                <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`}>
                    {message.text}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setMessage({ type: "", text: "" })}
                    ></button>
                </div>
            )}

            {/* Header */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                <div className="my-auto mb-2">
                    <h2 className="mb-1">Payment Records</h2>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/dashboard">
                                    <i className="ti ti-smart-home"></i>
                                </a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/ledger">Ledger</a>
                            </li>
                            <li className="breadcrumb-item">Payments</li>
                        </ol>
                    </nav>
                </div>
                <div className="">
                    <a href="/payments" className="btn btn-primary me-2">
                        <i className="ti ti-plus"></i> Record Payment
                    </a>
                    <button onClick={exportToCSV} className="btn btn-outline-secondary">
                        <i className="ti ti-download"></i> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-md bg-primary-light rounded">
                                        <i className="ti ti-receipt text-primary"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <p className="text-muted mb-1">Total Payments</p>
                                    <h4 className="mb-0">{pagination.totalCount}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-md bg-success-light rounded">
                                        <i className="ti ti-building-store text-success"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <p className="text-muted mb-1">Vendor Payments</p>
                                    <h4 className="mb-0">
                                        {formatCurrency(summary.byType.find(t => t._id === 'vendor')?.totalAmount || 0)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-md bg-info-light rounded">
                                        <i className="ti ti-users text-info"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <p className="text-muted mb-1">Customer Payments</p>
                                    <h4 className="mb-0">
                                        {formatCurrency(summary.byType.find(t => t._id === 'customer')?.totalAmount || 0)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 col-sm-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="avatar avatar-md bg-warning-light rounded">
                                        <i className="ti ti-cash text-warning"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <p className="text-muted mb-1">Today's Total</p>
                                    <h4 className="mb-0">
                                        {formatCurrency(
                                            payments
                                                .filter(p => new Date(p.paymentDate).toDateString() === new Date().toDateString())
                                                .reduce((sum, p) => sum + p.paymentAmount, 0)
                                        )}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="card-title mb-0">Filters</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-2 mb-3">
                            <label className="form-label">Type</label>
                            <select
                                className="form-select"
                                name="recordType"
                                value={filters.recordType}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Types</option>
                                <option value="vendor">Vendor</option>
                                <option value="customer">Customer</option>
                            </select>
                        </div>

                        <div className="col-md-2 mb-3">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="cleared">Cleared</option>
                                <option value="bounced">Bounced</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="col-md-2 mb-3">
                            <label className="form-label">Method</label>
                            <select
                                className="form-select"
                                name="paymentMethod"
                                value={filters.paymentMethod}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Methods</option>
                                <option value="cash">Cash</option>
                                <option value="cheque">Cheque</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="col-md-2 mb-3">
                            <label className="form-label">Entity Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="entityName"
                                placeholder="Search entity..."
                                value={filters.entityName}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="col-md-2 mb-3">
                            <label className="form-label">From Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="startDate"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="col-md-2 mb-3">
                            <label className="form-label">To Date</label>
                            <input
                                type="date"
                                className="form-control"
                                name="endDate"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={clearFilters}
                        >
                            <i className="ti ti-refresh"></i> Clear Filters
                        </button>

                        <div className="d-flex align-items-center">
                            <label className="form-label me-2 mb-0">Show:</label>
                            <select
                                className="form-select"
                                name="limit"
                                value={filters.limit}
                                onChange={handleFilterChange}
                                style={{ width: "auto" }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">Payment Records</h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="ti ti-receipt-off text-muted" style={{ fontSize: "3rem" }}></i>
                            <h5 className="text-muted mt-2">No payments found</h5>
                            <p className="text-muted">Try adjusting your filters or record a new payment.</p>
                            <a href="/payments" className="btn btn-primary">
                                <i className="ti ti-plus"></i> Record Payment
                            </a>
                        </div>
                    ) : (
                        <>
                            <div>
                                <table className="table table-sm table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Payment Doc</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Entity</th>
                                            <th>Original Doc</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Balance Change</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment, index) => (
                                            <tr key={payment._id}>
                                                <td>{(pagination.currentPage - 1) * filters.limit + index + 1}</td>
                                                <td>
                                                    <strong className="text-primary">{payment.paymentDocNumber}</strong>
                                                </td>
                                                <td>
                                                    <small>{formatDate(payment.paymentDate)}</small>
                                                </td>
                                                <td>
                                                    <span className={`badge bg-${payment.recordType === 'vendor' ? 'success' : 'info'}`}>
                                                        {payment.recordType}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>{payment.entityName}</strong>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted">{payment.docnumber}</span>
                                                </td>
                                                <td>
                                                    <strong className="text-success">{formatCurrency(payment.paymentAmount)}</strong>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className={`${getMethodIcon(payment.paymentMethod)} me-2`}></i>
                                                        <span className="text-capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-sm">
                                                        <div>
                                                            <span className="text-muted">From:</span> {formatCurrency(payment.previousBalance)}
                                                        </div>
                                                        <div>
                                                            <span className="text-muted">To:</span> {formatCurrency(payment.newBalance)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadge(payment.status)}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="dropdown">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                                            type="button"
                                                            data-bs-toggle="dropdown"
                                                            aria-expanded="false"
                                                        >
                                                            Actions
                                                        </button>
                                                        <ul className="dropdown-menu">
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => viewPaymentDetails(payment)}
                                                                >
                                                                    <i className="ti ti-eye me-2"></i>View Details
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={() => printReceipt(payment)}
                                                                >
                                                                    <i className="ti ti-printer me-2"></i>Print Receipt
                                                                </button>
                                                            </li>
                                                            <li><hr className="dropdown-divider" /></li>
                                                            <li>
                                                                <button
                                                                    className="dropdown-item text-primary"
                                                                    onClick={() => editPaymentDetails(payment)}
                                                                    disabled={payment.status === 'cancelled'}
                                                                >
                                                                    <i className="ti ti-edit me-2"></i>Edit
                                                                </button>
                                                            </li>
                                                            {/* <li>
                                <button 
                                  className="dropdown-item text-danger"
                                  onClick={() => cancelPayment(payment._id)}
                                  disabled={payment.status === 'cancelled'}
                                >
                                  <i className="ti ti-trash me-2"></i>Cancel
                                </button>
                              </li> */}
                                                        </ul>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="text-muted">
                                        Showing {((pagination.currentPage - 1) * filters.limit) + 1} to{" "}
                                        {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)} of{" "}
                                        {pagination.totalCount} entries
                                    </div>

                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                    disabled={!pagination.hasPrev}
                                                >
                                                    <i className="ti ti-chevron-left"></i>
                                                </button>
                                            </li>

                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                                                if (pageNum <= pagination.totalPages) {
                                                    return (
                                                        <li key={pageNum} className={`page-item ${pageNum === pagination.currentPage ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pageNum)}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </li>
                                                    );
                                                }
                                                return null;
                                            })}

                                            <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                    disabled={!pagination.hasNext}
                                                >
                                                    <i className="ti ti-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Payment Details Modal */}
            {showModal && selectedPayment && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Payment Details</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Payment Information</h6>
                                        <div className="mb-3">
                                            <strong>Payment Document:</strong>
                                            <div>{selectedPayment.paymentDocNumber}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Date & Time:</strong>
                                            <div>{formatDate(selectedPayment.paymentDate)}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Amount:</strong>
                                            <div className="text-success">{formatCurrency(selectedPayment.paymentAmount)}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Payment Method:</strong>
                                            <div className="d-flex align-items-center">
                                                <i className={`${getMethodIcon(selectedPayment.paymentMethod)} me-2`}></i>
                                                <span className="text-capitalize">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Status:</strong>
                                            <div>
                                                <span className={getStatusBadge(selectedPayment.status)}>
                                                    {selectedPayment.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h6 className="text-muted mb-3">Entity & Transaction Details</h6>
                                        <div className="mb-3">
                                            <strong>Entity Type:</strong>
                                            <div className="text-capitalize">{selectedPayment.recordType}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Entity Name:</strong>
                                            <div>{selectedPayment.entityName}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Original Document:</strong>
                                            <div>{selectedPayment.docnumber}</div>
                                        </div>
                                        <div className="mb-3">
                                            <strong>Balance Changes:</strong>
                                            <div>
                                                <div>Previous: {formatCurrency(selectedPayment.previousBalance)}</div>
                                                <div>New: {formatCurrency(selectedPayment.newBalance)}</div>
                                                <div className="text-success">
                                                    Reduction: {formatCurrency(selectedPayment.previousBalance - selectedPayment.newBalance)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedPayment.description && (
                                    <div className="mt-3">
                                        <h6 className="text-muted">Description</h6>
                                        <p className="bg-light p-3 rounded">{selectedPayment.description}</p>
                                    </div>
                                )}

                                {selectedPayment.paymentDetails && (
                                    <div className="mt-3">
                                        <h6 className="text-muted">Payment Method Details</h6>
                                        <div className="bg-light p-3 rounded">
                                            {selectedPayment.paymentMethod === 'cheque' && (
                                                <>
                                                    {selectedPayment.paymentDetails.chequeNumber && (
                                                        <div><strong>Cheque Number:</strong> {selectedPayment.paymentDetails.chequeNumber}</div>
                                                    )}
                                                    {selectedPayment.paymentDetails.bankName && (
                                                        <div><strong>Bank:</strong> {selectedPayment.paymentDetails.bankName}</div>
                                                    )}
                                                </>
                                            )}

                                            {selectedPayment.paymentMethod === 'bank_transfer' && (
                                                <>
                                                    {selectedPayment.paymentDetails.accountNumber && (
                                                        <div><strong>Account Number:</strong> {selectedPayment.paymentDetails.accountNumber}</div>
                                                    )}
                                                    {selectedPayment.paymentDetails.transactionId && (
                                                        <div><strong>Transaction ID:</strong> {selectedPayment.paymentDetails.transactionId}</div>
                                                    )}
                                                </>
                                            )}

                                            {selectedPayment.paymentMethod === 'upi' && (
                                                <>
                                                    {selectedPayment.paymentDetails.upiId && (
                                                        <div><strong>UPI ID:</strong> {selectedPayment.paymentDetails.upiId}</div>
                                                    )}
                                                    {selectedPayment.paymentDetails.transactionId && (
                                                        <div><strong>Transaction ID:</strong> {selectedPayment.paymentDetails.transactionId}</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => printReceipt(selectedPayment)}
                                >
                                    <i className="ti ti-printer me-2"></i>Print Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Payment Modal */}
            {showEditModal && editPayment && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Payment - {editPayment.paymentDocNumber}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Payment Amount *</label>
                                            <div className="input-group">
                                                <span className="input-group-text">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="paymentAmount"
                                                    value={editPayment.paymentAmount}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Payment Method *</label>
                                            <select
                                                className="form-select"
                                                name="paymentMethod"
                                                value={editPayment.paymentMethod}
                                                onChange={handleEditChange}
                                                required
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="cheque">Cheque</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="upi">UPI</option>
                                                <option value="card">Card</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Payment Date *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="paymentDate"
                                                value={editPayment.paymentDate}
                                                onChange={handleEditChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status *</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={editPayment.status}
                                                onChange={handleEditChange}
                                                required
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="cleared">Cleared</option>
                                                <option value="bounced">Bounced</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="col-12 mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={editPayment.description || ''}
                                                onChange={handleEditChange}
                                                rows="3"
                                                placeholder="Payment description or notes..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="alert alert-warning">
                                        <i className="ti ti-alert-triangle me-2"></i>
                                        <strong>Note:</strong> Editing payment details will not automatically update the balance in the original invoice/billing record. You may need to manually adjust balances if necessary.
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="ti ti-check me-2"></i>Update Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentDisplay;