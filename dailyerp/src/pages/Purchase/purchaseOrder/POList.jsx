// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function PurchaseOrderDisplay() {
//   const [pos, setPos] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:8080/api/purchase-orders')
//       .then(res => setPos(res.data))
//       .catch(err => {
//         console.error('Error fetching POs:', err);
//         alert('Failed to fetch POs');
//       });
//   }, []);

//   const handlePrint = (po) => {
//     const itemRows = po.items.map((item, idx) => `
//       <tr>
//         <td>${idx + 1}</td>
//         <td>${item.materialId}</td>
//         <td>${item.description}</td>
//         <td>${item.quantity}</td>
//         <td>${item.baseUnit}</td>
//         <td>${item.unit}</td>
//         <td>${item.orderUnit}</td>
//         <td>${item.price}</td>
//         <td>${item.buyerGroup}</td>
//         <td>${item.materialgroup}</td>
//         <td>${item.deliveryDate}</td>
//       </tr>
//     `).join('');

//     const html = `
//       <html>
//       <head>
//         <title>Purchase Order - ${po.poNumber}</title>
//         <style>
//           body { font-family: Arial; padding: 20px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//           th, td { border: 1px solid black; padding: 8px; text-align: left; }
//           th { background-color: #f0f0f0; }
//         </style>
//       </head>
//       <body>
//         <h2>Purchase Order Details</h2>
//         <p><strong>PO Number:</strong> ${po.poNumber}</p>
//         <p><strong>Date:</strong> ${po.date}</p>
//         <p><strong>Vendor:</strong> ${po.vendor}</p>
//         <p><strong>Category:</strong> ${po.category}</p>
//         <p><strong>Quotation Number:</strong> ${po.quotationNumber}</p>
//         <p><strong>Delivery Location:</strong> ${po.deliveryLocation}</p>
//         <p><strong>Delivery Address:</strong> ${po.deliveryAddress}</p>

//         <h3>Item Details</h3>
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Material ID</th>
//               <th>Description</th>
//               <th>Qty</th>
//               <th>Base Unit</th>
//               <th>Unit</th>
//               <th>Order Unit</th>
//               <th>Price</th>
//               <th>Buyer Group</th>
//               <th>Material Group</th>
//               <th>Delivery Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemRows}
//           </tbody>
//         </table>

//         <h3>Tax Summary</h3>
//         <p><strong>Total:</strong> ₹${po.total}</p>
//         <p><strong>Tax Name:</strong> ${po.taxName}</p>
//         <p><strong>CGST:</strong> ${po.cgst}%</p>
//         <p><strong>SGST:</strong> ${po.sgst}%</p>
//         <p><strong>IGST:</strong> ${po.igst}%</p>
//         <p><strong>Tax Discount:</strong> ₹${po.taxDiscount}</p>
//         <p><strong>Final Total:</strong> ₹${po.finalTotal}</p>
//       </body>
//       </html>
//     `;
//     const win = window.open('', '', 'width=800,height=600');
//     win.document.write(html);
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div className='content'>
//       <h2>Purchase Order Display</h2>

//       <table className='table table-sm table-bordered'>
//         <thead>
//           <tr>
//             <th>PO Number</th>
//             <th>Date</th>
//             <th>Vendor</th>
//             <th>Category</th>
//             <th>Quotation Number</th>
//             <th>Delivery Location</th>
//             <th>Delivery Address</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {pos.map((po) => (
//             <tr key={po._id} >
//               <td>{po.poNumber}</td>
//               <td>{po.date}</td>
//               <td>{po.vendor}</td>
//               <td>{po.category}</td>
//               <td>{po.quotationNumber}</td>
//               <td>{po.deliveryLocation}</td>
//               <td>{po.deliveryAddress}</td>
//               <td>
//                 <button className='btn btn-primary' onClick={() => handlePrint(po)}>🖨️ Print</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//     </div>
//   );
// }

// export default PurchaseOrderDisplay;
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function PurchaseOrderDisplay() {
//   const [pos, setPos] = useState([]);
//   const [filteredPos, setFilteredPos] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Search functionality
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [searchType, setSearchType] = useState('poNumber');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     fetchPurchaseOrders();
//   }, []);

// const fetchPurchaseOrders = () => {
//   setLoading(true);
//   axios.get('http://localhost:8080/api/purchase-orders')
//     .then(res => {
//       // Sort by createdAt (latest first)
//       const sortedData = res.data.sort((a, b) => {
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       });
//       setPos(sortedData);
//       setFilteredPos(sortedData);
//       setLoading(false);
//     })
//     .catch(err => {
//       console.error('Error fetching POs:', err);
//       alert('Failed to fetch POs');
//       setLoading(false);
//     });
// };


//   // Search functionality
//   const handleSearchInputChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.trim() === '') {
//       setSearchResults([]);
//       return;
//     }

//     const results = pos.filter(po => {
//       switch (searchType) {
//         case 'poNumber':
//           return po.poNumber.toLowerCase().includes(query.toLowerCase());
//         case 'vendor':
//           return po.vendor.toLowerCase().includes(query.toLowerCase());
//         case 'category':
//           return po.category.toLowerCase().includes(query.toLowerCase());
//         case 'quotationNumber':
//           return po.quotationNumber.toLowerCase().includes(query.toLowerCase());
//         default:
//           return po.poNumber.toLowerCase().includes(query.toLowerCase());
//       }
//     });

//     setSearchResults(results);
//   };

//   const handleViewAll = () => {
//     setSearchResults(pos);
//     setSearchQuery('');
//   };

