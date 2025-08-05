import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PurchaseContractForm() {
  const [indents, setIndents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  const [contractReference, setContractReference] = useState("");
  const [selectedIndent, setSelectedIndent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vendor, setVendor] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [note, setNote] = useState("");
  const [vnNo, setVnNo] = useState("");
  const [items, setItems] = useState([]);
  const [location, setLocation] = useState("");
  const [buyerGroup, setBuyerGroup] = useState("");
  const [validityFDate, setvalidityFDate] = useState("");
  const [validityTDate, setvalidityTDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showIndentModal, setShowIndentModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [indentSearch, setIndentSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");

  const [searchIndent, setSearchIndent] = useState("");
  const [modalIndentSearch, setModalIndentSearch] = useState("");
  // const [selectedIndent, setSelectedIndent] = useState(null);

  // const [vendorName, setVendorName] = useState('');
  const [modalVendorSearch, setModalVendorSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (modalIndentSearch) {
      const filtered = indents.filter((indent) =>
        indent.indentId.toLowerCase().includes(modalIndentSearch.toLowerCase())
      );
      setFilteredIndents(filtered);
    }
  }, [modalIndentSearch]);
  const [locations, setLocations] = useState([]); // Add this state
  useEffect(() => {
    const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');


    axios.get("http://localhost:8080/api/indent/get",{params: { companyId, financialYear }}).then((res) => {
      const activeIndents = res.data.filter(
        (indent) => !indent.isDeleted && !indent.isBlocked
      );

      setIndents(
        activeIndents.map((indent) => ({
          label: `${indent.indentId} (${indent.categoryName})`,
          value: indent,
        }))
      );
    });

    axios.get("http://localhost:8080/api/purchase-contract-categories").then((res) => {
      setCategories(
        res.data.map((cat) => ({
          label: `${cat.categoryName} (${cat.prefix})`,
          value: cat._id,
        }))
      );
    });

    axios.get("http://localhost:8080/api/vendors",{params: { companyId, financialYear }}).then((res) => {
      const activeVendors = res.data.filter(
        (vendor) => !vendor.isDeleted && !vendor.isBlocked
      );

      setVendors(
        activeVendors.map((vendor) => ({
          label: `${vendor.name1} ${vendor.name2 || ""}`,
          value: vendor._id,
          vnNo: vendor.vnNo || "",
        }))
      );
    });


    axios.get("http://localhost:8080/api/locations",{params: { companyId, financialYear }}).then((res) => {
      console.log("Locations API response:", res.data); // Add this to debug
      // Handle different response structures
      if (Array.isArray(res.data)) {
        setLocations(res.data);
      } else if (res.data && Array.isArray(res.data.locations)) {
        setLocations(res.data.locations);
      } else {
        setLocations([]); // Fallback to empty array
      }
    }).catch((err) => {
      console.error("Failed to fetch locations:", err);
      setLocations([]); // Set empty array on error
    }); console.log("location", location);


    axios
      .get("http://localhost:8080/api/material",{params: { companyId, financialYear }})
      .then((res) => {
        console.log("Fetched materials:", res.data);
        const filteredMaterials = res.data.filter(
          (material) => !material.isDeleted && !material.isBlocked
        );
        setMaterials(filteredMaterials);
        console.log("Filtered materials:", filteredMaterials);
      })
      .catch((err) => console.error("Failed to fetch materials:", err));
  }, []);
  const handleIndentChange = (selectedOption) => {
    setSelectedIndent(selectedOption);
    const { buyerGroup, materialGroup, deliveryDate, location } = selectedOption.value;

    // Set the location and buyerGroup from indent
    setLocation(location || "");
    setBuyerGroup(buyerGroup || "");

    const mappedItems = selectedOption.value.items.map((item) => ({
      ...item,
      unit: item.unit || "",
      price: item.price || "",
      materialGroup: item.materialGroup || materialGroup || "",
      deliveryDate: item.deliveryDate || deliveryDate || "",
    }));
    setItems(mappedItems);
  };
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        materialId: "",
        description: "",
        qty: 0,
        baseUnit: "",
        orderUnit: "",
        location: "",
        buyerGroup: "",
        unit: "",
        materialGroup: "",
        deliveryDate: new Date().toISOString().slice(0, 10),
        price: 0,
      },
    ]);
  };
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractGenType, setContractGenType] = useState('internal'); // 'internal' or 'external'
  const [externalContractNumber, setExternalContractNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show the contract number generation modal first
    setShowContractModal(true);
  };
  useEffect(() => {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.qty) || 0; // or item.quantity if named that way
      return sum + (price * qty);
    }, 0);
    setTotalPrice(total);
  }, [items]);

  // Add this new function to handle the final submission
  const handleFinalSubmit = async () => {
    
 const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      const financialYear = localStorage.getItem('financialYear');


    const payload = {
      indentId: selectedIndent?.value?.indentId, // Changed from selectedIndent.indentId
      categoryId: selectedCategory?.value, // Changed from selectedIndent.categoryId
      rfqCategoryId: selectedCategory?.value,
      vendor,
      vendorName,
      contractReference,
      validityFDate,
      validityTDate,
        companyId: selectedCompanyId,
        financialYear: financialYear,
      vnNo,
      note,
      buyerGroup,
      location,
      totalPrice,
      items,
      contractGenType, // Add generation type
      externalContractNumber: contractGenType === 'external' ? externalContractNumber : null // Add external number if applicable
    };
    console.log("Payload for submission:", payload); // Debugging line
    try {
      const res = await axios.post(
        "http://localhost:8080/api/contracts/create",
        payload
      );
      alert("Contract Created Successfully");
      console.log(res.data);
      setShowContractModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create contract");
    }
  };

  // Add this new ContractNumberModal component before your return statement
  const ContractNumberModal = () => {
    return (
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-hashtag me-2"></i>Contract Number Generation
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowContractModal(false)}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Select Generation Type</label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="contractGenType"
                    id="internal"
                    value="internal"
                    checked={contractGenType === 'internal'}
                    onChange={(e) => setContractGenType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="internal">
                    <strong>Internal Generation</strong>
                    <br />
                    <small className="text-muted">
                      Auto-generate based on category and range count
                    </small>
                  </label>
                </div>

                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="contractGenType"
                    id="external"
                    value="external"
                    checked={contractGenType === 'external'}
                    onChange={(e) => setContractGenType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="external">
                    <strong>External Generation</strong>
                    <br />
                    <small className="text-muted">
                      Manually enter contract number
                    </small>
                  </label>
                </div>
              </div>

              {contractGenType === 'external' && (
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
                disabled={contractGenType === 'external' && !externalContractNumber.trim()}
              >
                <i className="fas fa-save me-1"></i>Create Contract
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const MaterialModal = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState("materialId");

    const [materialSearch, setMaterialSearch] = useState(""); // ✅ Add this line
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

    const selectMaterialFromSearch = (material) => {
      const updatedItems = [...items];
      updatedItems[selectedItemIndex] = {
        ...updatedItems[selectedItemIndex],
        materialId: material.materialId,
        description: material.description,
        baseUnit: material.baseUnit,
        unit: material.unit,
        price: material.price,
      };
      setItems(updatedItems);
      setShowModal(false);
    };

    return (
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-search me-2"></i>Search Materials
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowModal(false)}
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

              {/* Search Results */}
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
                        ? "No materials loaded from API"
                        : materialSearch
                          ? `No materials found matching "${materialSearch}"`
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
                onClick={() => setShowModal(false)}
              >
                <i className="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const IndentModal = () => {
    const [indentSearchType, setIndentSearchType] = useState("indentId");
    const [searchResults, setSearchResults] = useState([]);
    const [indentSearch, setIndentSearch] = useState(""); // ✅ Add this

    const handleIndentSearch = (e) => {
      const val = e.target.value;
      setIndentSearch(val); // ✅ update state
      const filtered = indents.filter((ind) =>
        (indentSearchType === "indentId"
          ? ind?.value?.indentId
          : ind?.value?.categoryName
        )
          ?.toLowerCase()
          .includes(val.toLowerCase())
      );
      setSearchResults(filtered);
    };

    const handleViewAllIndents = () => {
      setSearchResults(indents);
      setIndentSearch("");
    };

    const handleClearIndents = () => {
      setSearchResults([]);
      setIndentSearch("");
    };

    return (
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-search me-2"></i>Search Indents
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setShowIndentModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Search Type</label>
                  <select
                    className="form-select"
                    value={indentSearchType}
                    onChange={(e) => setIndentSearchType(e.target.value)}
                  >
                    <option value="indentId">Indent ID</option>
                    <option value="categoryName">Category</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Indent ID or Category"
                    value={indentSearch}
                    onChange={handleIndentSearch}
                  />
                </div>
                <div className="col-md-3 d-flex gap-2 mt-4">
                  <button
                    className="btn btn-info"
                    onClick={handleViewAllIndents}
                  >
                    <i className="fas fa-list me-1"></i>View All
                  </button>
                  {searchResults.length > 0 && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleClearIndents}
                    >
                      <i className="fas fa-times me-1"></i>Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {searchResults.length > 0 ? (
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Indent ID</th>
                        <th>Category</th>
                        <th>Buyer Group</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((ind, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="badge bg-secondary">
                              {ind.value.indentId}
                            </span>
                          </td>
                          <td>{ind.value.categoryName}</td>
                          <td>{ind.value.buyerGroup}</td>
                          <td>{ind.value.location}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                handleIndentChange(ind);
                                setShowIndentModal(false);
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
                      No indents found. Try different search or click "View
                      All".
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowIndentModal(false)}
              >
                <i className="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const VendorModal = () => {
    const [vendorSearchType, setVendorSearchType] = useState("name1");
    const [searchResults, setSearchResults] = useState([]);
    const [vendorSearch, setVendorSearch] = useState(""); // ✅ Add this line

    const handleVendorSearch = (e) => {
      const val = e.target.value;
      setVendorSearch(val);
      const filtered = vendors.filter((v) =>
        (vendorSearchType === "vnNo" ? v.vnNo : v.label)
          ?.toLowerCase()
          .includes(val.toLowerCase())
      );
      setSearchResults(filtered);
    };

    const handleViewAllVendors = () => {
      setSearchResults(vendors);
      setVendorSearch("");
    };

    const handleClearVendors = () => {
      setSearchResults([]);
      setVendorSearch("");
    };

    return (
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
                onClick={() => setShowVendorModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Search Type</label>
                  <select
                    className="form-select"
                    value={vendorSearchType}
                    onChange={(e) => setVendorSearchType(e.target.value)}
                  >
                    <option value="name1">Vendor Name</option>
                    <option value="vnNo">Vendor No</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Name or VN No"
                    value={vendorSearch}
                    onChange={handleVendorSearch}
                  />
                </div>
                <div className="col-md-3 d-flex gap-2 mt-4">
                  <button
                    className="btn btn-info"
                    onClick={handleViewAllVendors}
                  >
                    <i className="fas fa-list me-1"></i>View All
                  </button>
                  {searchResults.length > 0 && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handleClearVendors}
                    >
                      <i className="fas fa-times me-1"></i>Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {searchResults.length > 0 ? (
                  <table className="table table-hover">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Vendor Name</th>
                        <th>Vendor No</th>
                        <th>City</th>
                        <th>Region</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((v, idx) => (
                        <tr key={idx}>
                          <td>{v.label}</td>
                          <td>
                            <span className="badge bg-secondary">{v.vnNo}</span>
                          </td>
                          <td>{v.city || "-"}</td>
                          <td>{v.region || "-"}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => {
                                setVendor(v.value);
                                setVendorName(v.label);
                                setVnNo(v.vnNo || "");
                                setShowVendorModal(false);
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
                      No vendors found. Try another search or click "View All".
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowVendorModal(false)}
              >
                <i className="fas fa-times me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">Purchase Contract</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item">
                  Purchase
                </li>
                <li className="breadcrumb-item active" aria-current="page">Purchase Contract</li>
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
                          <h5 className="fw-semibold">Purchase Contract Header</h5>
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
                        <div className="col-xl-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">Select Indent</label></div>
                          <div className="col-xl-7">
                            <div className="input-group">
                              <input
                                className="form-control form-control-sm"
                                placeholder="Type or search Indent"
                                value={selectedIndent?.value?.indentId || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSearchIndent(val);

                                  const matched = indents.find(
                                    (indent) =>
                                      indent.indentId.toLowerCase() ===
                                      val.toLowerCase()
                                  );
                                  setSelectedIndent(matched || null);
                                }}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  setModalIndentSearch(searchIndent);
                                  setShowIndentModal(true);
                                }}
                              >
                                <i className="ti ti-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Category
                            </label>
                          </div>
                          <div className="col-xl-7">
                            <select
                              className="form-select form-control-sm"
                              value={selectedCategory?.value || ""}
                              onChange={(e) =>
                                setSelectedCategory(
                                  categories.find(
                                    (c) => c.value === e.target.value
                                  ) || null
                                )
                              }
                            >
                              <option value="">Select</option>
                              {categories.map((cat, idx) => (
                                <option key={idx} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-3">
                            <label className="form-label">Vendor</label>
                          </div>
                          <div className="col-xl-9">
                            <div className="input-group">
                              <input
                                className="form-control form-control-sm"
                                placeholder="Type or search Vendor"
                                value={vendorName}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setVendorName(val);

                                  const matchedVendor = vendors.find(
                                    (v) =>
                                      v.name.toLowerCase() === val.toLowerCase()
                                  );
                                  if (matchedVendor) {
                                    setSelectedVendor(matchedVendor);
                                  } else {
                                    setSelectedVendor(null);
                                  }
                                }}
                              />
                              <button
                                className="btn btn-outline-info btn-sm"
                                onClick={() => {
                                  setShowVendorModal(true);
                                  setModalVendorSearch(vendorName);
                                }}
                              >
                                <i className="ti ti-search"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-3 row">
                          <div className="col-xl-4">
                            <label className="form-label">Reference</label></div>
                          <div className="col-xl-8">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter Contract Reference"
                              value={contractReference}
                              onChange={(e) => setContractReference(e.target.value)}
                            /></div>
                        </div>
                        <div className="col-lg-3 row">

                          <div className="col-lg-3">
                            <label className="form-label">Location</label></div>
                          <div className="col-xl-9">
                            <select
                              className="form-select form-select-sm "
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            >
                              <option value="">Select Location</option>
                              {Array.isArray(locations) && locations.map((loc, idx) => (
                                <option key={idx} value={loc.name || loc._id || loc}>
                                  {loc.name || loc.locationName || loc}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Buyer Group
                            </label></div>
                          <div className="col-xl-7">
                            <input
                              type="text"
                              className="form-control"
                              value={buyerGroup}
                              onChange={(e) =>
                                setBuyerGroup(e.target.value)
                              }
                            /></div>
                        </div>

                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Validity From
                            </label></div>
                          <div className="col-xl-7">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={validityFDate}
                              onChange={(e) =>
                                setvalidityFDate(e.target.value)
                              }
                            /></div>
                        </div>
                             <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Validity Till
                            </label></div>
                          <div className="col-xl-7">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={validityTDate}
                              onChange={(e) =>
                                setvalidityTDate(e.target.value)
                              }
                            /></div>
                        </div>
                        <div className="col-lg-3 row">
                          <div className="col-xl-5">
                            <label className="form-label">
                              Additional Notes
                            </label></div>
                          <div className="col-xl-7">
                            <textarea
                              className="form-control form-control-sm"
                              rows={4}
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                            ></textarea>
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
                      <form onSubmit={handleSubmit}>
                        <div className="border-bottom mb-3 pb-3">
                          <h6 className="mb-3">Items & Details</h6>
                          <div className="table-responsive">
                            <table className="table-bordered table-sm  mb-0">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Material ID</th>
                                  <th>Description</th>
                                  <th>Qty</th>
                                  <th>Base Unit</th>
                                  <th>Order Unit</th>

                                  {/* <th>Unit</th> */}
                                  <th>Material Group</th>
                                  <th>Delivery Date</th>
                                  <th>Vendor</th>
                                  <th>Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                      <input
                                        className="form-control form-control-sm"
                                        value={item.materialId}
                                        readOnly
                                      />
                                    </td>
                                    <td>
                                      <input
                                        className="form-control form-control-sm"
                                        value={item.description}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
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
                                          handleItemChange(
                                            index,
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
                                          handleItemChange(
                                            index,
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
                                            index,
                                            "orderUnit",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>

                                    {/* <td>
                                      <input
                                        className="form-control form-control-sm"
                                        value={item.unit}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "unit",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td> */}
                                    <td>
                                      <input
                                        className="form-control form-control-sm"
                                        value={item.materialGroup}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "materialGroup",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={item.deliveryDate}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
                                            "deliveryDate",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td>{vendorName}</td>
                                    <td>
                                      <input
                                        className="form-control form-control-sm"
                                        type="number"
                                        value={item.price}
                                        onChange={(e) =>
                                          handleItemChange(
                                            index,
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
                            <div className="col-md-12">
                              <div className="mb-3">
                                <button
                                  type="button"
                                  onClick={addItem}
                                  className="btn btn-link"
                                >
                                  <i className="isax isax-add-circle5 text-primary me-1"></i>
                                  Add Item
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between">
                          <button type="submit" className="btn btn-primary">
                            Submit Quotation
                          </button>
                        </div>
                      </form>



                      {showModal && <MaterialModal />}
                    </div>
                    <div className="col-xl-2 ms-auto  bg-light p-3 rounded">
                      <h6 className="mb-0">Total Price: <span className="text-primary">₹{totalPrice.toFixed(2)}</span></h6>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>

          {showIndentModal && <IndentModal />}
          {showVendorModal && <VendorModal />}
{showContractModal && <ContractNumberModal />}
        </div>
      </div>
    </>
  );
}

export default PurchaseContractForm;

