import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DataImportModal from "../../components/DataImportModal";

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
    const [showDataImportModal, setShowDataImportModal] = useState(false);

    const handleImportSuccess = (result) => {
        alert(`Import completed: ${result.results.imported} records imported`);
        setShowDataImportModal(false);
        fetchLocations(); // Refresh the list after import
    };

    // Export to Excel Function
    const exportToExcel = () => {
        // Prepare data for Excel
        const excelData = locations.map((location, index) => ({
            'S.No': index + 1,
            'Location Name': location.name || '',
            'Address': location.address || '',
            'City': location.city || '',
            'State': location.state || '',
            'Country': location.country || '',
            'Postal Code': location.postalCode || '',
            'Contact Person': location.contactPerson || '',
            'Contact Number': location.contactNumber || '',
            'Company ID': location.companyId || '',
            'Financial Year': location.financialYear || '',
            'Created Date': location.createdAt ? new Date(location.createdAt).toLocaleDateString() : '',
            'Updated Date': location.updatedAt ? new Date(location.updatedAt).toLocaleDateString() : ''
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 8 },  // S.No
            { wch: 25 }, // Location Name
            { wch: 40 }, // Address
            { wch: 20 }, // City
            { wch: 20 }, // State
            { wch: 15 }, // Country
            { wch: 12 }, // Postal Code
            { wch: 25 }, // Contact Person
            { wch: 15 }, // Contact Number
            { wch: 15 }, // Company ID
            { wch: 15 }, // Financial Year
            { wch: 15 }, // Created Date
            { wch: 15 }  // Updated Date
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Location Master');

        // Generate filename with current date and time
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
        const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
        const filename = `Location-Master-${currentDate}-${currentTime}.xlsx`;

        // Save the file
        XLSX.writeFile(wb, filename);
        
        // Show success message
        alert(`Excel file exported successfully as: ${filename}`);
    };

    const fetchLocations = async () => {
        try {
            const companyId = localStorage.getItem('selectedCompanyId');
            const financialYear = localStorage.getItem('financialYear');

            const res = await axios.get("http://localhost:8080/api/locations", { 
                params: { companyId, financialYear } 
            });
            setLocations(res.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
            alert('Error loading locations');
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const selectedCompanyId = localStorage.getItem('selectedCompanyId');
            const financialYear = localStorage.getItem('financialYear');

            const payload = {
                ...form,
                companyId: selectedCompanyId,
                financialYear: financialYear
            };

            if (editId) {
                await axios.put(`http://localhost:8080/api/locations/${editId}`, payload);
                alert('Location updated successfully!');
            } else {
                await axios.post("http://localhost:8080/api/locations", payload);
                alert('Location created successfully!');
            }

            setForm(initialForm);
            setEditId(null);
            setShowModal(false);
            fetchLocations();
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Error saving location. Please try again.');
        }
    };

    const handleEdit = (loc) => {
        setForm({
            name: loc.name || '',
            address: loc.address || '',
            city: loc.city || '',
            state: loc.state || '',
            country: loc.country || '',
            postalCode: loc.postalCode || '',
            contactPerson: loc.contactPerson || '',
            contactNumber: loc.contactNumber || ''
        });
        setEditId(loc._id);
        setShowModal(true);
    };

    const handleAdd = () => {
        setForm(initialForm);
        setEditId(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setForm(initialForm);
        setEditId(null);
    };



    // Helper function to format field labels
    const formatFieldLabel = (key) => {
        const labelMap = {
            name: "Location Name",
            address: "Address",
            city: "City",
            state: "State",
            country: "Country",
            postalCode: "Postal Code",
            contactPerson: "Contact Person",
            contactNumber: "Contact Number"
        };
        return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
    };

    return (
        <div className="content">
            {/* Header Section */}
            <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                <div className="my-auto mb-2">
                    <h2 className="mb-1">Location Master</h2>
                    <nav>
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item">
                                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                            </li>
                            <li className="breadcrumb-item">
                                Master
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Location Master</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3">
                        <div></div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap gap-2">
                            <button 
                                onClick={() => setShowDataImportModal(true)} 
                                className="btn btn-outline-primary btn-sm"
                            >
                                <i className="ti ti-file-import me-1"></i>Import
                            </button>
                            
                            {/* Updated Export Button - Direct Excel Export */}
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={exportToExcel}
                                title="Export to Excel"
                            >
                                <i className="ti ti-file-export me-1"></i>Export Excel
                            </button>

                            <div>
                                <button 
                                    onClick={handleAdd} 
                                    className="btn btn-primary btn-sm"
                                >
                                    <i className="ti ti-circle-plus me-1"></i>Add Location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Location Name</th>
                                    <th>Address</th>
                                    <th>City</th>
                                    <th>State</th>
                                    <th>Country</th>
                                    <th>Postal Code</th>
                                    <th>Contact Person</th>
                                    <th>Contact Number</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                            No locations found
                                        </td>
                                    </tr>
                                ) : (
                                    locations.map((loc, index) => (
                                        <tr key={loc._id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{loc.name}</strong></td>
                                            <td>{loc.address}</td>
                                            <td>{loc.city}</td>
                                            <td>{loc.state}</td>
                                            <td>{loc.country}</td>
                                            <td>{loc.postalCode}</td>
                                            <td>{loc.contactPerson}</td>
                                            <td>{loc.contactNumber}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-primary" 
                                                    onClick={() => handleEdit(loc)}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DataImportModal
                show={showDataImportModal}
                onClose={() => setShowDataImportModal(false)}
                onImportSuccess={handleImportSuccess}
                masterDataType="location"
            />

            {showModal && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div
                        className="modal fade show"
                        tabIndex="-1"
                        role="dialog"
                        style={{ display: "block" }}
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editId ? "Edit Location" : "Add New Location"}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={handleCloseModal}
                                    ></button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            {Object.keys(initialForm).map((key) => (
                                                <div className="col-md-4 mb-3" key={key}>
                                                    <div className="row">
                                                        <div className="col-4">
                                                            <label className="form-label">
                                                                {formatFieldLabel(key)}
                                                                {key === "name" && <span className="text-danger"> *</span>}
                                                            </label>
                                                        </div>
                                                        <div className="col-8">
                                                            <input
                                                                type={key === "contactNumber" ? "tel" : "text"}
                                                                name={key}
                                                                className="form-control"
                                                                placeholder={`Enter ${formatFieldLabel(key)}`}
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
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editId ? "Update Location" : "Create Location"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LocationMaster;