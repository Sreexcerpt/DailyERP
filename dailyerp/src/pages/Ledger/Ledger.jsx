import React, { useEffect, useState } from "react";
import axios from "axios";

function Ledger() {
  const [vendorInvoice, setVendorInvoice] = useState([]);
  const [customerInvoice, setCustomerInvoice] = useState([]);
  const [vendorPage, setVendorPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [loading, setLoading] = useState(false);
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
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const vendorResponse = await axios.get("http://localhost:8080/api/invoiceform", {
        params: { companyId, financialYear }
      });
      const customerResponse = await axios.get("http://localhost:8080/api/billingform", {
        params: { companyId, financialYear }
      });

      console.log("vendorResponse", vendorResponse, customerResponse);
      setVendorInvoice(vendorResponse.data || []);
      setCustomerInvoice(customerResponse.data || []);

      // Calculate summaries
      calculateSummaries(vendorResponse.data || [], customerResponse.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (vendorData, customerData) => {
    // Vendor Summary
    const vendorSummary = vendorData.reduce((acc, item) => {
      const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || item.netAmount || 0) : 0;
      const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || item.netAmount || 0) : 0;
      const balance = item.balance || 0;

      // Apply the balance logic
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

    // Customer Summary
    const customerSummary = customerData.reduce((acc, item) => {
      const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || 0) : 0;
      const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || 0) : 0;
      const balance = item.balance || 0;

      // Apply the balance logic
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

    // If debit has value and credit is zero, show credit as negative balance
    if (originalDebit > 0 && originalCredit === 0) {
      adjustedCredit = originalDebit - balance;
    }
    // If credit has value and debit is zero, show debit as negative balance
    else if (originalCredit > 0 && originalDebit === 0) {
      adjustedDebit = originalCredit - balance;
    }

    return { adjustedDebit, adjustedCredit };
  };

  const vendorData = vendorInvoice.map((item, index) => {
    const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || item.netAmount || 0) : 0;
    const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || item.netAmount || 0) : 0;
    const balance = item.balance || 0;

    const { adjustedDebit, adjustedCredit } = processAccountingEntry(originalDebit, originalCredit, balance);

    return {
      id: item._id || index,
      name: item?.vendor || "Unknown Vendor",
      docnumber: item?.docnumber || "_",
      debit: adjustedDebit,
      credit: adjustedCredit,
      balance: balance,
      originalAmount: item.finalTotal || item.netAmount || 0,
      lastPaymentAmount: item.lastPaymentAmount || 0,
      lastPaymentDate: item.lastPaymentDate || null,
      lastPaymentMethod: item.lastPaymentMethod || null,
      createdAt: item.createdAt || new Date(),
      category: item.category || 'debit',
      originalDebit: originalDebit,
      originalCredit: originalCredit
    };
  });

  const customerData = customerInvoice.map((item, index) => {
    const originalDebit = item.category?.toLowerCase() === "debit" ? (item.finalTotal || 0) : 0;
    const originalCredit = item.category?.toLowerCase() === "credit" ? (item.finalTotal || 0) : 0;
    const balance = item.balance || 0;

    const { adjustedDebit, adjustedCredit } = processAccountingEntry(originalDebit, originalCredit, balance);

    return {
      id: item._id || index,
      docnumber: item.docnumber || "_",
      name: item?.salesOrderId?.customer || "Unknown Customer",
      debit: adjustedDebit,
      credit: adjustedCredit,
      balance: balance,
      originalAmount: item.finalTotal || 0,
      lastPaymentAmount: item.lastPaymentAmount || 0,
      lastPaymentDate: item.lastPaymentDate || null,
      lastPaymentMethod: item.lastPaymentMethod || null,
      createdAt: item.createdAt || new Date(),
      category: item.category || 'debit',
      originalDebit: originalDebit,
      originalCredit: originalCredit
    };
  });

  const paginate = (data, page) =>
    data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalVendorPages = Math.ceil(vendorData.length / PAGE_SIZE);
  const totalCustomerPages = Math.ceil(customerData.length / PAGE_SIZE);

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

  return (
    <div className="content">
      {/* Header */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Ledger</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">Ledger</li>
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
            <i className="ti ti-refresh"></i> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header  text-white">
              <h6 className="mb-0">Vendor Summary</h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-muted mb-1">Total Debit</div>
                  <h6 className="text-danger">{formatCurrency(vendorSummary.totalDebit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Total Credit</div>
                  <h6 className="text-success">{formatCurrency(vendorSummary.totalCredit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Net Balance</div>
                  <h6 className={vendorSummary.totalBalance >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(vendorSummary.totalBalance)}
                  </h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Outstanding</div>
                  <h6 className="text-warning">{formatCurrency(vendorSummary.outstandingBalance)}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header  text-white">
              <h6 className="mb-0">Customer Summary</h6>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <div className="text-muted mb-1">Total Debit</div>
                  <h6 className="text-danger">{formatCurrency(customerSummary.totalDebit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Total Credit</div>
                  <h6 className="text-success">{formatCurrency(customerSummary.totalCredit)}</h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Net Balance</div>
                  <h6 className={customerSummary.totalBalance >= 0 ? "text-success" : "text-danger"}>
                    {formatCurrency(customerSummary.totalBalance)}
                  </h6>
                </div>
                <div className="col-3">
                  <div className="text-muted mb-1">Outstanding</div>
                  <h6 className="text-warning">{formatCurrency(customerSummary.outstandingBalance)}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Vendor Ledger */}
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header  text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Vendor Ledger</h5>
              <small>Total Records: {vendorData.length}</small>
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
                    <table className="table table-bordered table-hover">
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
                          <th>Last Payment</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(vendorData, vendorPage).map((entry, index) => {
                          const balanceStatus = getBalanceStatus(entry.balance, entry.originalAmount);
                          return (
                            <tr key={entry.id}>
                              <td>{(vendorPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>
                                <strong className="text-primary">{entry.docnumber}</strong>
                              </td>
                              <td>{entry.name}</td>
                              <td className="text-end">{formatCurrency(entry.originalAmount)}</td>
                              <td className={`text-end fw-bold ${getCellClass(entry.debit)}`}>
                                {formatCurrency(entry.debit)}
                                {entry.originalDebit > 0 && entry.originalCredit === 0 && entry.debit !== entry.originalDebit && (
                                  <small className="d-block text-muted">
                                    (Orig: {formatCurrency(entry.originalDebit)})
                                  </small>
                                )}
                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.credit)}`}>
                                {formatCurrency(entry.credit)}
                                {entry.originalCredit > 0 && entry.originalDebit === 0 && entry.credit !== entry.originalCredit && (
                                  <small className="d-block text-muted">
                                    (Orig: {formatCurrency(entry.originalCredit)})
                                  </small>
                                )}
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
                              </td>
                              <td className="text-center">
                                {entry.lastPaymentAmount > 0 ? (
                                  <div>
                                    <div className="text-success fw-bold">
                                      {formatCurrency(entry.lastPaymentAmount)}
                                    </div>
                                    <small className="text-muted">
                                      {entry.lastPaymentMethod}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="text-muted">No Payment</span>
                                )}
                              </td>
                              <td className="text-center">
                                <div>{formatDate(entry.createdAt)}</div>
                                {entry.lastPaymentDate && (
                                  <small className="text-muted">
                                    Paid: {formatDate(entry.lastPaymentDate)}
                                  </small>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setVendorPage((p) => Math.max(p - 1, 1))}
                      disabled={vendorPage === 1}
                    >
                      <i className="ti ti-chevron-left"></i> Previous
                    </button>
                    <span className="text-muted">
                      Page {vendorPage} of {totalVendorPages}
                      <small className="ms-2">
                        ({((vendorPage - 1) * PAGE_SIZE) + 1} - {Math.min(vendorPage * PAGE_SIZE, vendorData.length)} of {vendorData.length})
                      </small>
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setVendorPage((p) => Math.min(p + 1, totalVendorPages))}
                      disabled={vendorPage === totalVendorPages}
                    >
                      Next <i className="ti ti-chevron-right"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customer Ledger */}
        <div className="col-12">
          <div className="card">
            <div className="card-header  text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Customer Ledger</h5>
              <small>Total Records: {customerData.length}</small>
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
                    <table className="table table-bordered table-hover">
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
                          <th>Last Payment</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(customerData, customerPage).map((entry, index) => {
                          const balanceStatus = getBalanceStatus(entry.balance, entry.originalAmount);
                          return (
                            <tr key={entry.id}>
                              <td>{(customerPage - 1) * PAGE_SIZE + index + 1}</td>
                              <td>
                                <strong className="text-primary">{entry.docnumber}</strong>
                              </td>
                              <td>{entry.name}</td>
                              <td className="text-end">{formatCurrency(entry.originalAmount)}</td>
                              <td className={`text-end fw-bold ${getCellClass(entry.debit)}`}>
                                {formatCurrency(entry.debit)}
                                {entry.originalDebit > 0 && entry.originalCredit === 0 && entry.debit !== entry.originalDebit && (
                                  <small className="d-block text-muted">
                                    (Orig: {formatCurrency(entry.originalDebit)})
                                  </small>
                                )}
                              </td>
                              <td className={`text-end fw-bold ${getCellClass(entry.credit)}`}>
                                {formatCurrency(entry.credit)}
                                {entry.originalCredit > 0 && entry.originalDebit === 0 && entry.credit !== entry.originalCredit && (
                                  <small className="d-block text-muted">
                                    (Orig: {formatCurrency(entry.originalCredit)})
                                  </small>
                                )}
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
                              </td>
                              <td className="text-center">
                                {entry.lastPaymentAmount > 0 ? (
                                  <div>
                                    <div className="text-success fw-bold">
                                      {formatCurrency(entry.lastPaymentAmount)}
                                    </div>
                                    <small className="text-muted">
                                      {entry.lastPaymentMethod}
                                    </small>
                                  </div>
                                ) : (
                                  <span className="text-muted">No Payment</span>
                                )}
                              </td>
                              <td className="text-center">
                                <div>{formatDate(entry.createdAt)}</div>
                                {entry.lastPaymentDate && (
                                  <small className="text-muted">
                                    Paid: {formatDate(entry.lastPaymentDate)}
                                  </small>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setCustomerPage((p) => Math.max(p - 1, 1))}
                      disabled={customerPage === 1}
                    >
                      <i className="ti ti-chevron-left"></i> Previous
                    </button>
                    <span className="text-muted">
                      Page {customerPage} of {totalCustomerPages}
                      <small className="ms-2">
                        ({((customerPage - 1) * PAGE_SIZE) + 1} - {Math.min(customerPage * PAGE_SIZE, customerData.length)} of {customerData.length})
                      </small>
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setCustomerPage((p) => Math.min(p + 1, totalCustomerPages))}
                      disabled={customerPage === totalCustomerPages}
                    >
                      Next <i className="ti ti-chevron-right"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ledger;