import React, { useEffect, useState } from "react";
import axios from "axios";

function Ledger() {
  const [vendorInvoice, setVendorInvoice] = useState([]);
  const [customerInvoice, setCustomerInvoice] = useState([]);
  const [vendorPage, setVendorPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Payment data integration
  const [paymentsData, setPaymentsData] = useState([]);
  const [lastPaymentUpdate, setLastPaymentUpdate] = useState(Date.now());

  const [vendorSummary, setVendorSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalBalance: 0,
    outstandingBalance: 0
  });
  const [customerSummary, setCustomerSummary] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalBalance: 0,
    outstandingBalance: 0
  });

  // For filter dropdowns
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // For date range filtering
  const [vendorDateFrom, setVendorDateFrom] = useState("");
  const [vendorDateTo, setVendorDateTo] = useState("");
  const [customerDateFrom, setCustomerDateFrom] = useState("");
  const [customerDateTo, setCustomerDateTo] = useState("");

  // For download modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadType, setDownloadType] = useState("");
  const [downloadEntity, setDownloadEntity] = useState("");
  const [downloadDateFrom, setDownloadDateFrom] = useState("");
  const [downloadDateTo, setDownloadDateTo] = useState("");

  // For detailed payment view
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedInvoicePayments, setSelectedInvoicePayments] = useState(null);
  const [selectedInvoiceInfo, setSelectedInvoiceInfo] = useState(null);

  // Real-time update states

  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [message, setMessage] = useState({ type: "", text: "" });

  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchAllData();

    const handleStorageChange = (e) => {
      if (e.key === 'paymentUpdated') {
        setMessage({
          type: "info",
          text: "Payment updated in another tab. Refreshing ledger..."
        });
        fetchAllData();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);



  const fetchPayments = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/payment`, {
        params: { companyId, financialYear, limit: 1000 }
      });
      return response.data.payments || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [vendorResponse, customerResponse, paymentsResponse] = await Promise.all([
        axios.get("http://localhost:8080/api/invoiceform", {
          params: { companyId, financialYear }
        }),
        axios.get("http://localhost:8080/api/billingform", {
          params: { companyId, financialYear }
        }),
        fetchPayments()
      ]);

      setVendorInvoice(vendorResponse.data || []);
      setCustomerInvoice(customerResponse.data || []);
      setPaymentsData(paymentsResponse || []);
      setLastPaymentUpdate(Date.now());

      calculateSummaries(vendorResponse.data || [], customerResponse.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data", error);
      setMessage({
        type: "error",
        text: "Failed to fetch data. Please refresh the page."
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (vendorData, customerData) => {
    const vendorSummary = vendorData.reduce((acc, item) => {
      const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || item.netAmount || 0) : 0;
      const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || item.netAmount || 0) : 0;
      const balance = item.balance || 0;

      let adjustedDebit = originalDebit;
      let adjustedCredit = originalCredit;

      if (originalDebit > 0 && originalCredit === 0) {
        adjustedCredit = -balance;
      } else if (originalCredit > 0 && originalDebit === 0) {
        adjustedDebit = -balance;
      }

      return {
        totalDebit: acc.totalDebit + adjustedDebit,
        totalCredit: acc.totalCredit + adjustedCredit,
        totalBalance: acc.totalBalance + (adjustedCredit - adjustedDebit),
        outstandingBalance: acc.outstandingBalance + balance
      };
    }, { totalDebit: 0, totalCredit: 0, totalBalance: 0, outstandingBalance: 0 });

    const customerSummary = customerData.reduce((acc, item) => {
      const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || 0) : 0;
      const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || 0) : 0;
      const balance = item.balance || 0;

      let adjustedDebit = originalDebit;
      let adjustedCredit = originalCredit;

      if (originalDebit > 0 && originalCredit === 0) {
        adjustedCredit = -balance;
      } else if (originalCredit > 0 && originalDebit === 0) {
        adjustedDebit = -balance;
      }

      return {
        totalDebit: acc.totalDebit + adjustedDebit,
        totalCredit: acc.totalCredit + adjustedCredit,
        totalBalance: acc.totalBalance + (adjustedDebit - adjustedCredit),
        outstandingBalance: acc.outstandingBalance + balance
      };
    }, { totalDebit: 0, totalCredit: 0, totalBalance: 0, outstandingBalance: 0 });

    setVendorSummary(vendorSummary);
    setCustomerSummary(customerSummary);
  };

  const processAccountingEntry = (originalDebit, originalCredit, balance) => {
    let adjustedDebit = originalDebit;
    let adjustedCredit = originalCredit;

    if (originalDebit > 0 && originalCredit === 0) {
      adjustedCredit = originalDebit - balance;
    } else if (originalCredit > 0 && originalDebit === 0) {
      adjustedDebit = originalCredit - balance;
    }

    return { adjustedDebit, adjustedCredit };
  };

  const getPaymentsForInvoice = (docNumber, entityName, entityType) => {
    if (!paymentsData || paymentsData.length === 0) return [];

    return paymentsData.filter(payment => {
      const docMatch = payment.docnumber === docNumber ||
        payment.invoiceNumber === docNumber ||
        payment.originalDocNumber === docNumber;
      const typeMatch = payment.recordType === entityType;
      return typeMatch && docMatch;
    });
  };

  const openPaymentDetails = (invoiceData, payments) => {
    setSelectedInvoiceInfo(invoiceData);
    setSelectedInvoicePayments(payments);
    setShowPaymentDetails(true);
  };

  // Enhanced data mapping
  const vendorData = vendorInvoice.map((item, index) => {
    const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || item.netAmount || 0) : 0;
    const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || item.netAmount || 0) : 0;
    const vendorName = item?.vendor || "Unknown Vendor";
    const docNumber = item?.docnumber || "_";

    const invoicePayments = getPaymentsForInvoice(docNumber, vendorName, 'vendor');
    const clearedPayments = invoicePayments.filter(p => p.status === 'cleared');
    const totalClearedPayments = clearedPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
    const lastClearedPayment = clearedPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];

    let currentBalance = (item.balance || 0);
    if (currentBalance < 0) currentBalance = 0;

    const { adjustedDebit, adjustedCredit } = processAccountingEntry(originalDebit, originalCredit, currentBalance);

    return {
      id: item._id || index,
      name: vendorName,
      docnumber: docNumber,
      debit: adjustedDebit,
      credit: adjustedCredit,
      balance: currentBalance,
      originalAmount: item.finalTotal || item.netAmount || 0,
      lastPaymentAmount: lastClearedPayment?.paymentAmount || 0,
      lastPaymentDate: lastClearedPayment?.paymentDate || null,
      lastPaymentMethod: lastClearedPayment?.paymentMethod || null,
      createdAt: item.createdAt || new Date(),
      category: item.category || 'debit',
      originalDebit: originalDebit,
      originalCredit: originalCredit,
      totalPayments: totalClearedPayments,
      paymentCount: clearedPayments.length,
      pendingPayments: invoicePayments.filter(p => p.status === 'pending').length,
      specificInvoicePayments: invoicePayments,
      allPaymentStatuses: invoicePayments.map(p => p.status),
      paymentMethods: [...new Set(invoicePayments.map(p => p.paymentMethod))],
      firstPaymentDate: invoicePayments.length > 0 ?
        invoicePayments.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))[0].paymentDate : null
    };
  });

  const customerData = customerInvoice.map((item, index) => {
    const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || 0) : 0;
    const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || 0) : 0;
    const customerName = item?.customer || "Unknown Customer";
    const docNumber = item.docnumber || "_";

    const invoicePayments = getPaymentsForInvoice(docNumber, customerName, 'customer');
    const clearedPayments = invoicePayments.filter(p => p.status === 'cleared');
    const totalClearedPayments = clearedPayments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);
    const lastClearedPayment = clearedPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))[0];

    let currentBalance = (item.balance || 0) ;
    if (currentBalance < 0) currentBalance = 0;

    const { adjustedDebit, adjustedCredit } = processAccountingEntry(originalDebit, originalCredit, currentBalance);

    return {
      id: item._id || index,
      docnumber: docNumber,
      name: customerName,
      debit: adjustedDebit,
      credit: adjustedCredit,
      balance: currentBalance,
      originalAmount: item.finalTotal || 0,
      lastPaymentAmount: lastClearedPayment?.paymentAmount || 0,
      lastPaymentDate: lastClearedPayment?.paymentDate || null,
      lastPaymentMethod: lastClearedPayment?.paymentMethod || null,
      createdAt: item.createdAt || new Date(),
      category: item.category || 'debit',
      originalDebit: originalDebit,
      originalCredit: originalCredit,
      totalPayments: totalClearedPayments,
      paymentCount: clearedPayments.length,
      pendingPayments: invoicePayments.filter(p => p.status === 'pending').length,
      specificInvoicePayments: invoicePayments,
      allPaymentStatuses: invoicePayments.map(p => p.status),
      paymentMethods: [...new Set(invoicePayments.map(p => p.paymentMethod))],
      firstPaymentDate: invoicePayments.length > 0 ?
        invoicePayments.sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))[0].paymentDate : null
    };
  });

  const uniqueVendors = [...new Set(vendorData.map(v => v.name))];
  const uniqueCustomers = [...new Set(customerData.map(c => c.name))];

  const filterByDateRange = (data, dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return data;

    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      if (fromDate && itemDate < fromDate) return false;
      if (toDate && itemDate > toDate) return false;
      return true;
    });
  };

  let filteredVendorData = selectedVendor ? vendorData.filter(v => v.name === selectedVendor) : vendorData;
  filteredVendorData = filterByDateRange(filteredVendorData, vendorDateFrom, vendorDateTo);

  let filteredCustomerData = selectedCustomer ? customerData.filter(c => c.name === selectedCustomer) : customerData;
  filteredCustomerData = filterByDateRange(filteredCustomerData, customerDateFrom, customerDateTo);
  console.log("filteredCustomerData",filteredCustomerData)
  const filteredVendorSummary = filteredVendorData.reduce((acc, item) => ({
    totalDebit: acc.totalDebit + item.debit,
    totalCredit: acc.totalCredit + item.credit,
    totalBalance: acc.totalBalance + (item.credit - item.debit),
    outstandingBalance: acc.outstandingBalance + item.balance
  }), { totalDebit: 0, totalCredit: 0, totalBalance: 0, outstandingBalance: 0 });

  const filteredCustomerSummary = filteredCustomerData.reduce((acc, item) => ({
    totalDebit: acc.totalDebit + item.debit,
    totalCredit: acc.totalCredit + item.credit,
    totalBalance: acc.totalBalance + (item.debit - item.credit),
    outstandingBalance: acc.outstandingBalance + item.balance
  }), { totalDebit: 0, totalCredit: 0, totalBalance: 0, outstandingBalance: 0 });

  const openDownloadModal = (type, entity = "") => {
    setDownloadType(type);
    setDownloadEntity(entity);
    setDownloadDateFrom("");
    setDownloadDateTo("");
    setShowDownloadModal(true);
  };

  const downloadCSV = (data, filename, type) => {
    const headers = [
      'S.No',
      'Invoice/Doc Number',
      type === 'vendor' ? 'Vendor Name' : 'Customer Name',
      'Invoice Original Amount',
      'Current Debit',
      'Current Credit',
      'Outstanding Balance',
      'Payment Status',
      'Total Payments Made (This Invoice)',
      'Payment Count (This Invoice)',
      'Cleared Payments Count',
      'Pending Payments Count',
      'Payment Methods Used',
      'First Payment Date',
      'Last Payment Date',
      'Last Payment Amount',
      'Last Payment Method',
      'Invoice Created Date',
      'Detailed Payment History',
      'Payment Status Breakdown',
      'Balance Calculation Details',
     
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    data.forEach((item, index) => {
      const invoicePayments = item.specificInvoicePayments || [];

      const paymentHistory = invoicePayments.map(payment => {
        const paymentDate = formatDateTime(payment.paymentDate);
        const amount = (payment.paymentAmount || 0).toFixed(2);
        const method = payment.paymentMethod || 'N/A';
        const status = payment.status || 'N/A';
        const docRef = payment.paymentDocNumber || 'N/A';
        const description = payment.description || 'N/A';

        return `[${paymentDate}] Amount: ${amount} | Method: ${method} | Status: ${status.toUpperCase()} | Reference: ${docRef} | Description: ${description} `;
      }).join(' \n ');

      const statusBreakdown = item.allPaymentStatuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      const statusSummary = Object.entries(statusBreakdown)
        .map(([status, count]) => `${status.toUpperCase()}: ${count}`)
        .join(', ');

      const balanceDetails = `Original: ${item.originalAmount.toFixed(2)} | Total Paid: ${item.totalPayments.toFixed(2)} | Outstanding: ${item.balance.toFixed(2)} | Calculation: ${item.originalAmount.toFixed(2)} - ${item.totalPayments.toFixed(2)} = ${item.balance.toFixed(2)}`;

      const row = [
        index + 1,
        `"${item.docnumber}"`,
        `"${item.name}"`,
        item.originalAmount.toFixed(2),
        item.debit.toFixed(2),
        item.credit.toFixed(2),
        item.balance.toFixed(2),
        getBalanceStatus(item.balance, item.originalAmount).status,
        item.totalPayments.toFixed(2),
        item.paymentCount,
        invoicePayments.filter(p => p.status === 'cleared').length,
        invoicePayments.filter(p => p.status === 'pending').length,
        `"${item.paymentMethods.join(', ') || 'No payments'}"`,
        item.firstPaymentDate ? formatDate(item.firstPaymentDate) : 'N/A',
        item.lastPaymentDate ? formatDate(item.lastPaymentDate) : 'N/A',
        item.lastPaymentAmount.toFixed(2),
        `"${item.lastPaymentMethod || 'N/A'}"`,
        formatDate(item.createdAt),
        `"${paymentHistory || 'No payment history for this invoice'}"`,
        `"${statusSummary || 'No payment status available'}"`,
        `"${balanceDetails}"`
      ];

      csvRows.push(row.join(','));
    });

    csvRows.push('');
    // csvRows.push('=== COMPREHENSIVE INVOICE-SPECIFIC PAYMENT ANALYSIS ===');
    csvRows.push('Invoice Number,Entity Name,Invoice Amount,Payments Received,Outstanding,Payment Efficiency %,First Payment,Last Payment,Payment Methods,Status');

    data.forEach(item => {
      const paymentEfficiency = item.originalAmount > 0 ?
        ((item.totalPayments / item.originalAmount) * 100).toFixed(1) : 0;

      csvRows.push([
        `"${item.docnumber}"`,
        `"${item.name}"`,
        item.originalAmount.toFixed(2),
        item.totalPayments.toFixed(2),
        item.balance.toFixed(2),
        `${paymentEfficiency}%`,
        item.firstPaymentDate ? formatDate(item.firstPaymentDate) : 'No payments',
        item.lastPaymentDate ? formatDate(item.lastPaymentDate) : 'No payments',
        `"${item.paymentMethods.join(', ') || 'None'}"`,
        getBalanceStatus(item.balance, item.originalAmount).status
      ].join(','));
    });

    csvRows.push('');
    csvRows.push(`"Financial Year","${financialYear}"`);
    csvRows.push(`"Total Invoices","${data.length}"`);
    csvRows.push(`"Total Payment Records","${data.reduce((sum, item) => sum + item.paymentCount, 0)}"`);
   

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    let dataToDownload = [];
    let filename = "";

    if (downloadType === "vendor") {
      dataToDownload = downloadEntity ?
        vendorData.filter(v => v.name === downloadEntity) :
        vendorData;
      filename = downloadEntity ?
        `${downloadEntity}_vendor_detailed_invoice_payments` :
        "all_vendor_detailed_invoice_payments";
    } else {
      dataToDownload = downloadEntity ?
        customerData.filter(c => c.name === downloadEntity) :
        customerData;
      filename = downloadEntity ?
        `${downloadEntity}_customer_detailed_invoice_payments` :
        "all_customer_detailed_invoice_payments";
    }

    dataToDownload = filterByDateRange(dataToDownload, downloadDateFrom, downloadDateTo);

    if (downloadDateFrom || downloadDateTo) {
      filename += `_${downloadDateFrom || 'start'}_to_${downloadDateTo || 'end'}`;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    filename += `_${timestamp}.csv`;

    downloadCSV(dataToDownload, filename, downloadType);
    setShowDownloadModal(false);
  };

  const paginate = (data, page) =>
    data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalVendorPages = Math.ceil(filteredVendorData.length / PAGE_SIZE) || 1;
  const totalCustomerPages = Math.ceil(filteredCustomerData.length / PAGE_SIZE) || 1;

  const formatCurrency = (amount) => {
    const value = parseFloat(amount || 0);
    const absValue = Math.abs(value);
    const formatted = `₹${absValue.toFixed(2)}`;
    return value < 0 ? `(${formatted})` : formatted;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBalanceStatus = (balance, originalAmount) => {
    if (balance <= 0) return { status: 'Paid', class: 'success' };
    if (balance === originalAmount) return { status: 'Unpaid', class: 'danger' };
    return { status: 'Partial', class: 'warning' };
  };

  const getCellClass = (value) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-danger';
    return 'text-muted';
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
    return icons[method] || "ti ti-payment";
  };

  // --- RENDER ---
  return (
    <div className="content">
      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : message.type === "info" ? "info" : "danger"} alert-dismissible fade show`}>
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: "", text: "" })}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">
            Ledger

          </h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">Accounts</li>
              <li className="breadcrumb-item active">Ledger</li>
            </ol>
          </nav>
        </div>
        <div>
          <a href="/payments" className="btn btn-primary me-2">
            <i className="ti ti-plus"></i> Record Payment
          </a>
          <a href="/paymentdisplay" className="btn btn-outline-primary me-2">
            <i className="ti ti-eye"></i> View Payments
          </a>
          <button onClick={fetchAllData} className="btn btn-outline-secondary">
            <i className="ti ti-refresh"></i> Refresh Now
          </button>
        </div>
      </div>



      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                Vendor Summary

              </h6>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => openDownloadModal("vendor")}
                title="Download Detailed Vendor Payment Data"
              >
                <i className="ti ti-download"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-12 mb-2">
                  <label>Select Vendor: </label>
                  <select
                    value={selectedVendor}
                    onChange={e => { setSelectedVendor(e.target.value); setVendorPage(1); }}
                    className="form-select"
                    style={{ maxWidth: 250, display: "inline-block", marginLeft: 10 }}>
                    <option value="">All Vendors</option>
                    {uniqueVendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {selectedVendor && (
                    <>
                      <button className="btn btn-link text-danger ms-2 px-2 py-0" onClick={() => setSelectedVendor("")}>Clear</button>
                      <button
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => openDownloadModal("vendor", selectedVendor)}
                        title={`Download detailed ${selectedVendor} payment data`}
                      >
                        <i className="ti ti-download"></i> Detailed Export
                      </button>
                    </>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">From Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={vendorDateFrom}
                    onChange={e => { setVendorDateFrom(e.target.value); setVendorPage(1); }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">To Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={vendorDateTo}
                    onChange={e => { setVendorDateTo(e.target.value); setVendorPage(1); }}
                  />
                </div>
              </div>
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-muted mb-1">Total Debit</div>
                  <h6 className="text-danger">{formatCurrency(filteredVendorSummary.totalDebit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Total Credit</div>
                  <h6 className="text-success">{formatCurrency(filteredVendorSummary.totalCredit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Net Balance</div>
                  <h6 className={filteredVendorSummary.totalBalance >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(filteredVendorSummary.totalBalance)}
                  </h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Outstanding</div>
                  <h6 className="text-warning">{formatCurrency(filteredVendorSummary.outstandingBalance)}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                Customer Summary

              </h6>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => openDownloadModal("customer")}
                title="Download Detailed Customer Payment Data"
              >
                <i className="ti ti-download"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-12 mb-2">
                  <label>Select Customer: </label>
                  <select
                    value={selectedCustomer}
                    onChange={e => { setSelectedCustomer(e.target.value); setCustomerPage(1); }}
                    className="form-select"
                    style={{ maxWidth: 250, display: "inline-block", marginLeft: 10 }}>
                    <option value="">All Customers</option>
                    {uniqueCustomers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {selectedCustomer && (
                    <>
                      <button className="btn btn-link text-danger ms-2 px-2 py-0" onClick={() => setSelectedCustomer("")}>Clear</button>
                      <button
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => openDownloadModal("customer", selectedCustomer)}
                        title={`Download detailed ${selectedCustomer} payment data`}
                      >
                        <i className="ti ti-download"></i> Detailed Export
                      </button>
                    </>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">From Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customerDateFrom}
                    onChange={e => { setCustomerDateFrom(e.target.value); setCustomerPage(1); }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">To Date:</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={customerDateTo}
                    onChange={e => { setCustomerDateTo(e.target.value); setCustomerPage(1); }}
                  />
                </div>
              </div>
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-muted mb-1">Total Debit</div>
                  <h6 className="text-danger">{formatCurrency(filteredCustomerSummary.totalDebit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Total Credit</div>
                  <h6 className="text-success">{formatCurrency(filteredCustomerSummary.totalCredit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Net Balance</div>
                  <h6 className={filteredCustomerSummary.totalBalance >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(filteredCustomerSummary.totalBalance)}
                  </h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Outstanding</div>
                  <h6 className="text-warning">{formatCurrency(filteredCustomerSummary.outstandingBalance)}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Enhanced Vendor Ledger */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Vendor Ledger

              </h5>
              <div className="d-flex align-items-center">
                <small className="me-3">Total Records: {filteredVendorData.length}</small>
                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => openDownloadModal("vendor", selectedVendor)}
                // title="Download comprehensive payment details"
                >
                  <i className="ti ti-download"></i> Detailed Export
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>DocNumber</th>
                          <th>Vendor</th>
                          <th>Original Amount</th>
                          <th>Debit</th>
                          <th>Credit</th>
                          <th>Current Balance</th>
                          <th>Status</th>
                          <th>Payment Summary</th>
                          <th>Payment Timeline</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(filteredVendorData, vendorPage).map((entry, index) => {
                          const balanceStatus = getBalanceStatus(Number(entry.balance), entry.originalAmount);
                          const paymentEfficiency = entry.originalAmount > 0 ?
                            ((entry.totalPayments / entry.originalAmount) * 100).toFixed(1) : 0;

                          return (
                            <tr key={entry.id}>
                              <td>{(vendorPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>
                                <strong className="text-primary">{entry.docnumber}</strong>

                              </td>
                              <td>
                                <strong>{entry.name}</strong>

                              </td>
                              <td className="text-end">
                                <strong>{formatCurrency(entry.originalAmount)}</strong>

                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.debit)}`}>
                                {formatCurrency(entry.totalPayments)}
                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.credit)}`}>
                                {formatCurrency(entry.balance)}
                              </td>
                              <td className="text-end">
                                <strong className={`${entry.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                  {formatCurrency(entry.balance)}
                                </strong>

                              </td>
                              <td>
                                <span className={`badge bg-${balanceStatus.class}`}>
                                  {balanceStatus.status}
                                </span>
                                <div className="mt-1">
                                  <small className="text-muted">{paymentEfficiency}% paid</small>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column">
                                  {entry.totalPayments > 0 ? (
                                    <>
                                      <span className="badge bg-success mb-1">
                                        ₹{entry.totalPayments.toFixed(0)}
                                      </span>
                                      <small className="text-muted">
                                        {entry.paymentCount} payment(s)
                                      </small>

                                    </>
                                  ) : (
                                    <span className="badge bg-secondary">
                                      No Payments
                                    </span>
                                  )}
                                  {entry.pendingPayments > 0 && (
                                    <span className="badge bg-warning mt-1">
                                      {entry.pendingPayments} Pending
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column">
                                  <small className="text-muted">
                                    Created: {formatDate(entry.createdAt)}
                                  </small>
                                  {entry.firstPaymentDate && (
                                    <small className="text-success">
                                      First Payment: {formatDate(entry.firstPaymentDate)}
                                    </small>
                                  )}
                                  {entry.lastPaymentDate && (
                                    <small className="text-primary">
                                      Last Payment: {formatDate(entry.lastPaymentDate)}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="btn-group-vertical" role="group">
                                  {entry.specificInvoicePayments.length > 0 ? (
                                    <button
                                      className="btn btn-sm btn-outline-info mb-1"
                                      onClick={() => openPaymentDetails(entry, entry.specificInvoicePayments)}
                                      title="View detailed payment history"
                                    >
                                      <i className="ti ti-eye"></i> View Details
                                    </button>
                                  ) : (
                                    <span className="btn btn-sm btn-outline-secondary mb-1 disabled">
                                      <i className="ti ti-ban"></i> No Payments
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Enhanced Pagination for Vendor Table */}
                  {totalVendorPages > 1 && (
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <div className="d-flex justify-content-end align-items-end">
                          <nav aria-label="Vendor pagination">
                            <ul className="pagination justify-content-end mb-0">
                              <li className={`page-item ${vendorPage === 1 ? "disabled" : ""}`}>
                                <button
                                  className="page-link btn-sm"
                                  onClick={() => setVendorPage((p) => Math.max(p - 1, 1))}
                                  disabled={vendorPage === 1}
                                  title="Previous page"
                                >
                                  <span aria-hidden="true"><i className="ti ti-chevron-left"></i></span>
                                 
                                </button>
                              </li>

                              {(() => {
                                const delta = 2; // Number of pages to show on each side of current page
                                const range = [];
                                const rangeWithDots = [];

                                // Always show first page
                                range.push(1);

                                // Add pages around current page
                                for (let i = Math.max(2, vendorPage - delta); i <= Math.min(totalVendorPages - 1, vendorPage + delta); i++) {
                                  range.push(i);
                                }

                                // Always show last page if there are more than 1 page
                                if (totalVendorPages > 1) {
                                  range.push(totalVendorPages);
                                }

                                // Remove duplicates and sort
                                const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

                                let prev;
                                for (let i of uniqueRange) {
                                  if (prev) {
                                    if (i - prev === 2) {
                                      rangeWithDots.push(prev + 1);
                                    } else if (i - prev !== 1) {
                                      rangeWithDots.push('...');
                                    }
                                  }
                                  rangeWithDots.push(i);
                                  prev = i;
                                }

                                return rangeWithDots.map((number, index) => {
                                  if (number === '...') {
                                    return (
                                      <li key={`vendor-ellipsis-${index}`} className="page-item disabled">
                                        <span className="page-link">...</span>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li
                                      key={`vendor-page-${number}`}
                                      className={`page-item ${vendorPage === number ? "active" : ""}`}
                                    >
                                      <button
                                        className="page-link"
                                        onClick={() => setVendorPage(number)}
                                        title={`Go to page ${number}`}
                                      >
                                        {number}
                                      </button>
                                    </li>
                                  );
                                });
                              })()}

                              <li className={`page-item ${vendorPage === totalVendorPages ? "disabled" : ""}`}>
                                <button
                                  className="page-link btn-sm"
                                  onClick={() => setVendorPage((p) => Math.min(p + 1, totalVendorPages))}
                                  disabled={vendorPage === totalVendorPages}
                                  title="Next page"
                                >
                                 
                                  <span aria-hidden="true"><i className="ti ti-chevron-right"></i></span>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                     
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Customer Ledger */}
        <div className="col-12">
          <div className="card">
            <div className="card-header text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Customer Ledger
              </h5>
              <div className="d-flex align-items-center">

                <button
                  className="btn btn-sm btn-outline-light"
                  onClick={() => openDownloadModal("customer", selectedCustomer)}
                // title="Download comprehensive payment details"
                >
                  <i className="ti ti-download"></i> Detailed Export
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>DocNumber</th>
                          <th>Customer</th>
                          <th>Original Amount</th>
                          <th>Debit</th>
                          <th>Credit</th>
                          <th>Current Balance</th>
                          <th>Status</th>
                          <th>Payment Summary</th>
                          <th>Payment Timeline</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(filteredCustomerData, customerPage).map((entry, index) => {
                          const balanceStatus = getBalanceStatus(entry.balance, entry.originalAmount);
                          const paymentEfficiency = entry.originalAmount > 0 ?
                            ((entry.totalPayments / entry.originalAmount) * 100).toFixed(1) : 0;

                          return (
                            <tr key={entry.id}>
                              <td>{(customerPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>
                                <strong className="text-primary">{entry.docnumber}</strong>

                              </td>
                              <td>
                                <strong>{entry.name}</strong>

                              </td>
                              <td className="text-end">
                                <strong>{formatCurrency(entry.originalAmount)}</strong>

                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.debit)}`}>
                                {formatCurrency(entry.balance)}
                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.credit)}`}>
                                {formatCurrency(entry.totalPayments.toFixed(0))}
                              </td>
                              <td className="text-end">
                                <strong className={`${entry.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                  {formatCurrency(entry.balance)}
                                </strong>

                              </td>
                              <td>
                                <span className={`badge bg-${balanceStatus.class}`}>
                                  {balanceStatus.status}
                                </span>
                                <div className="mt-1">
                                  <small className="text-muted">{paymentEfficiency}% paid</small>
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column">
                                  {entry.totalPayments > 0 ? (
                                    <>
                                      <span className="badge bg-success mb-1">
                                        ₹{entry.totalPayments.toFixed(0)}
                                      </span>
                                      <small className="text-muted">
                                        {entry.paymentCount} payment(s)
                                      </small>

                                    </>
                                  ) : (
                                    <span className="badge bg-secondary">
                                      No Payments
                                    </span>
                                  )}
                                  {entry.pendingPayments > 0 && (
                                    <span className="badge bg-warning mt-1">
                                      {entry.pendingPayments} Pending
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="d-flex flex-column">
                                  <small className="text-muted">
                                    Created: {formatDate(entry.createdAt)}
                                  </small>
                                  {entry.firstPaymentDate && (
                                    <small className="text-success">
                                      First Payment: {formatDate(entry.firstPaymentDate)}
                                    </small>
                                  )}
                                  {entry.lastPaymentDate && (
                                    <small className="text-primary">
                                      Last Payment: {formatDate(entry.lastPaymentDate)}
                                    </small>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="btn-group-vertical" role="group">
                                  {entry.specificInvoicePayments.length > 0 ? (
                                    <button
                                      className="btn btn-sm btn-outline-info mb-1"
                                      onClick={() => openPaymentDetails(entry, entry.specificInvoicePayments)}
                                      title="View detailed payment history"
                                    >
                                      <i className="ti ti-eye"></i> View Details
                                    </button>
                                  ) : (
                                    <span className="btn btn-sm btn-outline-secondary mb-1 disabled">
                                      <i className="ti ti-ban"></i> No Payments
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Enhanced Pagination for Customer Table */}
                  {totalCustomerPages > 1 && (
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <div className="d-flex justify-content-end align-items-end">
                          {/* Page Info */}
                         

                          {/* Pagination Navigation */}
                          <nav aria-label="Customer pagination">
                            <ul className="pagination justify-content-end mb-0">
                              <li className={`page-item ${customerPage === 1 ? "disabled" : ""}`}>
                                <button
                                  className="page-link btn-sm"
                                  onClick={() => setCustomerPage((p) => Math.max(p - 1, 1))}
                                  disabled={customerPage === 1}
                                  title="Previous page"
                                >
                                  <span aria-hidden="true"><i className="ti ti-chevron-left"></i></span>
                                </button>
                              </li>

                              {(() => {
                                const delta = 2; // Number of pages to show on each side of current page
                                const range = [];
                                const rangeWithDots = [];

                                // Always show first page
                                range.push(1);

                                // Add pages around current page
                                for (let i = Math.max(2, customerPage - delta); i <= Math.min(totalCustomerPages - 1, customerPage + delta); i++) {
                                  range.push(i);
                                }

                                // Always show last page if there are more than 1 page
                                if (totalCustomerPages > 1) {
                                  range.push(totalCustomerPages);
                                }

                                // Remove duplicates and sort
                                const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

                                let prev;
                                for (let i of uniqueRange) {
                                  if (prev) {
                                    if (i - prev === 2) {
                                      rangeWithDots.push(prev + 1);
                                    } else if (i - prev !== 1) {
                                      rangeWithDots.push('...');
                                    }
                                  }
                                  rangeWithDots.push(i);
                                  prev = i;
                                }

                                return rangeWithDots.map((number, index) => {
                                  if (number === '...') {
                                    return (
                                      <li key={`customer-ellipsis-${index}`} className="page-item disabled">
                                        <span className="page-link">...</span>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li
                                      key={`customer-page-${number}`}
                                      className={`page-item ${customerPage === number ? "active" : ""}`}
                                    >
                                      <button
                                        className="page-link"
                                        onClick={() => setCustomerPage(number)}
                                        title={`Go to page ${number}`}
                                      >
                                        {number}
                                      </button>
                                    </li>
                                  );
                                });
                              })()}

                              <li className={`page-item ${customerPage === totalCustomerPages ? "disabled" : ""}`}>
                                <button
                                  className="page-link btn-sm"
                                  onClick={() => setCustomerPage((p) => Math.min(p + 1, totalCustomerPages))}
                                  disabled={customerPage === totalCustomerPages}
                                  title="Next page"
                                >
                                  <span aria-hidden="true"><i className="ti ti-chevron-right"></i></span>
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED PAYMENT MODAL */}
      {showPaymentDetails && selectedInvoicePayments && selectedInvoiceInfo && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl"> 
            <div className="modal-content">
              <div className="modal-header ">
                <h5 className="modal-title">
                  <i className="ti ti-file-invoice me-2"></i>
                  Payment Analysis - Invoice {selectedInvoiceInfo.docnumber}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close"
                  onClick={() => setShowPaymentDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Enhanced Invoice Summary Header */}
                <div className="row mb-4">
                  <div className="col-md-12">
                    <div className="card ">
                      <div className="card-header ">
                        <h6 className="mb-0">
                          <i className="ti ti-clipboard-data me-2"></i>
                          Invoice Summary & Payment Overview
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3">
                            <div className="text-center p-3 border rounded">
                              <strong className="text-primary">Invoice Number</strong><br />
                              <span className="h5 text-dark">{selectedInvoiceInfo.docnumber}</span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center p-3 border rounded">
                              <strong className="text-info">Entity</strong><br />
                              <span className="h6 text-dark">{selectedInvoiceInfo.name}</span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center p-3 border rounded">
                              <strong className="text-success">Original Amount</strong><br />
                              <span className="h5 text-success">{formatCurrency(selectedInvoiceInfo.originalAmount)}</span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center p-3 border rounded">
                              <strong className={selectedInvoiceInfo.balance > 0 ? 'text-danger' : 'text-success'}>Outstanding Balance</strong><br />
                              <span className={`h5 ${selectedInvoiceInfo.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(selectedInvoiceInfo.balance)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="row mt-3">
                          <div className="col-md-3">
                            <div className="text-center p-2 bg-info text-white rounded">
                              <strong>Total Payments</strong><br />
                              <span className="h6">{formatCurrency(selectedInvoiceInfo.totalPayments)}</span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center p-2 bg-primary text-white rounded">
                              <strong>Payment Count</strong><br />
                              <span className="h6">{selectedInvoiceInfo.paymentCount}</span>
                            </div>
                          </div>
                          {/* <div className="col-md-2">
                            <div className="text-center p-2 bg-success text-white rounded">
                              <strong>Payment Efficiency</strong><br />
                              <span className="h6">
                                {selectedInvoiceInfo.originalAmount > 0 ? 
                                  ((selectedInvoiceInfo.totalPayments / selectedInvoiceInfo.originalAmount) * 100).toFixed(1) : 0}%
                              </span>
                            </div>
                          </div> */}
                          {/* <div className="col-md-2">
                            <div className="text-center p-2 bg-warning text-white rounded">
                              <strong>Pending Payments</strong><br />
                              <span className="h6">{selectedInvoiceInfo.pendingPayments}</span>
                            </div>
                          </div> */}
                          <div className="col-md-3">
                            <div className={`text-center p-2 text-white rounded bg-${getBalanceStatus(selectedInvoiceInfo.balance, selectedInvoiceInfo.originalAmount).class}`}>
                              <strong>Status</strong><br />
                              <span className="h6">
                                {getBalanceStatus(selectedInvoiceInfo.balance, selectedInvoiceInfo.originalAmount).status}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="text-center p-2 bg-secondary text-white rounded">
                              <strong>Invoice Age</strong><br />
                              <span className="h6">
                                {Math.floor((new Date() - new Date(selectedInvoiceInfo.createdAt)) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Summary */}
                {/* {selectedInvoiceInfo.paymentMethods.length > 0 && (
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-header bg-info text-white">
                          <h6 className="mb-0">
                            <i className="ti ti-credit-card me-2"></i>
                            Payment Methods Used ({selectedInvoiceInfo.paymentMethods.length})
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex flex-wrap gap-2">
                            {selectedInvoiceInfo.paymentMethods.map((method, index) => (
                              <span key={index} className="badge bg-primary p-2">
                                <i className={`${getMethodIcon(method)} me-1`}></i>
                                                         {method.replace('_', ' ').toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Payment Timeline Analysis */}
                {/* {selectedInvoiceInfo.firstPaymentDate && (
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-header bg-success text-white">
                          <h6 className="mb-0">
                            <i className="ti ti-calendar-clock me-2"></i>
                            Payment Timeline Analysis
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <strong>Invoice Created:</strong><br />
                              <span className="text-muted">{formatDate(selectedInvoiceInfo.createdAt)}</span>
                            </div>
                            <div className="col-md-3">
                              <strong>First Payment:</strong><br />
                              <span className="text-success">{formatDate(selectedInvoiceInfo.firstPaymentDate)}</span>
                              <br />
                              <small className="text-muted">
                                ({Math.floor((new Date(selectedInvoiceInfo.firstPaymentDate) - new Date(selectedInvoiceInfo.createdAt)) / (1000 * 60 * 60 * 24))} days after invoice)
                              </small>
                            </div>
                            <div className="col-md-3">
                              <strong>Last Payment:</strong><br />
                              <span className="text-primary">{formatDate(selectedInvoiceInfo.lastPaymentDate)}</span>
                              <br />
                              <small className="text-muted">
                                ({Math.floor((new Date() - new Date(selectedInvoiceInfo.lastPaymentDate)) / (1000 * 60 * 60 * 24))} days ago)
                              </small>
                            </div>
                            <div className="col-md-3">
                              <strong>Payment Period:</strong><br />
                              <span className="text-info">
                                {Math.floor((new Date(selectedInvoiceInfo.lastPaymentDate) - new Date(selectedInvoiceInfo.firstPaymentDate)) / (1000 * 60 * 60 * 24))} days
                              </span>
                              <br />
                              <small className="text-muted">Duration between first and last payment</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )} */}

                {/* Detailed Payment Transaction History */}


                {/* Payment Analytics Summary */}
                {selectedInvoicePayments.length > 0 && (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-header text-dark">
                          <h6 className="mb-0">
                            <i className="ti ti-chart-bar me-2"></i>
                            Payment Analytics & Summary
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4">
                              <h6 className="text-primary">Payment Status Breakdown:</h6>
                              <ul className="list-unstyled">
                                {Object.entries(
                                  selectedInvoicePayments.reduce((acc, payment) => {
                                    acc[payment.status] = (acc[payment.status] || 0) + 1;
                                    return acc;
                                  }, {})
                                ).map(([status, count]) => (
                                  <li key={status} className="mb-1">
                                    <span className={`badge bg-${status === 'cleared' ? 'success' :
                                      status === 'pending' ? 'warning' :
                                        status === 'bounced' ? 'danger' : 'secondary'
                                      }`}>
                                      {status.toUpperCase()}
                                    </span>
                                    <span className="ms-2">{count} transaction(s)</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="col-md-4">
                              <h6 className="text-success">Payment Method Summary:</h6>
                              <ul className="list-unstyled">
                                {Object.entries(
                                  selectedInvoicePayments.reduce((acc, payment) => {
                                    const method = payment.paymentMethod || 'Unknown';
                                    acc[method] = (acc[method] || 0) + (payment.paymentAmount || 0);
                                    return acc;
                                  }, {})
                                ).map(([method, amount]) => (
                                  <li key={method} className="mb-1">
                                    <i className={`${getMethodIcon(method)} me-2 text-primary`}></i>
                                    <span className="text-capitalize">{method.replace('_', ' ')}</span>
                                    <span className="ms-2 text-success">{formatCurrency(amount)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {/* <div className="col-md-4">
                              <h6 className="text-info">Key Metrics:</h6>
                              <ul className="list-unstyled">
                                <li className="mb-2">
                                  <strong>Average Payment:</strong> 
                                  <span className="ms-2 text-primary">
                                    {formatCurrency(selectedInvoiceInfo.totalPayments / selectedInvoiceInfo.paymentCount)}
                                  </span>
                                </li>
                                <li className="mb-2">
                                  <strong>Collection Efficiency:</strong> 
                                  <span className="ms-2 text-success">
                                    {((selectedInvoiceInfo.totalPayments / selectedInvoiceInfo.originalAmount) * 100).toFixed(2)}%
                                  </span>
                                </li>
                                <li className="mb-2">
                                  <strong>Days to First Payment:</strong> 
                                  <span className="ms-2 text-warning">
                                    {Math.floor((new Date(selectedInvoiceInfo.firstPaymentDate) - new Date(selectedInvoiceInfo.createdAt)) / (1000 * 60 * 60 * 24))} days
                                  </span>
                                </li>
                                <li className="mb-2">
                                  <strong>Remaining Amount:</strong> 
                                  <span className={`ms-2 ${selectedInvoiceInfo.balance > 0 ? 'text-danger' : 'text-success'}`}>
                                    {formatCurrency(selectedInvoiceInfo.balance)}
                                  </span>
                                </li>
                              </ul>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              
              </div>
              <div className="modal-footer gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentDetails(false)}
                >
                  <i className="ti ti-x me-1"></i> Close
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    // Create detailed CSV for this specific invoice
                    const csvData = selectedInvoicePayments.map((payment, index) => [
                      index + 1,
                      selectedInvoiceInfo.docnumber,
                      selectedInvoiceInfo.name,
                      formatDate(payment.paymentDate),
                      payment.paymentDocNumber || 'N/A',
                      payment.paymentAmount || 0,
                      payment.paymentMethod || 'N/A',
                      payment.status || 'N/A',
                      payment.previousBalance || 0,
                      payment.newBalance || 0,
                      payment.description || 'N/A',
                      formatDateTime(payment.createdAt || payment.paymentDate)
                    ]);

                    const headers = [
                      'S.No', 'Invoice Number', 'Entity Name', 'Payment Date', 'Payment Doc Number',
                      'Payment Amount', 'Payment Method', 'Status', 'Balance Before', 'Balance After',
                      'Description', 'Created At'
                    ];

                    const csvContent = [
                      headers.join(','),
                      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `invoice_${selectedInvoiceInfo.docnumber}_payment_details_${new Date().toISOString().slice(0, 10)}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <i className="ti ti-download me-1"></i> Export to CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Download {downloadType === 'vendor' ? 'Vendor' : 'Customer'} Payment Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDownloadModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>
                    {downloadEntity ?
                      `${downloadType === 'vendor' ? 'Vendor' : 'Customer'}: ${downloadEntity}` :
                      `All ${downloadType === 'vendor' ? 'Vendors' : 'Customers'}`
                    }
                  </strong>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">From Date (Optional):</label>
                    <input
                      type="date"
                      className="form-control"
                      value={downloadDateFrom}
                      onChange={e => setDownloadDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">To Date (Optional):</label>
                    <input
                      type="date"
                      className="form-control"
                      value={downloadDateTo}
                      onChange={e => setDownloadDateTo(e.target.value)}
                    />
                  </div>
                </div>
                {/* <div className="mt-3">
                  <small className="text-muted">
                    <strong>Export Includes:</strong> Invoice-specific payment tracking with complete audit trail and analytics.
                    Each row represents one invoice with all its payment details consolidated.
                  </small>
                </div> */}
              </div>
              <div className="modal-footer gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDownload}
                >
                  <i className="ti ti-download"></i> Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ledger;