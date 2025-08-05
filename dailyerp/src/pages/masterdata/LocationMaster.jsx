import React, { useEffect, useState } from "react";
import axios from "axios";

const initialForm = {
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    contactPerson: "",
    contactNumber: "",
};

const LocationMaster = () => {
    const [locations, setLocations] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchLocations = async () => {
        const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');

        const res = await axios.get("http://localhost:8080/api/locations",{params: { companyId, financialYear }});
        setLocations(res.data);
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');

  const payload = {
    ...form,
    companyId: selectedCompanyId,
    financialYear: financialYear
  };

        if (editId) {
            await axios.put(`http://localhost:8080/api/locations/${editId}`, payload);
        } else {
            await axios.post("http://localhost:8080/api/locations", payload);
        }
        setForm(initialForm);
        setEditId(null);
        setShowModal(false);
        fetchLocations();
    };

    const handleEdit = (loc) => {
        setForm(loc);
        setEditId(loc._id);
        setShowModal(true);
    };

    const handleAdd = () => {
        setForm(initialForm);
        setEditId(null);
        setShowModal(true);
    };
    const [showdropdown, setShowdropdown] = useState(false);

    const handleOpendropdown = () => setShowdropdown(true);
    const handleClosedropdown = () => setShowdropdown(false);
    return (
        <div className="content">
            <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3 mb-3">
                <div>
                    <h4>Location Master</h4>
                </div>
                <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
                    <div className="dropdown">
                        <a href="#" onClick={handleOpendropdown} className="btn btn-outline-primary d-inline-flex align-items-center" data-bs-toggle="dropdown">
                            <i className="isax isax-export-1 me-1"></i>Export
                        </a>
                        <ul className={showdropdown ? `dropdown-menu show` : "dropdown-menu"}>
                            <li>
                                <a className="dropdown-item" href="#" onClick={handleClosedropdown}>Download as PDF</a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="#" onClick={handleClosedropdown}>Download as Excel</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <button onClick={handleAdd} className="btn btn-primary">Add Location</button>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered" style={{ marginTop: 16 }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>Postal Code</th>
                            <th>Contact Person</th>
                            <th>Contact Number</th>

                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((loc,index) => (
                            <tr key={loc._id}>
                                <td>{index + 1}</td>
                                <td>{loc.name}</td>
                                <td>{loc.address}</td>
                                <td>{loc.city}</td>
                                <td>{loc.state}</td>
                                <td>{loc.country}</td>
                                <td>{loc.postalCode}</td>
                                <td>{loc.contactPerson}</td>
                                <td>{loc.contactNumber}</td>
                                <td>
                                    <button className="btn btn-primary" onClick={() => handleEdit(loc)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* {showModal && (
                <div
                    style={{
                        position: "fixed",
                        left: 0,
                        top: 0,
                        zIndex: 1000,
                        width: "100vw",
                        height: "100vh",
                        padding: 100,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            background: "#fff",
                            padding: 24,
                            borderRadius: 8,
                            minWidth: 400,
                        }}
                    >
                        <h3>{editId ? "Edit Location" : "Add Location"}</h3>
                        <div className="row">
                            {Object.keys(initialForm).map((key) => (
                                <div key={key} className="col-md-4" style={{ marginBottom: 12 }}>
                                    <label style={{ display: "block", marginBottom: 4 }}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name={key}
                                        value={form[key]}
                                        onChange={handleChange}
                                        required={key === "name"}
                                    />
                                </div>
                            ))}</div>
                        <div style={{ marginTop: 16 }}>
                            <button type="submit" className="btn btn-primary">{editId ? "Update" : "Create"}</button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                style={{ marginLeft: 8 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )} */}

            {showModal && (
  <div
    className="modal fade show"
    tabIndex="-1"
    role="dialog"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.3)" }}
    aria-modal="true"
  >
    <div className="modal-dialog modal-xl modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            {editId ? "Edit Location" : "Add Location"}
          </h5>
          <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="row">
              {Object.keys(initialForm).map((key) => (
                <div className="col-md-4 mb-3" key={key}>
                  <div className="row">
                    <div className="col-4">
                      <label className="form-label">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                    <div className="col-8">
                      <input
                        type="text"
                        name={key}
                        className="form-control"
                        placeholder={form[key] || `Enter ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                        value={form[key]}
                        onChange={handleChange} 
                        required={key === "name"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

        </div>
    );
};

export default LocationMaster;