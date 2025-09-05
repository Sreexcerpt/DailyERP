import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SalesDeliveryDisplay() {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const companyId = localStorage.getItem('selectedCompanyId') || '';
  const financialYear = localStorage.getItem('financialYear') || '';
  
  // Search functionality
  const [globalSearch, setGlobalSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const filtered = deliveries.filter(delivery => {
      const searchMatch =
        delivery.deliveryNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.soNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.customerName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.category?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.deliveryLocation?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.vehicleNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        delivery.driverName?.toLowerCase().includes(globalSearch.toLowerCase());

      const createdAt = new Date(delivery.createdAt);
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      const dateMatch =
        (!from || createdAt >= from) &&
        (!to || createdAt <= to);

      const statusMatch = !statusFilter || delivery.deliveryStatus === statusFilter;
      const typeMatch = !typeFilter || delivery.deliveryType === typeFilter;

      return searchMatch && dateMatch && statusMatch && typeMatch;
    });

    setFilteredDeliveries(filtered);
  }, [globalSearch, fromDate, toDate, statusFilter, typeFilter, deliveries]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchSalesDeliveries();
  }, []);

  const fetchSalesDeliveries = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/del/salesdeliveries', {
      params: { companyId, financialYear }
    })
      .then(res => {
        // Sort by createdAt (latest first)
        const sortedData = res.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setDeliveries(sortedData);
        setFilteredDeliveries(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching deliveries:', err);
        alert('Failed to fetch deliveries');
        setLoading(false);
      });
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeliveries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-warning',
      'In Transit': 'bg-info',
      'Delivered': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return `badge ${statusClasses[status] || 'bg-secondary'}`;
  };

  const getTypeBadge = (type) => {
    return type === 'Full' ? 'badge bg-success' : 'badge bg-warning';
  };

  const handlePrint = (delivery) => {
    const itemRows = delivery.items.map((item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${item.materialId}</td>
        <td>${item.description}</td>
        <td>${item.orderedQuantity}</td>
        <td>${item.deliveredQuantity}</td>
        <td>${item.pendingQuantity}</td>
        <td>${item.baseUnit}</td>
        <td>${item.price}</td>
        <td>${item.deliveryDate}</td>
        <td>${item.actualDeliveryDate}</td>
        <td>${item.note || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head>
        <title>Sales Delivery - ${delivery.deliveryNumber}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f0f0f0; }
          .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .status-badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
          .status-delivered { background-color: #28a745; }
          .status-pending { background-color: #ffc107; color: black; }
          .status-transit { background-color: #17a2b8; }
          .status-cancelled { background-color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="header-info">
          <div>
            <h2>Sales Delivery Details</h2>
            <p><strong>Delivery Number:</strong> ${delivery.deliveryNumber}</p>
            <p><strong>SO Reference:</strong> ${delivery.soNumber}</p>
            <p><strong>Customer:</strong> ${delivery.customerName}</p>
            <p><strong>Category:</strong> ${delivery.category}</p>
          </div>
          <div>
            <p><strong>Delivery Date:</strong> ${delivery.deliveryDate}</p>
            <p><strong>Actual Delivery:</strong> ${delivery.actualDeliveryDate}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${delivery.deliveryStatus.toLowerCase()}">${delivery.deliveryStatus}</span></p>
            <p><strong>Type:</strong> ${delivery.deliveryType}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Delivery Information</h3>
          <p><strong>Delivery Location:</strong> ${delivery.deliveryLocation}</p>
          <p><strong>Delivery Address:</strong> ${delivery.deliveryAddress}</p>
          <p><strong>Contact Person:</strong> ${delivery.contactPerson}</p>
          <p><strong>Sales Group:</strong> ${delivery.salesGroup}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3>Transport Details</h3>
          <p><strong>Transport Details:</strong> ${delivery.transportDetails || 'N/A'}</p>
          <p><strong>Vehicle Number:</strong> ${delivery.vehicleNumber || 'N/A'}</p>
          <p><strong>Driver Name:</strong> ${delivery.driverName || 'N/A'}</p>
          <p><strong>Driver Phone:</strong> ${delivery.driverPhone || 'N/A'}</p>
        </div>

        <h3>Item Details</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Material ID</th>
              <th>Description</th>
              <th>Ordered Qty</th>
              <th>Delivered Qty</th>
              <th>Pending Qty</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Delivery Date</th>
              <th>Actual Delivery</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="margin-top: 20px;">
          <h3>Summary</h3>
          <p><strong>Total Delivered Amount:</strong> ₹${delivery.total}</p>
          <p><strong>Remarks:</strong> ${delivery.remarks || 'None'}</p>
        </div>
      </body>
      </html>
    `;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8080/api/del/salesdeliveries/${deliveryId}/status`, {
        deliveryStatus: newStatus,
        actualDeliveryDate: newStatus === 'Delivered' ? new Date().toISOString().substring(0, 10) : undefined
      });
      
      // Refresh the data
      fetchSalesDeliveries();
      alert(`Delivery status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update delivery status');
    }
  };

  return (
    <div className='content'>
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-4">
        <div className="my-auto">
          <h2 className="mb-1">Sales Delivery Display</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">Sales</li>
              <li className="breadcrumb-item active" aria-current="page">Deliveries</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex">
          <button className="btn btn-primary" onClick={fetchSalesDeliveries}>
            <i className="fas fa-sync me-1"></i>Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search delivery number, SO, customer..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
              <label className="form-label">To Date</label>
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
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-secondary w-100" 
                onClick={() => {
                  setGlobalSearch('');
                  setFromDate('');
                  setToDate('');
                  setStatusFilter('');
                  setTypeFilter('');
                  setCurrentPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading deliveries...</p>
        </div>
      ) : (
        <>
          {/* Deliveries Table */}
          <div className="card">
            <div className="card-body">
              <div className="">
                <table className='table table-sm table-bordered'>
                  <thead className="table-light">
                    <tr>
                      <th>Delivery Number</th>
                      <th>SO Reference</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Delivery Location</th>
                      <th>Status</th>
                      <th>Type</th>
                      <th>Total Amount</th>
                      <th>Vehicle</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((delivery) => (
                        <tr key={delivery._id}>
                          <td>
                            <strong>{delivery.deliveryNumber}</strong>
                          </td>
                          <td>
                            <span className="badge bg-primary">{delivery.soNumber}</span>
                          </td>
                          <td>{new Date(delivery.deliveryDate).toLocaleDateString()}</td>
                          <td>{delivery.customerName}</td>
                          <td>{delivery.deliveryLocation}</td>
                          <td>
                            <span className={getStatusBadge(delivery.deliveryStatus)}>
                              {delivery.deliveryStatus}
                            </span>
                          </td>
                          <td>
                            <span className={getTypeBadge(delivery.deliveryType)}>
                              {delivery.deliveryType}
                            </span>
                          </td>
                          <td>₹{delivery.total}</td>
                          <td>{delivery.vehicleNumber || 'N/A'}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button 
                                className='btn btn-primary btn-sm' 
                                onClick={() => handlePrint(delivery)}
                                title="Print Delivery"
                              >
                                <i className="fas fa-print"></i>
                              </button>
                              
                              {delivery.deliveryStatus !== 'Delivered' && delivery.deliveryStatus !== 'Cancelled' && (
                                <div className="btn-group" role="group">
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    title="Update Status"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <ul className="dropdown-menu">
                                    {delivery.deliveryStatus !== 'In Transit' && (
                                      <li>
                                        <a 
                                          className="dropdown-item" 
                                          href="#"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleStatusUpdate(delivery._id, 'In Transit');
                                          }}
                                        >
                                          <i className="fas fa-truck me-2"></i>Mark In Transit
                                        </a>
                                      </li>
                                    )}
                                    <li>
                                      <a 
                                        className="dropdown-item" 
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleStatusUpdate(delivery._id, 'Delivered');
                                        }}
                                      >
                                        <i className="fas fa-check me-2"></i>Mark Delivered
                                      </a>
                                    </li>
                                    <li>
                                      <a 
                                        className="dropdown-item text-danger" 
                                        href="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (confirm('Are you sure you want to cancel this delivery?')) {
                                            handleStatusUpdate(delivery._id, 'Cancelled');
                                          }
                                        }}
                                      >
                                        <i className="fas fa-times me-2"></i>Cancel
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <i className="fas fa-truck fa-2x text-muted mb-2"></i>
                          <p className="text-muted mb-0">No sales deliveries found</p>
                          {(globalSearch || fromDate || toDate || statusFilter || typeFilter) && (
                            <small className="text-muted">Try adjusting your filters</small>
                          )}
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
            <nav aria-label="Sales Deliveries pagination" className="mt-3">
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
                  const delta = 2;
                  const range = [];
                  const rangeWithDots = [];

                  range.push(1);

                  for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                    range.push(i);
                  }

                  if (totalPages > 1) {
                    range.push(totalPages);
                  }

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
    </div>
  );
}

export default SalesDeliveryDisplay;