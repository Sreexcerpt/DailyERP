
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalesOrderForm() {
  const [categories, setCategories] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuotationNumber, setSelectedQuotationNumber] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [locations, setLocations] = useState([]);
  const [vendor, setVendor] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [salesGroups, setsalesGroups] = useState([]);
  const [soNumber, setSoNumber] = useState('');
  // Quotation Search States
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationSearchQuery, setQuotationSearchQuery] = useState('');
  const [quotationSearchResults, setQuotationSearchResults] = useState([]);

  // Vendor Search States  
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorSearchResults, setVendorSearchResults] = useState([]);
  const [salesGroup, setsalesGroup] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [payTerms, setPayTerms] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);


  // Tax States
  const [taxes, setTaxes] = useState([]);
  const [selectedTax, setSelectedTax] = useState(null);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [taxDiscount, setTaxDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Material Modal States
  const [materials, setMaterials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  useEffect(() => {
    axios.get('http://localhost:8080/api/sales-order-categories').then(res => setCategories(res.data));
    axios.get('http://localhost:8080/api/salesquotations', { params: { companyId, financialYear }, }).then(res => {
      setQuotations(res.data);

      // Extract unique buyer groups from all quotation items
      const allsalesGroups = [];
      res.data.forEach(quotation => {
        quotation.items.forEach(item => {
          if (item.salesGroup && !allsalesGroups.includes(item.salesGroup)) {
            allsalesGroups.push(item.salesGroup);
          }
        });
      });
      setsalesGroups(allsalesGroups);
    });

    axios.get("http://localhost:8080/api/locations", { params: { companyId, financialYear }, }).then((res) => setLocations(res.data));
    axios.get('http://localhost:8080/api/tax', { params: { companyId, financialYear }, }).then(res => setTaxes(res.data));
    axios.get('http://localhost:8080/api/material', { params: { companyId, financialYear }, }).then(res => setMaterials(res.data));
    axios.get('http://localhost:8080/api/customers', { params: { companyId, financialYear }, }).then(res => setCustomers(res.data));

    setItems([
      ...Array(4).fill(null).map(() => ({
        materialId: '',
        description: '',
        quantity: 0,
        baseUnit: '',
        unit: '',
        orderUnit: '',
        price: 0,
        priceUnit: '',
        salesGroup: '',
        materialgroup: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        note: '',  // ✅ NEW - Individual note field
      }))
    ]);
  }, []);
  console.log("customers", customers);


  const handleViewAllQuotations = () => {
    setQuotationSearchResults(quotations);
  };

  // const selectQuotationFromSearch = (quotation) => {
  //   setSelectedQuotationNumber(quotation.quotationNumber);
  //   handleQuotationChange(quotation.quotationNumber);
  //   setShowQuotationModal(false);
  //   setQuotationSearchQuery('');
  //   setQuotationSearchResults([]);
  // };

  const selectQuotationFromSearch = (selectedItem) => {
    // Detect the type by checking which unique field is present
    if (selectedItem.contractNumber) {
      // Contract selected
      setSelectedQuotationNumber(selectedItem.contractNumber);
      setCustomer(selectedItem.customerName || '');
      setDeliveryLocation(selectedItem.location || '');
      setItems(selectedItem.items || []);
      // Set any other relevant fields for contract
      // Example:
      // setSalesGroup(selectedItem.salesGroup || '');
      // setValidityDate(selectedItem.validityFromDate || '');
    } else if (selectedItem.quotationNumber) {
      // Quotation selected
      setSelectedQuotationNumber(selectedItem.quotationNumber);
      setCustomer(selectedItem.customerName || '');
      setDeliveryLocation(selectedItem.items?.[0]?.location || '');
      setItems(selectedItem.items || []);
      // Set any other relevant fields for quotation
    } else if (selectedItem.enquiryNumber) {
      // Enquiry selected
      setSelectedQuotationNumber(selectedItem.enquiryNumber);
      setCustomer(selectedItem.customerName || selectedItem.name1 || '');
      // Set any other relevant fields for enquiry
    }

    setShowQuotationModal(false); // Close the modal after selection
  };

  const closeQuotationModal = () => {
    setShowQuotationModal(false);
    setQuotationSearchQuery('');
    setQuotationSearchResults([]);
  };

  // Vendor Search Handlers
  const handleVendorSearch = (query) => {
    setVendorSearchQuery(query);
    if (query.trim()) {
      const filtered = customers.filter(v =>  // Changed from 'vendors' to 'customers'
        v.name1?.toLowerCase().includes(query.toLowerCase()) ||  // Fixed property name
        v.cnNo?.toLowerCase().includes(query.toLowerCase())     // Fixed property name
      );
      setVendorSearchResults(filtered);
    } else {
      setVendorSearchResults([]);
    }
  };

  const handleViewAllVendors = () => {
    setVendorSearchResults(customers);  // This should use 'customers' not 'vendors'
  };

  const selectVendorFromSearch = (selectedVendor) => {
    setCustomer(selectedVendor.name1 || selectedVendor.customerName);  // Fixed: setCustomer instead of setCustomers
    setShowVendorModal(false);
    setVendorSearchQuery('');
    setVendorSearchResults([]);
  };

  // Also fix the quotation change handler:
  const handleQuotationChange = (quotationNumber) => {
    setSelectedQuotationNumber(quotationNumber);
    const quotation = quotations.find(q => q.quotationNumber === quotationNumber);
    if (quotation) {
      setCustomer(quotation.name1 || quotation.customerName);  // Fixed: setCustomer instead of setCustomers
      setDeliveryLocation(quotation.items[0]?.location || '');
      const firstItemWithsalesGroup = quotation.items.find(item => item.salesGroup);
      if (firstItemWithsalesGroup) {
        setSalesGroup(firstItemWithsalesGroup.salesGroup);
      }

      const mappedItems = quotation.items.map(item => ({
        materialId: item.materialId,
        description: item.description,
        quantity: item.qty,
        baseUnit: item.baseUnit,
        unit: item.unit,
        orderUnit: item.orderUnit,
        price: item.price,
        priceUnit: item.priceUnit,
        materialgroup: item.materialgroup,
        deliveryDate: item.deliveryDate ? String(item.deliveryDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));

      setItems(mappedItems);
      recalculateTotal(mappedItems);
    }
  };




  const closeVendorModal = () => {
    setShowVendorModal(false);
    setVendorSearchQuery('');
    setVendorSearchResults([]);
  };

  // Updated recalculateTotal function - REPLACE your existing one


  // Also update your tax change handlers - ADD these functions
  // Replace your existing tax change handlers with these immediate ones:

  // Updated recalculateTotal function - accepts tax values directly
  const recalculateTotal = (updatedItems, cgstVal, sgstVal, igstVal, discountVal) => {
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0);
    setTotal(subtotal.toFixed(2));

    // Use passed values or current state values
    const finalCgst = cgstVal !== undefined ? cgstVal : cgst;
    const finalSgst = sgstVal !== undefined ? sgstVal : sgst;
    const finalIgst = igstVal !== undefined ? igstVal : igst;
    const finalDiscount = discountVal !== undefined ? discountVal : taxDiscount;

    // Calculate individual tax amounts
    const cgstAmount = (subtotal * (parseFloat(finalCgst) || 0)) / 100;
    const sgstAmount = (subtotal * (parseFloat(finalSgst) || 0)) / 100;
    const igstAmount = (subtotal * (parseFloat(finalIgst) || 0)) / 100;
    const discount = parseFloat(finalDiscount) || 0;

    // Set calculated tax amounts for display
    setCgstAmount(cgstAmount.toFixed(2));
    setSgstAmount(sgstAmount.toFixed(2));
    setIgstAmount(igstAmount.toFixed(2));

    // Calculate final total
    const final = subtotal + cgstAmount + sgstAmount + igstAmount - discount;
    setFinalTotal(final.toFixed(2));
  };

  // Immediate tax change handlers - NO setTimeout needed
  const handleCgstChange = (value) => {
    setCgst(value);
    recalculateTotal(items, value, sgst, igst, taxDiscount);
  };

  const handleSgstChange = (value) => {
    setSgst(value);
    recalculateTotal(items, cgst, value, igst, taxDiscount);
  };

  const handleIgstChange = (value) => {
    setIgst(value);
    recalculateTotal(items, cgst, sgst, value, taxDiscount);
  };

  const handleTaxDiscountChange = (value) => {
    setTaxDiscount(value);
    recalculateTotal(items, cgst, sgst, igst, value);
  };

  // Also update your tax template selection handler for immediate calculation:
  // In your tax template dropdown onChange:


  // Update your item change handler to use the new recalculateTotal:
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = (field === 'quantity' || field === 'price') ? parseFloat(value) || 0 : value;
    setItems(updatedItems);
    recalculateTotal(updatedItems, cgst, sgst, igst, taxDiscount);
  };








  const addItem = () => {
    setItems([
      ...items,
      {
        materialId: '',
        description: '',
        quantity: 0,
        baseUnit: '',
        unit: '',
        orderUnit: '',
        price: 0,
        priceUnit: '',
        salesGroup: '',
        materialgroup: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
      }
    ]);
  };

  const deleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    recalculateTotal(updatedItems);
  };


  // 1. ADD THESE NEW STATE VARIABLES (add after your existing useState declarations)
  const [showSONumberModal, setShowSONumberModal] = useState(false);
  const [soNumberType, setSONumberType] = useState('internal'); // 'internal' or 'external'
  const [externalSONumber, setExternalSONumber] = useState('');
  const [generatedSONumber, setGeneratedSONumber] = useState('');

  // 2. UPDATE YOUR EXISTING handleSubmit FUNCTION (replace the existing one)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedQuotationNumber) {
      return alert('Please select both category and quotation');
    }

    // Show SO Number generation modal instead of directly submitting
    setShowSONumberModal(true);
  };

  // 3. ADD THIS NEW FUNCTION (add after your existing functions)
  const handleSONumberGeneration = async (type) => {
    try {
      if (type === 'external') {
        if (!externalSONumber.trim()) {
          return alert('Please enter external SO number');
        }
        if (externalSONumber.length > 50) {
          return alert('SO number cannot exceed 50 characters');
        }
        setGeneratedSONumber(externalSONumber);
      } else {
        // Generate internal SO number
        const response = await axios.post('http://localhost:8080/api/generate-so-number', {
          categoryId: selectedCategory._id
        });
        setGeneratedSONumber(response.data.soNumber);
      }

      // Proceed with form submission
      await submitSalesOrder(type === 'external' ? externalSONumber : null);

    } catch (error) {
      console.error('Error generating SO number:', error);
      alert('Failed to generate SO number');
    }
  };

  // 4. ADD THIS NEW FUNCTION (add after handleSONumberGeneration)
  const submitSalesOrder = async (customSONumber = null) => {
    const selectedQuotation = quotations.find(
      (q) => q.quotationNumber === selectedQuotationNumber
    );

    const data = {
      soNumber,
      quotationId: selectedQuotation?._id,
      quotationNumber: selectedQuotationNumber,
      categoryId: selectedCategory._id,
      category: selectedCategory.categoryName,
      date,
      customer,
      contactPerson,
      salesGroup,
      payTerms,
      validityDate,
      deliveryLocation,
      deliveryAddress,
      items,
      companyId: selectedCompanyId,
      financialYear: financialYear,
      total: parseFloat(total) || 0,
      taxName: selectedTax?.taxName || '',
      cgst: parseFloat(cgst) || 0,
      sgst: parseFloat(sgst) || 0,
      igst: parseFloat(igst) || 0,
      taxDiscount: parseFloat(taxDiscount) || 0,
      finalTotal: parseFloat(finalTotal) || 0,
      soNumberType: customSONumber ? 'external' : 'internal',
      customSONumber: customSONumber
    };

    try {
      const res = await axios.post('http://localhost:8080/api/sales-orders', data);
      console.log('Saved SO:', res.data);

      // Reset all fields
      setSelectedCategory(null);
      setSelectedQuotationNumber('');
      setDate(new Date().toISOString().substring(0, 10));
      setCustomers('');
      setDeliveryLocation('');
      setDeliveryAddress('');
      setItems([]);
      setTotal('');
      setSelectedTax(null);
      setCgst('');
      setSgst('');
      setIgst('');
      setTaxDiscount('');
      setFinalTotal('');
      setPayTerms('');
      setsalesGroup('');
      setContactPerson('');

      // Reset SO number modal states
      setShowSONumberModal(false);
      setSONumberType('internal');
      setExternalSONumber('');
      setGeneratedSONumber('');

      alert('Sales Order Created Successfully with SO Number: ' + res.data.soNumber);
    } catch (err) {
      console.error('Error during SO creation:', err);
      alert('Failed to create Sales Order');
    }
  };

  // 5. ADD THIS NEW MODAL COMPONENT (add after your existing modal components)
  // Fixed SONumberModal component - replace your existing one
  const SONumberModal = () => (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-hashtag me-2"></i>Generate SO Number
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => {
                setShowSONumberModal(false);
                setSONumberType('internal');
                setExternalSONumber('');
              }}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-12 mb-4">
                <label className="form-label fw-bold">Choose SO Number Generation Type:</label>
                <div className="row">
                  <div className="col-md-6">
                    <div className="card border-primary" style={{
                      backgroundColor: soNumberType === 'internal' ? '#e3f2fd' : 'white',
                      cursor: 'pointer'
                    }}>
                      <div className="card-body text-center" onClick={() => setSONumberType('internal')}>
                        <input
                          type="radio"
                          name="soNumberType"
                          value="internal"
                          checked={soNumberType === 'internal'}
                          onChange={(e) => setSONumberType(e.target.value)}
                          className="form-check-input me-2"
                        />
                        <i className="fas fa-cog fa-2x text-primary mb-2"></i>
                        <h6 className="card-title">Internal Generation</h6>
                        <p className="card-text small text-muted">
                          Auto-generate based on category range
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-success" style={{
                      backgroundColor: soNumberType === 'external' ? '#e8f5e8' : 'white'
                    }}>
                      <div className="card-body text-center" onClick={() => setSONumberType('external')}>
                        <input
                          type="radio"
                          name="soNumberType"
                          value="external"
                          checked={soNumberType === 'external'}
                          onChange={(e) => setSONumberType(e.target.value)}
                          className="form-check-input me-2"
                        />
                        <i className="fas fa-keyboard fa-2x text-success mb-2"></i>
                        <h6 className="card-title">External Input</h6>
                        <p className="card-text small text-muted">
                          Enter custom SO number manually
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {soNumberType === 'external' && (
                <div className="col-12 mb-3">
                  <label className="form-label">Enter Custom SO Number:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter SO number (max 50 characters)"
                    value={externalSONumber}
                    onChange={(e) => setExternalSONumber(e.target.value)}
                    maxLength="50"
                    autoFocus={soNumberType === 'external'}
                  />
                  <div className="form-text">
                    {externalSONumber.length}/50 characters
                  </div>
                </div>
              )}

              {soNumberType === 'internal' && (
                <div className="col-12 mb-3">
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    SO number will be auto-generated based on category: <strong>{selectedCategory?.categoryName}</strong>
                    <br />
                    <small>Range: {selectedCategory?.prefix}{selectedCategory?.rangeFrom} - {selectedCategory?.prefix}{selectedCategory?.rangeTo}</small>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowSONumberModal(false);
                setSONumberType('internal');
                setExternalSONumber('');
              }}
            >
              <i className="fas fa-times me-1"></i>Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => submitSalesOrder(soNumberType === 'external' ? externalSONumber : null)}
              disabled={soNumberType === 'external' && !externalSONumber.trim()}
            >
              <i className="fas fa-save me-1"></i>Generate & Save SO
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const MaterialModal = () => {
    const filteredMaterials = materials.filter(mat =>
      mat.materialId.toLowerCase().includes(materialSearch.toLowerCase()) ||
      mat.description.toLowerCase().includes(materialSearch.toLowerCase())
    );

    const selectMaterial = (material) => {
      const updatedItems = [...items];
      updatedItems[selectedItemIndex] = {
        ...updatedItems[selectedItemIndex],
        materialId: material.materialId,
        description: material.description,
        baseUnit: material.baseUnit,
        unit: material.unit,
        price: material.price,
        salesGroup: material.salesGroup,
        materialgroup: material.materialgroup,
      };
      setItems(updatedItems);
      recalculateTotal(updatedItems);
      setShowModal(false);
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <div style={{ background: 'white', padding: 20, maxHeight: '80%', overflowY: 'auto', width: '80%' }}>
          <h3>Select Material</h3>
          <input
            type="text"
            placeholder="Search by ID or Description"
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <table className='table table-bordered'>
            <thead>
              <tr>
                <th>Material ID</th>
                <th>Description</th>
                <th>Base Unit</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Price Unit</th>
                <th>Sales Group</th>
                <th>Material Group</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat, i) => (
                <tr key={i}>
                  <td>{mat.materialId}</td>
                  <td>{mat.description}</td>
                  <td>{mat.baseUnit}</td>
                  <td>{mat.unit}</td>
                  <td>{mat.price}</td>
                  <td>{mat.priceUnit}</td>
                  <td>{mat.salesGroup}</td>
                  <td>{mat.materialgroup}</td>
                  <td><button type="button" className='btn btn-sm btn-soft-info' onClick={() => selectMaterial(mat)}>Select</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className='btn btn-sm btn-soft-danger' onClick={() => setShowModal(false)} style={{ marginTop: 10 }}>Close</button>
        </div>
      </div>
    );
  };

  // const QuotationSearchModal = () => (
  //   <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
  //     <div className="modal-dialog modal-xl">
  //       <div className="modal-content">
  //         <div className="modal-header bg-primary text-white">
  //           <h5 className="modal-title">
  //             <i className="fas fa-search me-2"></i>Search Quotations
  //           </h5>
  //           <button
  //             type="button"
  //             className="btn-close btn-close-white"
  //             onClick={closeQuotationModal}
  //           ></button>
  //         </div>
  //         <div className="modal-body">
  //           <div className="row mb-3">
  //             <div className="col-md-6">
  //               <label className="form-label">Search Quotation Number</label>
  //               <div className="input-group">
  //                 <span className="input-group-text">
  //                   <i className="fas fa-search"></i>
  //                 </span>
  //                 <input
  //                   type="text"
  //                   className="form-control"
  //                   placeholder="Enter quotation number..."
  //                   value={quotationSearchQuery}
  //                   onChange={(e) => handleQuotationSearch(e.target.value)}
  //                 />
  //               </div>
  //             </div>
  //             <div className="col-md-3">
  //               <label className="form-label">&nbsp;</label>
  //               <div className="d-flex gap-2">
  //                 <button className="btn btn-info" onClick={handleViewAllQuotations}>
  //                   <i className="fas fa-list me-1"></i>View All
  //                 </button>
  //               </div>
  //             </div>
  //           </div>

  //           <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
  //             {quotationSearchResults.length > 0 ? (
  //               <table className="table table-hover">
  //                 <thead className="table-light sticky-top">
  //                   <tr>
  //                     <th>Quotation Number</th>
  //                     <th>Customer Name</th>
  //                     <th>Date</th>
  //                     <th>Total</th>
  //                     <th>Action</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody>
  //                   {quotationSearchResults.map((quotation, idx) => (
  //                     <tr key={idx}>
  //                       <td><span className="badge bg-info">{quotation.quotationNumber}</span></td>
  //                       <td>{quotation.
  //                         customerName}</td>
  //                       <td>{quotation.date}</td>
  //                       <td>₹{quotation.total}</td>
  //                       <td>
  //                         <button
  //                           className="btn btn-success btn-sm"
  //                           onClick={() => selectQuotationFromSearch(quotation)}
  //                         >
  //                           <i className="fas fa-check me-1"></i>Select
  //                         </button>
  //                       </td>
  //                     </tr>
  //                   ))}
  //                 </tbody>
  //               </table>
  //             ) : (
  //               <div className="text-center py-4">
  //                 <i className="fas fa-search fa-3x text-muted mb-3"></i>
  //                 <p className="text-muted">
  //                   {quotationSearchQuery
  //                     ? `No quotations found matching "${quotationSearchQuery}"`
  //                     : 'Enter search term or click "View All"'
  //                   }
  //                 </p>
  //               </div>
  //             )}
  //           </div>
  //         </div>
  //         <div className="modal-footer">
  //           <button type="button" className="btn btn-secondary" onClick={closeQuotationModal}>
  //             <i className="fas fa-times me-1"></i>Close
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );


  function QuotationSearchModal({
    show,
    onClose,
    onSelect,
    selectedTab = 'quotation'
  }) {
    const [activeTab, setActiveTab] = useState(selectedTab);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
      setSearchQuery('');
      setResults([]);
      fetchResults();
      // eslint-disable-next-line
    }, [activeTab]);

    const fetchResults = async () => {
      let endpoint = '';
      if (activeTab === 'enquiry') endpoint = '/api/salerequest/get';
      else if (activeTab === 'quotation') endpoint = '/api/salesquotations';
      else if (activeTab === 'contract') endpoint = '/api/salescontracts';

      const res = await axios.get(`http://localhost:8080${endpoint}`, { params: { companyId, financialYear }, });
      setResults(res.data);
    };

    const handleSearch = async (query) => {
      setSearchQuery(query);
      // Optionally filter results client-side or call a backend search endpoint.
      if (!query) {
        fetchResults();
        return;
      }
      setResults(prev =>
        prev.filter(item =>
          (item.quotationNumber || item.enquiryNumber || item.contractNumber || '').toLowerCase().includes(query.toLowerCase())
        )
      );
    };

    // Choose the right display fields
    const getNumber = (item) =>
      item.quotationNumber || item.enquiryNumber || item.contractNumber || '';
    const getCustomer = (item) =>
      item.customerName || item.name1 || '';
    const getDate = (item) =>
      item.date || item.validityDate || item.createdAt || '';

    return show ? (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-search me-2"></i>
                {activeTab === 'enquiry' ? 'Search Enquiries' : activeTab === 'quotation' ? 'Search Quotations' : 'Search Contracts'}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            {/* Tab Bar */}
            <div className="modal-body">
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'enquiry' ? 'active' : ''}`} onClick={() => setActiveTab('enquiry')}>Enquiry</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'quotation' ? 'active' : ''}`} onClick={() => setActiveTab('quotation')}>Quotation</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'contract' ? 'active' : ''}`} onClick={() => setActiveTab('contract')}>Contract</button>
                </li>
              </ul>
              {/* Search Controls */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Search Number</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Enter ${activeTab} number...`}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-2">
                    <button className="btn btn-info" onClick={fetchResults}>
                      <i className="fas fa-list me-1"></i>View All
                    </button>
                  </div>
                </div>
              </div>
              {/* Results Table */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.length > 0 ? (
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Number</th>
                        <th>Customer Name</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="badge bg-info">{getNumber(item)}</span>
                          </td>
                          <td>{getCustomer(item)}</td>
                          <td>{getDate(item)}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                onSelect(item);
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
                        ? `No ${activeTab}s found matching "${searchQuery}"`
                        : `Enter search term or click "View All"`}
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
    ) : null
  };


  const VendorSearchModal = () => (
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
              onClick={closeVendorModal}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Search Custmore</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by vendor name or code..."
                    value={vendorSearchQuery}
                    onChange={(e) => handleVendorSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label">&nbsp;</label>
                <div className="d-flex gap-2">
                  <button className="btn btn-info" onClick={handleViewAllVendors}>
                    <i className="fas fa-list me-1"></i>View All
                  </button>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {vendorSearchResults.length > 0 ? (
                <table className="table table-hover">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Customer Code</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>address1</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorSearchResults.map((vendor, idx) => (
                      <tr key={idx}>
                        <td><span className="badge bg-info">{vendor.cnNo}</span></td>
                        <td>{vendor.name1}</td>
                        <td>{vendor.email}</td>
                        <td>{vendor.address1}</td>
                        <td>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => selectVendorFromSearch(vendor)}
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
                    {vendorSearchQuery
                      ? `No vendors found matching "${vendorSearchQuery}"`
                      : 'Enter search term or click "View All"'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeVendorModal}>
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
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Sales Order</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Sales
                </li>
                <li className="breadcrumb-item active" aria-current="page">Sales Order</li>
              </ol>
            </nav>
          </div>

        </div>
        <div className="row">
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
                          <h5 className="fw-semibold">Sales Order Header</h5>
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
                      <div className="row gap-2">
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>Quotation Number:</label></div>
                          <div className="col-xl-6">
                            <div className="input-group">
                              <input
                                type="text"
                                className='form-control form-control-sm'
                                placeholder="Enter quotation number"
                                value={selectedQuotationNumber}
                                onChange={(e) => {
                                  setSelectedQuotationNumber(e.target.value);
                                  if (e.target.value) {
                                    handleQuotationChange(e.target.value);
                                  }
                                }}
                                required
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setShowQuotationModal(true)}
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div></div>
                        </div>


                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>SO Category:</label></div>
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
                          </div></div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>SO Number:</label></div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={soNumber} readOnly /></div></div>
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>SO Creating date:</label></div>
                          <div className="col-xl-6">
                            <input
                              type='date'
                              className='form-control form-control-sm'
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            />
                          </div></div>

                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>Customer:</label></div>
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
                                onClick={() => setShowVendorModal(true)}
                              >
                                <i className="fas fa-search"></i>
                              </button>
                            </div>
                          </div></div>

                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">Location:</label></div>
                          <div className="col-xl-7">
                            <select
                              className="form-select"
                              value={deliveryLocation}
                              onChange={(e) =>
                                setDeliveryLocation(e.target.value)
                              }
                            >
                              <option value="">-- Select Location --</option>
                              {locations.map((loc) => (
                                <option
                                  key={loc._id || loc.id || loc.name}
                                  value={
                                    loc.name || loc.locationName || loc._id
                                  }
                                >
                                  {loc.name || loc.locationName || loc._id}
                                </option>
                              ))}
                            </select></div>
                        </div>
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>Sales Group:</label></div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={salesGroup} onChange={(e) => setsalesGroup(e.target.value)} /></div>
                        </div>
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>Contact Person:</label></div>
                          <div className="col-xl-6">
                            <input className='form-control form-control-sm' value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
                          </div></div>
                        <div className='col-xl-3 row'>
                          <div className="col-xl-6">
                            <label>Payment Terms:</label></div>
                          <div className="col-xl-6">
                            <textarea className='form-control form-control-sm' value={payTerms} onChange={(e) => setPayTerms(e.target.value)} maxLength="250" />
                          </div></div>
                        <div className='col-xl-3 row' >
                          <div className="col-xl-6">
                            <label>Validity Date:</label></div>
                          <div className="col-xl-6">
                            <input type="date" className='form-control form-control-sm' value={validityDate} onChange={(e) => setValidityDate(e.target.value)} />
                          </div></div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample" >
                <div className="accordion-body">
                  <div className="card">
                    <div className="card-body">
                      <div className='table-responsive' style={{ width: '100%', tableLayout: 'fixed' }}>
                        <table className=' table-sm table-bordered'>
                          <thead>
                            <tr>
                              <th>#</th><th>Material ID</th><th>Description</th><th>Qty</th><th>Base Unit</th><th>Order Unit</th><th>Material Group</th><th>Price</th><th>PriceUnit</th><th>Amount</th><th>Delivery Date</th><th>Note</th><th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <input
                                    value={item.materialId}
                                    readOnly
                                    className='form-control form-control-sm'
                                    onClick={() => {
                                      setSelectedItemIndex(idx);
                                      setShowModal(true);
                                    }}
                                    style={{ cursor: 'pointer', backgroundColor: '#f9f9f9' }}
                                  />
                                </td>
                                <td><input className='form-control form-control-sm' value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} /></td>
                                <td><input className='form-control form-control-sm' type="number" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} /></td>
                                <td><input className='form-control form-control-sm' value={item.baseUnit} onChange={(e) => handleItemChange(idx, 'baseUnit', e.target.value)} /></td>

                                <td><input className='form-control form-control-sm' value={item.orderUnit} onChange={(e) => handleItemChange(idx, 'orderUnit', e.target.value)} /></td>

                                <td><input className='form-control form-control-sm' value={item.materialgroup} onChange={(e) => handleItemChange(idx, 'materialgroup', e.target.value)} /></td>
                                <td><input className='form-control form-control-sm' type="number" value={item.price} onChange={(e) => handleItemChange(idx, 'price', e.target.value)} /></td>
                                <td>
                                  <select
                                    value={item.priceUnit}
                                    onChange={(e) => handleItemChange(idx, 'priceUnit', e.target.value)}
                                    required
                                    className='form-select'
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EXTRA">EXTRA</option>
                                  </select>
                                </td>
                                <td>{(item.quantity * item.price).toFixed(2)}</td>
                                <td><input className='form-control form-control-sm' type="date" value={item.deliveryDate} onChange={(e) => handleItemChange(idx, 'deliveryDate', e.target.value)} /></td>
                                <td>
                                  <textarea
                                    className='form-control form-control-sm'
                                    value={item.note}
                                    onChange={(e) => handleItemChange(idx, 'note', e.target.value)}
                                    maxLength="250"
                                    rows="2"
                                  />
                                </td>
                                <td><button className='btn btn-outline-warning' type="button" onClick={() => deleteItem(idx)}><i className='ti ti-trash'></i></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button type="button" className='btn btn-sm btn-outline-info' onClick={addItem} style={{ marginTop: 10 }}>+ Add Item</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                          <span><i className="fas fa-list me-2"></i></span>
                          <h5 className="fw-semibold">Order Footer</h5>
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
                          {/* Delivery Address Section */}
                          <div className='col-xl-6'>
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6>
                                  <i className="fas fa-shipping-fast me-2"></i>Delivery Information
                                </h6>
                              </div>
                              <div className="card-body">
                                <label className="form-label">Delivery Address:</label>
                                <textarea
                                  className='form-control form-control-sm'
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  rows="4"
                                  placeholder="Enter complete delivery address..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Tax Calculation Section */}
                          <div className='col-xl-6'>
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6>
                                  <i className="fas fa-calculator me-2"></i>Tax Calculation
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-xl-6 row">
                                    <div className="col-xl-3"><label className="form-label">Tax:</label>
                                    </div>
                                    <div className="col-xl-9">
                                      <select className='form-select' onChange={(e) => {
                                        const tax = taxes.find(t => t.taxName === e.target.value);
                                        setSelectedTax(tax);
                                        if (tax) {
                                          const newCgst = tax.cgst || 0;
                                          const newSgst = tax.sgst || 0;
                                          const newIgst = tax.igst || 0;

                                          setCgst(newCgst);
                                          setSgst(newSgst);
                                          setIgst(newIgst);

                                          // Immediate recalculation with new tax values
                                          recalculateTotal(items, newCgst, newSgst, newIgst, taxDiscount);
                                        }
                                      }}>
                                        <option value="">-- Select Tax Template --</option>
                                        {taxes.map(t => (
                                          <option key={t._id} value={t.taxName}>{t.taxName}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6 row ">
                                    <div className="col-xl-6">
                                      <label className="form-label">CGST (%):</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className='form-control form-control-sm'
                                        value={cgst}
                                        onChange={(e) => handleCgstChange(e.target.value)}
                                        step="0.01"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-md-6 row ">
                                    <div className="col-xl-6">
                                      <label className="form-label">SGST (%):</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className='form-control form-control-sm'
                                        value={sgst}
                                        onChange={(e) => handleSgstChange(e.target.value)}
                                        step="0.01"
                                      />

                                    </div></div>

                                  <div className="col-md-6 row ">
                                    <div className="col-xl-6">
                                      <label className="form-label">IGST (%):</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className='form-control form-control-sm'
                                        value={igst}
                                        onChange={(e) => handleIgstChange(e.target.value)}
                                        step="0.01"
                                      />

                                    </div></div>

                                  <div className="col-md-6 row ">
                                    <div className="col-xl-6">
                                      <label className="form-label">Tax Discount:</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className='form-control form-control-sm'
                                        value={taxDiscount}
                                        onChange={(e) => handleTaxDiscountChange(e.target.value)}
                                        step="0.01"
                                      />
                                    </div></div>
                                </div>

                                {/* Total Summary */}
                                <div className="border-top pt-3 ">
                                  <div className="row">
                                    <div className="col-6">
                                      <div className="d-flex justify-content-between">
                                        <span>Subtotal:</span>
                                        <strong>₹{total}</strong>
                                      </div>
                                      <div className="d-flex justify-content-between text-muted small">
                                        <span>CGST:</span>
                                        <span>₹{cgstAmount}</span>
                                      </div>
                                      <div className="d-flex justify-content-between text-muted small">
                                        <span>SGST:</span>
                                        <span>₹{sgstAmount}</span>
                                      </div>
                                      <div className="d-flex justify-content-between text-muted small">
                                        <span>IGST:</span>
                                        <span>₹{igstAmount}</span>
                                      </div>
                                      <div className="d-flex justify-content-between text-muted small">
                                        <span>Discount:</span>
                                        <span>- ₹{taxDiscount}</span>
                                      </div>
                                      <hr className="my-2" />
                                      <div className="d-flex justify-content-between">
                                        <strong>Final Total:</strong>
                                        <strong className="text-success">₹{finalTotal}</strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>


                        <button type="submit" className='btn btn-success mb-6 mt-2'>Submit SO</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {showModal && <MaterialModal />}
            {showQuotationModal && (
              <QuotationSearchModal
                show={showQuotationModal}
                onClose={closeQuotationModal}
                onSelect={selectQuotationFromSearch}
              />
            )}
            {showVendorModal && <VendorSearchModal />}
            {showSONumberModal && <SONumberModal />}
          </div>


        </div>

      </div>
    </>
  );
}

export default SalesOrderForm;