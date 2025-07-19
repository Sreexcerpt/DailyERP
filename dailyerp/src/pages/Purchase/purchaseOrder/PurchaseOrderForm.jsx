import React, { useState, useEffect } from "react";
import axios from "axios";

function PurchaseOrderForm() {
  const [activeTab, setActiveTab] = useState("enquiry");

  const [categories, setCategories] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [enquirys, setEnquirys] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuotationNumber, setSelectedQuotationNumber] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const [vendor, setVendor] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [vendors, setVendors] = useState([]);
  const [buyerGroups, setBuyerGroups] = useState([]);

  // Quotation Search States
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationSearchQuery, setQuotationSearchQuery] = useState("");
  const [quotationSearchResults, setQuotationSearchResults] = useState([]);
  const [enquirySearchQuery, setEnquirySearchQuery] = useState("");
  const [enquirySearchResults, setEnquirySearchResults] = useState([]);
  console.log("enquirySearchResults", quotationSearchResults)
  // Vendor Search States
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");
  const [vendorSearchResults, setVendorSearchResults] = useState([]);
  const [buyerGroup, setBuyerGroup] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [payTerms, setPayTerms] = useState("");
  const [notes, setNotes] = useState("")
  const [validityDate, setValidityDate] = useState("");
  const [cgstAmount, setCgstAmount] = useState(0);
  const [sgstAmount, setSgstAmount] = useState(0);
  const [igstAmount, setIgstAmount] = useState(0);
  const [remarks, setRemarks] = useState();
  const [approvedby, setApprovedby] = useState();
  const [preparedby, setPreparedby] = useState();
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
  const [materialSearch, setMaterialSearch] = useState("");
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [locations, setLocations] = useState([]);
  const [generalConditions, setGeneralConditions] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8080/api/po-categories")
      .then((res) => setCategories(res.data));
    axios.get('http://localhost:8080/api/indent/get')
      .then((res) => {
        setEnquirys(res.data);
      })
    axios.get("http://localhost:8080/api/quotations/get")
      .then((res) => {
        setQuotations(res.data);
        const allBuyerGroups = [];
        res.data.forEach((quotation) => {
          quotation.items.forEach((item) => {
            if (item.buyerGroup && !allBuyerGroups.includes(item.buyerGroup)) {
              allBuyerGroups.push(item.buyerGroup);
            }
          });
        });
        setBuyerGroups(allBuyerGroups);
      });

    axios.get('http://localhost:8080/api/general-conditions')
      .then(res => {
        const filteredConditions = res.data
          .filter(gc => !gc.isDeleted) // remove deleted if needed
          .map(gc => ({
            _id: gc._id,
            name: gc.name,
            description: gc.description
          }));
        setGeneralConditions(filteredConditions);
      });

    axios.get('http://localhost:8080/api/processes')
      .then(res => {
        const filteredProcesses = res.data
          .filter(p => !p.isDeleted)
          .map(p => ({
            _id: p._id,
            processId: p.processId,
            processDescription: p.processDescription
          }));
        setProcesses(filteredProcesses);
      });

    axios.get("http://localhost:8080/api/locations")
      .then((res) => setLocations(res.data));

    axios.get("http://localhost:8080/api/tax")
      .then((res) => setTaxes(res.data));

    axios.get("http://localhost:8080/api/material")
      .then((res) => setMaterials(res.data));

    axios.get("http://localhost:8080/api/vendors")
      .then((res) => setVendors(res.data));

    setItems([
      ...Array(4)
        .fill(null)
        .map(() => ({
          materialId: "",
          description: "",
          quantity: 0,
          baseUnit: "",
          unit: "",
          orderUnit: "",
          price: 0,
          priceUnit: "",
          buyerGroup: "",
          materialgroup: "",
          deliveryDate: new Date().toISOString().slice(0, 10),
          note: "",
        })),
    ]);
  }, []);
  const toggleSelection = (id, selectedList, setSelectedList) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter(item => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const handleQuotationSearch = (query) => {
    setQuotationSearchQuery(query);
    if (query.trim()) {
      const filtered = quotations.filter((q) =>
        q.quotationNumber.toLowerCase().includes(query.toLowerCase())
      );
      setQuotationSearchResults(filtered);
    } else {
      setQuotationSearchResults([]);
    }
  };

  const handleViewAllQuotations = () => {
    setQuotationSearchResults(quotations);
  };
  const handleEnquirySearch = (query) => {
    setEnquirySearchQuery(query);
    if (query.trim()) {
      const filtered = enquirys.filter((q) =>
        q.quotationNumber.toLowerCase().includes(query.toLowerCase())
      );
      setEnquirySearchResults(filtered);
    } else {
      setEnquirySearchResults([]);
    }
  };

  const handleViewAllEnquiry = () => {
    setEnquirySearchResults(enquirys);
  };
  const selectQuotationFromSearch = (quotation) => {
    setSelectedQuotationNumber(quotation.quotationNumber);
    handleQuotationChange(quotation.quotationNumber);
    setShowQuotationModal(false);
    setQuotationSearchQuery("");
    setQuotationSearchResults([]);
  };
  const selectEnquiryFromSearch = (quotation) => {
    setSelectedQuotationNumber(quotation.indentId);
    handleEnquryChange(quotation.indentId);
    setShowQuotationModal(false);
    setQuotationSearchQuery("");
    setQuotationSearchResults([]);
  };
  const closeQuotationModal = () => {
    setShowQuotationModal(false);
    setQuotationSearchQuery("");
    setQuotationSearchResults([]);
  };

  // Vendor Search Handlers
  const handleVendorSearch = (query) => {
    setVendorSearchQuery(query);
    if (query.trim()) {
      const filtered = vendors.filter(
        (v) =>
          v.vendorName.toLowerCase().includes(query.toLowerCase()) ||
          v.vendorCode.toLowerCase().includes(query.toLowerCase())
      );
      setVendorSearchResults(filtered);
    } else {
      setVendorSearchResults([]);
    }
  };

  const handleViewAllVendors = () => {
    setVendorSearchResults(vendors);
  };

  const selectVendorFromSearch = (selectedVendor) => {
    setVendor(selectedVendor.name1 || selectedVendor.vendorName);
    setShowVendorModal(false);
    setVendorSearchQuery("");
    setVendorSearchResults([]);
  };

  const closeVendorModal = () => {
    setShowVendorModal(false);
    setVendorSearchQuery("");
    setVendorSearchResults([]);
  };

  // Updated recalculateTotal function - REPLACE your existing one

  // Also update your tax change handlers - ADD these functions
  // Replace your existing tax change handlers with these immediate ones:

  // Updated recalculateTotal function - accepts tax values directly
  const recalculateTotal = (
    updatedItems,
    cgstVal,
    sgstVal,
    igstVal,
    discountVal
  ) => {
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
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


  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] =
      field === "quantity" || field === "price"
        ? parseFloat(value) || 0
        : value;
    setItems(updatedItems);
    recalculateTotal(updatedItems, cgst, sgst, igst, taxDiscount);
  };

  const handleQuotationChange = (quotationNumber) => {
    setSelectedQuotationNumber(quotationNumber);
    const quotation = quotations.find(
      (q) => q.quotationNumber === quotationNumber
    );
    if (quotation) {
      setVendor(quotation.name1 || quotation.vendorName);
      setDeliveryLocation(quotation.items[0]?.location || "");
      const firstItemWithBuyerGroup = quotation.items.find(
        (item) => item.buyerGroup
      );
      if (firstItemWithBuyerGroup) {
        setBuyerGroup(firstItemWithBuyerGroup.buyerGroup);
      }

      const mappedItems = quotation.items.map((item) => ({
        materialId: item.materialId,
        description: item.description,
        quantity: item.qty,
        baseUnit: item.baseUnit,
        unit: item.unit,
        orderUnit: item.orderUnit,
        price: item.price,
        priceUnit: item.priceUnit,

        materialgroup: item.materialgroup,
        deliveryDate: item.deliveryDate
          ? String(item.deliveryDate).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      }));

      setItems(mappedItems);
      recalculateTotal(mappedItems);
    }
  };
  const handleEnquryChange = (quotationNumber) => {
    setSelectedQuotationNumber(quotationNumber);
    const quotation = enquirys.find(
      (q) => q.indentId === quotationNumber
    );
    if (quotation) {
      setVendor(quotation.name1 || quotation.vendorName);
      setDeliveryLocation(quotation.items[0]?.location || "");
      const firstItemWithBuyerGroup = quotation.items.find(
        (item) => item.buyerGroup
      );
      if (firstItemWithBuyerGroup) {
        setBuyerGroup(firstItemWithBuyerGroup.buyerGroup);
      }

      const mappedItems = quotation.items.map((item) => ({
        materialId: item.materialId,
        description: item.description,
        quantity: item.qty,
        baseUnit: item.baseUnit,
        unit: item.unit,
        orderUnit: item.orderUnit,
        price: item.price,
        priceUnit: item.priceUnit,

        materialgroup: item.materialgroup,
        deliveryDate: item.deliveryDate
          ? String(item.deliveryDate).slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      }));

      setItems(mappedItems);
      recalculateTotal(mappedItems);
    }
  };
  const addItem = () => {
    setItems([
      ...items,
      {
        materialId: "",
        description: "",
        quantity: 0,
        baseUnit: "",
        unit: "",
        orderUnit: "",
        price: 0,
        priceUnit: "",
        buyerGroup: "",
        materialgroup: "",
        deliveryDate: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const deleteItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    recalculateTotal(updatedItems);
  };


  const [showPOModal, setShowPOModal] = useState(false);
  const [poGenerationType, setPOGenerationType] = useState(''); // 'internal' or 'external'
  const [externalPONumber, setExternalPONumber] = useState('');
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedQuotationNumber) {
      return alert("Please select both category and quotation");
    }

    const selectedQuotation = quotations.find(
      (q) => q.quotationNumber === selectedQuotationNumber
    );

    const data = {
      quotationId: selectedQuotation?._id,
      quotationNumber: selectedQuotationNumber,
      categoryId: selectedCategory._id,
      category: selectedCategory.categoryName,
      date,
      vendor,
      notes,
      contactPerson,
      generalConditions,
      processes,
      preparedby,
      approvedby,
      remarks,
      validityDate,
      buyerGroup,
      deliveryLocation,
      deliveryAddress,
      items,
      total: parseFloat(total) || 0,
      taxName: selectedTax?.taxName || "",
      cgst: parseFloat(cgst) || 0,
      sgst: parseFloat(sgst) || 0,
      igst: parseFloat(igst) || 0,
      taxDiscount: parseFloat(taxDiscount) || 0,
      finalTotal: parseFloat(finalTotal) || 0,
    };

    // Store data and show PO generation modal
    setPendingSubmitData(data);
    setShowPOModal(true);
  };

  // New function to handle PO generation type selection
  const handlePOGenerationConfirm = async () => {
    try {
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      const financialYear = localStorage.getItem('financialYear');

      let finalData = {
        ...pendingSubmitData,
        companyId: selectedCompanyId,
        financialYear: financialYear
      };

      if (poGenerationType === 'internal') {
        // Let backend generate PO number
        finalData.poGenerationType = 'internal';
      } else if (poGenerationType === 'external') {
        if (!externalPONumber.trim()) {
          return alert('Please enter external PO number');
        }
        finalData.poGenerationType = 'external';
        finalData.poNumber = externalPONumber.trim();
      }

      const res = await axios.post("http://localhost:8080/api/purchase-orders", finalData);
      console.log("Saved PO:", res.data);

      // Reset all fields after successful response
      resetForm();
      setShowPOModal(false);
      setPOGenerationType('');
      setExternalPONumber('');
      setPendingSubmitData(null);

      alert("PO Created Successfully!");
    } catch (err) {
      console.error("Error during PO creation:", err);
      alert("Failed to create PO");
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedQuotationNumber("");
    setDate(new Date().toISOString().substring(0, 10));
    setVendor("");
    setDeliveryLocation("");
    setDeliveryAddress("");
    setItems([]);
    setTotal("");
    setSelectedTax(null);
    setCgst("");
    setSgst("");
    setIgst("");
    setTaxDiscount("");
    setFinalTotal("");
    setPayTerms("");
    setNotes('')
    setBuyerGroup("");
    setContactPerson("");
    setValidityDate("");
  };

  const closePOModal = () => {
    setShowPOModal(false);
    setPOGenerationType('');
    setExternalPONumber('');
    setPendingSubmitData(null);
  };

  const POGenerationModal = () => (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-cog me-2"></i>PO Number Generation
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={closePOModal}
            ></button>
          </div>

          <div className="modal-body">
            {/* Internal Generation Option */}
            <div
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 mb-3 ${poGenerationType === 'internal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setPOGenerationType('internal')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="poGeneration"
                  value="internal"
                  checked={poGenerationType === 'internal'}
                  onChange={(e) => setPOGenerationType(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Internal Generation</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    System generated number
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Format: {selectedCategory?.prefix}-XXXXXX
                  </p>
                </div>
              </div>
            </div>

            {/* External Generation Option */}
            <div
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 mb-3 ${poGenerationType === 'external'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => setPOGenerationType('external')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="poGeneration"
                  value="external"
                  checked={poGenerationType === 'external'}
                  onChange={(e) => setPOGenerationType(e.target.value)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">External Generation</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Customized or manual PO number
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Custom Format
                  </p>
                </div>
              </div>
            </div>

            {/* External PO Input */}
            {poGenerationType === 'external' && (
              <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your custom PO number (up to 50 characters)
                </label>
                <input
                  type="text"
                  value={externalPONumber}
                  onChange={(e) => setExternalPONumber(e.target.value)}
                  placeholder="External PO Number"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="off"
                  spellCheck="false"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Characters: {externalPONumber.length}/50
                </p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closePOModal}
            >
              <i className="fas fa-times me-1"></i>Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePOGenerationConfirm}
              disabled={!poGenerationType || (poGenerationType === 'external' && !externalPONumber.trim())}
            >
              <i className="fas fa-check me-1"></i>
              {poGenerationType === 'internal' ? 'Generate PO' : 'Create PO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const MaterialModal = () => {
    const filteredMaterials = materials.filter(
      (mat) =>
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
        buyerGroup: material.buyerGroup,
        materialgroup: material.materialgroup,
      };
      setItems(updatedItems);
      recalculateTotal(updatedItems);
      setShowModal(false);
    };

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 20,
            maxHeight: "80%",
            overflowY: "auto",
            width: "80%",
          }}
        >
          <h3>Select Material</h3>
          <input
            type="text"
            placeholder="Search by ID or Description"
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Material ID</th>
                <th>Description</th>
                <th>Base Unit</th>
                <th>Unit</th>
                <th>Price</th>
                <th>Price Unit</th>
                <th>Buyer Group</th>
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
                  <td>{mat.buyerGroup}</td>
                  <td>{mat.materialgroup}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-soft-info"
                      onClick={() => selectMaterial(mat)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger"
            onClick={() => setShowModal(false)}
            style={{ marginTop: 10 }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const QuotationSearchModal = () => (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header text-white">
            <ul className="nav nav-tabs nav-tabs-bottom">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "enquiry" ? "active" : ""}`}
                  onClick={() => setActiveTab("enquiry")}
                  href="#"
                >
                  Enquiry
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "quotation" ? "active" : ""}`}
                  onClick={() => setActiveTab("quotation")}
                  href="#"
                >
                  Quotation
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "contract" ? "active" : ""}`}
                  onClick={() => setActiveTab("contract")}
                  href="#"
                >
                  Contract
                </a>
              </li>
            </ul>

            <button
              type="button"
              className="btn-close btn-close-black"
              onClick={closeQuotationModal}
            ></button>
          </div>
          <div className="modal-body">
            <div class="card">

              <div class="card-body">
                <div class="tab-content">
                  {activeTab === "enquiry" && (
                    <div class={`tab-pane ${activeTab === "enquiry" ? `show active` : ""}`} id="bottom-tab1">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Search Enquiry Number</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Enquiry number..."
                              value={enquirySearchQuery}
                              onChange={(e) => handleEnquirySearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">&nbsp;</label>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-info"
                              onClick={handleViewAllEnquiry}
                            >
                              <i className="fas fa-list me-1"></i>View All
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {enquirySearchResults.length > 0 ? (
                          <table className="table table-hover">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th>Enquiry Number</th>
                                <th>Date</th>

                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {enquirySearchResults.map((quotation, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <span className="badge bg-info">
                                      {quotation.indentId}
                                    </span>
                                  </td>

                                  <td>{quotation.documentDate}</td>
                                  <td>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => selectEnquiryFromSearch(quotation)}
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
                              {enquirySearchQuery
                                ? `No quotations found matching "${enquirySearchQuery}"`
                                : 'Enter search term or click "View All"'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "quotation" && (
                    <div class={`tab-pane ${activeTab === "quotation" ? `show active` : ""}`} id="bottom-tab2">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Search Quotation Number</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="fas fa-search"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter quotation number..."
                              value={quotationSearchQuery}
                              onChange={(e) => handleQuotationSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">&nbsp;</label>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-info"
                              onClick={handleViewAllQuotations}
                            >
                              <i className="fas fa-list me-1"></i>View All
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {quotationSearchResults.length > 0 ? (
                          <table className="table table-hover">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th>Quotation Number</th>
                                <th>Vendor Name</th>
                                <th>validity Date</th>
                                <th>Total</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quotationSearchResults.map((quotation, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <span className="badge bg-info">
                                      {quotation.quotationNumber}
                                    </span>
                                  </td>
                                  <td>{quotation.vendorName}</td>
                                  <td>{quotation.validityDate}</td>
                                  <td>₹{quotation.total}</td>
                                  <td>
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => selectQuotationFromSearch(quotation)}
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
                              {quotationSearchQuery
                                ? `No quotations found matching "${quotationSearchQuery}"`
                                : 'Enter search term or click "View All"'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "contract" && (
                    <div class={`tab-pane ${activeTab === "contract" ? `show active` : ""}`} id="bottom-tab3">
                      Tab content 3
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VendorSearchModal = () => (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="fas fa-search me-2"></i>Search Vendors
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
                <label className="form-label">Search Vendor</label>
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
                  <button
                    className="btn btn-info"
                    onClick={handleViewAllVendors}
                  >
                    <i className="fas fa-list me-1"></i>View All
                  </button>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {vendorSearchResults.length > 0 ? (
                <table className="table table-hover">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>Vendor Code</th>
                      <th>Vendor Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorSearchResults.map((vendor, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="badge bg-info">{vendor.vnNo}</span>
                        </td>
                        <td>{vendor.name1}</td>
                        <td>{vendor.email}</td>
                        <td>{vendor.phone}</td>
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
              onClick={closeVendorModal}
            >
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
            <h2 className="mb-1">Purchase Order</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Purchase
                </li>
                <li className="breadcrumb-item active" aria-current="page">Purchase Order</li>
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
                          <h5 className="fw-semibold">Purchase Quotation Header</h5>
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
                        <div className="col-lg-3 row">
                          <div className="col-xl-6">
                            <label className="form-label">Quotation_Number:
                            </label>
                          </div>
                          <div className="col-xl-6">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control form-control-sm"
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
                                className="btn btn-outline-primary btn-sm"
                                type="button"
                                onClick={() => setShowQuotationModal(true)}
                                style={{ border: "0px solid" }}
                              >
                                <i className="ti ti-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">PO Category:</label>
                          </div>
                          <div className="col-xl-7">
                            <select
                              className="form-select"
                              onChange={(e) => {
                                const cat = categories.find(
                                  (c) => c._id === e.target.value
                                );
                                setSelectedCategory(cat);
                              }}
                              required
                            >
                              <option value="">-- Select Category --</option>
                              {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3 " >

                          <label className="form-label">Select General Conditions</label>
                          {generalConditions.map((gc) => (
                            <div key={gc._id} className="flex items-center space-x-2 mb-1">
                              <input
                                type="checkbox"
                                checked={selectedConditions.includes(gc._id)}
                                onChange={() => toggleSelection(gc._id, selectedConditions, setSelectedConditions)}
                              />
                              <label>{gc.name}</label>
                            </div>
                          ))}
                        </div>
                        <div className="col-lg-3">
                          <label className="form-label">Select Processes</label>
                          {processes.map((p) => (
                            <div key={p._id} className="flex items-center space-x-2 mb-1">
                              <input
                                type="checkbox"
                                checked={selectedProcesses.includes(p._id)}
                                onChange={() => toggleSelection(p._id, selectedProcesses, setSelectedProcesses)}
                              />
                              <label>{p.processDescription}</label>
                            </div>
                          ))}
                        </div>

                        <div className="col-lg-3 row">
                          <div className="col-xl-4">
                            <label className="form-label">Remarks:</label></div>
                          <div className="col-xl-8">
                            <input
                              className="form-control"
                              value={remarks}
                              onChange={(e) =>
                                setRemarks(e.target.value)
                              }
                            />
                          </div></div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-6">
                            <label className="form-label">Prepared By:</label></div>
                          <div className="col-xl-6">
                            <input
                              className="form-control"
                              value={preparedby}
                              onChange={(e) =>
                                setPreparedby(e.target.value)
                              }
                            /></div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-6">
                            <label className="form-label">Approved By:</label>
                          </div>
                          <div className="col-xl-6">
                            <input
                              className="form-control"
                              value={approvedby}
                              onChange={(e) =>
                                setApprovedby(e.target.value)
                              }
                            /></div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">PO Number:</label>
                          </div>
                          <div className="col-xl-7">
                            <input
                              className="form-control form-control-sm"
                              value={poNumber}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-6">
                            <label className="form-label">
                              PO Creating date:
                            </label></div>
                          <div className="col-xl-6">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                            /></div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-3">
                            <label className="form-label">Vendor:</label></div>
                          <div className="col-xl-9">
                            <div className="input-group">
                              <input
                                className="form-control form-control-sm"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                placeholder="Enter vendor name"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowVendorModal(true)}
                              >
                                <i className="ti ti-search"></i>
                              </button>
                            </div></div>
                        </div>


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
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">Buyer Group:</label></div>
                          <div className="col-xl-7">
                            <input
                              className="form-control form-control-sm"
                              value={buyerGroup}
                              onChange={(e) => setBuyerGroup(e.target.value)}
                            /></div>
                        </div>

                        <div className="col-lg-3 row">
                          <div className="col-xl-6">
                            <label className="form-label">
                              Contact Person:
                            </label></div>
                          <div className="col-xl-6">
                            <input
                              className="form-control form-control-sm"
                              value={contactPerson}
                              onChange={(e) =>
                                setContactPerson(e.target.value)
                              }
                            /></div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Validity Date:
                            </label></div>
                          <div className="col-xl-7">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={validityDate}
                              onChange={(e) =>
                                setValidityDate(e.target.value)
                              }
                            />
                          </div></div>

                        <div className="col-lg-4 row">
                          <div className="col-xl-3">
                            <label className="form-label">Payment:</label></div>
                          <div className="col-xl-9">
                            <textarea
                              className="form-control form-control-sm"
                              value={payTerms}
                              onChange={(e) => setPayTerms(e.target.value)}
                              maxLength="250"
                            />
                          </div>
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
                      <div className="table-responsive rounded table-nowrap border-bottom-0 border mb-3">
                        <table className="table-sm table-bordered mb-0">
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Material ID</th>
                              <th>Description</th>
                              <th>Qty</th>
                              <th>Base Unit</th>
                              <th>Order Unit</th>
                              <th>Material Group</th>
                              <th>Price</th>
                              <th>PriceUnit</th>
                              <th>Amount</th>
                              <th>Delivery Date</th>
                              <th>Note</th>
                              <th>Action</th>
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
                                    className="form-control form-control-sm"
                                    onClick={() => {
                                      setSelectedItemIndex(idx);
                                      setShowModal(true);
                                    }}
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor: "#f9f9f9",
                                    }}
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.description}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.baseUnit}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "baseUnit",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>

                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.orderUnit}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "orderUnit",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>

                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.materialgroup}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "materialgroup",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    type="number"
                                    value={item.price}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <select
                                    value={item.priceUnit}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "priceUnit",
                                        e.target.value
                                      )
                                    }
                                    required
                                    className="form-select form-select-sm"
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EXTRA">EXTRA</option>
                                  </select>
                                </td>
                                <td>
                                  {(item.quantity * item.price).toFixed(2)}
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    type="date"
                                    value={item.deliveryDate}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "deliveryDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <textarea
                                    className="form-control form-control-sm"
                                    value={item.note}
                                    onChange={(e) =>
                                      handleItemChange(
                                        idx,
                                        "note",
                                        e.target.value
                                      )
                                    }
                                    maxLength="250"
                                    rows="2"
                                  />
                                </td>
                                <td>
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    type="button"
                                    onClick={() => deleteItem(idx)}
                                  >
                                    <i className="ti ti-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="col-md-12">
                          <div className="mb-3">
                            <button
                              type="button"
                              className="btn btn-link"
                              onClick={addItem}
                            >
                              <i className="isax isax-add-circle5 text-primary me-1"></i>
                              Add Item
                            </button>
                          </div>
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
                          <div className="col-xl-6">
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6>
                                  <i className="fas fa-shipping-fast me-2"></i>Delivery
                                  Information
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-3">
                                  <label className="form-label">Delivery Address:</label>
                                  <textarea
                                    className="form-control form-control-sm"
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    rows="4"
                                    placeholder="Enter complete delivery address..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6">
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6 className="">
                                  <i className="fas fa-calculator me-2"></i>Tax
                                  Calculation
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-xl-12  row">
                                    <div className="col-xl-2">
                                      <label className="form-label">
                                        Tax:
                                      </label></div>
                                    <div className="col-xl-6">
                                      <select
                                        className="form-select form-select-sm"
                                        onChange={(e) => {
                                          const tax = taxes.find(
                                            (t) => t.taxName === e.target.value
                                          );
                                          setSelectedTax(tax);
                                          if (tax) {
                                            const newCgst = tax.cgst || 0;
                                            const newSgst = tax.sgst || 0;
                                            const newIgst = tax.igst || 0;

                                            setCgst(newCgst);
                                            setSgst(newSgst);
                                            setIgst(newIgst);

                                            // Immediate recalculation with new tax values
                                            recalculateTotal(
                                              items,
                                              newCgst,
                                              newSgst,
                                              newIgst,
                                              taxDiscount
                                            );
                                          }
                                        }}
                                      >
                                        <option value="">
                                          -- Select Tax Template --
                                        </option>
                                        {taxes.map((t) => (
                                          <option key={t._id} value={t.taxName}>
                                            {t.taxName}
                                          </option>
                                        ))}
                                      </select>
                                    </div></div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6 row">
                                    <div className="col-xl-6">
                                      <label className="form-label">CGST (%):</label>
                                    </div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={cgst}
                                        onChange={(e) =>
                                          handleCgstChange(e.target.value)
                                        }
                                        step="0.01"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-md-6 mb-3 row">
                                    <div className="col-xl-6">
                                      <label className="form-label">SGST (%):</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={sgst}
                                        onChange={(e) =>
                                          handleSgstChange(e.target.value)
                                        }
                                        step="0.01"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-md-6 mb-3 row">
                                    <div className="col-xl-6">
                                      <label className="form-label">IGST (%):</label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={igst}
                                        onChange={(e) =>
                                          handleIgstChange(e.target.value)
                                        }
                                        step="0.01"
                                      />
                                    </div>
                                  </div>

                                  <div className="col-md-6 mb-3 row">
                                    <div className="col-xl-6">
                                      <label className="form-label">
                                        Tax Discount:
                                      </label></div>
                                    <div className="col-xl-6">
                                      <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        value={taxDiscount}
                                        onChange={(e) =>
                                          handleTaxDiscountChange(e.target.value)
                                        }
                                        step="0.01"
                                      /></div>
                                  </div>
                                </div>

                                {/* Total Summary */}
                                <div className="border-top ">
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
                                        <strong className="text-success">
                                          ₹{finalTotal}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between">
                          <button type="submit" className="btn btn-primary">
                            Submit PO
                          </button>
                        </div>
                      </form>
                    </div>


                  </div>
                </div>
              </div>
            </div>
            {showModal && <MaterialModal />}
            {showQuotationModal && <QuotationSearchModal />}
            {showVendorModal && <VendorSearchModal />}
          </div>
        </div>
      </div>
    </>

  );
}

export default PurchaseOrderForm;