import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalesIndentsummary = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [savedIndents, setSavedIndents] = useState([]);
    const [filteredIndents, setFilteredIndents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('indentId');
    const [loading, setLoading] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null)
  const [selectedQuotation, setSelectedQuotation] = useState(null)
    useEffect(() => {
        fetchIndents();
    }, []);

    const fetchIndents = () => {
        setLoading(true);
        axios.get('http://localhost:8080/api/salerequest/get')
            .then(res => {
                // Sort by latest first (using createdAt or documentDate)
                const sortedIndents = res.data.sort((a, b) =>
                    new Date(b.createdAt || b.documentDate) - new Date(a.createdAt || a.documentDate)
                );
                setSavedIndents(sortedIndents);
                setFilteredIndents(sortedIndents);
            })
            .catch(err => console.error("Failed to fetch saved indents", err))
            .finally(() => setLoading(false));
    };

    // Handle status change for delete/undelete and block/unblock - NEW FUNCTION
    const handleStatusChange = async (indentId, statusType, isChecked) => {
        try {
            const updateData = {
                [statusType]: isChecked
            };

            await axios.put(`http://localhost:8080/api/salerequest/status/${indentId}`, updateData);

            // Update local state for both savedIndents and filteredIndents
            const updateIndentStatus = (indents) =>
                indents.map(indent =>
                    indent._id === indentId
                        ? { ...indent, [statusType]: isChecked }
                        : indent
                );

            setSavedIndents(updateIndentStatus);
            setFilteredIndents(prev => updateIndentStatus(prev));

            alert('Status updated successfully!');
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status!');
        }
    };

    // Modal functions
    const openSearchModal = () => {
        setShowSearchModal(true);
        setSearchResults(savedIndents); // Show all indents initially
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim() === '') {
            setSearchResults(savedIndents);
            return;
        }

        // Real-time search in modal
        const filtered = savedIndents.filter(indent => {
            if (searchType === 'indentId') {
                // Handle both full code (INDENT-100001) and just number (100001)
                const query = value.toLowerCase();
                const indentId = indent.indentId.toLowerCase();
                return indentId.includes(query) ||
                    indentId.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''));
            } else if (searchType === 'location') {
                return indent.location.toLowerCase().includes(value.toLowerCase());
            } else if (searchType === 'buyerGroup') {
                return indent.buyerGroup.toLowerCase().includes(value.toLowerCase());
            } else if (searchType === 'categoryName') {
                return indent.categoryName.toLowerCase().includes(value.toLowerCase());
            }
            return false;
        });

        setSearchResults(filtered);
    };
  useEffect(() => {
    // Filter quotations based on selectedQuotationId
    const result = savedIndents.find(q => q._id === selectedQuotationId);
    setSelectedQuotation(result);
  }, [selectedQuotationId, savedIndents]);
    const handleViewAll = () => {
        setSearchResults(savedIndents);
        setSearchQuery('');
    };

    const handleClearResults = () => {
        setSearchResults([]);
        setSearchQuery('');
    };

    const selectIndentFromSearch = (indent) => {
        // Close modal and show selected indent
        setFilteredIndents([indent]);
        setCurrentPage(1);
        closeSearchModal();
    };

    const handleShowAllIndents = () => {
        setFilteredIndents(savedIndents);
        setCurrentPage(1);
    };

    const handlePrintSingle = (indent) => {
        const printContent = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    Purchase Indent Details
                </h2>
                
                <div style="margin: 20px 0;">
                    <h3 style="color: #007bff;">Indent Information</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; width: 150px;">Indent ID:</td>
                            <td style="padding: 8px;">${indent.indentId}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 8px; font-weight: bold;">Document Date:</td>
                            <td style="padding: 8px;">${new Date(indent.documentDate).toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Category:</td>
                            <td style="padding: 8px;">${indent.categoryName}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 8px; font-weight: bold;">Location:</td>
                            <td style="padding: 8px;">${indent.location}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold;">Buyer Group:</td>
                            <td style="padding: 8px;">${indent.buyerGroup}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin: 20px 0;">
                    <h3 style="color: #007bff;">Material Details</h3>
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <thead>
                            <tr style="background-color: #007bff; color: white;">
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">S.No</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Material ID</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Qty</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Base Unit</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Order Unit</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Delivery Date</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Material Group</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${indent.items.map((item, i) => `
                                <tr style="${i % 2 === 0 ? 'background-color: #f8f9fa;' : ''}">
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${i + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.materialId}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.qty}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.baseUnit}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.orderUnit}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.deliveryDate}</td>
                                    <td style="border: 1px solid #ddd; padding: 8px;">${item.materialgroup || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                    Generated on: ${new Date().toLocaleString()}
                </div>
            </div>
        `;

        const win = window.open('', '', 'width=900,height=700');
        win.document.write('<html><head><title>Indent Print - ' + indent.indentId + '</title></head><body>');
        win.document.write(printContent);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    };

    // Pagination logic
    const indexOfLastIndent = currentPage * itemsPerPage;
    const indexOfFirstIndent = indexOfLastIndent - itemsPerPage;
    const currentIndents = filteredIndents.slice(indexOfFirstIndent, indexOfLastIndent);
    const totalPages = Math.ceil(filteredIndents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                    </li>

                    {startPage > 1 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => onPageChange(1)}>1</button>
                            </li>
                            {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                        </>
                    )}

                    {pageNumbers.map(number => (
                        <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange(number)}
                            >
                                {number}
                            </button>
                        </li>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                            <li className="page-item">
                                <button className="page-link" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                            </li>
                        </>
                    )}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="content">
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                <div className="my-auto mb-2">
                    <h2 className="mb-1">Sales Enquiry List</h2>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                            </li>
                            <li className="breadcrumb-item">
                                Sales
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Sales Enquiry List</li>
                        </ol>
                    </nav>
                </div>

            </div>
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header text-white d-flex justify-content-between align-items-center">
                            <h6>
                                <i className="fas fa-archive me-2"></i>
                                Sales Indents Summary ({filteredIndents.length})
                            </h6>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-light btn-sm"
                                    onClick={openSearchModal}
                                >
                                    <i className="fas fa-search me-1"></i>Search Indents
                                </button>
                                {filteredIndents.length !== savedIndents.length && (
                                    <button
                                        className="btn btn-outline-light btn-sm"
                                        onClick={handleShowAllIndents}
                                    >
                                        <i className="fas fa-list me-1"></i>Show All
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Loading indents...</p>
                                </div>
                            ) : currentIndents.length > 0 ? (
                                <>
                                    <div className="table-responsive">
                                        <table className="table-sm table table-bordered align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th >S.No</th>
                                                    <th>Indent ID</th>
                                                    <th>Document Date</th>
                                                    <th>Location</th>
                                                    <th>Buyer Group</th>
                                                    <th>Category</th>
                                                    <th>Materials</th>
                                                    <th>Delete Status</th>
                                                    <th>Block Status</th>
                                                    <th >Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentIndents.map((indent, idx) => {
                                                    const actualIndex = indexOfFirstIndent + idx;
                                                    return (
                                                        <tr key={indent._id}>
                                                            <td className="text-center">
                                                                {actualIndex + 1}
                                                            </td>
                                                            <td>
                                                                {indent.indentId}
                                                            </td>
                                                            <td>
                                                                {new Date(indent.documentDate).toLocaleDateString('en-IN')}
                                                            </td>
                                                            <td>
                                                                <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                                                {indent.location}
                                                            </td>
                                                            <td>
                                                                {indent.buyerGroup}
                                                            </td>
                                                            <td>
                                                                {indent.categoryName}
                                                            </td>
                                                            <td className="text-center">
                                                                {indent.items.length} items
                                                            </td>
                                                            <td>
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        checked={indent.isDeleted || false}
                                                                        onChange={(e) => handleStatusChange(indent._id, 'isDeleted', e.target.checked)}
                                                                    />
                                                                    <label className="form-check-label">
                                                                        {indent.isDeleted ? 'Deleted' : 'Active'}
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        checked={indent.isBlocked || false}
                                                                        onChange={(e) => handleStatusChange(indent._id, 'isBlocked', e.target.checked)}
                                                                    />
                                                                    <label className="form-check-label">
                                                                        {indent.isBlocked ? 'Blocked' : 'Active'}
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => handlePrintSingle(indent)}
                                                                    title="Print Indent"
                                                                >
                                                                    <i className="fas fa-print"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedQuotationId(indent._id)}
                                                                    className="btn btn-outline-primary btn-sm ms-2"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#standard-modal"
                                                                >
                                                                    <i className='ti ti-eye'></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="d-flex justify-content-center mt-4">
                                            <PaginationComponent
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={paginate}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">
                                        {filteredIndents.length !== savedIndents.length ? 'Filtered results' : 'No indents available'}
                                    </h5>
                                    <p className="text-muted">
                                        {filteredIndents.length !== savedIndents.length
                                            ? `Showing ${filteredIndents.length} filtered indents. Click "Show All" to see all indents.`
                                            : 'No purchase indents have been created yet.'
                                        }
                                    </p>
                                    {filteredIndents.length !== savedIndents.length && (
                                        <button
                                            className="btn btn-outline-primary mt-2"
                                            onClick={handleShowAllIndents}
                                        >
                                            <i className="fas fa-list me-1"></i>Show All Indents
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="fas fa-search me-2"></i>Search Purchase Indents
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
                                        <label className="form-label">Search Type</label>
                                        <select
                                            className="form-select"
                                            value={searchType}
                                            onChange={(e) => setSearchType(e.target.value)}
                                        >
                                            <option value="indentId">Indent ID</option>
                                            <option value="location">Location</option>
                                            <option value="buyerGroup">Buyer Group</option>
                                            <option value="categoryName">Category</option>
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
                                                placeholder={
                                                    searchType === 'indentId'
                                                        ? 'Enter Indent ID (e.g., INDENT-100001 or 100001)'
                                                        : `Search by ${searchType}...`
                                                }
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
                                                <button className="btn btn-outline-secondary" onClick={handleClearResults}>
                                                    <i className="fas fa-times me-1"></i>Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Search Results */}
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {searchResults.length > 0 ? (
                                        <table className="table table-hover">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th>Indent ID</th>
                                                    <th>Document Date</th>
                                                    <th>Location</th>
                                                    <th>Buyer Group</th>
                                                    <th>Category</th>
                                                    <th>Materials</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {searchResults.map((indent, idx) => (
                                                    <tr key={idx}>
                                                        <td><span className="badge bg-primary">{indent.indentId}</span></td>
                                                        <td>{new Date(indent.documentDate).toLocaleDateString('en-IN')}</td>
                                                        <td>
                                                            <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                                            {indent.location}
                                                        </td>
                                                        <td><span className="badge bg-info">{indent.buyerGroup}</span></td>
                                                        <td><span className="badge bg-success">{indent.categoryName}</span></td>
                                                        <td>
                                                            <span className="badge bg-warning text-dark">
                                                                {indent.items.length} items
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => selectIndentFromSearch(indent)}
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
                                                {savedIndents.length === 0
                                                    ? 'No indents loaded from API'
                                                    : searchQuery
                                                        ? `No indents found matching "${searchQuery}"`
                                                        : 'Enter search term or click "View All"'
                                                }
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
                  <div id="standard-modal" className="modal fade" tabindex="-1" role="dialog"
        aria-labelledby="standard-modalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title" id="standard-modalLabel">Quotation Items</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                {selectedQuotation?.items?.length > 0 &&
                  <table className='table-sm table-bordered'>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Material ID</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Base Unit</th>
                        <th>Order Unit</th>
                        <th>Location</th>
                        <th>Buyer Group</th>
                        <th>Unit</th>
                        {/* <th>Material Group</th> */}
                        <th>Delivery Date</th>
                        <th>Vendor</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation?.items.map((item, idx) => (
                        <tr key={item._id}>
                          <td>{idx + 1}</td>
                          <td>{item.materialId}</td>
                          <td>{item.description}</td>
                          <td>{item.qty}</td>
                          <td>{item.baseUnit}</td>
                          <td>{item.orderUnit}</td>
                          <td>{item.location}</td>
                          <td>{item.buyerGroup}</td>
                          <td>{item.unit}</td>
                          {/* <td>{selectedQuotation.categoryId}</td> Assuming Material Group is categoryId */}
                          <td>{new Date(item.deliveryDate).toLocaleDateString()}</td>
                          <td>{selectedQuotation.vendorName}</td>
                          <td>{item.price}</td>
                        </tr>
                      ))}

                    </tbody>
                  </table>}
              </div>
            </div>

          </div>
        </div>
      </div>
        </div>
    );
};

export default SalesIndentsummary;