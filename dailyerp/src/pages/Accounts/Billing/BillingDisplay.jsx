import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const PAGE_SIZE = 10;

const BillingDisplay = () => {
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/billingform');
      setBillings(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch billing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredBillings = useMemo(() => {
    if (!searchTerm) return billings;
    return billings.filter(billing =>
      [
        billing.docnumber,
        billing.customer,
        billing.reference,
        billing.BillingRef,
        billing.location,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, billings]);

  const totalPages = Math.ceil(filteredBillings.length / PAGE_SIZE);
  const paginatedBillings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBillings.slice(start, start + PAGE_SIZE);
  }, [filteredBillings, currentPage]);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setCurrentPage(n);
  };

//   const handlePrint = (billing) => {
//     const printContent = `
//       <html>
//         <head>
//           <title>Billing - ${billing.docnumber}</title>
//           <style>
//             body { font-family: Arial; padding: 20px; }
//             h2 { text-align: center; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ccc; padding: 8px; }
//             th { background: #f0f0f0; }
//             .summary { margin-top: 20px; font-weight: bold; }
//             .footer { margin-top: 40px; font-size: 12px; text-align: right; }
//           </style>
//         </head>
//         <body>
//           <h2>Billing Document</h2>
//           <p><strong>Document No:</strong> ${billing.docnumber}</p>
//           <p><strong>Customer:</strong> ${billing.customer}</p>
//           <p><strong>Location:</strong> ${billing.location}</p>
//           <p><strong>Reference:</strong> ${billing.reference}</p>
//           <p><strong>Billing Ref:</strong> ${billing.BillingRef}</p>
//           <p><strong>Date:</strong> ${new Date(billing.documentDate).toLocaleDateString()}</p>
//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Material ID</th>
//                 <th>Description</th>
//                 <th>Qty</th>
//                 <th>Unit</th>
//                 <th>Price</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${billing.items.map((item, index) => `
//                 <tr>
//                   <td>${index + 1}</td>
//                   <td>${item.materialId}</td>
//                   <td>${item.description}</td>
//                   <td>${item.quantity}</td>
//                   <td>${item.baseUnit}</td>
//                   <td>₹${parseFloat(item.price).toFixed(2)}</td>
//                   <td>₹${(item.price * item.quantity).toFixed(2)}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>

//           <div className="summary">
//             <p>CGST: %${billing.cgst}</p>
//             <p>SGST: %${billing.sgst}</p>
//             <p>IGST: %${billing.igst}</p>
//             <p>Discount: ₹${billing.discount}</p>
//             <p>Final Total: ₹${billing.finalTotal}</p>
//           </div>

//           <div className="footer">
//             Printed on: ${new Date().toLocaleString()}
//           </div>
//         </body>
//       </html>
//     `;

//     const win = window.open('', '_blank');
//     win.document.write(printContent);
//     win.document.close();
//     win.focus();
//     win.print();
//   };
const handlePrint = (billing) => {
  const printContent = `
    <html>
      <head>
        <title>Billing - ${billing.docnumber}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background: #f0f0f0; }
          .summary { margin-top: 20px; font-weight: bold; }
          .summary p { margin: 4px 0; }
          .footer { margin-top: 40px; font-size: 12px; text-align: right; }
        </style>
      </head>
      <body>
        <h2>Billing Document</h2>
        <p><strong>Document No:</strong> ${billing.docnumber}</p>
        <p><strong>Customer:</strong> ${billing.vendor}</p>
        <p><strong>Location:</strong> ${billing.location}</p>
        <p><strong>Reference:</strong> ${billing.reference}</p>
        <p><strong>Invoice Ref:</strong> ${billing.invoiceRef}</p>
        <p><strong>Date:</strong> ${new Date(billing.documentDate).toLocaleDateString()}</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Material ID</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${billing.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.materialId}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.baseUnit}</td>
                <td>₹${parseFloat(item.price).toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div className="summary">
          <p>Total Amount: ₹${billing.totalAmount.toFixed(2)}</p>
          <p>Discount: ₹${billing.discount.toFixed(2)}</p>
          <p>Net Amount: ₹${billing.netAmount.toFixed(2)}</p>
          <p>CGST (%): ${billing.cgst}%</p>
          <p>SGST (%): ${billing.sgst}%</p>
          <p>IGST (%): ${billing.igst}%</p>
          <p><strong>Final Total: ₹${billing.finalTotal.toFixed(2)}</strong></p>
        </div>

        <div className="footer">
          Printed on: ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(printContent);
  win.document.close();
  win.focus();
  win.print();
};


  if (loading) return <div className="text-center"><div className="spinner-border" role="status" /></div>;

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h5>Billing Records</h5>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search billing..."
          className="form-control w-25"
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Item No</th>
              <th>Doc No</th>
              <th>Customer</th>
              <th>Location</th>
              <th>Ref</th>
              <th>BillingRef</th>
              <th>Date</th>
              <th>Final Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBillings.map((billing, index) => (
              <tr key={billing._id}>
                <td>{index + 1}</td>
                <td>{billing.docnumber}</td>
                <td>{billing.customer}</td>
                <td>{billing.location}</td>
                <td>{billing.reference}</td>
                <td>{billing.BillingRef}</td>
                <td>{new Date(billing.documentDate).toLocaleDateString()}</td>
                <td>₹{billing.finalTotal}</td>
                <td>
                  <button onClick={() => handlePrint(billing)} className="btn btn-sm btn-primary">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <nav className="d-flex justify-content-center">
        <ul className="pagination pagination-sm">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>«</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => goToPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>»</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default BillingDisplay;
