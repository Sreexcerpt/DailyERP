import React from 'react';

const GoodsIssuePreviewModal = ({ show, onClose, issue }) => {
  if (!issue) return null;

  return (
    <div className={`modal fade${show ? " show d-block" : ""}`} tabIndex="-1" style={show ? {background: "rgba(0,0,0,0.5)"} : {display: "none"}}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Preview: Goods Issue - {issue.docnumber}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Category:</strong> {issue.category}<br />
                <strong>Category Desc:</strong> {issue.catdesc}<br />
                <strong>Document Date:</strong> {issue.documentDate}<br />
                <strong>Posting Date:</strong> {issue.postingDate}<br />
                <strong>Reference:</strong> {issue.reference}<br />
                <strong>Customer:</strong> {issue.customer}<br />
              </div>
              <div className="col-md-6">
                <strong>Location:</strong> {issue.location}<br />
                <strong>Issue Date:</strong> {issue.issueDate}<br />
                <strong>Sales Order ID:</strong> {issue.salesOrderId}<br />
                <strong>Company ID:</strong> {issue.companyId}<br />
                <strong>Financial Year:</strong> {issue.financialYear}<br />
                <strong>Deleted:</strong> {issue.isdelete ? 'Yes' : 'No'}<br />
              </div>
            </div>
            <h6 className="mt-3">Items</h6>
            <table className="table table-bordered table-sm">
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
                {issue.items.map((item, idx) => {
                  const total = item.quantity * item.price;
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{item.materialId}</td>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.baseUnit}</td>
                      <td>{item.deliveryDate}</td>
                      <td>{item.lotNo}</td>
                      <td>{item.price}</td>
                      <td>{item.availableQty}</td>
                      <td>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsIssuePreviewModal;