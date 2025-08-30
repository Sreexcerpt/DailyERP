import React, { useState, useEffect } from "react";
import axios from "axios";

function GoodsTransferList() {
  const [transfers, setTransfers] = useState([]);
  const [filteredTransfers, setFilteredTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    docnumber: "",
    dateFrom: "",
    dateTo: "",
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    fetchTransfers();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transfers, filters]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/goodsTransfer", {
        params: { companyId, financialYear },
      });
      setTransfers(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch goods transfers");
      console.error("Error fetching transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await axios.get("http://localhost:8080/api/goodsTransferCategory", {
        params: { companyId, financialYear },
      });
      setCategories(categoriesResponse.data);

      // Fetch locations
      const locationsResponse = await axios.get("http://localhost:8080/api/locations", {
        params: { companyId, financialYear },
      });
      setLocations(locationsResponse.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...transfers];

    if (filters.category) {
      filtered = filtered.filter(transfer => 
        transfer.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(transfer => 
        transfer.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.docnumber) {
      filtered = filtered.filter(transfer => 
        transfer.docnumber.toLowerCase().includes(filters.docnumber.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(transfer => 
        new Date(transfer.docDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(transfer => 
        new Date(transfer.docDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredTransfers(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      location: "",
      docnumber: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleView = (transfer) => {
    setSelectedTransfer(transfer);
    setShowViewModal(true);
  };

  const handlePrint = (transfer) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printContent = generatePrintContent(transfer);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const generatePrintContent = (transfer) => {
    const currentDate = new Date().toLocaleString();
    const totalValue = calculateTotal(transfer.items);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Goods Transfer - ${transfer.docnumber}</title>
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
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              font-weight: bold;
              color: #666;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-box {
              width: 48%;
            }
            .info-box h4 {
              background-color: #f8f9fa;
              padding: 8px;
              margin: 0 0 10px 0;
              border-left: 4px solid #007bff;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
            }
            .info-table td {
              padding: 5px;
              border-bottom: 1px solid #eee;
            }
            .info-table td:first-child {
              font-weight: bold;
              width: 40%;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .items-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .total-row {
              background-color: #e9ecef !important;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              border-top: 1px solid #333;
              padding-top: 20px;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
            }
            .signature-box {
              width: 200px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Your Company Name</div>
            <div class="document-title">GOODS TRANSFER DOCUMENT</div>
          </div>

          <div class="info-section">
            <div class="info-box">
              <h4>Document Information</h4>
              <table class="info-table">
                <tr>
                  <td>Document No:</td>
                  <td><strong>${transfer.docnumber}</strong></td>
                </tr>
                <tr>
                  <td>Category:</td>
                  <td>${transfer.category}</td>
                </tr>
                <tr>
                  <td>Description:</td>
                  <td>${transfer.catdesc || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Location:</td>
                  <td>${transfer.location}</td>
                </tr>
              </table>
            </div>
            
            <div class="info-box">
              <h4>Dates & Reference</h4>
              <table class="info-table">
                <tr>
                  <td>Document Date:</td>
                  <td>${formatDate(transfer.docDate)}</td>
                </tr>
                <tr>
                  <td>Posting Date:</td>
                  <td>${formatDate(transfer.postDate)}</td>
                </tr>
                <tr>
                  <td>Reference:</td>
                  <td>${transfer.reference || 'N/A'}</td>
                </tr>
                <tr>
                  <td>Print Date:</td>
                  <td>${currentDate}</td>
                </tr>
              </table>
            </div>
          </div>

          <h4>Items Details</h4>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 15%">Material ID</th>
                <th style="width: 25%">Description</th>
                <th style="width: 8%">Qty</th>
                <th style="width: 8%">UOM</th>
                <th style="width: 10%">Price</th>
                <th style="width: 10%">Total</th>
                <th style="width: 10%">Del Date</th>
                <th style="width: 9%">Lot No</th>
              </tr>
            </thead>
            <tbody>
              ${transfer.items ? transfer.items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.materialId || 'N/A'}</td>
                  <td>${item.description || 'N/A'}</td>
                  <td>${item.quantity || '0'}</td>
                  <td>${item.baseUnit || 'N/A'}</td>
                  <td>₹${item.price || '0.00'}</td>
                  <td>₹${(parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}</td>
                  <td>${formatDate(item.deliveryDate)}</td>
                  <td>${item.lotNo || 'N/A'}</td>
                </tr>
              `).join('') : '<tr><td colspan="9" style="text-align: center;">No items found</td></tr>'}
              <tr class="total-row">
                <td colspan="6" style="text-align: right;"><strong>GRAND TOTAL:</strong></td>
                <td><strong>₹${totalValue}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">Prepared By</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Checked By</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Approved By</div>
              </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
              <p>This is a computer generated document. No signature required.</p>
              <p>Generated on: ${currentDate} | User: ${localStorage.getItem('userLogin') || 'System'}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      return total + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="container p-3">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading goods transfers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4><i className="fas fa-truck me-2"></i>Goods Transfer List</h4>
     
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="card mb-3">
        <div className="card-header">
          <h6 className="mb-0"><i className="fas fa-filter me-2"></i>Filters</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.categoryName}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Location</label>
              <select 
                className="form-select"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc.name || loc.locationName}>{loc.name || loc.locationName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Document No</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Search document..."
                value={filters.docnumber}
                onChange={(e) => handleFilterChange("docnumber", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Date From</label>
              <input 
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Date To</label>
              <input 
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">&nbsp;</label>
              <div className="d-grid">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times me-1"></i>Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-3">
        <small className="text-muted">
          Showing {filteredTransfers.length} of {transfers.length} records
        </small>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-body">
          {filteredTransfers.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No goods transfers found</h5>
              <p className="text-muted">Try adjusting your filters or create a new goods transfer.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Document No</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Document Date</th>
                    <th>Posting Date</th>
                    <th>Reference</th>
                    <th>Items Count</th>
                    <th>Total Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransfers.map((transfer, idx) => (
                    <tr key={transfer._id || idx}>
                      <td>{idx + 1}</td>
                      <td>{transfer.docnumber}</td>
                      <td>{transfer.category}</td>
                      <td>{transfer.location}</td>
                      <td>{formatDate(transfer.docDate)}</td>
                      <td>{formatDate(transfer.postDate)}</td>
                      <td>{transfer.reference}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {transfer.items ? transfer.items.length : 0}
                        </span>
                      </td>
                      <td>
                        <strong>₹{calculateTotal(transfer.items)}</strong>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleView(transfer)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handlePrint(transfer)}
                            title="Print Document"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedTransfer && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-file-alt me-2"></i>
                  Goods Transfer Details - {selectedTransfer.docnumber}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Header Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Document Information</h6>
                      </div>
                      <div className="card-body">
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <th width="40%">Document No:</th>
                              <td><span className="badge bg-primary">{selectedTransfer.docnumber}</span></td>
                            </tr>
                            <tr>
                              <th>Category:</th>
                              <td><span className="badge bg-info">{selectedTransfer.category}</span></td>
                            </tr>
                            <tr>
                              <th>Description:</th>
                              <td>{selectedTransfer.catdesc}</td>
                            </tr>
                            <tr>
                              <th>Location:</th>
                              <td>{selectedTransfer.location}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">Dates & Reference</h6>
                      </div>
                      <div className="card-body">
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <th width="40%">Document Date:</th>
                              <td>{formatDate(selectedTransfer.docDate)}</td>
                            </tr>
                            <tr>
                              <th>Posting Date:</th>
                              <td>{formatDate(selectedTransfer.postDate)}</td>
                            </tr>
                            <tr>
                              <th>Reference:</th>
                              <td>{selectedTransfer.reference}</td>
                            </tr>
                            <tr>
                              <th>Created Date:</th>
                              <td>{formatDate(selectedTransfer.date)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Details */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Items Details</h6>
                    <button 
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handlePrint(selectedTransfer)}
                    >
                      <i className="fas fa-print me-1"></i>Print
                    </button>
                  </div>
                  <div className="card-body">
                    {selectedTransfer.items && selectedTransfer.items.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-striped">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Material ID</th>
                              <th>Description</th>
                              <th>Quantity</th>
                              <th>UOM</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Delivery Date</th>
                              <th>Lot No</th>
                              <th>Text</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTransfer.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td><code>{item.materialId}</code></td>
                                <td>{item.description}</td>
                                <td>{item.quantity}</td>
                                <td>{item.baseUnit}</td>
                                <td>₹{item.price}</td>
                                <td><strong>₹{(parseFloat(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}</strong></td>
                                <td>{formatDate(item.deliveryDate)}</td>
                                <td>{item.lotNo}</td>
                                <td>{item.text}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <th colSpan="6" className="text-end">Grand Total:</th>
                              <th>₹{calculateTotal(selectedTransfer.items)}</th>
                              <th colSpan="3"></th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <i className="fas fa-box-open fa-2x text-muted mb-2"></i>
                        <p className="text-muted">No items found for this transfer</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => handlePrint(selectedTransfer)}
                >
                  <i className="fas fa-print me-1"></i>Print Document
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowViewModal(false)}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoodsTransferList;