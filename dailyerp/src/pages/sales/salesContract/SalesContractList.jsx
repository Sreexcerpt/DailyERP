import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ContractListPage() {
  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  useEffect(() => {
    axios.get('http://localhost:8080/api/salescontracts', { params: { companyId, financialYear }, })
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setContracts(sorted);
      })
      .catch(err => {
        console.error('Failed to fetch contracts', err);
        alert('Error loading contracts');
      });
  }, []);

  const handlePrint = (contract) => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Print Contract</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            .contract-header { margin-bottom: 20px; }
            .validity-dates { display: flex; gap: 20px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="contract-header">
            <h2>Sales Contract: ${contract.contractNumber}</h2>
            <p><strong>Indent ID:</strong> ${contract.indentId}</p>
            <p><strong>Customer Name:</strong> ${contract.customerName}</p>
            <div class="validity-dates">
              <p><strong>Validity From:</strong> ${contract.validityFromDate || 'N/A'}</p>
              <p><strong>Validity To:</strong> ${contract.validityToDate || 'N/A'}</p>
            </div>
            <p><strong>Location:</strong> ${contract.location || 'N/A'}</p>
            <p><strong>Sales Group:</strong> ${contract.salesGroup || 'N/A'}</p>
            <p><strong>Note:</strong> ${contract.note || 'N/A'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Material ID</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Base Unit</th>
                <th>Order Unit</th>
                <th>Location</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                contract.items.map((item, idx) => {
                  const total = item.qty * parseFloat(item.price || 0);
                  return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.materialId || 'N/A'}</td>
                      <td>${item.description || 'N/A'}</td>
                      <td>${item.qty || 0}</td>
                      <td>${item.baseUnit || 'N/A'}</td>
                      <td>${item.orderUnit || 'N/A'}</td>
                      <td>${item.location || 'N/A'}</td>
                      <td>${item.unit || 'N/A'}</td>
                      <td>${item.price || 0}</td>
                      <td>${total.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')
              }
              <tr>
                <td colspan="9" style="text-align:right;"><strong>Grand Total</strong></td>
                <td><strong>${
                  contract.items.reduce((acc, item) => acc + (item.qty * parseFloat(item.price || 0)), 0).toFixed(2)
                }</strong></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Search filter
  const filteredContracts = contracts.filter(c => {
    const matchSearch = (
      c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.indentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createdAt = new Date(c.createdAt);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const matchDate = (
      (!from || createdAt >= from) &&
      (!to || createdAt <= to)
    );

    return matchSearch && matchDate;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Sales Contracts</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">Sales</li>
              <li className="breadcrumb-item active" aria-current="page">Contract List</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="fas fa-file-contract me-2"></i>
            Saved Sales Contracts
          </h5>
        </div>
        <div className="card-body">
          {/* Search and Filter Section */}
          <div className="row mb-3">
            <div className="col-md-12">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Contract No, Indent ID, Customer Name, or Location"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                min={fromDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setFromDate('');
                  setToDate('');
                  setCurrentPage(1);
                }}
              >
                <i className="fas fa-refresh me-1"></i>Reset Filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Showing {currentContracts.length} of {filteredContracts.length} contracts
            {(searchTerm || fromDate || toDate) && ` (filtered from ${contracts.length} total)`}
          </div>

          {/* Contracts Table */}
          {currentContracts.length === 0 ? (
            <div className="text-center py-4">
              <i className="fas fa-file-contract fa-3x text-muted mb-3"></i>
              <p className="text-muted">
                {contracts.length === 0 
                  ? "No contracts found. Create your first contract!" 
                  : "No contracts match your search criteria."}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Contract No</th>
                      <th>Indent ID</th>
                      <th>Customer Name</th>
                      <th>Location</th>
                      <th>Validity From</th>
                      <th>Validity To</th>
                      <th>Created Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentContracts.map((contract, index) => (
                      <tr key={index}>
                        <td>
                          <span className="badge bg-primary">
                            {contract.contractNumber}
                          </span>
                        </td>
                        <td>{contract.indentId}</td>
                        <td>{contract.customerName}</td>
                        <td>{contract.location || 'N/A'}</td>
                        <td>
                          {contract.validityFromDate 
                            ? new Date(contract.validityFromDate).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td>
                          {contract.validityToDate 
                            ? new Date(contract.validityToDate).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td>
                          {contract.createdAt 
                            ? new Date(contract.createdAt).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handlePrint(contract)}
                              title="Print Contract"
                            >
                              <i className="fas fa-print me-1"></i>Print
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                            >
                              <i className="fas fa-eye me-1"></i>View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)} 
                        className="page-link"
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button onClick={() => paginate(i + 1)} className="page-link">
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button 
                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)} 
                        className="page-link"
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContractListPage;