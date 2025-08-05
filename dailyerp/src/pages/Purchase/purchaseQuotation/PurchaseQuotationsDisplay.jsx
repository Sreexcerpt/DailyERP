// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// const PAGE_SIZE = 10; // You can adjust this value
// function PurchaseQuotationsDisplay() {
//   const [quotations, setQuotations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [editingQuotation, setEditingQuotation] = useState(null);
//   const [vendors, setVendors] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedQuotationId, setSelectedQuotationId] = useState(null)
//   const [selectedQuotation, setSelectedQuotation] = useState(null)
//   // Fetch all quotations
//   useEffect(() => {
//     fetchQuotations();
//     fetchVendors();
//     fetchCategories();
//   }, []);

//   const fetchQuotations = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:8080/api/quotations/get');
//       setQuotations(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Failed to fetch quotations:', err);
//       setError('Failed to load quotations. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchVendors = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/vendors');
//       const options = response.data.map((vendor) => ({
//         label: `${vendor.name1} ${vendor.name2}`,
//         value: vendor._id
//       }));
//       setVendors(options);
//     } catch (err) {
//       console.error('Failed to fetch vendors:', err);
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/api/rfq-categories');
//       setCategories(
//         response.data.map((cat) => ({
//           label: `${cat.categoryName} (${cat.prefix})`,
//           value: cat._id
//         }))
//       );
//     } catch (err) {
//       console.error('Failed to fetch categories:', err);
//     }
//   };

//   const handleEdit = async (quotationId) => {
//     try {
//       const response = await axios.get(`http://localhost:8080/api/quotations/${quotationId}`);
//       setEditingQuotation(response.data);
//     } catch (err) {
//       console.error('Failed to fetch quotation details:', err);
//       alert('Failed to load quotation details');
//     }
//   };
//   useEffect(() => {
//     // Filter quotations based on selectedQuotationId
//     const result = quotations.find(q => q._id === selectedQuotationId);
//     setSelectedQuotation(result);
//   }, [selectedQuotationId, quotations]);

//   const handleSaveEdit = async () => {
//     try {
//       await axios.put(`http://localhost:8080/api/quotations/${editingQuotation._id}`, editingQuotation);
//       alert('Quotation updated successfully!');
//       setEditingQuotation(null);
//       fetchQuotations(); // Refresh the list
//     } catch (err) {
//       console.error('Failed to update quotation:', err);
//       alert('Failed to update quotation');
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingQuotation(null);
//   };

//   const handleEditChange = (field, value) => {
//     setEditingQuotation(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleItemEditChange = (index, field, value) => {
//     const updatedItems = [...editingQuotation.items];
//     updatedItems[index][field] = value;
//     setEditingQuotation(prev => ({
//       ...prev,
//       items: updatedItems
//     }));
//   };

//   const handlePrint = (quotation) => {
//     const printContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>Quotation - ${quotation._id}</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 20px; }
//           .header { text-align: center; margin-bottom: 30px; }
//           .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
//           .info-item { margin-bottom: 10px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//           th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//           th { background-color: #f5f5f5; }
//           .total-row { background-color: #f0f0f0; font-weight: bold; }
//           .print-date { text-align: right; margin-top: 30px; font-size: 12px; }
//           @media print {
//             body { margin: 0; }
//             .no-print { display: none; }
//           }
//         </style>
//       </head>
//       <body>
//         <div className="header">
//           <h1>QUOTATION</h1>
//           <h3>Quotation ID: ${quotation._id}</h3>
//         </div>
        
//         <div className="info-grid">
//           <div>
//             <div className="info-item"><strong>Indent ID:</strong> ${quotation.indentId}</div>
//             <div className="info-item"><strong>Category ID:</strong> ${quotation.categoryId}</div>
//             <div className="info-item"><strong>RFQ Category:</strong> ${quotation.rfqCategoryId}</div>
//           </div>
//           <div>
//             <div className="info-item"><strong>Vendor:</strong> ${quotation.vendorName}</div>
//             <div className="info-item"><strong>Date:</strong> ${new Date(quotation.createdAt).toLocaleDateString()}</div>
//           </div>
//         </div>
        
