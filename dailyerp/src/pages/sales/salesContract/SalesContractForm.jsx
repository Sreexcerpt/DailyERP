import React, { useState, useEffect } from "react";
import axios from "axios";

function SalesContractForm() {
  const [salesRequests, setSalesRequests] = useState([]);
  const [contractCategories, setContractCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [salesGroup, setSalesGroup] = useState("");

  const [savedContracts, setSavedContracts] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [note, setNote] = useState("");
  const [validityFromDate, setValidityFromDate] = useState("");
  const [validityToDate, setValidityToDate] = useState("");
  const [items, setItems] = useState([]);

  const [materialSearch, setMaterialSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  useEffect(() => {
    // Fetch and filter sales requests (indents)
    axios
      .get("http://localhost:8080/api/salerequest/get", { params: { companyId, financialYear }, })
      .then((res) => {
        const activeRequests = res.data.filter(
          (r) => !r.isBlocked && !r.isDeleted
        );
        setSalesRequests(activeRequests);
      })
      .catch(console.error);

    // Fetch contract categories (adjust API endpoint as needed)
    axios
      .get("http://localhost:8080/api/sale-contract-categories")
      .then((res) => setContractCategories(res.data))
      .catch(console.error);

    // Fetch locations
    axios.get("http://localhost:8080/api/locations").then((res) => {
      console.log("Locations API response:", res.data);
      if (Array.isArray(res.data)) {
        setLocations(res.data);
      } else if (res.data && Array.isArray(res.data.locations)) {
        setLocations(res.data.locations);
      } else {
        setLocations([]);
      }
    }).catch((err) => {
      console.error("Failed to fetch locations:", err);
      setLocations([]);
    });

    // Fetch and filter customers
    axios
      .get("http://localhost:8080/api/customers")
      .then((res) => {
        const activeCustomers = res.data.filter(
          (c) => !c.isBlocked && !c.isDeleted
        );
        setCustomers(activeCustomers);
      })
      .catch(console.error);

    axios
      .get("http://localhost:8080/api/material")
      .then((res) => setMaterials(res.data))
      .catch(console.error);

    fetchSavedContracts();
  }, []);

  const fetchSavedContracts = () => {
    axios
      .get("http://localhost:8080/api/salescontracts", { params: { companyId, financialYear }, })
      .then((res) => setSavedContracts(res.data))
      .catch(console.error);
  };

  const handleRequestSelect = (req) => {
    setSelectedRequest({ label: req.indentId, value: req._id });
    setSalesGroup(req.salesGroup || "");
    setLocation(req.location)
    setItems(
      req.items.map((item) => ({
        ...item,
        customerName: selectedCustomer?.name1 || "",
        price: "",
        unit: "",

      }))
    );
    setShowRequestModal(false);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      label: `${customer.name1} ${customer.name2}`,
      value: customer._id,
    });
    setItems((prev) =>
      prev.map((item) => ({ ...item, customerName: customer.name1 }))
    );
    setShowCustomerModal(false);
  };

  const handleMaterialSelect = (mat) => {
    const updated = [...items];
    updated[selectedItemIndex] = {
      ...updated[selectedItemIndex],
      materialId: mat.materialId,
      description: mat.description,
      baseUnit: mat.baseUnit,
      unit: mat.unit,
      price: mat.price,
    };
    setItems(updated);
    setShowMaterialModal(false);
  };

  const updateItemField = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addEmptyItem = () => {
    setItems((prev) => [
      ...prev,
      {
        customerName: selectedCustomer?.label || "",
        materialId: "",
        description: "",
        qty: "",
        baseUnit: "",
        orderUnit: "",
        location: "",
        unit: "",
        price: "",
      },
    ]);
  };

  // Contract number modal states
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractNumberType, setContractNumberType] = useState('internal');
  const [externalContractNumber, setExternalContractNumber] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate validity dates
    if (validityFromDate && validityToDate && validityFromDate > validityToDate) {
      alert("Validity From date cannot be later than Validity To date");
      return;
    }
    setShowContractModal(true);
  };

  const handleFinalSubmit = () => {
    const data = {
      indentId: selectedRequest?.label,
      categoryId: selectedCategory?.value,
      customerId: selectedCustomer?.value,
      note,
      companyId: selectedCompanyId,
      financialYear: financialYear,
      validityFromDate,
      validityToDate,
      salesGroup,
      location,
      items,
      contractNumberType,
      externalContractNumber: contractNumberType === 'external' ? externalContractNumber : null
    };

    axios
      .post("http://localhost:8080/api/salescontracts", data)
      .then(() => {
        alert("Contract saved successfully!");
        fetchSavedContracts();
        resetForm();
        setShowContractModal(false);
        setContractNumberType('internal');
        setExternalContractNumber('');
      })
      .catch((err) => {
        console.error(err);
        alert("Error saving contract");
      });
  };

  const ContractNumberModal = () => {
    return (
      <ModalWrapper onClose={() => setShowContractModal(false)}>
        <div className="text-center mb-4">
          <h5>Choose Contract Number Generation</h5>
          <p className="text-muted">Select how you want to generate the contract number</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6">
                <div className="card h-100" style={{ cursor: 'pointer' }}>
                  <div
                    className={`card-body text-center p-4 ${contractNumberType === 'internal' ? 'bg-primary text-white' : ''}`}
                    onClick={() => setContractNumberType('internal')}
                  >
                    <i className="fas fa-cog fa-3x mb-3"></i>
                    <h6>Internal Generation</h6>
                    <p className="small">
                      System will automatically generate contract number based on category and range
                    </p>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="contractType"
                        value="internal"
                        checked={contractNumberType === 'internal'}
                        onChange={(e) => setContractNumberType(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100">
                  <div
                    className={`card-body text-center p-4 ${contractNumberType === 'external' ? 'bg-primary text-white' : ''}`}
                    onClick={() => setContractNumberType('external')}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="fas fa-keyboard fa-3x mb-3"></i>
                    <h6>External Generation</h6>
                    <p className="small">
                      Enter your own custom contract number
                    </p>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="contractType"
                        value="external"
                        checked={contractNumberType === 'external'}
                        onChange={(e) => setContractNumberType(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {contractNumberType === 'external' && (
              <div className="mt-4">
                <label className="form-label">Enter Contract Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter custom contract number (max 50 characters)"
                  value={externalContractNumber}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setExternalContractNumber(e.target.value);
                    }
                  }}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  maxLength="50"
                  autoFocus
                />
                <div className="form-text">
                  {externalContractNumber.length}/50 characters
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowContractModal(false)}
          >
            <i className="fas fa-times me-1"></i>Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinalSubmit}
            disabled={contractNumberType === 'external' && !externalContractNumber.trim()}
          >
            <i className="fas fa-save me-1"></i>Save Contract
          </button>
        </div>
      </ModalWrapper>
    );
  };

  const resetForm = () => {
    setSelectedRequest(null);
    setSelectedCategory(null);
    setSelectedCustomer(null);
    setNote("");
    setValidityFromDate("");
    setValidityToDate("");
    setItems([]);
  };

  const ModalWrapper = ({ children, onClose }) => (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Select</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );

  const MaterialModal = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState("materialId");

    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setMaterialSearch(value);

      const filtered = materials.filter((mat) => {
        const target =
          searchType === "materialId" ? mat.materialId : mat.description;
        return target?.toLowerCase().includes(value.toLowerCase());
      });

      setSearchResults(filtered);
    };

    const handleViewAll = () => {
      setSearchResults(materials);
      setMaterialSearch("");
    };

    const handleClearResults = () => {
      setSearchResults([]);
      setMaterialSearch("");
    };

    return (
      <ModalWrapper onClose={() => setShowMaterialModal(false)}>
        {/* Search Controls */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Search Type</label>
            <select
              className="form-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="materialId">Material ID</option>
              <option value="description">Description</option>
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
                  searchType === "materialId"
                    ? "Enter Material ID (e.g., MMNR-100001)"
                    : "Search by Description..."
                }
                value={materialSearch}
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

        {/* Search Results Table */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {searchResults.length > 0 ? (
            <table className="table table-hover">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Material ID</th>
                  <th>Description</th>
                  <th>Base Unit</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((material, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className="badge bg-secondary">
                        {material.materialId}
                      </span>
                    </td>
                    <td>{material.description}</td>
                    <td>{material.baseUnit}</td>
                    <td>{material.unit}</td>
                    <td>{material.price}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleMaterialSelect(material)}
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
                  ? "No materials loaded from API"
                  : materialSearch
                    ? `No materials found matching "${materialSearch}"`
                    : 'Enter search term or click "View All"'}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowMaterialModal(false)}
          >
            <i className="fas fa-times me-1"></i>Close
          </button>
        </div>
      </ModalWrapper>
    );
  };

  const CustomerModal = () => {
    const [searchType, setSearchType] = useState("name1");
    const [searchResults, setSearchResults] = useState([]);

    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setCustomerSearch(value);

      const filtered = customers.filter((c) => {
        const target =
          searchType === "name1"
            ? c.name1
            : searchType === "city"
              ? c.city
              : searchType === "region"
                ? c.region
                : `${c.name1} ${c.name2}`;
        return target?.toLowerCase().includes(value.toLowerCase());
      });

      setSearchResults(filtered);
    };

    const handleViewAll = () => {
      setSearchResults(customers);
      setCustomerSearch("");
    };

    const handleClearResults = () => {
      setSearchResults([]);
      setCustomerSearch("");
    };

    return (
      <ModalWrapper onClose={() => setShowCustomerModal(false)}>
        {/* Search Controls */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Search Type</label>
            <select
              className="form-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="name1">Name</option>
              <option value="city">City</option>
              <option value="region">Region</option>
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
                placeholder="Type to search..."
                value={customerSearch}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-md-3 d-flex align-items-end gap-2">
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

        {/* Results */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {searchResults.length > 0 ? (
            <table className="table table-hover">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Region</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      {c.name1} {c.name2}
                    </td>
                    <td>{c.city}</td>
                    <td>{c.region}</td>
                    <td>{c.contactNo}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleCustomerSelect(c)}
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
                {customers.length === 0
                  ? "No customers loaded"
                  : customerSearch
                    ? `No match found for "${customerSearch}"`
                    : 'Enter a search term or click "View All"'}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomerModal(false)}
          >
            <i className="fas fa-times me-1"></i>Close
          </button>
        </div>
      </ModalWrapper>
    );
  };

  const RequestModal = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState("indentId");
    const [requestSearch, setRequestSearch] = useState("");

    const handleSearchInputChange = (e) => {
      const value = e.target.value;
      setRequestSearch(value);

      const filtered = salesRequests.filter((req) => {
        const target =
          searchType === "indentId"
            ? req.indentId
            : searchType === "categoryName"
              ? req.categoryName
              : req.location;
        return target?.toLowerCase().includes(value.toLowerCase());
      });

      setSearchResults(filtered);
    };

    const handleViewAll = () => {
      setSearchResults(salesRequests);
      setRequestSearch("");
    };

    const handleClearResults = () => {
      setSearchResults([]);
      setRequestSearch("");
    };

    return (
      <ModalWrapper onClose={() => setShowRequestModal(false)}>
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
              <option value="categoryName">Category</option>
              <option value="location">Location</option>
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
                placeholder="Search..."
                value={requestSearch}
                onChange={handleSearchInputChange}
              />
            </div>
          </div>

          <div className="col-md-3 d-flex align-items-end gap-2">
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

        {/* Search Results Table */}
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {searchResults.length > 0 ? (
            <table className="table table-hover">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Indent ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.indentId}</td>
                    <td>{r.categoryName}</td>
                    <td>{r.location}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleRequestSelect(r)}
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
                {salesRequests.length === 0
                  ? "No sales requests found"
                  : requestSearch
                    ? `No match for "${requestSearch}"`
                    : 'Enter a search term or click "View All"'}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowRequestModal(false)}
          >
            <i className="fas fa-times me-1"></i>Close
          </button>
        </div>
      </ModalWrapper>
    );
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Sales Contract</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Sales
                </li>
                <li className="breadcrumb-item active" aria-current="page">Sales Contract</li>
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
                        <span><i className="fas fa-file-contract me-2"></i></span>
                        <h5 className="fw-semibold">Contract Header</h5>
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
                      <div className="col-xl-3 row">
                        <div className="col-xl-6">
                          <label className="form-label">Sales Request:</label>
                        </div>
                        <div className="col-xl-6">
                          <div className="input-group">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Type or search Indent"
                              value={selectedRequest?.label || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedRequest({
                                  label: val,
                                  value: null,
                                });
                              }}
                            />
                            <button
                              className="btn btn-outline-primary btn-sm"
                              type="button"
                              onClick={() => setShowRequestModal(true)}
                            >
                              <i className="ti ti-search"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 row">
                        <div className="col-xl-6">
                          <label className="form-label">Customer:</label>
                        </div>
                        <div className="col-xl-6">
                          <div className="input-group">
                            <input
                              className="form-control form-control-sm"
                              placeholder="Type or search Customer"
                              value={selectedCustomer?.label || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedCustomer({
                                  label: val,
                                  value: null,
                                });
                              }}
                            />
                            <button
                              className="btn btn-outline-primary btn-sm"
                              type="button"
                              onClick={() => setShowCustomerModal(true)}
                            >
                              <i className="ti ti-search"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-3 row">
                        <div className="col-xl-3">
                          <label className="form-label">Location</label>
                        </div>
                        <div className="col-xl-9">
                          <select
                            className="form-select"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          >
                            <option value="">Select Location</option>
                            {Array.isArray(locations) && locations.map((loc, idx) => (
                              <option key={idx} value={loc.name}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-xl-3 row">
                        <div className="col-xl-7">
                          <label className="form-label">Contract Category:</label>
                        </div>
                        <div className="col-xl-5">
                          <select
                            className="form-select"
                            value={selectedCategory?.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const found = contractCategories.find(
                                (cat) => cat._id === value
                              );
                              setSelectedCategory(
                                found
                                  ? {
                                    label: found.categoryName,
                                    value: found._id,
                                  }
                                  : null
                              );
                            }}
                          >
                            <option value="">Select</option>
                            {contractCategories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.categoryName} ({cat.prefix})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-xl-3 row">
                        <div className="col-xl-6">
                          <label className="form-label">Validity From Date</label>
                        </div>
                        <div className="col-xl-6">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={validityFromDate}
                            onChange={(e) => setValidityFromDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="col-xl-3 row">
                        <div className="col-xl-6">
                          <label className="form-label">Validity To Date</label>
                        </div>
                        <div className="col-xl-6">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={validityToDate}
                            onChange={(e) => setValidityToDate(e.target.value)}
                            min={validityFromDate} // Ensures "To" date is not before "From" date
                          />
                        </div>
                      </div>

                      <div className="col-xl-3 row">
                        <div className="col-xl-6">
                          <label className="form-label">Sales Group:</label>
                        </div>
                        <div className="col-xl-6">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={salesGroup}
                            onChange={(e) => setSalesGroup(e.target.value)}
                            placeholder="Enter or edit Sales Group"
                          />
                        </div>
                      </div>

                      <div className="col-xl-4 row">
                        <div className="col-xl-2">
                          <label className="form-label">Notes</label>
                        </div>
                        <div className="col-xl-10">
                          <textarea
                            className="form-control form-control-sm"
                            rows="3"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
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

            <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
              <div className="accordion-body">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="table-responsive mb-3">
                        <table className="table-sm table-bordered mb-0">
                          <thead className="table-dark">
                            <tr>
                              <th>#</th>
                              <th>Material ID</th>
                              <th>Description</th>
                              <th>Qty</th>
                              <th>Base Unit</th>
                              <th>Order Unit</th>
                              <th>Location</th>
                              <th>Customer</th>
                              <th>Unit</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <div className="input-group input-group-sm">
                                    <input
                                      className="form-control form-control-sm"
                                      placeholder="Type or search Material"
                                      value={item.materialId}
                                      onChange={(e) =>
                                        updateItemField(
                                          idx,
                                          "materialId",
                                          e.target.value
                                        )
                                      }
                                    />
                                    <button
                                      className="btn btn-outline-info"
                                      type="button"
                                      title="Search Material"
                                      onClick={() => {
                                        setSelectedItemIndex(idx);
                                        setShowMaterialModal(true);
                                      }}
                                    >
                                      <i className="fas fa-search"></i>
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.description}
                                    onChange={(e) =>
                                      updateItemField(
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
                                    value={item.qty}
                                    onChange={(e) =>
                                      updateItemField(
                                        idx,
                                        "qty",
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
                                      updateItemField(
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
                                      updateItemField(
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
                                    value={item.location}
                                    onChange={(e) =>
                                      updateItemField(
                                        idx,
                                        "location",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.customerName}
                                    onChange={(e) =>
                                      updateItemField(
                                        idx,
                                        "customerName",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.unit}
                                    onChange={(e) =>
                                      updateItemField(
                                        idx,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control form-control-sm"
                                    value={item.price}
                                    onChange={(e) =>
                                      updateItemField(
                                        idx,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={addEmptyItem}
                          >
                            + Add Contract Item
                          </button>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between">
                        <button type="submit" className="btn btn-primary">
                          Submit Contract
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showMaterialModal && <MaterialModal />}
          {showCustomerModal && <CustomerModal />}
          {showRequestModal && <RequestModal />}
          {showContractModal && <ContractNumberModal />}
        </div>
      </div>
    </>
  );
}

export default SalesContractForm;