//   const handleClearResults = () => {
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const selectPOFromSearch = (selectedPO) => {
//     setFilteredPos([selectedPO]);
//     setCurrentPage(1);
//     closeSearchModal();
//   };

//   const openSearchModal = () => {
//     setShowSearchModal(true);
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const closeSearchModal = () => {
//     setShowSearchModal(false);
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const resetFilter = () => {
//     setFilteredPos(pos);
//     setCurrentPage(1);
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredPos.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredPos.length / itemsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handlePrint = (po) => {
//     const itemRows = po.items.map((item, idx) => `
//       <tr>
//         <td>${idx + 1}</td>
//         <td>${item.materialId}</td>
//         <td>${item.description}</td>
//         <td>${item.quantity}</td>
//         <td>${item.baseUnit}</td>
//         <td>${item.unit}</td>
//         <td>${item.orderUnit}</td>
//         <td>${item.price}</td>
//         <td>${item.buyerGroup}</td>
//         <td>${item.materialgroup}</td>
//         <td>${item.deliveryDate}</td>
//       </tr>
//     `).join('');

//     const html = `
//       <html>
//       <head>
//         <title>Purchase Order - ${po.poNumber}</title>
//         <style>
//           body { font-family: Arial; padding: 20px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//           th, td { border: 1px solid black; padding: 8px; text-align: left; }
//           th { background-color: #f0f0f0; }
//         </style>
//       </head>
//       <body>
//         <h2>Purchase Order Details</h2>
//         <p><strong>PO Number:</strong> ${po.poNumber}</p>
//         <p><strong>Date:</strong> ${po.date}</p>
//         <p><strong>Vendor:</strong> ${po.vendor}</p>
//         <p><strong>Category:</strong> ${po.category}</p>
//         <p><strong>Quotation Number:</strong> ${po.quotationNumber}</p>
//         <p><strong>Delivery Location:</strong> ${po.deliveryLocation}</p>
//         <p><strong>Delivery Address:</strong> ${po.deliveryAddress}</p>

//         <h3>Item Details</h3>
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Material ID</th>
//               <th>Description</th>
//               <th>Qty</th>
//               <th>Base Unit</th>
//               <th>Unit</th>
//               <th>Order Unit</th>
//               <th>Price</th>
//               <th>Buyer Group</th>
//               <th>Material Group</th>
//               <th>Delivery Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemRows}
//           </tbody>
//         </table>

//         <h3>Tax Summary</h3>
//         <p><strong>Total:</strong> ₹${po.total}</p>
//         <p><strong>Tax Name:</strong> ${po.taxName}</p>
//         <p><strong>CGST:</strong> ${po.cgst}%</p>
//         <p><strong>SGST:</strong> ${po.sgst}%</p>
//         <p><strong>IGST:</strong> ${po.igst}%</p>
//         <p><strong>Tax Discount:</strong> ₹${po.taxDiscount}</p>
//         <p><strong>Final Total:</strong> ₹${po.finalTotal}</p>
//       </body>
//       </html>
//     `;
//     const win = window.open('', '', 'width=800,height=600');
//     win.document.write(html);
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div className='content'>
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Purchase Order Display</h2>
//         <div className="d-flex gap-2">
//           <button className="btn btn-primary" onClick={openSearchModal}>
//             <i className="fas fa-search me-2"></i>Search PO
//           </button>
//           {filteredPos.length !== pos.length && (
//             <button className="btn btn-outline-secondary" onClick={resetFilter}>
//               <i className="fas fa-refresh me-2"></i>Show All
//             </button>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-4">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Results Summary */}
//           <div className="mb-3">
//             <small className="text-muted">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPos.length)} of {filteredPos.length} purchase orders
//               {filteredPos.length !== pos.length && (
//                 <span className="badge bg-info ms-2">Filtered Results</span>
//               )}
//             </small>
//           </div>

//           {/* Purchase Orders Table */}
//           <div className="table-responsive">
//             <table className='table table-sm table-bordered table-hover'>
//               <thead className="table-light">
//                 <tr>
//                   <th>PO Number</th>
//                   <th>Date</th>
//                   <th>Vendor</th>
//                   <th>Category</th>
//                   <th>Quotation Number</th>
//                   <th>Delivery Location</th>
//                   <th>Delivery Address</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.length > 0 ? (
//                   currentItems.map((po) => (
//                     <tr key={po._id}>
//                       <td><span className="badge bg-primary">{po.poNumber}</span></td>
//                       <td>{po.date}</td>
//                       <td>{po.vendor}</td>
//                       <td>{po.category}</td>
//                       <td>{po.quotationNumber}</td>
//                       <td>{po.deliveryLocation}</td>
//                       <td>{po.deliveryAddress}</td>
//                       <td>
//                         <button className='btn btn-primary btn-sm' onClick={() => handlePrint(po)}>
//                           <i className="fas fa-print me-1"></i>Print
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="text-center py-4">
//                       <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
//                       <p className="text-muted mb-0">No purchase orders found</p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <nav aria-label="Purchase Orders pagination">
//               <ul className="pagination justify-content-center">
//                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                   <button 
//                     className="page-link" 
//                     onClick={() => paginate(currentPage - 1)}
//                     disabled={currentPage === 1}
//                   >
//                     <i className="fas fa-chevron-left"></i>
//                   </button>
//                 </li>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//                   <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
//                     <button 
//                       className="page-link" 
//                       onClick={() => paginate(number)}
//                     >
//                       {number}
//                     </button>
//                   </li>
//                 ))}

//                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                   <button 
//                     className="page-link" 
//                     onClick={() => paginate(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                   >
//                     <i className="fas fa-chevron-right"></i>
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           )}
//         </>
//       )}

//       {/* Search Modal */}
//       {showSearchModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-xl">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-search me-2"></i>Search Purchase Orders
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={closeSearchModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 {/* Search Controls */}
//                 <div className="row mb-3">
//                   <div className="col-md-3">
//                     <label className="form-label">Search By</label>
//                     <select
//                       className="form-select"
//                       value={searchType}
//                       onChange={(e) => setSearchType(e.target.value)}
//                     >
//                       <option value="poNumber">PO Number</option>
//                       <option value="vendor">Vendor</option>
//                       <option value="category">Category</option>
//                       <option value="quotationNumber">Quotation Number</option>
//                     </select>
//                   </div>
//                   <div className="col-md-6">
//                     <label className="form-label">Search Query</label>
//                     <div className="input-group">
//                       <span className="input-group-text">
//                         <i className="fas fa-search"></i>
//                       </span>
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder={`Search by ${searchType === 'poNumber' ? 'PO Number' : searchType}...`}
//                         value={searchQuery}
//                         onChange={handleSearchInputChange}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">&nbsp;</label>
//                     <div className="d-flex gap-2">
//                       <button className="btn btn-info" onClick={handleViewAll}>
//                         <i className="fas fa-list me-1"></i>View All
//                       </button>
//                       {searchResults.length > 0 && (
//                         <button className="btn btn-outline-secondary" onClick={handleClearResults}>
//                           <i className="fas fa-times me-1"></i>Clear
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Search Results */}
//                 <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                   {searchResults.length > 0 ? (
//                     <table className="table table-hover">
//                       <thead className="table-light sticky-top">
//                         <tr>
//                           <th>PO Number</th>
//                           <th>Date</th>
//                           <th>Vendor</th>
//                           <th>Category</th>
//                           <th>Quotation Number</th>
//                           <th>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {searchResults.map((po, idx) => (
//                           <tr key={idx}>
//                             <td><span className="badge bg-primary">{po.poNumber}</span></td>
//                             <td>{po.date}</td>
//                             <td>{po.vendor}</td>
//                             <td>{po.category}</td>
//                             <td>{po.quotationNumber}</td>
//                             <td>
//                               <button
//                                 className="btn btn-success btn-sm"
//                                 onClick={() => selectPOFromSearch(po)}
//                               >
//                                 <i className="fas fa-check me-1"></i>Select
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="text-center py-4">
//                       <i className="fas fa-search fa-3x text-muted mb-3"></i>
//                       <p className="text-muted">
//                         {pos.length === 0
//                           ? 'No purchase orders loaded from API'
//                           : searchQuery
//                             ? `No purchase orders found matching "${searchQuery}"`
//                             : 'Enter search term or click "View All"'
//                         }
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={closeSearchModal}
//                 >
//                   <i className="fas fa-times me-1"></i>Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default PurchaseOrderDisplay;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// function PurchaseOrderDisplay() {
//   const [pos, setPos] = useState([]);
//   const [filteredPos, setFilteredPos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [dateFilter, setDateFilter] = useState({
//     fromDate: '',
//     toDate: ''
//   });
//   // Search functionality
//     const [selectedQuotationId, setSelectedQuotationId] = useState(null)
//   const [selectedQuotation, setSelectedQuotation] = useState(null)
//   const [showSearchModal, setShowSearchModal] = useState(false);
//   const [searchType, setSearchType] = useState('poNumber');

//   const [searchResults, setSearchResults] = useState([]);

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     fetchPurchaseOrders();
//   }, []);
//   useEffect(() => {
//     // Filter quotations based on selectedQuotationId
//     const result = pos.find(q => q._id === selectedQuotationId);
//     console.log(result)
//     setSelectedQuotation(result);
//   }, [selectedQuotationId, pos]);
//   const fetchPurchaseOrders = () => {
//     setLoading(true);
//     axios.get('http://localhost:8080/api/purchase-orders')
//       .then(res => {
//         // Sort by createdAt (latest first)
//         const sortedData = res.data.sort((a, b) => {
//           return new Date(b.createdAt) - new Date(a.createdAt);
//         });
//         setPos(sortedData);
//         setFilteredPos(sortedData);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Error fetching POs:', err);
//         alert('Failed to fetch POs');
//         setLoading(false);
//       });
//   };

//   const applyFilters = () => {
//     let filtered = pos;

//     // Apply search filter
//     if (searchQuery.trim()) {
//       filtered = filtered.filter(po => {
//         const searchFields = [
//           po.poNumber,
//           po.vendor,
//           po.category,
//           po.quotationNumber,
//           po.deliveryLocation,
//           po.deliveryAddress,
//           po.date
//         ];

//         return searchFields.some(field =>
//           field && field.toString().toLowerCase().includes(searchQuery.toLowerCase())
//         );
//       });
//     }

//     // Apply date filter
//     if (dateFilter.fromDate || dateFilter.toDate) {
//       filtered = filtered.filter(po => {
//         const createdDate = new Date(po.date);
//         const fromDate = dateFilter.fromDate ? new Date(dateFilter.fromDate) : null;
//         const toDate = dateFilter.toDate ? new Date(dateFilter.toDate) : null;

//         // Set time to end of day for toDate to include the full day
//         if (toDate) {
//           toDate.setHours(23, 59, 59, 999);
//         }

//         let matchesDateRange = true;

//         if (fromDate && createdDate < fromDate) {
//           matchesDateRange = false;
//         }

//         if (toDate && createdDate > toDate) {
//           matchesDateRange = false;
//         }

//         return matchesDateRange;
//       });
//     }

//     setFilteredPos(filtered);
//     setCurrentPage(1);
//   };

//   // 4. ADD FILTER HANDLERS
//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleDateFilterChange = (field, value) => {
//     setDateFilter(prev => ({ ...prev, [field]: value }));
//   };

//   const clearAllFilters = () => {
//     setSearchQuery('');
//     setDateFilter({ fromDate: '', toDate: '' });
//     setFilteredPos(pos);
//     setCurrentPage(1);
//   };

//   // 5. ADD useEffect TO APPLY FILTERS WHEN DEPENDENCIES CHANGE
//   useEffect(() => {
//     applyFilters();
//   }, [searchQuery, dateFilter, pos]);

//   // Search functionality
//   const handleSearchInputChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (query.trim() === '') {
//       setSearchResults([]);
//       return;
//     }

//     const results = pos.filter(po => {
//       switch (searchType) {
//         case 'poNumber':
//           return po.poNumber.toLowerCase().includes(query.toLowerCase());
//         case 'vendor':
//           return po.vendor.toLowerCase().includes(query.toLowerCase());
//         case 'category':
//           return po.category.toLowerCase().includes(query.toLowerCase());
//         case 'quotationNumber':
//           return po.quotationNumber.toLowerCase().includes(query.toLowerCase());
//         default:
//           return po.poNumber.toLowerCase().includes(query.toLowerCase());
//       }
//     });

//     setSearchResults(results);
//   };

//   const handleViewAll = () => {
//     setSearchResults(pos);
//     setSearchQuery('');
//   };

//   const handleClearResults = () => {
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const selectPOFromSearch = (selectedPO) => {
//     setFilteredPos([selectedPO]);
//     setCurrentPage(1);
//     closeSearchModal();
//   };

//   const openSearchModal = () => {
//     setShowSearchModal(true);
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const closeSearchModal = () => {
//     setShowSearchModal(false);
//     setSearchResults([]);
//     setSearchQuery('');
//   };

//   const resetFilter = () => {
//     setFilteredPos(pos);
//     setCurrentPage(1);
//   };

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredPos.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredPos.length / itemsPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handlePrint = (po) => {
//     const itemRows = po.items.map((item, idx) => `
//       <tr>
//         <td>${idx + 1}</td>
//         <td>${item.materialId}</td>
//         <td>${item.description}</td>
//         <td>${item.quantity}</td>
//         <td>${item.baseUnit}</td>
//         <td>${item.unit}</td>
//         <td>${item.orderUnit}</td>
//         <td>${item.price}</td>
//         <td>${item.buyerGroup}</td>
//         <td>${item.materialgroup}</td>
//         <td>${item.deliveryDate}</td>
//       </tr>
//     `).join('');

//     const html = `
//       <html>
//       <head>
//         <title>Purchase Order - ${po.poNumber}</title>
//         <style>
//           body { font-family: Arial; padding: 20px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//           th, td { border: 1px solid black; padding: 8px; text-align: left; }
//           th { background-color: #f0f0f0; }
//         </style>
//       </head>
//       <body>
//         <h2>Purchase Order Details</h2>
//         <p><strong>PO Number:</strong> ${po.poNumber}</p>
//         <p><strong>Date:</strong> ${po.date}</p>
//         <p><strong>Vendor:</strong> ${po.vendor}</p>
//         <p><strong>Category:</strong> ${po.category}</p>
//         <p><strong>Quotation Number:</strong> ${po.quotationNumber}</p>
//         <p><strong>Delivery Location:</strong> ${po.deliveryLocation}</p>
//         <p><strong>Delivery Address:</strong> ${po.deliveryAddress}</p>

//         <h3>Item Details</h3>
//         <table>
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Material ID</th>
//               <th>Description</th>
//               <th>Qty</th>
//               <th>Base Unit</th>
//               <th>Unit</th>
//               <th>Order Unit</th>
//               <th>Price</th>
//               <th>Buyer Group</th>
//               <th>Material Group</th>
//               <th>Delivery Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${itemRows}
//           </tbody>
//         </table>

//         <h3>Tax Summary</h3>
//         <p><strong>Total:</strong> ₹${po.total}</p>
//         <p><strong>Tax Name:</strong> ${po.taxName}</p>
//         <p><strong>CGST:</strong> ${po.cgst}%</p>
//         <p><strong>SGST:</strong> ${po.sgst}%</p>
//         <p><strong>IGST:</strong> ${po.igst}%</p>
//         <p><strong>Tax Discount:</strong> ₹${po.taxDiscount}</p>
//         <p><strong>Final Total:</strong> ₹${po.finalTotal}</p>
//       </body>
//       </html>
//     `;
//     const win = window.open('', '', 'width=800,height=600');
//     win.document.write(html);
//     win.document.close();
//     win.print();
//   };

//   return (
//     <div className='content'>

//       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
//         <div className="me-auto">
//           <h2 className="mb-1">Purchase Order List</h2>
//           <nav>
//             <ol className="breadcrumb mb-0">
//               <li className="breadcrumb-item">
//                 <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
//               </li>
//               <li className="breadcrumb-item">
//                 Purchase
//               </li>
//               <li className="breadcrumb-item active" aria-current="page">Purchase Order List</li>
//             </ol>
//           </nav>
//         </div>
//         <div className='d-flex gap-2'>

//           {(searchQuery || dateFilter.fromDate || dateFilter.toDate) && (
//             <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
//               <i className="fas fa-times me-2"></i>Clear All Filters
//             </button>
//           )}
//           {/* Search and Filter Controls */}
//           <div className="row">
//             <div className="col-md-6">
//               <label className="form-label">Search All Fields</label>
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <i className="fas fa-search"></i>
//                 </span>
//                 <input
//                   type="text"
//                   className="form-control"
//                   placeholder="Search across all fields (PO Number, Vendor, Category, etc.)..."
//                   value={searchQuery}
//                   onChange={handleSearchChange}
//                 />
//               </div>
//             </div>
//             <div className="col-md-3">
//               <label className="form-label">From Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={dateFilter.fromDate}
//                 onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
//               />
//             </div>
//             <div className="col-md-3">
//               <label className="form-label">To Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={dateFilter.toDate}
//                 onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
//               />
//             </div>
//           </div>
//         </div>
//       </div>


//       {loading ? (
//         <div className="text-center py-4">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Results Summary */}
//           <div >
//             <small className="text-muted">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPos.length)} of {filteredPos.length} purchase orders
//               {filteredPos.length !== pos.length && (
//                 <span className="badge bg-info ms-2">Filtered Results</span>
//               )}
//             </small>
//           </div>

//           {/* Purchase Orders Table */}
//           <div className="card">
//             <div className="card-body">
//               <div className="table-responsive">
//                 <table className=' invoice-table table-sm table-bordered'>
//                   <thead>
//                     <tr>
//                       <th>PO Number</th>
//                       <th>Date</th>
//                       <th>Vendor</th>
//                       <th>Category</th>
//                       <th>Quotation Number</th>
//                       <th>Delivery Location</th>
//                       <th>Delivery Address</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {currentItems.length > 0 ? (
//                       currentItems.map((po) => (
//                         <tr key={po._id}>
//                           <td>{po.poNumber}</td>
//                           <td>{po.date}</td>
//                           <td>{po.vendor}</td>
//                           <td>{po.category}</td>
//                           <td>{po.quotationNumber}</td>
//                           <td>{po.deliveryLocation}</td>
//                           <td>{po.deliveryAddress}</td>
//                           <td>
//                             <button className='btn btn-primary btn-sm' onClick={() => handlePrint(po)}>
//                               <i className="fas fa-print me-1"></i>Print
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => setSelectedQuotationId(po._id)}
//                               className="btn btn-outline-primary btn-sm ms-2"
//                               data-bs-toggle="modal"
//                               data-bs-target="#standard-modal"
//                             >
//                               <i className='ti ti-eye'></i>
//                             </button>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="8" className="text-center py-4">
//                           <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
//                           <p className="text-muted mb-0">No purchase orders found</p>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             {totalPages > 1 && (
//               <nav aria-label="Purchase Orders pagination">
//                 <ul className="pagination justify-content-center">
//                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                     <button
//                       className="page-link"
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                     >
//                       <i className="fas fa-chevron-left"></i>
//                     </button>
//                   </li>

//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//                     <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
//                       <button
//                         className="page-link"
//                         onClick={() => paginate(number)}
//                       >
//                         {number}
//                       </button>
//                     </li>
//                   ))}

//                   <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                     <button
//                       className="page-link"
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                     >
//                       <i className="fas fa-chevron-right"></i>
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             )}
//           </div>
//           {/* Pagination */}

//         </>
//       )}

//       {/* Search Modal */}
//       {showSearchModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-xl">
//             <div className="modal-content">
//               <div className="modal-header bg-primary text-white">
//                 <h5 className="modal-title">
//                   <i className="fas fa-search me-2"></i>Search Purchase Orders
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={closeSearchModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 {/* Search Controls */}
//                 <div className="row mb-3">
//                   <div className="col-md-3">
//                     <label className="form-label">Search By</label>
//                     <select
//                       className="form-select"
//                       value={searchType}
//                       onChange={(e) => setSearchType(e.target.value)}
//                     >
//                       <option value="poNumber">PO Number</option>
//                       <option value="vendor">Vendor</option>
//                       <option value="category">Category</option>
//                       <option value="quotationNumber">Quotation Number</option>
//                     </select>
//                   </div>
//                   <div className="col-md-6">
//                     <label className="form-label">Search Query</label>
//                     <div className="input-group">
//                       <span className="input-group-text">
//                         <i className="fas fa-search"></i>
//                       </span>
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder={`Search by ${searchType === 'poNumber' ? 'PO Number' : searchType}...`}
//                         value={searchQuery}
//                         onChange={handleSearchInputChange}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-md-3">
//                     <label className="form-label">&nbsp;</label>
//                     <div className="d-flex gap-2">
//                       <button className="btn btn-info" onClick={handleViewAll}>
//                         <i className="fas fa-list me-1"></i>View All
//                       </button>
//                       {searchResults.length > 0 && (
//                         <button className="btn btn-outline-secondary" onClick={handleClearResults}>
//                           <i className="fas fa-times me-1"></i>Clear
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Search Results */}
//                 <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                   {searchResults.length > 0 ? (
//                     <table className="table table-hover">
//                       <thead className="table-light sticky-top">
//                         <tr>
//                           <th>PO Number</th>
//                           <th>Date</th>
//                           <th>Vendor</th>
//                           <th>Category</th>
//                           <th>Quotation Number</th>
//                           <th>Action</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {searchResults.map((po, idx) => (
//                           <tr key={idx}>
//                             <td><span className="badge bg-primary">{po.poNumber}</span></td>
//                             <td>{po.date}</td>
//                             <td>{po.vendor}</td>
//                             <td>{po.category}</td>
//                             <td>{po.quotationNumber}</td>
//                             <td>
//                               <button
//                                 className="btn btn-success btn-sm"
//                                 onClick={() => selectPOFromSearch(po)}
//                               >
//                                 <i className="fas fa-check me-1"></i>Select
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="text-center py-4">
//                       <i className="fas fa-search fa-3x text-muted mb-3"></i>
//                       <p className="text-muted">
//                         {pos.length === 0
//                           ? 'No purchase orders loaded from API'
//                           : searchQuery
//                             ? `No purchase orders found matching "${searchQuery}"`
//                             : 'Enter search term or click "View All"'
//                         }
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={closeSearchModal}
//                 >
//                   <i className="fas fa-times me-1"></i>Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <div id="standard-modal" className="modal fade" tabindex="-1" role="dialog"
//         aria-labelledby="standard-modalLabel" aria-hidden="true">
//         <div className="modal-dialog modal-lg">
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
//                           <td>{item.quantity}</td>
//                           <td>{item.baseUnit}</td>
//                           <td>{item.orderUnit}</td>
//                           <td>{selectedQuotation.deliveryLocation}</td>
//                           <td>{item.buyerGroup || "demo"}</td>
//                           {/* <td>{selectedQuotation.categoryId}</td> Assuming Material Group is categoryId */}
//                           <td>{new Date(item.deliveryDate).toLocaleDateString()}</td>
//                           <td>{selectedQuotation.vendor}</td>
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

// export default PurchaseOrderDisplay;

import React, { useEffect, useState } from "react";
import axios from "axios";

function PurchaseOrderDisplay() {
  const [pos, setPos] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
  });
  // Search functionality
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState("poNumber");

  const [searchResults, setSearchResults] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = () => {
    setLoading(true);
    const companyId = localStorage.getItem("selectedCompanyId");
    const financialYear = localStorage.getItem("financialYear");

    axios
      .get("http://localhost:8080/api/purchase-orders", {
        params: { companyId, financialYear },
      })
      .then((res) => {
        // Sort by createdAt (latest first)
        const sortedData = res.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setPos(sortedData);

        setFilteredPos(sortedData);
        console.log("data fo po", filteredPos);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching POs:", err);
        alert("Failed to fetch POs");
        setLoading(false);
      });
  };

  const applyFilters = () => {
    let filtered = pos;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((po) => {
        const searchFields = [
          po.poNumber,
          po.vendor,
          po.category,
          po.quotationNumber,
          po.deliveryLocation,
          po.deliveryAddress,
          po.date,
        ];

        return searchFields.some(
          (field) =>
            field &&
            field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply date filter
    if (dateFilter.fromDate || dateFilter.toDate) {
      filtered = filtered.filter((po) => {
        const createdDate = new Date(po.date);
        const fromDate = dateFilter.fromDate
          ? new Date(dateFilter.fromDate)
          : null;
        const toDate = dateFilter.toDate ? new Date(dateFilter.toDate) : null;

        // Set time to end of day for toDate to include the full day
        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
        }

        let matchesDateRange = true;

        if (fromDate && createdDate < fromDate) {
          matchesDateRange = false;
        }

        if (toDate && createdDate > toDate) {
          matchesDateRange = false;
        }

        return matchesDateRange;
      });
    }

    setFilteredPos(filtered);
    setCurrentPage(1);
  };

  // 4. ADD FILTER HANDLERS
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDateFilter({ fromDate: "", toDate: "" });
    setFilteredPos(pos);
    setCurrentPage(1);
  };

  // 5. ADD useEffect TO APPLY FILTERS WHEN DEPENDENCIES CHANGE
  useEffect(() => {
    applyFilters();
  }, [searchQuery, dateFilter, pos]);

  // Search functionality
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = pos.filter((po) => {
      switch (searchType) {
        case "poNumber":
          return po.poNumber.toLowerCase().includes(query.toLowerCase());
        case "vendor":
          return po.vendor.toLowerCase().includes(query.toLowerCase());
        case "category":
          return po.category.toLowerCase().includes(query.toLowerCase());
        case "quotationNumber":
          return po.quotationNumber.toLowerCase().includes(query.toLowerCase());
        default:
          return po.poNumber.toLowerCase().includes(query.toLowerCase());
      }
    });

    setSearchResults(results);
  };

  const handleViewAll = () => {
    setSearchResults(pos);
    setSearchQuery("");
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const selectPOFromSearch = (selectedPO) => {
    setFilteredPos([selectedPO]);
    setCurrentPage(1);
    closeSearchModal();
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchResults([]);
    setSearchQuery("");
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const resetFilter = () => {
    setFilteredPos(pos);
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPos.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

 

   const handlePrint = async (po) => {
   try {
     // Fetch vendor details
     const companyId = localStorage.getItem("selectedCompanyId");
     const financialYear = localStorage.getItem("financialYear");
 // Add this function before the main handlePrint function
 
 // And in the HTML:
    const [vendorResponse, companyResponse] = await Promise.all([
       axios.get(`http://localhost:8080/api/vendors/${po.vendor}`, {
         params: { companyId, financialYear },
       }),
       axios.get(`http://localhost:8080/api/companies/${companyId}`),
     ]);
 
     const vendor = vendorResponse.data;
     const company = companyResponse.data;
 // Client side - add logging to your function
 const getImageAsBase64 = async (imagePath) => {
   try {
     console.log('=== getImageAsBase64 called ===');
     console.log('Input imagePath:', imagePath);
     
     const filename = imagePath.includes('/') 
       ? imagePath.split('/').pop()
       : imagePath;
     
     console.log('Extracted filename:', filename);
     
     const url = `http://localhost:8080/api/image/${filename}`;
     console.log('Request URL:', url);
 
     const response = await axios.get(url, {
       responseType: 'arraybuffer'
     });
 
     console.log('Response status:', response.status);
     console.log('Response data length:', response.data.byteLength);
 
     const base64 = btoa(
       new Uint8Array(response.data)
         .reduce((data, byte) => data + String.fromCharCode(byte), '')
     );
 
     return `data:image/jpeg;base64,${base64}`;
   } catch (error) {
     console.error('Error fetching image:', error.message);
     console.error('Error status:', error.response?.status);
     console.error('Error URL:', error.config?.url);
     return null;
   }
 };
 
 // Then in your handlePrint function, after getting company data:
 let logoBase64 = null;
 if (company.logo) {
   logoBase64 = await getImageAsBase64(company.logo);
 }
 
     // Generate item rows
     const itemRows = po.items
       .map(
         (item, idx) => `
     <tr>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${idx + 1}</td>
       <td style="border: 1px solid #000; padding: 4px;">${item.materialId || ""}</td>
       <td style="border: 1px solid #000; padding: 4px;">${item.description || ""}</td>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.deliveryDate || ""}</td>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.quantity || ""} ${item.unit || ""}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${item.price || 0}</td>
       
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${item.price || 0}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
     </tr>
   `
       )
       .join("");
 
     // Generate notes from po.notes field - completely dynamic
 const notesRows = (() => {
   if (po.notes) {
     // Check if notes is a string or array
     if (typeof po.notes === 'string') {
       // Split string by newlines and create rows
       const noteLines = po.notes.split('\n').filter(line => line.trim() !== '');
       if (noteLines.length > 0) {
         return noteLines.map((note, idx) => `
           <tr>
             <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">${idx + 1}.</td>
             <td style="border: 1px solid #000; padding: 4px;">${note.trim()}</td>
           </tr>
         `).join("");
       }
     } else if (Array.isArray(po.notes) && po.notes.length > 0) {
       // Handle array of notes
       return po.notes.map((note, idx) => `
         <tr>
           <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">${idx + 1}.</td>
           <td style="border: 1px solid #000; padding: 4px;">${note}</td>
         </tr>
       `).join("");
     }
   }
   
   // Return empty row if no notes
   return `
     <tr>
       <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">-</td>
       <td style="border: 1px solid #000; padding: 4px; color: #666; font-style: italic;">No notes available</td>
     </tr>
   `;
 })();
 
     // Generate general conditions display
     const generalConditionsDisplay = po.generalConditions && po.generalConditions.length > 0
       ? po.generalConditions.map((condition, idx) => `
           <div style="margin-bottom: 8px;">
             <strong>${idx + 1}. ${condition.name}:</strong><br>
             ${condition.description}
           </div>
         `).join("")
       : "";
 
     // Number to words function
     const numberToWords = (num) => {
       const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
       const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
       const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
       
       if (num === 0) return 'Zero';
       if (num < 10) return ones[num];
       if (num < 20) return teens[num - 10];
       if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
       if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
       if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
       if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
       return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
     };
 
     const html = `
     <!DOCTYPE html>
     <html>
     <head>
       <title>Purchase Order - ${po.poNumber}</title>
       <style>
         @page {
           size: A4;
           margin: 0.5in;
         }
         body {
           font-family: Arial, sans-serif;
           font-size: 11px;
           line-height: 1.2;
           margin: 0;
           padding: 0;
           color: #000;
         }
         .header-table {
           width: 100%;
           border-collapse: collapse;
           border: 2px solid #000;
           margin-bottom: 0;
         }
         .header-table td {
           border: 1px solid #000;
           padding: 4px;
           vertical-align: top;
         }
         .main-table {
           width: 100%;
           border-collapse: collapse;
           border: 2px solid #000;
           margin-top: 0;
         }
         .main-table td, .main-table th {
           border: 1px solid #000;
           padding: 4px;
           vertical-align: top;
         }
         .center {
           text-align: center;
         }
         .bold {
           font-weight: bold;
         }
         .section-header {
           background-color: #f0f0f0;
           font-weight: bold;
           text-align: center;
           padding: 6px;
         }
         .amount-cell {
           text-align: right;
           padding-right: 8px;
         }
         .signature-section {
           margin-top: 20px;
           text-align: center;
         }
         .print-note {
           font-size: 10px;
           color: #666;
           text-align: center;
           margin-top: 10px;
         }
         .no-border {
           border: none !important;
         }
         .logo-img {
           max-width: 100px;
           max-height: 80px;
           object-fit: contain;
         }
         .general-conditions {
           padding: 8px;
           font-size: 10px;
           line-height: 1.3;
         }
       </style>
     </head>
     <body>
       <!-- Header Section -->
       <table class="header-table">
         <tr>
           <td colspan="6" class="section-header">PURCHASE ORDER</td>
         </tr>
         <tr>
           <td class="bold" style="width: 120px;">PO No.:</td>
           <td style="width: 150px;">${po.poNumber}</td>
           <td rowspan="6" style="text-align: center; vertical-align: middle; width: 200px;">
           ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo-img">` : `<div style="border: 1px dashed #ccc; padding: 20px; color: #999;">No Logo</div>`}
  
           </td>
         </tr>
         <tr>
           <td class="bold">PO Date:</td>
           <td>${po.date}</td>
         </tr>
         <tr>
           <td class="bold">Rev. No.:</td>
           <td>${po.revisionNumber || "1.0"}</td>
         </tr>
         <tr>
           <td class="bold">Rev. Date:</td>
           <td>${po.revisionDate || po.date}</td>
         </tr>
         <tr>
           <td class="bold">Ref No.:</td>
           <td>${po.refNumber || ""}</td>
         </tr>
         <tr>
           <td class="bold">Ref Date:</td>
           <td>${po.refDate || po.date}</td>
         </tr>
         <tr>
           <td class="bold">Supplier Details:</td>
           <td colspan="2">
             <strong>M/s. ${vendor.name1 || vendor.name}</strong><br>
             ${vendor.address1 || ""}<br>
             ${vendor.address2 || ""}<br>
             ${vendor.city || ""}, ${vendor.region || ""}<br>
             ${vendor.country || ""}<br>
             ${vendor.pincode || ""}<br>
             Contact Details: ${vendor.contactNo || ""}<br>
             ${vendor.email || ""}
           </td>
         </tr>
         <tr>
           <td class="bold">GSTIN:</td>
           <td>${company.gstin || ""}</td>
           <td></td>
         </tr>
       </table>
 
       <!-- Bill To and Ship To -->
       <table class="main-table">
         <tr>
           <td class="bold section-header">BILL TO:</td>
           <td class="bold section-header">SHIP TO:</td>
         </tr>
         <tr>
           <td style="width: 50%; padding: 8px;">
             <strong>M/s. ${company.name || ""}</strong><br>
             ${company.address1 || ""}<br>
             ${company.address || ""}<br>
             ${company.city || ""} ${company.state || ""}<br>
        
             <strong>Tel:</strong> ${company.phone || ""}<br>
             <strong>Email:</strong> ${company.email || ""}
           </td>
           <td style="width: 50%; padding: 8px;">
             <strong>M/s. ${company.name || ""}</strong><br>
             ${company.address1 || ""}<br>
             ${company.address || ""}<br>
             ${company.city || ""} ${company.state || ""}<br>
            
             <strong>Tel:</strong> ${company.phone || ""}<br>
             <strong>Email:</strong> ${company.email || ""}
           </td>
         </tr>
       </table>
 
       <!-- Items Section -->
       <table class="main-table">
         <tr>
           <td colspan="9" class="section-header">PLEASE SUPPLY THE FOLLOWING ITEMS AS PER THE DETAILS MENTIONED BELOW:</td>
         </tr>
         <tr class="bold" style="background-color: #f0f0f0;">
           <td class="center">SI No</td>
           <td class="center">Part No</td>
           <td class="center">Description</td>
           <td class="center">Schedule</td>
           <td class="center">Quantity & Unit</td>
           <td class="center">Unit Price</td>
          
           <td class="center">Unit Price (₹)</td>
           <td class="center">Int (₹)</td>
            <td class="center">Total</td>
         </tr>
         ${itemRows}
         <tr>
           <td colspan="6" class="bold">Basic Total:</td>
           <td class="amount-cell bold">₹${po.total || 0}</td>
           <td colspan="2"></td>
         </tr>
       </table>
 
       <!-- Notes Section -->
       <table class="main-table">
         <tr>
           <td colspan="2" class="section-header">NOTES:</td>
         </tr>
         ${notesRows}
       </table>
 
       <!-- Tax Summary -->
       <table class="main-table">
         <tr>
           <td style="width: 60%;">
             <strong>Total Amount (In Words):</strong><br>
             Rupees ${numberToWords(Math.floor(po.finalTotal || po.total || 0))} Only
           </td>
           <td style="width: 40%;">
             <table style="width: 100%; border-collapse: collapse;">
               <tr>
                 <td class="no-border" style="padding: 2px;"><strong>SGST(${po.sgst || 0}%):</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;">₹${((po.total * (po.sgst || 0)) / 100).toFixed(2)}</td>
               </tr>
               <tr>
                 <td class="no-border" style="padding: 2px;"><strong>CGST(${po.cgst || 0}%):</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;">₹${((po.total * (po.cgst || 0)) / 100).toFixed(2)}</td>
               </tr>
               <tr style="border-top: 1px solid #000;">
                 <td class="no-border" style="padding: 2px;"><strong>Net Total:</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;"><strong>₹${po.finalTotal || po.total || 0}</strong></td>
               </tr>
             </table>
           </td>
         </tr>
       </table>
 
       <!-- Remarks -->
       <table class="main-table">
         <tr>
           <td class="bold" style="width: 100px;">REMARKS:</td>
           <td>${po.remarks || ""}</td>
         </tr>
       </table>
 
       <!-- Terms and Conditions -->
       <table class="main-table">
         <tr>
           <td style="width: 50%;">
             <strong>TERMS & CONDITIONS:</strong><br>
             <div class="general-conditions">
               ${generalConditionsDisplay || po.termsAndConditions || ""}
             </div>
           </td>
           <td style="width: 50%;">
             <strong>PREPARED BY:</strong> ${po.preparedby || ""}<br><br>
             <strong>APPROVED BY:</strong> ${po.approvedby || ""}
           </td>
         </tr>
       </table>
 
       <!-- Footer -->
      
 
       <div class="print-note">
         This is an electronically generated document and does not require signature.
       </div>
     </body>
     </html>
   `;
 
     // Open print window
     const printWindow = window.open("", "_blank", "width=800,height=600");
     printWindow.document.write(html);
     printWindow.document.close();
     printWindow.focus();
 
     // Print after content loads
     printWindow.onload = function () {
       printWindow.print();
     };
   } catch (error) {
     console.error("Error generating print:", error);
     alert("Error generating print. Please try again.");
   }
 };



  return (
    <div className="content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Purchase Order Display</h2>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {(searchQuery || dateFilter.fromDate || dateFilter.toDate) && (
              <button
                className="btn btn-outline-secondary"
                onClick={clearAllFilters}
              >
                <i className="fas fa-times me-2"></i>Clear All Filters
              </button>
            )}
          </div>

          {/* Search and Filter Controls */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Search All Fields</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search across all fields (PO Number, Vendor, Category, etc.)..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter.fromDate}
                onChange={(e) =>
                  handleDateFilterChange("fromDate", e.target.value)
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter.toDate}
                onChange={(e) =>
                  handleDateFilterChange("toDate", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="mb-3">
            <small className="text-muted">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredPos.length)} of{" "}
              {filteredPos.length} purchase orders
              {filteredPos.length !== pos.length && (
                <span className="badge bg-info ms-2">Filtered Results</span>
              )}
            </small>
          </div>

          {/* Purchase Orders Table */}
          <div className="table-responsive">
            <table className="table table-sm table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>PO Number</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Quotation Number</th>
                  <th>Delivery Location</th>
                  <th>Delivery Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((po) => (
                    <tr key={po._id}>
                      <td>
                        <span className="badge bg-primary">{po.poNumber}</span>
                      </td>
                      <td>{po.date}</td>
                      <td>{po.vendor}</td>
                      <td>{po.category}</td>
                      <td>{po.quotationNumber}</td>
                      <td>{po.deliveryLocation}</td>
                      <td>{po.deliveryAddress}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePrint(po)}
                        >
                          <i className="fas fa-print me-1"></i>Print
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
                      <p className="text-muted mb-0">
                        No purchase orders found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Purchase Orders pagination">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <li
                      key={number}
                      className={`page-item ${currentPage === number ? "active" : ""
                        }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </li>
                  )
                )}

                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""
                    }`}
                >
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

      {/* Search Modal */}
      {showSearchModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Search Purchase Orders
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeSearchModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Search Controls */}
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search By</label>
                    <select
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="poNumber">PO Number</option>
                      <option value="vendor">Vendor</option>
                      <option value="category">Category</option>
                      <option value="quotationNumber">Quotation Number</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${searchType === "poNumber" ? "PO Number" : searchType
                          }...`}
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleViewAll}>
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {searchResults.length > 0 && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleClearResults}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {searchResults.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>PO Number</th>
                          <th>Date</th>
                          <th>Vendor</th>
                          <th>Category</th>
                          <th>Quotation Number</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((po, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="badge bg-primary">
                                {po.poNumber}
                              </span>
                            </td>
                            <td>{po.date}</td>
                            <td>{po.vendor}</td>
                            <td>{po.category}</td>
                            <td>{po.quotationNumber}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => selectPOFromSearch(po)}
                              >
                                <i className="fas fa-check me-1"></i>Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {pos.length === 0
                          ? "No purchase orders loaded from API"
                          : searchQuery
                            ? `No purchase orders found matching "${searchQuery}"`
                            : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeSearchModal}
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

export default PurchaseOrderDisplay;