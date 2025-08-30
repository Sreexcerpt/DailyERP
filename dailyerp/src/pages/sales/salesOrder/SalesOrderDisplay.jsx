import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SalesOrderDisplay() {
  const [pos, setPos] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = localStorage.getItem('selectedCompanyId') || '';
  const financialYear = localStorage.getItem('financialYear') || '';
  // Search functionality
  const [globalSearch, setGlobalSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const filtered = pos.filter(po => {
      const searchMatch =
        po.soNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.poNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.vendor?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.customer?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.category?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.quotationNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.deliveryLocation?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        po.deliveryAddress?.toLowerCase().includes(globalSearch.toLowerCase());

      const createdAt = new Date(po.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const dateMatch =
        (!from || createdAt >= from) &&
        (!to || createdAt <= to);

      return searchMatch && dateMatch;
    });

    setFilteredPos(filtered);
  }, [globalSearch, fromDate, toDate, pos]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/sales-orders', {
      params: { companyId, financialYear }
    })
      .then(res => {
        // Sort by createdAt (latest first)
        const sortedData = res.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setPos(sortedData);
        setFilteredPos(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching POs:', err);
        alert('Failed to fetch POs');
        setLoading(false);
      });
  };




  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPos.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrint = (po) => {
    const itemRows = po.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.materialId}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${item.baseUnit}</td>
        <td>${item.unit}</td>
        <td>${item.orderUnit}</td>
        <td>${item.price}</td>
        <td>${item.salesGroup}</td>
        <td>${item.materialgroup}</td>
        <td>${item.deliveryDate}</td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head>
        <title>Sales Order - ${po.soNumber}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h2>sales Order Details</h2>
        <p><strong>PO Number:</strong> ${po.poNumber}</p>
        <p><strong>Date:</strong> ${po.date}</p>
        <p><strong>Vendor:</strong> ${po.vendor}</p>
        <p><strong>Category:</strong> ${po.category}</p>
        <p><strong>Quotation Number:</strong> ${po.quotationNumber}</p>
        <p><strong>Delivery Location:</strong> ${po.deliveryLocation}</p>
        <p><strong>Delivery Address:</strong> ${po.deliveryAddress}</p>

        <h3>Item Details</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Material ID</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Base Unit</th>
              <th>Unit</th>
              <th>Order Unit</th>
              <th>Price</th>
              <th>Buyer Group</th>
              <th>Material Group</th>
              <th>Delivery Date</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <h3>Tax Summary</h3>
        <p><strong>Total:</strong> ₹${po.total}</p>
        <p><strong>Tax Name:</strong> ${po.taxName}</p>
        <p><strong>CGST:</strong> ${po.cgst}%</p>
        <p><strong>SGST:</strong> ${po.sgst}%</p>
        <p><strong>IGST:</strong> ${po.igst}%</p>
        <p><strong>Tax Discount:</strong> ₹${po.taxDiscount}</p>
        <p><strong>Final Total:</strong> ₹${po.finalTotal}</p>
      </body>
      </html>
    `;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <div className='content'>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Sales Order Display</h2>
        <div className="row">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search PO Number, Vendor, Category, etc."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-md-3">
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
          <div className="col-md-3">
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
          <div className="col-md-2 mb-1">
            <button className="btn btn-secondary w-100" onClick={() => {
              setGlobalSearch('');
              setFromDate('');
              setToDate('');
              setCurrentPage(1);
            }}>
              Reset Filters
            </button>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Results Summary */}


          {/* Purchase Orders Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className='table table-sm table-bordered table-hover'>
                  <thead className="table-light">
                    <tr>
                      <th>SO Number</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Quotation Number</th>
                      <th>Delivery Location</th>
                      <th>Delivery Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((po) => (
                        <tr key={po._id}>
                          <td>{po.soNumber}</td>
                          <td>{po.date}</td>
                          <td>{po.customerName}</td>
                          <td>{po.category}</td>
                          <td>{po.quotationNumber}</td>
                          <td>{po.deliveryLocation}</td>
                          <td>{po.deliveryAddress}</td>
                          <td>
                            <button className='btn btn-primary btn-sm' onClick={() => handlePrint(po)}>
                              <i className="fas fa-print me-1"></i>Print
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
                          <p className="text-muted mb-0">No sales orders found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="sales Orders pagination">
              <ul className="pagination justify-content-end">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
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
                        <button
                          className="page-link"
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      </li>
                    );
                  });
                })()}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
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

      {/* Search Modal */}

    </div>
  );
}

export default SalesOrderDisplay;