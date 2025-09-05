import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesDeliveryForm() {
  const [categories, setCategories] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSONumber, setSelectedSONumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().substring(0, 10));
  const [actualDeliveryDate, setActualDeliveryDate] = useState(new Date().toISOString().substring(0, 10));
  const [locations, setLocations] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState('');
  const [deliveryNumber, setDeliveryNumber] = useState('');
  
  // SO Search States
  const [showSOModal, setShowSOModal] = useState(false);
  const [soSearchQuery, setSOSearchQuery] = useState('');
  const [soSearchResults, setSOSearchResults] = useState([]);

  // Customer Search States  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [salesGroup, setSalesGroup] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [generalConditions, setGeneralConditions] = useState([]);
  const [generalCondition, setgeneralCondition] = useState([]);
  
  // Transport Details
  const [transportDetails, setTransportDetails] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('Full');
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');
  const [remarks, setRemarks] = useState('');

  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');

  useEffect(() => {
    axios.get('http://localhost:8080/api/sales-order-categories', { params: { companyId, financialYear } })
      .then(res => setCategories(res.data));
    
    axios.get('http://localhost:8080/api/sales-orders', { params: { companyId, financialYear } })
      .then(res => {
        setSalesOrders(res.data);
      });

    axios.get('http://localhost:8080/api/general-conditions', { params: { companyId, financialYear } })
      .then(res => {
        const filteredConditions = res.data
          .filter(gc => !gc.isDeleted)
          .map(gc => ({
            _id: gc._id,
            name: gc.name,
            description: gc.description
          }));
        setGeneralConditions(filteredConditions);
      });

    axios.get("http://localhost:8080/api/locations", { params: { companyId, financialYear } })
      .then((res) => setLocations(res.data));
    
    axios.get('http://localhost:8080/api/customers', { params: { companyId, financialYear } })
      .then(res => setCustomers(res.data));

    setItems([
      ...Array(4).fill(null).map(() => ({
        materialId: '',
        description: '',
        orderedQuantity: 0,
        deliveredQuantity: 0,
        pendingQuantity: 0,
        baseUnit: '',
        unit: '',
        orderUnit: '',
        price: 0,
        priceUnit: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        actualDeliveryDate: new Date().toISOString().slice(0, 10),
        note: '',
        isPartialDelivery: false,
      }))
    ]);
  }, []);

  const selectSOFromSearch = (selectedSO) => {
    console.log("Selected Sales Order:", selectedSO);
    
    setSelectedSONumber(selectedSO.soNumber);
    setCustomer(selectedSO.customerName || '');
    setDeliveryLocation(selectedSO.deliveryLocation || '');
    setDeliveryAddress(selectedSO.deliveryAddress || '');
    setSalesGroup(selectedSO.salesGroup || '');
    setContactPerson(selectedSO.contactPerson || '');
    setgeneralCondition(selectedSO.generalCondition || []);
    // Map SO items to delivery items
    const mappedItems = selectedSO.items?.map(item => ({
      materialId: item.materialId || '',
      description: item.description || '',
      orderedQuantity: item.quantity || 0,
      deliveredQuantity: 0, // User will enter this
      pendingQuantity: item.quantity || 0, // Initially same as ordered
      baseUnit: item.baseUnit || '',
      unit: item.unit || '',
      orderUnit: item.orderUnit || '',
      price: item.price || 0,
      priceUnit: item.priceUnit || '',
      deliveryDate: item.deliveryDate || new Date().toISOString().slice(0, 10),
      actualDeliveryDate: new Date().toISOString().slice(0, 10),
      note: item.note || '',
      isPartialDelivery: false,
    })) || [];

    setItems(mappedItems);
    recalculateTotal(mappedItems);
    setShowSOModal(false);
  };

  const closeSOModal = () => {
    setShowSOModal(false);
    setSOSearchQuery('');
    setSOSearchResults([]);
  };

  const toggleSelection = (id, selectedList, setSelectedList) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter(item => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  // Customer Search Handlers
  const handleCustomerSearch = (query) => {
    setCustomerSearchQuery(query);
    if (query.trim()) {
      const filtered = customers.filter(c =>
        c.name1?.toLowerCase().includes(query.toLowerCase()) ||
        c.cnNo?.toLowerCase().includes(query.toLowerCase())
      );
      setCustomerSearchResults(filtered);
    } else {
      setCustomerSearchResults([]);
    }
  };

  const handleViewAllCustomers = () => {
    setCustomerSearchResults(customers);
  };

  const selectCustomerFromSearch = (selectedCustomer) => {
    setCustomer(selectedCustomer.name1 || selectedCustomer.customerName);
    setShowCustomerModal(false);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setCustomerSearchQuery('');
    setCustomerSearchResults([]);
  };

  const handleSOChange = (soNumber) => {
    setSelectedSONumber(soNumber);
    const salesOrder = salesOrders.find(so => so.soNumber === soNumber);
    if (salesOrder) {
      selectSOFromSearch(salesOrder);
    }
  };

  const recalculateTotal = (updatedItems) => {
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.deliveredQuantity || 0) * (item.price || 0), 0);
    setTotal(subtotal.toFixed(2));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    
    if (field === 'deliveredQuantity') {
      const deliveredQty = parseFloat(value) || 0;
      const orderedQty = updatedItems[index].orderedQuantity || 0;
      
      // Calculate pending quantity
      const pendingQty = Math.max(0, orderedQty - deliveredQty);
      
      updatedItems[index].deliveredQuantity = deliveredQty;
      updatedItems[index].pendingQuantity = pendingQty;
      updatedItems[index].isPartialDelivery = deliveredQty < orderedQty && deliveredQty > 0;
    } else {
      updatedItems[index][field] = (field === 'orderedQuantity' || field === 'price') ? parseFloat(value) || 0 : value;
    }
    
    setItems(updatedItems);
    recalculateTotal(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        materialId: '',
        description: '',
        orderedQuantity: 0,
        deliveredQuantity: 0,
        pendingQuantity: 0,
        baseUnit: '',
        unit: '',
        orderUnit: '',
        price: 0,
        priceUnit: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        actualDeliveryDate: new Date().toISOString().slice(0, 10),
        note: '',
        isPartialDelivery: false,
      }
    ]);
  };

  const deleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    recalculateTotal(updatedItems);
  };

  // Delivery Number Modal States
  const [showDeliveryNumberModal, setShowDeliveryNumberModal] = useState(false);
  const [deliveryNumberType, setDeliveryNumberType] = useState('internal');
  const [externalDeliveryNumber, setExternalDeliveryNumber] = useState('');
  const [generatedDeliveryNumber, setGeneratedDeliveryNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSONumber) {
      return alert('Please select both category and sales order');
    }

    setShowDeliveryNumberModal(true);
  };

  const submitSalesDelivery = async (customDeliveryNumber = null) => {
    const selectedSalesOrder = salesOrders.find(so => so.soNumber === selectedSONumber);

    const data = {
      deliveryNumber,
      salesOrderId: selectedSalesOrder?._id,
      soNumber: selectedSONumber,
      categoryId: selectedCategory._id,
      category: selectedCategory.categoryName,
      deliveryDate,
      actualDeliveryDate,
      customerName: customer,
      contactPerson,
      salesGroup,
      deliveryLocation,
      deliveryAddress,
      transportDetails,
      vehicleNumber,
      driverName,
      driverPhone,
      items,
      deliveryType,
      deliveryStatus,
      generalCondition,
      remarks,
      companyId: selectedCompanyId,
      financialYear: financialYear,
      total: parseFloat(total) || 0,
      deliveryNumberType: customDeliveryNumber ? 'external' : 'internal',
      customDeliveryNumber: customDeliveryNumber
    };

    try {
        console.log("data",data)
      const res = await axios.post('http://localhost:8080/api/del/salesdeliveries', data);
      console.log('Saved Delivery:', res.data);

      // Reset all fields
      setSelectedCategory(null);
      setSelectedSONumber('');
      setDeliveryDate(new Date().toISOString().substring(0, 10));
      setActualDeliveryDate(new Date().toISOString().substring(0, 10));
      setCustomer('');
      setDeliveryLocation('');
      setDeliveryAddress('');
      setItems([]);
      setTotal('');
      setSalesGroup('');
      setContactPerson('');
      setTransportDetails('');
      setVehicleNumber('');
      setDriverName('');
      setDriverPhone('');
      setDeliveryType('Full');
      setDeliveryStatus('Pending');
      setRemarks('');

      // Reset delivery number modal states
      setShowDeliveryNumberModal(false);
      setDeliveryNumberType('internal');
      setExternalDeliveryNumber('');
      setGeneratedDeliveryNumber('');

      alert('Sales Delivery Created Successfully with Delivery Number: ' + res.data.deliveryNumber);
    } catch (err) {
      console.error('Error during Delivery creation:', err);
      alert('Failed to create Sales Delivery');
    }
  };

  const DeliveryNumberModal = () => (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">
                Generate Sales Delivery Number
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowDeliveryNumberModal(false);
                  setDeliveryNumberType('internal');
                  setExternalDeliveryNumber('');
                }}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-4">
                Choose how you want to create the Delivery Number:
              </p>
              <div className="row">
                <div className="col-xl-6">
                  <button
                    className="btn btn-primary btn-md"
                    onClick={() => {
                      setDeliveryNumberType("internal");
                      submitSalesDelivery(null);
                    }}
                  >
                    <i className="ti ti-user me-2"></i>
                    Internal (Auto-generate)
                  </button>
                </div>
                <div className="col-xl-6">
                  <button
                    className="btn btn-secondary btn-md"
                    onClick={() => setDeliveryNumberType("external")}
                  >
                    <i className="ti ti-edit me-2"></i>
                    External (Manual Entry)
                  </button>
                </div>
              </div>
              {deliveryNumberType === "external" && (
                <div className="mt-4">
                  <label className="form-label">Enter Custom Delivery Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter delivery number (max 50 characters)"
                    value={externalDeliveryNumber}
                    onChange={(e) => setExternalDeliveryNumber(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && externalDeliveryNumber.trim()) {
                        submitSalesDelivery(externalDeliveryNumber);
                      }
                    }}
                    maxLength={50}
                    autoFocus
                  />
                  <div className="form-text">{externalDeliveryNumber.length}/50 characters</div>
                  <div className="mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() => submitSalesDelivery(externalDeliveryNumber)}
                      disabled={!externalDeliveryNumber.trim()}
                    >
                      <i className="fas fa-save me-1"></i>Generate & Save Delivery
                    </button>
                  </div>
                </div>
              )}
              {deliveryNumberType === "internal" && (
                <div className="mt-4">
                  <div className="alert alert-info" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    Delivery number will be auto-generated based on category: <strong>{selectedCategory?.categoryName}</strong>
                    <br />
                    <small>Range: {selectedCategory?.prefix}{selectedCategory?.rangeFrom} - {selectedCategory?.prefix}{selectedCategory?.rangeTo}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  function SOSearchModal({ show, onClose, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
      if (show) {
        setResults(salesOrders);
      }
    }, [show]);

    const handleSearch = (query) => {
      setSearchQuery(query);
      if (!query) {
        setResults(salesOrders);
        return;
      }
      setResults(salesOrders.filter(so =>
        so.soNumber?.toLowerCase().includes(query.toLowerCase()) ||
        so.customerName?.toLowerCase().includes(query.toLowerCase())
      ));
    };

    return show ? (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-search me-2"></i>Search Sales Orders
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Search SO Number</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter SO number or customer name..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-2">
                    <button className="btn btn-info" onClick={() => setResults(salesOrders)}>
                      <i className="fas fa-list me-1"></i>View All
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.length > 0 ? (
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>SO Number</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((so, idx) => (
                        <tr key={idx}>
                          <td><span className="badge bg-info">{so.soNumber}</span></td>
                          <td>{so.customerName}</td>
                          <td>{new Date(so.date).toLocaleDateString()}</td>
                          <td>₹{so.finalTotal || so.total}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                onSelect(so);
                                onClose();
                              }}
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
                      {searchQuery
                        ? `No sales orders found matching "${searchQuery}"`
                        : 'Enter search term or click "View All"'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <i className="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }

  const CustomerSearchModal = () => (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-search me-2"></i>Search Customer
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={closeCustomerModal}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Search Customer</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by customer name or code..."
                    value={customerSearchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">&nbsp;</label>
                <div className="d-flex gap-2">
                  <button className="btn btn-info" onClick={handleViewAllCustomers}>
                    <i className="fas fa-list me-1"></i>View All
                  </button>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {customerSearchResults.length > 0 ? (
                <table className="table table-hover">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Customer Code</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSearchResults.map((customer, idx) => (
                      <tr key={idx}>
                        <td><span className="badge bg-info">{customer.cnNo}</span></td>
                        <td>{customer.name1}</td>
                        <td>{customer.email}</td>
                        <td>{customer.address1}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => selectCustomerFromSearch(customer)}
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
                    {customerSearchQuery
                      ? `No customers found matching "${customerSearchQuery}"`
                      : 'Enter search term or click "View All"'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeCustomerModal}>
              <i className="fas fa-times me-1"></i>Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
          <div className="my-auto">
            <h2 className="mb-1">Sales Delivery</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">Sales</li>
                <li className="breadcrumb-item active" aria-current="page">Sales Delivery</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="accordion todo-accordion" id="accordionExample">
            {/* Delivery Header */}
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
                          <span><i className="fas fa-truck me-2"></i></span>
                          <h5 className="fw-semibold">Sales Delivery Header</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <div className="card">
                    <div className="card-body">
                      <div className="row gap-2">
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>SO Reference:</label>
                          </div>
                          <div className="col-xl-6">
                            <div className="input-group">
                              <input
                                type="text"
                                className='form-control form-control-sm'
                                placeholder="Enter SO number"
                                value={selectedSONumber}
                                onChange={(e) => {
                                  setSelectedSONumber(e.target.value);
                                  if (e.target.value) {
                                    handleSOChange(e.target.value);
                                  }
                                }}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowSOModal(true)}
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Category:</label>
                          </div>
                          <div className="col-xl-6">
                            <select className='form-select' onChange={(e) => {
                              const cat = categories.find(c => c._id === e.target.value);
                              setSelectedCategory(cat);
                            }} required>
                              <option value="">-- Select Category --</option>
                              {categories.map(c => (
                                <option key={c._id} value={c._id}>{c.categoryName}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Delivery Number:</label>
                          </div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={deliveryNumber} readOnly />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Delivery Date:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              type='date'
                              className='form-control form-control-sm'
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Actual Delivery Date:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              type='date'
                              className='form-control form-control-sm'
                              value={actualDeliveryDate}
                              onChange={(e) => setActualDeliveryDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Customer:</label>
                          </div>
                          <div className="col-xl-6">
                            <div className="input-group">
                              <input
                                className='form-control form-control-sm'
                                value={customer}
                                onChange={(e) => setCustomer(e.target.value)}
                                placeholder="Enter customer name"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowCustomerModal(true)}
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">Location:</label>
                          </div>
                          <div className="col-xl-7">
                            <select
                              className="form-select"
                              value={deliveryLocation}
                              onChange={(e) => setDeliveryLocation(e.target.value)}
                            >
                              <option value="">-- Select Location --</option>
                              {locations.map((loc) => (
                                <option
                                  key={loc._id || loc.id || loc.name}
                                  value={loc.name || loc.locationName || loc._id}
                                >
                                  {loc.name || loc.locationName || loc._id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Sales Group:</label>
                          </div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={salesGroup} onChange={(e) => setSalesGroup(e.target.value)} />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Contact Person:</label>
                          </div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Delivery Type:</label>
                          </div>
                          <div className="col-xl-6">
                            <select className='form-select' value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                              <option value="Full">Full Delivery</option>
                              <option value="Partial">Partial Delivery</option>
                            </select>
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Delivery Status:</label>
                          </div>
                          <div className="col-xl-6">
                            <select className='form-select' value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
                              <option value="Pending">Pending</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-xl-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">General Conditions</label>
                          </div>
                          <div className="col-xl-6">
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary btn-sm w-100 text-start"
                                type="button"
                                data-bs-toggle="dropdown"
                              >
                                {generalCondition.length === 0
                                  ? 'Select...'
                                  : `${generalCondition.length} selected`}
                              </button>
                              <div className="dropdown-menu w-200" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {generalConditions.map((gc) => (
                                  <div key={gc._id} className="dropdown-item-text">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={generalCondition.includes(gc._id)}
                                        onChange={() => toggleSelection(gc._id, generalCondition, setgeneralCondition)}
                                      />
                                      <label className="form-check-label ms-1">
                                        {gc.name}
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Details */}
            <div className="accordion-item mb-3">
              <div className="row align-items-center mb-3 row-gap-3">
                <div className="col-lg-4 col-sm-6">
                  <div className="accordion-header" id="headingTransport">
                    <div className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseTransport" aria-controls="collapseTransport" aria-expanded="false">
                      <div className="d-flex align-items-center w-100">
                        <div className="me-2">
                          <a href="javascript:void(0);">
                            <span><i className="fas fa-chevron-down"></i></span>
                          </a>
                        </div>
                        <div className="d-flex align-items-center">
                          <span><i className="fas fa-shipping-fast me-2"></i></span>
                          <h5 className="fw-semibold">Transport Details</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="collapseTransport" className="accordion-collapse collapse" aria-labelledby="headingTransport" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <div className="card">
                    <div className="card-body">
                      <div className="row gap-2">
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Transport Details:</label>
                          </div>
                          <div className="col-xl-6">
                            <textarea
                              className='form-control form-control-sm'
                              value={transportDetails}
                              onChange={(e) => setTransportDetails(e.target.value)}
                              rows="2"
                              placeholder="Enter transport company details..."
                            />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Vehicle Number:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              className='form-control form-control-sm'
                              value={vehicleNumber}
                              onChange={(e) => setVehicleNumber(e.target.value)}
                              placeholder="Enter vehicle number"
                            />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Driver Name:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              className='form-control form-control-sm'
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              placeholder="Enter driver name"
                            />
                          </div>
                        </div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label className='form-label'>Driver Phone:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              className='form-control form-control-sm'
                              value={driverPhone}
                              onChange={(e) => setDriverPhone(e.target.value)}
                              placeholder="Enter driver phone"
                            />
                          </div>
                        </div>

                        <div className='col-xl-6 row'>
                          <div className="col-xl-3">
                            <label className='form-label'>Delivery Address:</label>
                          </div>
                          <div className="col-xl-9">
                            <textarea
                              className='form-control form-control-sm'
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              rows="3"
                              placeholder="Enter complete delivery address..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Item List */}
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
                          <h5 className="fw-semibold">Delivery Items</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <div className="card">
                    <div className="card-body">
                      <div className='table-responsive'>
                        <table className='table table-sm table-bordered'>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Material ID</th>
                              <th>Description</th>
                              <th>Ordered Qty</th>
                              <th>Delivered Qty</th>
                              <th>Pending Qty</th>
                              <th>Unit</th>
                              <th>Price</th>
                              <th>Amount</th>
                              <th>Delivery Date</th>
                              <th>Actual Delivery</th>
                              <th>Note</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx} className={item.isPartialDelivery ? 'table-warning' : ''}>
                                <td>{idx + 1}</td>
                                <td>{item.materialId}</td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    value={item.description}
                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="number"
                                    value={item.orderedQuantity}
                                    readOnly
                                    style={{ backgroundColor: '#f8f9fa' }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="number"
                                    value={item.deliveredQuantity}
                                    onChange={(e) => handleItemChange(idx, 'deliveredQuantity', e.target.value)}
                                    max={item.orderedQuantity}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="number"
                                    value={item.pendingQuantity}
                                    readOnly
                                    style={{ backgroundColor: '#f8f9fa' }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    value={item.baseUnit}
                                    onChange={(e) => handleItemChange(idx, 'baseUnit', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                  />
                                </td>
                                <td>{(item.deliveredQuantity * item.price).toFixed(2)}</td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="date"
                                    value={item.deliveryDate}
                                    onChange={(e) => handleItemChange(idx, 'deliveryDate', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <input
                                    className='form-control form-control-sm'
                                    type="date"
                                    value={item.actualDeliveryDate}
                                    onChange={(e) => handleItemChange(idx, 'actualDeliveryDate', e.target.value)}
                                  />
                                </td>
                                <td>
                                  <textarea
                                    className='form-control form-control-sm'
                                    value={item.note}
                                    onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                                    maxLength="250"
                                    rows="2"
                                  />
                                </td>
                                <td>
                                  <button
                                    className='btn btn-outline-warning'
                                    type="button"
                                    onClick={() => deleteItem(idx)}
                                  >
                                    <i className='ti ti-trash'></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button type="button" className='btn btn-sm btn-outline-info' onClick={addItem} style={{ marginTop: 10 }}>
                        + Add Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Footer */}
            <div className="accordion-item mb-3">
              <div className="row align-items-center mb-3 row-gap-3">
                <div className="col-lg-4 col-sm-6">
                  <div className="accordion-header" id="headingFour">
                    <div className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-controls="collapseFour" aria-expanded="false">
                      <div className="d-flex align-items-center w-100">
                        <div className="me-2">
                          <a href="javascript:void(0);">
                            <span><i className="fas fa-chevron-down"></i></span>
                          </a>
                        </div>
                        <div className="d-flex align-items-center">
                          <span><i className="fas fa-clipboard-check me-2"></i></span>
                          <h5 className="fw-semibold">Delivery Summary</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <div className="card">
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className='col-xl-6'>
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6>
                                  <i className="fas fa-comment me-2"></i>Remarks
                                </h6>
                              </div>
                              <div className="card-body">
                                <textarea
                                  className='form-control form-control-sm'
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  rows="4"
                                  placeholder="Enter delivery remarks..."
                                />
                              </div>
                            </div>
                          </div>

                          <div className='col-xl-6'>
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6>
                                  <i className="fas fa-calculator me-2"></i>Delivery Summary
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="d-flex justify-content-between">
                                  <span>Total Delivered Amount:</span>
                                  <strong className="text-success">₹{total}</strong>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                  <span>Delivery Type:</span>
                                  <span className={`badge ${deliveryType === 'Full' ? 'bg-success' : 'bg-warning'}`}>
                                    {deliveryType}
                                  </span>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                  <span>Status:</span>
                                  <span className={`badge ${
                                    deliveryStatus === 'Delivered' ? 'bg-success' :
                                    deliveryStatus === 'In Transit' ? 'bg-info' :
                                    deliveryStatus === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                                  }`}>
                                    {deliveryStatus}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button type="submit" className='btn btn-success mb-6 mt-2'>
                          <i className="fas fa-truck me-1"></i>Submit Delivery
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showSOModal && (
          <SOSearchModal
            show={showSOModal}
            onClose={closeSOModal}
            onSelect={selectSOFromSearch}
          />
        )}
        {showCustomerModal && <CustomerSearchModal />}
        {showDeliveryNumberModal && <DeliveryNumberModal />}
      </div>
    </>
  );
}

export default SalesDeliveryForm;