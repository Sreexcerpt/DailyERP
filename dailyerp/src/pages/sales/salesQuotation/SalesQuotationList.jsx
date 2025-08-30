import React, { useEffect, useState } from 'react';
import axios from 'axios';

function QuotationListPage() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  useEffect(() => {
    axios.get('http://localhost:8080/api/salesquotations', { params: { companyId, financialYear }, })
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setQuotations(sorted);
      })
      .catch(err => {
        console.error('Failed to fetch quotations', err);
        alert('Error loading quotations');
      });
  }, []);

  const handlePrint = (quotation) => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Print Quotation</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Quotation: ${quotation.quotationNumber}</h2>
          <p><strong>Indent ID:</strong> ${quotation.indentId}</p>
          <p><strong>Customer Name:</strong> ${quotation.customerName}</p>
          <p><strong>Validity Date:</strong> ${quotation.validityDate}</p>
          <p><strong>Note:</strong> ${quotation.note}</p>
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
              ${quotation.items.map((item, idx) => {
      const total = item.qty * parseFloat(item.price || 0);
      return `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.materialId}</td>
                      <td>${item.description}</td>
                      <td>${item.qty}</td>
                      <td>${item.baseUnit}</td>
                      <td>${item.orderUnit}</td>
                      <td>${item.location}</td>
                      <td>${item.unit}</td>
                      <td>${item.price}</td>
                      <td>${total.toFixed(2)}</td>
                    </tr>
                  `;
    }).join('')
      }
              <tr>
                <td colspan="9" style="text-align:right;"><strong>Grand Total</strong></td>
                <td><strong>${quotation.items.reduce((acc, item) => acc + (item.qty * parseFloat(item.price || 0)), 0).toFixed(2)
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
  const filteredQuotations = quotations.filter(q => {
    const matchSearch = (
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.indentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const createdAt = new Date(q.createdAt);
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
  const currentQuotations = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Sales Quotation List</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Sales
              </li>
              <li className="breadcrumb-item">
                Sales Report
              </li>
              <li className="breadcrumb-item active" aria-current="page">Sales Quotation List</li>
            </ol>
          </nav>
        </div>
      </div>



      <div className="card">
        <div className="card-header">
          <div className="row">
            <div className="col-xl-6"></div>
            <div className="col-xl-2">
              <div className="input-group">
                <span className="input-group-text"><i className="fas fa-search"></i></span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by Quotation No, Indent ID or Customer Name"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                /></div>
            </div>
            <div className=" col-xl-3  d-flex gap-2">
              {/* Date Range Filters */}
              <label>From:</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <label>To:</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <div className="card-body">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Indent ID</th>
                <th>Customer Name</th>
                <th>Location</th>
                <th>Validity Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentQuotations.map((quotation, index) => (
                <tr key={index}>
                  <td className='text-flex'>{quotation.quotationNumber}</td>
                  <td className='text-flex'>{quotation.indentId}</td>
                  <td className='text-flex'>{quotation.customerName}</td>
                  <td className='text-flex'>{quotation.location}</td>
                  <td className='text-flex'>{quotation.validityDate}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handlePrint(quotation)}>
                      <i className="fas fa-print"></i> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav className='ms-auto'>
          <ul className="pagination justify-content-end">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                onClick={() => paginate(currentPage - 1)}
                className="page-link"
                disabled={currentPage === 1}
              >
                <span aria-hidden="true"><i className="fas fa-angle-left"></i></span>
              </button>
            </li>

            {(() => {
              const delta = 2; // Number of pages to show on each side of current page
              const range = [];
              const rangeWithDots = [];

              // Always show first page
              range.push(1);

              // Add pages around current page
              for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                range.push(i);
              }

              // Always show last page if there are more than 1 page
              if (totalPages > 1) {
                range.push(totalPages);
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
                    <li key={`ellipsis-${index}`} className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  );
                }

                return (
                  <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                    <button onClick={() => paginate(number)} className="page-link">
                      {number}
                    </button>
                  </li>
                );
              });
            })()}

            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                onClick={() => paginate(currentPage + 1)}
                className="page-link"
                disabled={currentPage === totalPages}
              >
                <span aria-hidden="true"><i className="fas fa-angle-right"></i></span>
              </button>
            </li>
          </ul>
        </nav>
      )}

    </div>
  );
}

export default QuotationListPage;