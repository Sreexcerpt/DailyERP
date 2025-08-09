import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const PAGE_SIZE = 10;

const InvoiceDisplay = () => {
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/invoiceform');
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setInvoices(sorted);
      setError(null);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter((inv) =>
      [
        inv.docnumber,
        inv.vendor,
        inv.location,
        inv.invoiceRef,
        inv.reference,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, invoices]);

  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setCurrentPage(n);
  };

//   const handlePrint = (invoice) => {
//     const printContent = `
//       <html>
//         <head>
//           <title>Invoice - ${invoice.docnumber}</title>
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
//           <h2>Invoice Document</h2>
//           <p><strong>Document No:</strong> ${invoice.docnumber}</p>
//           <p><strong>Vendor:</strong> ${invoice.vendor}</p>
//           <p><strong>Location:</strong> ${invoice.location}</p>
//           <p><strong>Reference:</strong> ${invoice.reference || '-'}</p>
//           <p><strong>Invoice Ref:</strong> ${invoice.invoiceRef || '-'}</p>
//           <p><strong>Date:</strong> ${new Date(invoice.documentDate).toLocaleDateString()}</p>
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
//               ${invoice.items.map((item, index) => `
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
//             <p>CGST: %${invoice.cgst}</p>
//             <p>SGST: %${invoice.sgst}</p>
//             <p>IGST: %${invoice.igst}</p>
//             <p>Discount: ₹${invoice.discount}</p>
//             <p>Final Total: ₹${invoice.finalTotal}</p>
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

const handlePrint = (invoice) => {
  const printContent = `
    <html>
      <head>
        <title>Invoice - ${invoice.docnumber}</title>
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
        <h2>Invoice Document</h2>
        <p><strong>Document No:</strong> ${invoice.docnumber}</p>
        <p><strong>Vendor:</strong> ${invoice.vendor}</p>
        <p><strong>Location:</strong> ${invoice.location}</p>
        <p><strong>Reference:</strong> ${invoice.reference || '-'}</p>
        <p><strong>Invoice Ref:</strong> ${invoice.invoiceRef || '-'}</p>
        <p><strong>Date:</strong> ${new Date(invoice.documentDate).toLocaleDateString()}</p>

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
            ${invoice.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.materialId||"DEMO"}</td>
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
          <p>Total Amount: ₹${invoice.totalAmount?.toFixed(2) || '-'}</p>
          <p>Discount: ₹${invoice.discount?.toFixed(2) || '0.00'}</p>
          <p>Net Amount: ₹${invoice.netAmount?.toFixed(2) || '-'}</p>
          <p>CGST (%): ${invoice.cgst}%</p>
          <p>SGST (%): ${invoice.sgst}%</p>
          <p>IGST (%): ${invoice.igst}%</p>
          <p><strong>Final Total: ₹${invoice.finalTotal?.toFixed(2)}</strong></p>
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
        <h5>Invoice Records</h5>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search invoices..."
          className="form-control w-25"
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Item No</th>
              <th>Doc No</th>
              <th>Vendor</th>
              <th>Location</th>
              <th>Reference</th>
              <th>Invoice Ref</th>
              <th>Date</th>
              <th>Final Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((inv, index) => (
              <tr key={inv._id}>
                <td>{index + 1}</td>
                <td>{inv.docnumber}</td>
                <td>{inv.vendor}</td>
                <td>{inv.location}</td>
                <td>{inv.reference || '-'}</td>
                <td>{inv.invoiceRef || '-'}</td>
                <td>{new Date(inv.documentDate).toLocaleDateString()}</td>
                <td>₹{inv.finalTotal}</td>
                <td>
                  <button onClick={() => handlePrint(inv)} className="btn btn-sm btn-primary">Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default InvoiceDisplay;
