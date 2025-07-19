import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GoodsIssueList = () => {
  const [goodsIssues, setGoodsIssues] = useState([]);

  useEffect(() => {
    fetchGoodsIssues();
  }, []);

  const fetchGoodsIssues = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/goodsissue');
      setGoodsIssues(response.data);
    } catch (error) {
      console.error('Error fetching Goods Issues:', error);
    }
  };

  const handlePrint = (id) => {
    const printElement = document.getElementById(`print-section-${id}`);
    const printContents = printElement.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write('<html><head><title>Print Goods Issue</title>');
    printWindow.document.write('<style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 6px; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Goods Issue Records</h2>

      {goodsIssues.length === 0 ? (
        <p>No records found.</p>
      ) : (
        goodsIssues.map((issue, index) => {
          const id = issue._id?.$oid || issue._id || index;
          return (
            <div key={id} className="card mb-4 shadow p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Document No: {issue.docnumber}</h5>
                <button className="btn btn-sm btn-primary" onClick={() => handlePrint(id)}>Print</button>
              </div>
              <div id={`print-section-${id}`}>
           

                <h6 className="mt-3">Items</h6>
                <table className="table table-bordered">
                  <thead className="table-light">
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
            </div>
          );
        })
      )}
    </div>
  );
};

export default GoodsIssueList;