//         ${quotation.note ? `<div className="info-item"><strong>Note:</strong> ${quotation.note}</div>` : ''}
        
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Material ID</th>
//               <th>Description</th>
//               <th>Quantity</th>
//               <th>Unit</th>
//               <th>Price</th>
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${quotation.items.map((item, index) => `
//               <tr>
//                 <td>${index + 1}</td>
//                 <td>${item.materialId}</td>
//                 <td>${item.description}</td>
//                 <td>${item.qty}</td>
//                 <td>${item.unit || item.baseUnit}</td>
//                 <td>₹${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
//                 <td>₹${item.price && item.qty ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(2) : '0.00'}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//           <tfoot>
//             <tr className="total-row">
//               <td colspan="6" style="text-align: right;"><strong>Grand Total:</strong></td>
//               <td><strong>₹${quotation.items.reduce((total, item) => {
//       const itemTotal = item.price && item.qty ? parseFloat(item.price) * parseFloat(item.qty) : 0;
//       return total + itemTotal;
//     }, 0).toFixed(2)}</strong></td>
//             </tr>
//           </tfoot>
//         </table>
        
//         <div className="print-date">
//           Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
//         </div>
//       </body>
//       </html>
//     `;

//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(printContent);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//   };
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);

//   // Filter by search term
//   const filteredQuotations = useMemo(() => {
//     if (!searchTerm) return quotations;
//     return quotations.filter((quotation) =>
//       [
//         quotation.quotationNumber,
//         quotation.indentId,
//         quotation.vendorName,
//         quotation.vnNo,
//         quotation.note,
//       ]
//         .join(' ')
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//     );
//   }, [searchTerm, quotations]);

//   // Pagination
//   const totalPages = Math.ceil(filteredQuotations.length / PAGE_SIZE);
//   const paginatedQuotations = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return filteredQuotations.slice(start, start + PAGE_SIZE);
//   }, [filteredQuotations, currentPage]);

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//     setCurrentPage(1); // Reset to first page on search
//   };

//   const goToPage = (n) => {
//     if (n < 1 || n > totalPages) return;
//     setCurrentPage(n);
//   };
//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center">
//         <div className="spinner-border" role="status"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ padding: '20px', marginLeft: '300px' }}>
//         <h2>Quotations</h2>
//         <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
//         <button onClick={fetchQuotations} style={{ padding: '10px 20px' }}>Retry</button>
//       </div>
//     );
//   }

//   // Edit Modal
//   if (editingQuotation) {
//     return (
//       <div style={{ padding: '20px', marginLeft: '300px', marginBottom: '50px' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h2>Edit Quotation - {editingQuotation._id}</h2>
//           <div>
//             <button onClick={handleSaveEdit} style={{ padding: '8px 16px', marginRight: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
//               Save Changes
//             </button>
//             <button onClick={handleCancelEdit} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>
//               Cancel
//             </button>
//           </div>
//         </div>

//         <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#f9f9f9' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
//             <div>
//               <label><strong>RFQ Category:</strong></label>
//               <Select
//                 options={categories}
//                 value={categories.find(cat => cat.value === editingQuotation.rfqCategoryId)}
//                 onChange={(selected) => handleEditChange('rfqCategoryId', selected?.value)}
//                 placeholder="Select Category"
//               />
//             </div>
//             <div>
//               <label><strong>Vendor:</strong></label>
//               <Select
//                 options={vendors}
//                 value={vendors.find(v => v.value === editingQuotation.vendor)}
//                 onChange={(selected) => {
//                   handleEditChange('vendor', selected?.value);
//                   handleEditChange('vendorName', selected?.label);
//                 }}
//                 placeholder="Select Vendor"
//               />
//             </div>
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label><strong>Note:</strong></label>
//             <textarea
//               value={editingQuotation.note || ''}
//               onChange={(e) => handleEditChange('note', e.target.value)}
//               rows={3}
//               style={{ width: '100%', padding: '8px', marginTop: '5px' }}
//               placeholder="Add any notes (optional)"
//             />
//           </div>

//           <h4>Items</h4>
//           <div style={{ overflowX: 'auto' }}>
//             <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead style={{ backgroundColor: '#f5f5f5' }}>
//                 <tr>
//                   <th>#</th>
//                   <th>Material ID</th>
//                   <th>Description</th>
//                   <th>Quantity</th>
//                   <th>Base Unit</th>
//                   <th>MaterialGroup</th>
//                   <th>
//                     BuyerGroup</th>
//                   <th>DeliveryDate</th>
//                   <th>ValidityDate</th>

//                   <th>Price</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {editingQuotation.items.map((item, index) => (
//                   <tr key={index}>
//                     <td>{index + 1}</td>
//                     <td>{item.materialId}</td>
//                     <td>{item.description}</td>
//                     <td>{item.qty}</td>
//                     <td>{item.baseUnit}</td>
//                     <td>{item.materialgroup}</td>
//                     <td>{item.buyerGroup}</td>
//                     <td>{item.
//                       deliveryDate}</td>
//                     <td>{item.validityDate}</td>
//                     <td>
//                       <input
//                         type="number"
//                         value={item.price || ''}
//                         onChange={(e) => handleItemEditChange(index, 'price', e.target.value)}
//                         style={{ width: '100px', padding: '4px' }}
//                         step="0.01"
//                       />
//                     </td>
//                     <td>
//                       ₹{item.price && item.qty ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(2) : '0.00'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='content'>
//       <div style={{ display: 'flex', flexWrap: "wrap", justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//         <h6>All Quotations</h6>
//         <div style={{ marginBottom: 10 }}>
//           <input
//             type="text"
//             placeholder="Search quotations..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="form-control"
//             style={{ width: 300, display: 'inline-block' }}
//           />
//         </div>

//       </div>


//       <div className="table-responsive">
//         <table className="table table-nowrap datatable dataTable no-footer" id="DataTables_Table_0" aria-describedby="DataTables_Table_0_info" >
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Quotation ID</th>
//               <th>Indent ID</th>
//               {/* <th>Category ID</th>
//                 <th>RFQ Category</th> */}
//               <th>Vendor</th>
//               <th>Vendor NO</th>
//               <th>Validity Date</th>
//               <th>Created</th>
//               <th>Note</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedQuotations.map((quotation, index) => (
//               <tr key={quotation._id || index}>
//                 <td>{index + 1}</td>
//                 <td>{quotation.quotationNumber}</td>
//                 <td>{quotation.indentId}</td>
//                 <td>{quotation.vendorName}</td>
//                 <td>{quotation.vnNo || "-"}</td>
//                 <td>{quotation.validityDate}</td>
//                 <td>{new Date(quotation.createdAt).toLocaleDateString()}</td>
//                 <td>{quotation.note || '-'}</td>
//                 <td>
//                   <button
//                     onClick={() => handlePrint(quotation)}
//                     className='btn btn-sm btn-warning'
//                   >
//                     Print
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
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="d-flex justify-content-center mt-2">
//         <nav>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
//               <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
//                 <i className="bi bi-chevron-double-left"></i>
//               </button>
//             </li>
//             {/* Page Numbers */}
//             {(() => {
//               const pageButtons = [];
//               const totalToShow = 7; // first 2, last 2, and 3 around current
//               let startPages = [1, 2];
//               let endPages = [totalPages - 1, totalPages].filter(n => n > 2);
//               let middlePages = [];

//               if (currentPage <= 4) {
//                 // Show first 5 pages
//                 startPages = [1, 2, 3, 4, 5].filter(n => n <= totalPages);
//                 endPages = [totalPages - 1, totalPages].filter(n => n > 5);
//               } else if (currentPage >= totalPages - 3) {
//                 // Show last 5 pages
//                 startPages = [1, 2].filter(n => n < totalPages - 4);
//                 endPages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
//                   .filter(n => n > 2 && n <= totalPages);
//               } else {
//                 // Middle window
//                 startPages = [1, 2];
//                 middlePages = [currentPage - 1, currentPage, currentPage + 1];
//                 endPages = [totalPages - 1, totalPages];
//               }

//               // Helper to render a set of page numbers
//               const renderPages = (pages) =>
//                 pages.map((n) => (
//                   <li key={n} className={`page-item${currentPage === n ? ' active' : ''}`}>
//                     <button className="page-link" onClick={() => goToPage(n)}>
//                       {n}
//                     </button>
//                   </li>
//                 ));

//               // Render first pages
//               pageButtons.push(...renderPages(startPages));

//               // Ellipsis if needed before middle
//               if (
//                 (middlePages.length > 0 && middlePages[0] > startPages[startPages.length - 1] + 1) ||
//                 (middlePages.length === 0 && endPages[0] > startPages[startPages.length - 1] + 1)
//               ) {
//                 pageButtons.push(
//                   <li key="start-ellipsis" className="page-item disabled">
//                     <span className="page-link">…</span>
//                   </li>
//                 );
//               }

//               // Render middle pages
//               pageButtons.push(...renderPages(middlePages));

//               // Ellipsis if needed before end
//               if (
//                 endPages.length > 0 &&
//                 ((middlePages.length > 0 && endPages[0] > middlePages[middlePages.length - 1] + 1) ||
//                   (middlePages.length === 0 && endPages[0] > startPages[startPages.length - 1] + 1))
//               ) {
//                 pageButtons.push(
//                   <li key="end-ellipsis" className="page-item disabled">
//                     <span className="page-link">…</span>
//                   </li>
//                 );
//               }

//               // Render end pages
//               pageButtons.push(...renderPages(endPages));

//               return pageButtons;
//             })()}
//             <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
//               <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
//                 <i className="bi bi-chevron-double-right"></i>
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>



//       <div id="standard-modal" className="modal fade" tabindex="-1" role="dialog"
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
//                         <th>Buyer Group</th>
//                         <th>Unit</th>
//                         {/* <th>Material Group</th> */}
//                         <th>Delivery Date</th>
//                         <th>Vendor</th>
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
//                           <td>{item.buyerGroup}</td>
//                           <td>{item.unit}</td>
//                           {/* <td>{selectedQuotation.categoryId}</td> Assuming Material Group is categoryId */}
//                           <td>{new Date(item.deliveryDate).toLocaleDateString()}</td>
//                           <td>{selectedQuotation.vendorName}</td>
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

//     </div>
//   );
// }

// export default PurchaseQuotationsDisplay;

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
const PAGE_SIZE = 10; // You can adjust this value
function QuotationsDisplay() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
// Add these state variables to your existing useState declarations
const [rfqCategories, setRfqCategories] = useState([]);
const [allVendors, setAllVendors] = useState([]);
const [locations, setLocations] = useState([]);

// Update your fetchCategories function to set both categories and rfqCategories
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/rfq-categories');
    const categoryOptions = response.data.map((cat) => ({
      label: `${cat.categoryName} (${cat.prefix})`,
      value: cat._id
    }));
    setCategories(categoryOptions);
    setRfqCategories(categoryOptions); // Add this line
  } catch (err) {
    console.error('Failed to fetch categories:', err);
  }
};

