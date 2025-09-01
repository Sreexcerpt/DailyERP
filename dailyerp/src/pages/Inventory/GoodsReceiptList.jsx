import React, { useEffect, useState } from "react";
import axios from "axios";

const PAGE_SIZE = 10;

const GoodsReceiptList = () => {
  const [goodsReceipts, setGoodsReceipts] = useState([]);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [postingDateFrom, setPostingDateFrom] = useState("");
  const [postingDateTo, setPostingDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');

  useEffect(() => {
    fetchGoodsReceipts();
  }, []);

  const fetchGoodsReceipts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/goodsreceipt', { params: { companyId, financialYear } });
      setGoodsReceipts(response.data);
    } catch (error) {
      console.error('Error fetching Goods Receipts:', error);
    }
  };

  // Print for individual receipt
  const handlePrint = (receipt) => {
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write('<html><head><title>Print Goods Receipt</title>');
    printWindow.document.write('<style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 6px; } h4 { margin-bottom: 10px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<h4>Goods Receipt</h4>`);
    printWindow.document.write('<table style="margin-bottom:10px;">');
    printWindow.document.write('<tbody>');
    printWindow.document.write(`<tr><td><strong>Document No:</strong></td><td>${receipt.docnumber}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Document Date:</strong></td><td>${receipt.documentDate}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Posting Date:</strong></td><td>${receipt.postingDate}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Reference:</strong></td><td>${receipt.reference}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Vendor:</strong></td><td>${receipt.vendor}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Location:</strong></td><td>${receipt.location}</td></tr>`);
    printWindow.document.write(`<tr><td><strong>Receipt Date:</strong></td><td>${receipt.receiptDate}</td></tr>`);
    printWindow.document.write('</tbody></table>');

    // Items Table
    printWindow.document.write('<h5>Items</h5>');
    printWindow.document.write('<table style="width:100%;">');
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th>#</th>');
    printWindow.document.write('<th>Material ID</th>');
    printWindow.document.write('<th>Description</th>');
    printWindow.document.write('<th>Quantity</th>');
    printWindow.document.write('<th>Base Unit</th>');
    printWindow.document.write('<th>Delivery Date</th>');
    printWindow.document.write('<th>Lot No</th>');
    printWindow.document.write('<th>Price</th>');
    printWindow.document.write('<th>Total</th>');
    printWindow.document.write('</tr></thead><tbody>');
    if (receipt.items && receipt.items.length > 0) {
      receipt.items.forEach((item, idx) => {
        printWindow.document.write('<tr>');
        printWindow.document.write(`<td>${idx + 1}</td>`);
        printWindow.document.write(`<td>${item.materialId}</td>`);
        printWindow.document.write(`<td>${item.description}</td>`);
        printWindow.document.write(`<td>${item.quantity}</td>`);
        printWindow.document.write(`<td>${item.baseUnit}</td>`);
        printWindow.document.write(`<td>${item.deliveryDate}</td>`);
        printWindow.document.write(`<td>${item.lotNo}</td>`);
        printWindow.document.write(`<td>${item.price}</td>`);
        printWindow.document.write(`<td>${(item.quantity * item.price).toFixed(2)}</td>`);
        printWindow.document.write('</tr>');
      });
    } else {
      printWindow.document.write('<tr><td colspan="9" style="text-align:center;">No items found</td></tr>');
    }
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Preview modal logic
  const handlePreview = (receipt) => {
    setPreviewReceipt(receipt);
  };

  const closePreview = () => {
    setPreviewReceipt(null);
  };

  // Search and postingDate range filter logic
  const filterReceipts = () => {
    return goodsReceipts.filter((receipt) => {
      // Posting Date range filter
      if (postingDateFrom) {
        const postingDateValue = receipt.postingDate ? receipt.postingDate.slice(0, 10) : "";
        if (postingDateValue < postingDateFrom) return false;
      }
      if (postingDateTo) {
        const postingDateValue = receipt.postingDate ? receipt.postingDate.slice(0, 10) : "";
        if (postingDateValue > postingDateTo) return false;
      }

      // Search term filter (ignore date fields)
      if (searchTerm.trim() !== "") {
        const term = searchTerm.trim().toLowerCase();
        const fieldsToSearch = [
          receipt.docnumber,
          receipt.reference,
          receipt.vendor,
          receipt.location
        ];
        // If any field contains the search term, include it
        const found = fieldsToSearch.some(val =>
          val && val.toLowerCase().includes(term)
        );
        if (!found) return false;
      }

      return true;
    });
  };

  const filteredReceipts = filterReceipts();

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / PAGE_SIZE) || 1;

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
  };

  // Reset filter and search
  const handleReset = () => {
    setSearchTerm("");
    setPostingDateFrom("");
    setPostingDateTo("");
    setCurrentPage(1);
  };

  // Receipts to show for current page
  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    // If current page exceeds total pages after filtering, reset to last page
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
    // eslint-disable-next-line
  }, [filteredReceipts, totalPages]);

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
          <div className="my-auto">
            <h2 className="mb-1">Goods Receipt List</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Inventory
                </li>
                <li className="breadcrumb-item">
                  Inventory Report
                </li>
                <li className="breadcrumb-item active" aria-current="page">Goods Receipt List</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-header">
                <div className="row ">
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search (Doc No, Reference, Vendor, Location)..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Posting Date From</label>
                    <input
                      type="date"
                      className="form-control"
                      value={postingDateFrom}
                      onChange={e => setPostingDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <label className="form-label">Posting Date To</label>
                    <input
                      type="date"
                      className="form-control"
                      value={postingDateTo}
                      onChange={e => setPostingDateTo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 mb-2 d-flex align-items-end">
                    <button className="btn btn-outline-secondary w-100" onClick={handleReset}>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive table-nowrap">
                  <table className="table table-sm mb-0 border">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Document No</th>
                        <th>Document Date</th>
                        <th>Posting Date</th>
                        <th>Reference</th>
                        <th>Vendor</th>
                        <th>Location</th>
                        <th>Receipt Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReceipts.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center">
                            No goods receipt records found.
                          </td>
                        </tr>
                      ) : (
                        paginatedReceipts.map((receipt, idx) => (
                          <tr key={receipt._id?.$oid || ((currentPage - 1) * PAGE_SIZE + idx)}>
                            <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                            <td>{receipt.docnumber}</td>
                            <td>{receipt.documentDate}</td>
                            <td>{receipt.postingDate}</td>
                            <td>{receipt.reference}</td>
                            <td>{receipt.vendor}</td>
                            <td>{receipt.location}</td>
                            <td>{receipt.receiptDate}</td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={() => handlePrint(receipt)}
                              >
                                Print
                              </button>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handlePreview(receipt)}
                              >
                                Preview
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="row mb-3">
                <div className="col-md-12">
                  <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-end">
                      <li
                        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link btn-sm"
                          onClick={() => handlePageChange(currentPage - 1)}
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
                            <li
                              key={number}
                              className={`page-item ${currentPage === number ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(number)}
                              >
                                {number}
                              </button>
                            </li>
                          );
                        });
                      })()}

                      <li
                        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link btn-sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <span aria-hidden="true"><i className="fas fa-angle-right"></i></span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewReceipt && (
        <div
          className="modal show"
          tabIndex="-1"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.3)",
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999
          }}
          onClick={closePreview}
        >
          <div
            className="modal-dialog modal-xl"
            style={{ pointerEvents: "auto", marginTop: "5vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Preview - Document No: {previewReceipt.docnumber}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closePreview}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table table-borderless mb-3">
                  <tbody>
                    <tr>
                      <td><strong>Document Date:</strong></td>
                      <td>{previewReceipt.documentDate}</td>
                      <td><strong>Posting Date:</strong></td>
                      <td>{previewReceipt.postingDate}</td>
                    </tr>
                    <tr>
                      <td><strong>Reference:</strong></td>
                      <td>{previewReceipt.reference}</td>
                      <td><strong>Vendor:</strong></td>
                      <td>{previewReceipt.vendor}</td>
                    </tr>
                    <tr>
                      <td><strong>Location:</strong></td>
                      <td>{previewReceipt.location}</td>
                      <td><strong>Receipt Date:</strong></td>
                      <td>{previewReceipt.receiptDate}</td>
                    </tr>
                  </tbody>
                </table>
                <h6>Items</h6>
                <table className="table border">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Material ID</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Base Unit</th>
                      <th>Delivery Date</th>
                      <th>Lot No</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewReceipt.items && previewReceipt.items.length > 0 ? (
                      previewReceipt.items.map((item, idx) => (
                        <tr key={item._id?.$oid || idx}>
                          <td>{idx + 1}</td>
                          <td>{item.materialId}</td>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{item.baseUnit}</td>
                          <td>{item.deliveryDate}</td>
                          <td>{item.lotNo}</td>
                          <td>{item.price}</td>
                          <td>{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closePreview}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoodsReceiptList;