// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function SalesQuotationListPage() {
//   const [quotations, setQuotations] = useState([]);
//   const [selectedQuotationId, setSelectedQuotationId] = useState(null)
//   const [selectedQuotation, setSelectedQuotation] = useState(null)
//   useEffect(() => {
//     axios.get('http://localhost:8080/api/salesquotations')
//       .then(res => setQuotations(res.data))
//       .catch(err => {
//         console.error('Failed to fetch quotations', err);
//         alert('Error loading quotations');
//       });
//   }, []);

//   const handlePrint = (quotation) => {
//     const printWindow = window.open('', '_blank');
//     const html = `
//       <html>
//         <head>
//           <title>Print Quotation</title>
//           <style>
//             body { font-family: Arial; padding: 20px; }
//             h2 { margin-bottom: 5px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #000; padding: 6px; text-align: left; }
//           </style>
//         </head>
//         <body>
//           <h2>Quotation: ${quotation.quotationNumber}</h2>
//           <p><strong>Indent ID:</strong> ${quotation.indentId}</p>
//           <p><strong>Customer Name:</strong> ${quotation.customerName}</p>
//           <p><strong>Validity Date:</strong> ${quotation.validityDate}</p>
//           <p><strong>Note:</strong> ${quotation.note}</p>
//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Material ID</th>
//                 <th>Description</th>
//                 <th>Qty</th>
//                 <th>Base Unit</th>
//                 <th>Order Unit</th>
//                 <th>Location</th>
//                 <th>Unit</th>
//                 <th>Price</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 quotation.items.map((item, idx) => {
//                   const total = item.qty * parseFloat(item.price || 0);
//                   return `
//                     <tr>
//                       <td>${idx + 1}</td>
//                       <td>${item.materialId}</td>
//                       <td>${item.description}</td>
//                       <td>${item.qty}</td>
//                       <td>${item.baseUnit}</td>
//                       <td>${item.orderUnit}</td>
//                       <td>${item.location}</td>
//                       <td>${item.unit}</td>
//                       <td>${item.price}</td>
//                       <td>${total.toFixed(2)}</td>
//                     </tr>
//                   `;
//                 }).join('')
//               }
//               <tr>
//                 <td colspan="9" style="text-align:right;"><strong>Grand Total</strong></td>
//                 <td><strong>${
//                   quotation.items.reduce((acc, item) => acc + (item.qty * parseFloat(item.price || 0)), 0).toFixed(2)
//                 }</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         </body>
//       </html>
//     `;
//     printWindow.document.write(html);
//     printWindow.document.close();
//     printWindow.print();
//   };
//   useEffect(() => {
//     // Filter quotations based on selectedQuotationId
//     const result = quotations.find(q => q._id === selectedQuotationId);
//     setSelectedQuotation(result);
//   }, [selectedQuotationId, quotations]);
// return (
//   <div className="content">
//     <h2>Saved Sales Quotations</h2>
//     {quotations.length === 0 ? (
//       <p>No quotations available.</p>
//     ) : (
//       <div className="table-responsive">
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Quotation No</th>
//             <th>Indent ID</th>
//             <th>Customer Name</th>
//             <th>Validity Date</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {quotations.map((quotation, index) => {
//             return (
//               <tr key={index}>
//                 <td>{quotation.quotationNumber}</td>
//                 <td>{quotation.indentId}</td>
//                 <td>{quotation.customerName}</td>
//                 <td>{quotation.validityDate}</td>
//                 <td>
//                   <button className='btn btn-sm btn-soft-primary' onClick={() => handlePrint(quotation)}>
//                     Print Quotation
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setSelectedQuotationId(quotation._id)}
//                     className="btn btn-outline-primary btn-sm ms-2"
//                     data-bs-toggle="modal"
//                     data-bs-target="#standard-modal"
//                   >
//                     <i className='ti ti-eye'></i>
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//       </div>
//     )}
//           <div id="standard-modal" className="modal fade" tabindex="-1" role="dialog"
//         aria-labelledby="standard-modalLabel" aria-hidden="true">
//         <div className="modal-dialog modal-xl">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h4 className="modal-title" id="standard-modalLabel">Quotation Items</h4>
//               <button type="button" className="btn-close" data-bs-dismiss="modal"
//                 aria-label="Close"></button>
//             </div>
//             <div className="modal-body">
//               <div className="table-responsive">
//                 {selectedQuotation?.items?.length > 0 &&
//                   <table className='table-sm table-bordered'>
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Material ID</th>
//                         <th>Description</th>
//                         <th>Qty</th>
//                         <th>Base Unit</th>
//                         <th>Order Unit</th>
//                         <th>Location</th>

//                         <th>Unit</th>
//                         {/* <th>Material Group</th> */}

//                         <th>Customer</th>
//                         <th>Price</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedQuotation?.items.map((item, idx) => (
//                         <tr key={item._id}>
//                           <td>{idx + 1}</td>
//                           <td>{item.materialId}</td>
//                           <td>{item.description}</td>
//                           <td>{item.qty}</td>
//                           <td>{item.baseUnit}</td>
//                           <td>{item.orderUnit}</td>
//                           <td>{item.location}</td>
//                           <td>{item.unit}</td>
//                           {/* <td>{selectedQuotation.categoryId}</td> Assuming Material Group is categoryId */}

//                           <td>{selectedQuotation.customerName}</td>
//                           <td>{item.price}</td>
//                         </tr>
//                       ))}

//                     </tbody>
//                   </table>}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//   </div>
// );

// }

// export default SalesQuotationListPage;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function QuotationListPage() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    axios.get('http://localhost:8080/api/salesquotations')
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
      <h2>Saved Sales Quotations</h2>
<div className="row">
      <div className="col-xl-2 mb-3">

        <input
          type="text"
          className="form-control"
          placeholder="Search by Quotation No, Indent ID or Customer Name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
        />
      </div>
      <div className=" col-xl-5 mb-3 d-flex gap-2">
        <input
          type="date"
          className="form-control"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setCurrentPage(1);
          }}
        />
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
      <div className="col-xl-1 ms-auto">
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => {
          setSearchTerm('');
          setFromDate('');
          setToDate('');
          setCurrentPage(1);
        }}
      >
        Reset_Filters
      </button></div>

</div>

      {currentQuotations.length === 0 ? (
        <p>No quotations found.</p>
      ) : (
        <>
          <div className="card mt-2">
            <div className="card-body">
              <table className="table table-bordered">
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
                      <td>{quotation.quotationNumber}</td>
                      <td>{quotation.indentId}</td>
                      <td>{quotation.customerName}</td>
                      <td>{quotation.location}</td>
                      <td>{quotation.validityDate}</td>
                      <td>
                        <button className="btn btn-sm btn-soft-primary" onClick={() => handlePrint(quotation)}>
                          Print Quotation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
          </div>

          {/* Pagination */}
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button onClick={() => paginate(i + 1)} className="page-link">
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default QuotationListPage;