// Update your fetchVendors function to set both vendors and allVendors
const fetchVendors = async () => {
  try {
    const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');


    const response = await axios.get('http://localhost:8080/api/vendors',{params: { companyId, financialYear }});
    const activeVendors = response.data.filter(
      (vendor) => !vendor.isDeleted && !vendor.isBlocked
    );
    const vendorOptions = activeVendors.map((vendor) => ({
      label: `${vendor.name1} ${vendor.name2 || ""}`,
      value: vendor._id,
      vnNo: vendor.vnNo || ""
    }));
    setVendors(vendorOptions);
    setAllVendors(vendorOptions); // Add this line
  } catch (err) {
    console.error('Failed to fetch vendors:', err);
  }
};

// Add this function to fetch locations
const fetchLocations = async () => {
  try {
    const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');


    const response = await axios.get('http://localhost:8080/api/locations',{params: { companyId, financialYear }});
    if (Array.isArray(response.data)) {
      setLocations(response.data);
    } else if (response.data && Array.isArray(response.data.locations)) {
      setLocations(response.data.locations);
    } else {
      setLocations([]);
    }
  } catch (err) {
    console.error('Failed to fetch locations:', err);
    setLocations([]);
  }
};

// Update your useEffect to call fetchLocations
useEffect(() => {
  fetchQuotations();
  fetchVendors();
  fetchCategories();
  fetchLocations(); // Add this line
}, []);

