import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GoodsIssuePreviewModal from './GoodsIssuePreviewModal';

const PAGE_SIZE = 10;

const GoodsIssueList = () => {
  const [goodsIssues, setGoodsIssues] = useState([]);
  const [previewIssue, setPreviewIssue] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoodsIssues();
    // eslint-disable-next-line
  }, [page]);

  const fetchGoodsIssues = async () => {
    setLoading(true);
    try {
      // Assuming your backend supports skip & limit for pagination.
      const response = await axios.get('http://localhost:8080/api/goodsissue', {
        params: {
          companyId,
          financialYear,
          skip: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
      });
      // If your backend doesn't return total count, you need to fetch it separately.
      setGoodsIssues(response.data.items || response.data); // support both API variants
      setTotalCount(response.data.totalCount || response.data.total || response.data.length || 0);
    } catch (error) {
      console.error('Error fetching Goods Issues:', error);
    }
    setLoading(false);
  };

  const handlePrint = (issue) => {
    const printWindow = window.open('', '', 'height=700,width=1000');
    printWindow.document.write('<html><head><title>Print Goods Issue</title>');
    printWindow.document.write(
      `<style>
        table, th, td { border: 1px solid black; border-collapse: collapse; padding: 6px; }
        body { font-family: sans-serif; }
        h5, h6 { margin-top: 10px; }
      </style>`
    );
    printWindow.document.write('</head><body>');
    printWindow.document.write(
      `<h5>Preview: Goods Issue - ${issue.docnumber}</h5>
      <div>
        <div style="display:flex;gap:40px;margin-bottom:16px;">
          <div>
            <strong>Category:</strong> ${issue.category || ''}<br/>
            <strong>Category Desc:</strong> ${issue.catdesc || ''}<br/>
            <strong>Document Date:</strong> ${issue.documentDate || ''}<br/>
            <strong>Posting Date:</strong> ${issue.postingDate || ''}<br/>
            <strong>Reference:</strong> ${issue.reference || ''}<br/>
            <strong>Customer:</strong> ${issue.customer || ''}<br/>
          </div>
          <div>
            <strong>Location:</strong> ${issue.location || ''}<br/>
            <strong>Issue Date:</strong> ${issue.issueDate || ''}<br/>
            <strong>Sales Order ID:</strong> ${issue.salesOrderId || ''}<br/>
            <strong>Company ID:</strong> ${issue.companyId || ''}<br/>
            <strong>Financial Year:</strong> ${issue.financialYear || ''}<br/>
            <strong>Deleted:</strong> ${issue.isdelete ? 'Yes' : 'No'}<br/>
          </div>
        </div>
        <h6>Items</h6>
        <table style="width:100%;border:1px solid black;">
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
              <th>Available Qty</th>
              <th>Total (Qty × Price)</th>
            </tr>
          </thead>
          <tbody>
            ${issue.items && issue.items.length > 0
        ? issue.items.map((item, idx) => {
          const total = item.quantity * item.price;
          return `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${item.materialId || ''}</td>
                        <td>${item.description || ''}</td>
                        <td>${item.quantity}</td>
                        <td>${item.baseUnit || ''}</td>
                        <td>${item.deliveryDate || ''}</td>
                        <td>${item.lotNo || ''}</td>
                        <td>${item.price}</td>
                        <td>${item.availableQty}</td>
                        <td>${total}</td>
                      </tr>
                    `;
        }).join('')
        : `<tr><td colSpan="10">No items</td></tr>`
      }
          </tbody>
        </table>
      </div>`
    );
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Pagination controls
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * PAGE_SIZE;
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE;
  const currentItems = goodsIssues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(goodsIssues.length / PAGE_SIZE);
  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setCurrentPage(pageNum);
    // Any other logic you need (such as fetching new data)
  };
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Goods Issue Records</h2>
      {loading ? (
        <p>Loading...</p>
      ) : goodsIssues.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <>
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Document No</th>
                      <th>Category</th>
                      {/* <th>Category Desc</th> */}
                      <th>Document Date</th>
                      <th>Posting Date</th>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Location</th>
                      <th>Issue Date</th>
                      {/* <th>Sales Order ID</th>
                  <th>Company ID</th>
                  <th>Financial Year</th>
                  <th>Deleted</th> */}
                      <th>Preview Items</th>
                      <th>Print</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((issue, index) => {
                      const id = issue._id?.$oid || issue._id || index;
                      return (
                        <tr key={id}>
                          <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                          <td>{issue.docnumber}</td>
                          <td>{issue.category}</td>
                          {/* <td>{issue.catdesc}</td> */}
                          <td>{issue.documentDate}</td>
                          <td>{issue.postingDate}</td>
                          <td>{issue.reference}</td>
                          <td>{issue.customer}</td>
                          <td>{issue.location}</td>
                          <td>{issue.issueDate}</td>
                          {/* <td>{issue.salesOrderId}</td>
                      <td>{issue.companyId}</td>
                      <td>{issue.financialYear}</td>
                      <td>{issue.isdelete ? 'Yes' : 'No'}</td> */}
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => setPreviewIssue(issue)}
                            >
                              Preview
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handlePrint(issue)}
                            >
                              Print
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="row mb-3">
              <div className="col-md-12">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-end">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link btn-sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <span aria-hidden="true">
                          <i className="fas fa-angle-left"></i>
                        </span>
                      </button>
                    </li>
                    {(() => {
                      const delta = 2;
                      const range = [];
                      const rangeWithDots = [];
                      range.push(1);
                      for (
                        let i = Math.max(2, currentPage - delta);
                        i <= Math.min(totalPages - 1, currentPage + delta);
                        i++
                      ) {
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
                            rangeWithDots.push("...");
                          }
                        }
                        rangeWithDots.push(i);
                        prev = i;
                      }
                      return rangeWithDots.map((number, index) => {
                        if (number === "...") {
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
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link btn-sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <span aria-hidden="true">
                          <i className="fas fa-angle-right"></i>
                        </span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      )}
      <GoodsIssuePreviewModal
        show={!!previewIssue}
        onClose={() => setPreviewIssue(null)}
        issue={previewIssue}
      />
    </div>
  );
};

export default GoodsIssueList;