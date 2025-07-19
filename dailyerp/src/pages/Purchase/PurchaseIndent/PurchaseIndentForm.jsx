import React, { useEffect, useState } from 'react';
import axios from 'axios';

const baseUnits = ['Piece', 'Box', 'Kg', 'Ltr'];

const PurchaseIndent = () => {
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [commonLocation, setCommonLocation] = useState('');
  const [commonBuyerGroup, setCommonBuyerGroup] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize selectedItems with 4 default manual rows
  const [selectedItems, setSelectedItems] = useState([
    {
      materialId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      materialgroup: '',
      qty: '',
      deliveryDate: '',
      isManual: true,
    },
    {
      materialId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      location: '',
      materialgroup: '',
      qty: '',
      deliveryDate: '',
      buyerGroup: '',
      isManual: true,
    },
    {
      materialId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      location: '',
      materialgroup: '',
      qty: '',
      deliveryDate: '',
      buyerGroup: '',
      isManual: true,
    },
    {
      materialId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      location: '',
      materialgroup: '',
      qty: '',
      deliveryDate: '',
      buyerGroup: '',
      isManual: true,
    }
  ]);
  // Modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('materialId');
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const [showIndentIdModal, setShowIndentIdModal] = useState(false);
  const [locations, setLocations] = useState([]);
  // Indent ID selection states
  const [indentIdType, setIndentIdType] = useState('');
  const [externalIndentId, setExternalIndentId] = useState('');
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [savedIndentsCurrentPage, setSavedIndentsCurrentPage] = useState(1);
  const [savedIndentsPerPage] = useState(3);

  // Material ID prefix
  const MATERIAL_PREFIX = 'MMNR-';

  // Fetch materials
  useEffect(() => {
    axios.get('http://localhost:8080/api/material')
      .then(res => {
        const filteredMaterials = res.data.filter(
          (material) => !material.isDeleted && !material.isBlocked
        );
        setMaterials(filteredMaterials);
      })
      .catch(err => console.error(err));
    axios
      .get("http://localhost:8080/api/locations")
      .then((res) => setLocations(res.data));
  }, []);

  // Fetch purchase categories
  useEffect(() => {
    axios.get('http://localhost:8080/api/purchasecategory')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  // Handle material selection
  const handleMaterialSelect = (mat) => {
    setSelectedMaterial(mat);
    setSelectedItems(prev => [...prev, {
      ...mat,
      qty: 1,
      deliveryDate: '',
      buyerGroup: '',
      isManual: false,
    }]);
  };

  const addManualRow = () => {
    setSelectedItems(prev => [...prev, {
      materialId: '',
      description: '',
      baseUnit: '',
      orderUnit: '',
      location: '',
      materialgroup: '',
      qty: '',
      deliveryDate: '',
      buyerGroup: '',
      isManual: true,
    }]);
  };

  const removeItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
    // Reset pagination if needed
    const totalPages = Math.ceil((selectedItems.length - 1) / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  };

  const updateField = async (index, field, value) => {
    const updated = [...selectedItems];
    updated[index][field] = value;

    if (field === 'materialId' && updated[index].isManual) {
      try {
        const res = await axios.get(`http://localhost:8080/api/material/byId/${value}`);
        const mat = res.data;
        if (mat) {
          updated[index] = {
            ...updated[index],
            materialId: mat.materialId,
            description: mat.description,
            baseUnit: mat.baseUnit,
            orderUnit: mat.orderUnit,
            location: mat.location,
            materialgroup: mat.materialgroup,
            isManual: true,
          };
        }
      } catch (err) {
        console.error('Material ID not found:', value);
      }
    }

    setSelectedItems(updated);
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchType === 'materialId') {
      let searchTerm = searchQuery;

      if (/^\d+$/.test(searchQuery)) {
        searchTerm = MATERIAL_PREFIX + searchQuery;
      }

      const filtered = materials.filter(material => {
        const materialId = material.materialId || '';
        return materialId.toLowerCase().includes(searchTerm.toLowerCase());
      });

      setSearchResults(filtered);
    } else {
      const filtered = materials.filter(material => {
        const description = material.description || '';
        return description.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setSearchResults(filtered);
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, materials]);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleViewAll = () => {
    setSearchResults(materials);
    setSearchQuery('');
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  const openSearchModal = (index) => {
    setCurrentEditIndex(index);
    setShowSearchModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setCurrentEditIndex(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const selectMaterialFromSearch = (material) => {
    if (currentEditIndex !== null) {
      const updated = [...selectedItems];
      updated[currentEditIndex] = {
        ...updated[currentEditIndex],
        materialId: material.materialId,
        description: material.description,
        baseUnit: material.baseUnit,
        orderUnit: material.orderUnit,
        location: material.location,
        materialgroup: material.materialgroup,
        isManual: true,
      };
      setSelectedItems(updated);
    }
    closeSearchModal();
  };

  const [savedIndents, setSavedIndents] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:8080/api/indent/get')
      .then(res => setSavedIndents(res.data))
      .catch(err => console.error("Failed to fetch saved indents", err));
  }, []);


  const handleSubmitIndent = async () => {
    if (!selectedCategory) {
      alert("Please select a purchase category");
      return;
    }

    if (!commonLocation || !commonBuyerGroup) {
      alert("Please fill in Location and Buyer Group");
      return;
    }

    // Filter out empty/null rows before submitting
    const validItems = selectedItems.filter(item => {
      return item.materialId && item.materialId.trim() !== '' &&
        item.description && item.description.trim() !== '' &&
        item.qty && item.qty > 0;
    });

    if (validItems.length === 0) {
      alert("Please add at least one valid item with Material ID, Description, and Quantity");
      return;
    }

    const selectedCategoryObj = categories.find(cat =>
      cat.name === selectedCategory || cat.categoryName === selectedCategory || cat._id === selectedCategory
    );

    try {
      const payload = {
        indentIdType: indentIdType,
        externalIndentId: externalIndentId,
        categoryId: selectedCategoryObj._id,
        categoryName: selectedCategoryObj.name || selectedCategoryObj.categoryName,
        location: commonLocation,
        buyerGroup: commonBuyerGroup,
        documentDate: documentDate,
        items: validItems,
      };
      if (indentIdType === "") {
        setPendingFormData(payload);
        setShowModal(false);
        setShowIndentIdModal(true);
      } else {
        if (indentIdType === 'internal') {
          const res = await axios.post('http://localhost:8080/api/indent/create', payload);
          alert(`Indent saved successfully with ID: ${res.data.indentId}`);
        }
        else if (indentIdType === 'external') {
          if (!externalIndentId || externalIndentId.trim() === '') {
            alert("Please enter an External Indent ID");
            return;
          }
          payload.indentId = externalIndentId;
          const res = await axios.post('http://localhost:8080/api/indent/create', payload);
          alert(`Indent saved successfully with External ID: ${res.data.indentId}`);
        } else {
          alert(`Indent saved successfully with ID: ${res.data.indentId}`);
        }
        // Reset form
        setShowIndentIdModal(false);
        setSelectedItems([]);
        setCommonLocation('');
        setCommonBuyerGroup('');
        setDocumentDate(new Date().toISOString().split('T')[0]);
        setCurrentPage(1);
      }
      // Refresh saved indents
      axios.get('http://localhost:8080/api/indent/get')
        .then(res => setSavedIndents(res.data))
        .catch(err => console.error("Failed to fetch saved indents", err));
    } catch (err) {
      console.error(err);
      alert("Failed to save indent");
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = selectedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(selectedItems.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination component
  const PaginationComponent = ({ currentPage, totalPages, onPageChange, size = "normal" }) => {
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

    const buttonClass = size === "small" ? "btn-sm" : "";

    return (
      <nav aria-label="Page navigation mt-2">
        <ul className="pagination justify-content-center mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className={`page-link ${buttonClass}`}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className={`page-link ${buttonClass}`} onClick={() => onPageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className={`page-link ${buttonClass}`}>...</span></li>}
            </>
          )}

          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button
                className={`page-link ${buttonClass}`}
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className={`page-link ${buttonClass}`}>...</span></li>}
              <li className="page-item">
                <button className={`page-link ${buttonClass}`} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className={`page-link ${buttonClass}`}
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

  const handleCloseIndentIdModal = () => {
    setShowIndentIdModal(false);
    setIndentIdType('');
    setExternalIndentId('');
    setPendingFormData(null);
    setShowModal(true);
  };
  const handleIndentIdTypeSelection = (type) => {
    setIndentIdType(type);
    if (type === 'internal') {
      handleSubmitIndent();
    }

  };
  return (
    <>
      <div className="content">
        {/* Header Section */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Purchase Enquiry</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Purchase
                </li>
                <li className="breadcrumb-item active" aria-current="page">Purchase Enquiry</li>
              </ol>
            </nav>
          </div>

        </div>
        <div className="accordion todo-accordion" id="accordionExample">
          <div className="accordion-item mb-3">
            <div className="row align-items-center mb-3 row-gap-3">
              <div className="col-lg-4 col-sm-6">
                <div className="accordion-header" id="headingTwo">
                  <div className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-controls="collapseTwo" aria-expanded="false">
                    <div className="d-flex align-items-center w-100">
                      <div className="me-2">
                        <a href="javascript:void(0);">
                          <span><i className="fas fa-chevron-down"></i></span>
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <span><i className="fas fa-clipboard-list me-2"></i></span>
                        <h5 className="fw-semibold">Indent Header</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample" >
              <div className="accordion-body">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-xl-3  row">
                        <div className="col-xl-6 col-lg-6 ">
                          <label className="form-label-sm">Purchase Category<span className="text-danger">*</span></label></div>
                        <div className="col-xl-5">
                          <select
                            className="form-select form-select-sm"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat, idx) => (
                              <option key={idx} value={cat.name || cat.categoryName || cat._id}>
                                {cat.name || cat.categoryName || `Category ${idx + 1}`}
                              </option>
                            ))}
                          </select></div>
                      </div>
                      <div className="col-md-2 row">
                        <div className="col-xl-6">
                          <label className="form-label-sm">Doc Date <span className="text-danger">*</span></label></div>
                        <div className="col-xl-6">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={documentDate}
                            onChange={(e) => setDocumentDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-md-2 row">
                        <div className="col-xl-5">
                          <label className="form-label-sm">Location<span className="text-danger">*</span></label>
                        </div>
                        <div className="col-xl-7 ">
                          <select
                            className="form-control form-control-sm"
                            value={commonLocation}
                            onChange={(e) => setCommonLocation(e.target.value)}
                          >
                            <option value="">Select Location</option>
                            {locations.map((loc, idx) => (
                              <option key={idx} value={loc.name || loc._id}>
                                {loc.name || loc._id}
                              </option>
                            ))}
                          </select></div>
                      </div>
                      <div className="col-md-3 row">
                        <div className="col-xl-5">
                          <label className="form-label-sm">Buyer Group <span className="text-danger">*</span></label>
                        </div>
                        <div className="col-xl-7 ">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={commonBuyerGroup}
                            onChange={(e) => setCommonBuyerGroup(e.target.value)}
                            placeholder="Buyer Group"
                          /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="accordion-item mb-3">
            <div className="row align-items-center mb-3 row-gap-3">
              <div className="col-lg-4 col-sm-6">
                <div className="accordion-header" id="headingThree">
                  <div className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-controls="collapseThree" aria-expanded="false">
                    <div className="d-flex align-items-center w-100">
                      <div className="me-2">
                        <a href="javascript:void(0);">
                          <span><i className="fas fa-chevron-down"></i></span>
                        </a>
                      </div>
                      <div className="d-flex align-items-center">
                        <span><i className="fas fa-list me-2"></i></span>
                        <h5 className="fw-semibold">Item List</h5>
                        <span className="badge bg-light rounded-pill ms-2">({selectedItems.length})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample" >
              <div className="accordion-body">
                <div className="card">

                  <div className="card-body ">
                    {selectedItems.length > 0 ? (
                      <>
                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <table className=" table-bordered table-sm mb-0">
                            <thead className=" sticky-top">
                              <tr>
                                <th >S.No</th>
                                <th >Material No</th>
                                <th >Description</th>
                                <th >Qty</th>
                                <th >Base Unit</th>
                                <th >Delivery Date</th>
                                <th >Order Unit</th>
                                <th >Material Group</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentItems.map((item, idx) => {
                                const actualIndex = indexOfFirstItem + idx;
                                return (
                                  <tr key={actualIndex}>
                                    <td className="text-center fw-bold">{actualIndex + 1}</td>
                                    <td>
                                      {item.isManual ? (
                                        <div className="input-group input-group-sm">
                                          <input
                                            className="form-control form-control-sm w-50"
                                            value={item.materialId}
                                            onChange={(e) => updateField(actualIndex, 'materialId', e.target.value)}
                                            placeholder="Material ID"
                                          />
                                          <button
                                            className="btn btn-outline-info btn-sm"
                                            onClick={() => openSearchModal(actualIndex)}
                                            title="Search Material"
                                          >
                                            <i className="fas fa-search"></i>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="badge ">{item.materialId}</span>
                                      )}
                                    </td>
                                    <td>
                                      {item.isManual ? (
                                        <input
                                          className="form-control form-control-sm"
                                          value={item.description}
                                          onChange={(e) => updateField(actualIndex, 'description', e.target.value)}
                                          placeholder="Description"
                                          readOnly={item.materialId ? true : false}
                                        />
                                      ) : (
                                        <span title={item.description}>{item.description}</span>
                                      )}
                                    </td>
                                    <td>
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={item.qty}
                                        onChange={(e) => updateField(actualIndex, 'qty', e.target.value)}
                                        min="1"
                                      />
                                    </td>
                                    <td>
                                      <select
                                        value={item.baseUnit}
                                        onChange={(e) => updateField(actualIndex, 'baseUnit', e.target.value)}
                                        className="form-select form-select-sm"
                                      >
                                        <option value="">--Select--</option>
                                        {baseUnits.map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td>
                                      <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={item.deliveryDate}
                                        onChange={(e) => updateField(actualIndex, 'deliveryDate', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <select
                                        value={item.orderUnit}
                                        onChange={(e) => updateField(actualIndex, 'orderUnit', e.target.value)}
                                        className="form-select form-select-sm"
                                      >
                                        <option value="">--Select--</option>
                                        {baseUnits.map(unit => (
                                          <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td>
                                      <span className="badge bg-secondary">{item.materialgroup || '-'}</span>
                                    </td>
                                    <td>
                                      <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => removeItem(actualIndex)}
                                        title="Delete Item"
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {/* Pagination for Selected Items */}
                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={paginate}
                            size="small"

                          />
                      </>
                    ) : (
                      <div className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No materials selected. Click "Add Manual Entry" to start.</p>
                      </div>
                    )}   <div className="col-xl-2">
                      <button onClick={addManualRow} className="btn btn-outline-primary btn-sm me-2 mt-2">
                        <i className="fas fa-plus me-1"></i>Add Manual Entry
                      </button></div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
        {/* Selected Materials Section */}
        <div className="row mb-4">

          <div className="col-md-6 col-xl-2 col-sm-12">
            <button
              onClick={handleSubmitIndent}
              className="btn btn-success btn-sm"
              disabled={!selectedCategory || selectedItems.length === 0}
            >
              <i className="fas fa-save me-1"></i>Save Indent
            </button>
          </div>
        </div>

        {/* Material Search Modal */}
        {showSearchModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-search me-2"></i>Search Materials
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
                        className="form-select form-select-sm"
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="materialId">Material ID</option>
                        <option value="description">Description</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Search Query</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder={
                            searchType === 'materialId'
                              ? 'Enter Material ID (e.g., MMNR-100000 or 100000)'
                              : 'Search by Description...'
                          }
                          value={searchQuery}
                          onChange={handleSearchInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">&nbsp;</label>
                      <div className="d-flex gap-2">
                        <button className="btn btn-info btn-sm" onClick={handleViewAll}>
                          <i className="fas fa-list me-1"></i>View All
                        </button>
                        {searchResults.length > 0 && (
                          <button className="btn btn-outline-secondary btn-sm" onClick={handleClearResults}>
                            <i className="fas fa-times me-1"></i>Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Search Results */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {searchResults.length > 0 ? (
                      <table className="table table-bordered table-sm">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th>Material ID</th>
                            <th>Description</th>
                            <th>Base Unit</th>
                            <th>Location</th>
                            <th>Material Group</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.map((material, idx) => (
                            <tr key={idx}>
                              <td><span >{material.materialId}</span></td>
                              <td>{material.description}</td>
                              <td><span className="badge bg-secondary">{material.baseUnit}</span></td>
                              <td>{material.location}</td>
                              <td><span className="badge bg-info">{material.materialgroup}</span></td>
                              <td>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => selectMaterialFromSearch(material)}
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
                          {materials.length === 0
                            ? 'No materials loaded from API'
                            : searchQuery
                              ? `No materials found matching "${searchQuery}"`
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

        {/* Indent ID Type Modal */}
        {showIndentIdModal && (
          <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-modal="true" role="dialog">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">Select Indent ID Type</h4>
                    <button type="button" className="btn-close" onClick={handleCloseIndentIdModal} aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <p className="mb-4">Choose how you want to create the Indent ID:</p>

                    {indentIdType === 'external' ? (
                      <div>
                        <div className="mb-3">
                          <label className="form-label">External Indent ID</label>
                          <input
                            type="text"
                            className="form-control"
                            value={externalIndentId}
                            onChange={(e) => setExternalIndentId(e.target.value)}
                            maxLength={50}
                            required
                            placeholder="Enter custom Indent ID (max 50 characters)"
                          />
                          <small className="form-text text-muted">
                            {externalIndentId.length}/50 characters
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={handleSubmitIndent}
                            disabled={!externalIndentId.trim()}
                          >
                            Create Indent
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setIndentIdType('')}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={() => handleIndentIdTypeSelection('internal')}
                          >
                            <i className="isax isax-setting-2 me-2"></i>
                            Internal
                            <small className="d-block mt-1">Auto-generated ID</small>
                          </button>
                          <button
                            className="btn btn-secondary btn-lg"
                            onClick={() => handleIndentIdTypeSelection('external')}
                          >
                            <i className="isax isax-edit me-2"></i>
                            External
                            <small className="d-block mt-1">Custom ID</small>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PurchaseIndent;