// Update your handleEdit function
const handleEdit = async (quotationId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/quotations/${quotationId}`);
    const quotation = response.data;
    
    // Set the editing quotation with proper formatting
    setEditingQuotation({
      ...quotation,
      validityDate: quotation.validityDate ? new Date(quotation.validityDate).toISOString().split('T')[0] : '',
      items: quotation.items.map(item => ({
        ...item,
        deliveryDate: item.deliveryDate ? new Date(item.deliveryDate).toISOString().split('T')[0] : ''
      }))
    });
  } catch (err) {
    console.error('Failed to fetch quotation details:', err);
    alert('Failed to load quotation details');
  }
};

// Update your handleSaveEdit function
const handleSaveEdit = async () => {
  try {
    // Calculate total price
    const totalPrice = editingQuotation.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    const updatedQuotation = {
      ...editingQuotation,
      totalPrice,
      items: editingQuotation.items.map(item => ({
        ...item,
        deliveryDate: item.deliveryDate || null
      }))
    };

    await axios.put(`http://localhost:8080/api/quotations/${editingQuotation._id}`, updatedQuotation);
    alert('Quotation updated successfully!');
    setEditingQuotation(null);
    fetchQuotations(); // Refresh the list
  } catch (err) {
    console.error('Failed to update quotation:', err);
    alert('Failed to update quotation');
  }
};
  // Fetch all quotations
  useEffect(() => {
    fetchQuotations();
    fetchVendors();
    fetchCategories();
  }, []);

  const fetchQuotations = async () => {
    try {
      const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');


      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/quotations/get',{params: { companyId, financialYear }});
     const sortedQuotations = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

setQuotations(sortedQuotations);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch quotations:', err);
      setError('Failed to load quotations. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleCancelEdit = () => {
    setEditingQuotation(null);
  };

  const handleEditChange = (field, value) => {
    setEditingQuotation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemEditChange = (index, field, value) => {
    const updatedItems = [...editingQuotation.items];
    updatedItems[index][field] = value;
    setEditingQuotation(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handlePrint = (quotation) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${quotation._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .info-item { margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .total-row { background-color: #f0f0f0; font-weight: bold; }
          .print-date { text-align: right; margin-top: 30px; font-size: 12px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="header">
          <h1>QUOTATION</h1>
          <h3>Quotation ID: ${quotation._id}</h3>
        </div>
        
        <div className="info-grid">
          <div>
            <div className="info-item"><strong>Indent ID:</strong> ${quotation.indentId}</div>
            <div className="info-item"><strong>Category ID:</strong> ${quotation.categoryId}</div>
            <div className="info-item"><strong>RFQ Category:</strong> ${quotation.rfqCategoryId}</div>
          </div>
          <div>
            <div className="info-item"><strong>Vendor:</strong> ${quotation.vendorName}</div>
            <div className="info-item"><strong>Date:</strong> ${new Date(quotation.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        
        ${quotation.note ? `<div className="info-item"><strong>Note:</strong> ${quotation.note}</div>` : ''}
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Material ID</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.materialId}</td>
                <td>${item.description}</td>
                <td>${item.qty}</td>
                <td>${item.unit || item.baseUnit}</td>
                <td>₹${item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                <td>₹${item.price && item.qty ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(2) : '0.00'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colspan="6" style="text-align: right;"><strong>Grand Total:</strong></td>
              <td><strong>₹${quotation.items.reduce((total, item) => {
      const itemTotal = item.price && item.qty ? parseFloat(item.price) * parseFloat(item.qty) : 0;
      return total + itemTotal;
    }, 0).toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div className="print-date">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter by search term
const [previewQuotation, setPreviewQuotation] = useState(null);

// 2. Update the filteredQuotations useMemo to include sorting by totalPrice
const filteredQuotations = useMemo(() => {
  let filtered = quotations;
  
  // Date range filtering
  if (dateFrom || dateTo) {
    filtered = filtered.filter((quotation) => {
      const createdDate = new Date(quotation.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      
      if (fromDate && toDate) {
        return createdDate >= fromDate && createdDate <= toDate;
      } else if (fromDate) {
        return createdDate >= fromDate;
      } else if (toDate) {
        return createdDate <= toDate;
      }
      return true;
    });
  }
  
  // Search term filtering
  if (searchTerm) {
    filtered = filtered.filter((quotation) =>
      [
        quotation.quotationNumber,
        quotation.indentId,
        quotation.vendorName,
        quotation.vnNo,
        quotation.note,
        quotation.vendor,
        quotation.location,
        quotation.quotationReference
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    
    // Sort by totalPrice in ascending order when searching
    filtered = filtered.sort((a, b) => {
      const totalA = parseFloat(a.totalPrice) || 0;
      const totalB = parseFloat(b.totalPrice) || 0;
      return totalA - totalB;
    });
  }
  
  return filtered;
}, [searchTerm, quotations, dateFrom, dateTo]);
const handleReset = () => {
  setSearchTerm('');
  setDateFrom('');
  setDateTo('');
  setCurrentPage(1);
};
// 3. Add preview handler function
const handlePreview = async (quotationId) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/quotations/${quotationId}`);
    setPreviewQuotation(response.data);
  } catch (err) {
    console.error('Failed to fetch quotation details:', err);
    alert('Failed to load quotation details');
  }
};

// 4. Function to get row color based on search and price ranking
const getRowColor = (index, isSearching) => {
  if (!isSearching) return 'transparent';
  
  switch (index) {
    case 0: return '#d4edda'; // Light green for lowest price
    case 1: return '#fff3cd'; // Light yellow for second lowest
    default: return 'transparent'; // White for others
  }
};
  // Pagination
  const totalPages = Math.ceil(filteredQuotations.length / PAGE_SIZE);
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuotations.slice(start, start + PAGE_SIZE);
  }, [filteredQuotations, currentPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setCurrentPage(n);
  };
  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', marginLeft: '300px' }}>
        <h2>Quotations</h2>
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        <button onClick={fetchQuotations} style={{ padding: '10px 20px' }}>Retry</button>
      </div>
    );
  }
// Preview Modal
if (previewQuotation) {
  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Quotation Preview - {previewQuotation.quotationNumber}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setPreviewQuotation(null)}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Indent ID</small>
                    <div className="fw-bold">{previewQuotation.indentId}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Vendor</small>
                    <div className="fw-bold">{previewQuotation.vendorName}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Vendor No</small>
                    <div className="fw-bold">{previewQuotation.vnNo || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Quotation Reference</small>
                    <div className="fw-bold">{previewQuotation.quotationReference || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Validity Date</small>
                    <div className="fw-bold">
                      {previewQuotation.validityDate ? new Date(previewQuotation.validityDate).toLocaleDateString() : '-'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Location</small>
                    <div className="fw-bold">{previewQuotation.location || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Buyer Group</small>
                    <div className="fw-bold">{previewQuotation.buyerGroup || '-'}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 bg-light">
                  <div className="card-body p-3">
                    <small className="text-muted">Created Date</small>
                    <div className="fw-bold">
                      {new Date(previewQuotation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {previewQuotation.note && (
              <div className="alert alert-info mb-4">
                <strong>Note:</strong> {previewQuotation.note}
              </div>
            )}

            <h6 className="mb-3">Items</h6>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Material ID</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Delivery Date</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewQuotation.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.materialId}</td>
                      <td>{item.description}</td>
                      <td>{item.qty}</td>
                      <td>{item.unit || item.baseUnit}</td>
                      <td>₹{item.price ? parseFloat(item.price).toFixed(2) : '0.00'}</td>
                      <td>{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : '-'}</td>
                      <td>₹{item.price && item.qty ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(2) : '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-success">
                    <td colSpan="7" className="text-end fw-bold">Grand Total:</td>
                    <td className="fw-bold">
                      ₹{previewQuotation.items.reduce((total, item) => {
                        const itemTotal = item.price && item.qty ? parseFloat(item.price) * parseFloat(item.qty) : 0;
                        return total + itemTotal;
                      }, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Modal
if (editingQuotation) {
  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Edit Quotation - {editingQuotation.quotationNumber}
            </h5>
            <div>
              <button 
                type="button"
                className="btn btn-success me-4 mx-4"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </div>
          
          <div className="modal-body">
            <div className="card">
              <div className="card-body">
                {/* Basic Information */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label">Indent ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingQuotation.indentId || ''}
                      onChange={(e) => handleEditChange('indentId', e.target.value)}
                      readOnly
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label">RFQ Category</label>
                    <Select
                      options={rfqCategories}
                      value={rfqCategories.find(cat => cat.value === editingQuotation.rfqCategoryId)}
                      onChange={(selected) => handleEditChange('rfqCategoryId', selected?.value)}
                      placeholder="Select Category"
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Vendor</label>
                    <Select
                      options={allVendors}
                      value={allVendors.find(v => v.value === editingQuotation.vendor)}
                      onChange={(selected) => {
                        if (!editingQuotation.vendor) {
                          handleEditChange('vendor', selected?.value);
                          handleEditChange('vendorName', selected?.label);
                          handleEditChange('vnNo', selected?.vnNo || '');
                        }
                      }}
                      placeholder="Select Vendor"
                      isDisabled={!!editingQuotation.vendor}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Quotation Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingQuotation.quotationReference || ''}
                      onChange={(e) => handleEditChange('quotationReference', e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Validity Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editingQuotation.validityDate || ''}
                      onChange={(e) => handleEditChange('validityDate', e.target.value)}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Location</label>
                    <select
                      className="form-select"
                      value={editingQuotation.location || ''}
                      onChange={(e) => handleEditChange('location', e.target.value)}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc, index) => (
                        <option key={index} value={loc.name || loc}>
                          {loc.name || loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Buyer Group</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingQuotation.buyerGroup || ''}
                      onChange={(e) => handleEditChange('buyerGroup', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Note</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editingQuotation.note || ''}
                      onChange={(e) => handleEditChange('note', e.target.value)}
                      placeholder="Add any notes (optional)"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <h6 className="mb-3">Items</h6>
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Material ID</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Base Unit</th>
                        <th>Order Unit</th>
                        <th>Unit</th>
                        <th>Material Group</th>
                        <th>Delivery Date</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editingQuotation.items.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.materialId || ''}
                              onChange={(e) => handleItemEditChange(index, 'materialId', e.target.value)}
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.description || ''}
                              onChange={(e) => handleItemEditChange(index, 'description', e.target.value)}
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.qty || ''}
                              onChange={(e) => handleItemEditChange(index, 'qty', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.baseUnit || ''}
                              onChange={(e) => handleItemEditChange(index, 'baseUnit', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.orderUnit || ''}
                              onChange={(e) => handleItemEditChange(index, 'orderUnit', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.unit || ''}
                              onChange={(e) => handleItemEditChange(index, 'unit', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.materialgroup || ''}
                              onChange={(e) => handleItemEditChange(index, 'materialgroup', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={item.deliveryDate || ''}
                              onChange={(e) => handleItemEditChange(index, 'deliveryDate', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.price || ''}
                              onChange={(e) => handleItemEditChange(index, 'price', e.target.value)}
                              step="0.01"
                            />
                          </td>
                          <td>
                            <span className="fw-bold text-success">
                              ₹{item.price && item.qty ? (parseFloat(item.price) * parseFloat(item.qty)).toFixed(2) : '0.00'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-success">
                        <td colSpan="10" className="text-end fw-bold">Grand Total:</td>
                        <td className="fw-bold">
                          ₹{editingQuotation.items.reduce((total, item) => {
                            const itemTotal = item.price && item.qty ? parseFloat(item.price) * parseFloat(item.qty) : 0;
                            return total + itemTotal;
                          }, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className='content'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h6>All Quotations</h6>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
 
  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
    <input
      type="text"
      placeholder="Search by Quotation Reference etc......."
      value={searchTerm}
      onChange={handleSearchChange}
      className="form-control"
      style={{ width: 250, marginTop:'22px'}}
    />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <label style={{ fontSize: '12px', marginBottom: '2px' }}>From Date</label>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          setCurrentPage(1);
        }}
        className="form-control"
        style={{ width: 150 }}
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <label style={{ fontSize: '12px', marginBottom: '2px' }}>To Date</label>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => {
          setDateTo(e.target.value);
          setCurrentPage(1);
        }}
        className="form-control"
        style={{ width: 150 }}
      />
    </div>
    <button onClick={handleReset} className='btn btn-sm btn-soft-warning'>
      Reset
    </button>
    <button onClick={fetchQuotations} className='btn btn-sm btn-soft-primary'>
      Refresh
    </button>
  </div>
</div>
       
      </div>


      <div className="table-responsive">
        <table className="table table-nowrap datatable dataTable no-footer" id="DataTables_Table_0" aria-describedby="DataTables_Table_0_info" >
          <thead>
            <tr>
              <th>#</th>
              <th>Quotation ID</th>
              <th>Quotation Reference</th>
              {/* <th>Category ID</th>
                <th>RFQ Category</th> */}
              <th>Vendor</th>
      <th>Location</th>              <th>Validity Date</th>
              <th>Created</th>
              <th>TotalPrice</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
      
         <tbody>
  {paginatedQuotations.map((quotation, index) => (
    <tr 
      key={quotation._id || index}
     
    >
      <td>{index + 1}</td>
      <td>{quotation.quotationNumber}</td>
      <td>{quotation.quotationReference}</td>
      <td>{quotation.vendorName}</td>
<td>{quotation.location}</td>
      <td>{new Date(quotation.validityDate).toLocaleDateString()}</td>
      <td>{new Date(quotation.createdAt).toLocaleDateString()}</td>
      <td  style={{ backgroundColor: getRowColor(index, !!searchTerm) }}>{quotation.totalPrice}</td>
      <td>{quotation.note || '-'}</td>
      <td>
  <button
    onClick={() => handlePreview(quotation._id)}
    className='btn btn-sm '
    title="Preview"
  >
    <i className="fas fa-eye" style={{color:'black'}}></i>
  </button>
  <button
    onClick={() => handleEdit(quotation._id)}
    className='btn btn-sm '
    title="Edit"
  >
    <i className="fas fa-edit"style={{color:'black'}}></i>
  </button>
  <button
    onClick={() => handlePrint(quotation)}
    className='btn btn-sm '
    title="Print"
  >
    <i className="fas fa-print" style={{color:'black'}}></i>
  </button>
</td>
    </tr>
  ))}
</tbody>
         
        </table>
      </div>

      <div className="d-flex justify-content-center mt-2">
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <i className="bi bi-chevron-double-left"></i>
              </button>
            </li>
            {/* Page Numbers */}
            {(() => {
              const pageButtons = [];
              const totalToShow = 7; // first 2, last 2, and 3 around current
              let startPages = [1, 2];
              let endPages = [totalPages - 1, totalPages].filter(n => n > 2);
              let middlePages = [];

              if (currentPage <= 4) {
                // Show first 5 pages
                startPages = [1, 2, 3, 4, 5].filter(n => n <= totalPages);
                endPages = [totalPages - 1, totalPages].filter(n => n > 5);
              } else if (currentPage >= totalPages - 3) {
                // Show last 5 pages
                startPages = [1, 2].filter(n => n < totalPages - 4);
                endPages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
                  .filter(n => n > 2 && n <= totalPages);
              } else {
                // Middle window
                startPages = [1, 2];
                middlePages = [currentPage - 1, currentPage, currentPage + 1];
                endPages = [totalPages - 1, totalPages];
              }

              // Helper to render a set of page numbers
              const renderPages = (pages) =>
                pages.map((n) => (
                  <li key={n} className={`page-item${currentPage === n ? ' active' : ''}`}>
                    <button className="page-link" onClick={() => goToPage(n)}>
                      {n}
                    </button>
                  </li>
                ));

              // Render first pages
              pageButtons.push(...renderPages(startPages));

              // Ellipsis if needed before middle
              if (
                (middlePages.length > 0 && middlePages[0] > startPages[startPages.length - 1] + 1) ||
                (middlePages.length === 0 && endPages[0] > startPages[startPages.length - 1] + 1)
              ) {
                pageButtons.push(
                  <li key="start-ellipsis" className="page-item disabled">
                    <span className="page-link">…</span>
                  </li>
                );
              }

              // Render middle pages
              pageButtons.push(...renderPages(middlePages));

              // Ellipsis if needed before end
              if (
                endPages.length > 0 &&
                ((middlePages.length > 0 && endPages[0] > middlePages[middlePages.length - 1] + 1) ||
                  (middlePages.length === 0 && endPages[0] > startPages[startPages.length - 1] + 1))
              ) {
                pageButtons.push(
                  <li key="end-ellipsis" className="page-item disabled">
                    <span className="page-link">…</span>
                  </li>
                );
              }

              // Render end pages
              pageButtons.push(...renderPages(endPages));

              return pageButtons;
            })()}
            <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
               <i className="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default QuotationsDisplay;