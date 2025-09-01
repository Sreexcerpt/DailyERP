import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import DataImportModal from '../../components/DataImportModal';

const TaxForm = () => {
  const [errors, setErrors] = useState({});
  const [taxes, setTaxes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showDataImportModal, setShowDataImportModal] = useState(false);
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTaxes();
  }, []);

  const [formData, setFormData] = useState({
    taxCode: '',
    taxName: '',
    cgst: '',
    sgst: '',
    igst: '',
    companyId: companyId,
    financialYear: financialYear,
  });

  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
    fetchTaxes();
  };

  const fetchTaxes = async () => {
    const res = await axios.get('http://localhost:8080/api/tax', {
      params: { companyId, financialYear }
    });
    setTaxes(res.data);
    setCurrentPage(1); // Reset to first page when data is fetched
  };

  // Filter taxes based on search term
  const filteredTaxes = taxes.filter(tax => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      tax.taxCode?.toLowerCase().includes(searchLower) ||
      tax.taxName?.toLowerCase().includes(searchLower) ||
      tax.cgst?.toString().includes(searchLower) ||
      tax.sgst?.toString().includes(searchLower) ||
      tax.igst?.toString().includes(searchLower) ||
      ((parseFloat(tax.cgst) || 0) + (parseFloat(tax.sgst) || 0) + (parseFloat(tax.igst) || 0)).toString().includes(searchLower)
    );
  });

  // Pagination calculations (based on filtered data)
  const totalPages = Math.ceil(filteredTaxes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTaxes = filteredTaxes.slice(startIndex, endIndex);

  // Search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Export to Excel Function
  const exportToExcel = () => {
    // Use filtered data for export if search is active
    const dataToExport = searchTerm ? filteredTaxes : taxes;

    // Prepare data for Excel
    const excelData = dataToExport.map(tax => ({
      'Tax Code': tax.taxCode || '',
      'Tax Name': tax.taxName || '',
      'CGST %': tax.cgst || '',
      'SGST %': tax.sgst || '',
      'IGST %': tax.igst || '',
      'Total Tax %': ((parseFloat(tax.cgst) || 0) + (parseFloat(tax.sgst) || 0) + (parseFloat(tax.igst) || 0)),
      'Tax Type': (parseFloat(tax.igst) > 0) ? 'IGST' : 'CGST + SGST',
      'Created Date': tax.createdAt ? new Date(tax.createdAt).toLocaleDateString() : '',
      'Updated Date': tax.updatedAt ? new Date(tax.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Tax Code
      { wch: 25 }, // Tax Name
      { wch: 10 }, // CGST %
      { wch: 10 }, // SGST %
      { wch: 10 }, // IGST %
      { wch: 12 }, // Total Tax %
      { wch: 15 }, // Tax Type
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Tax Master');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const searchSuffix = searchTerm ? `-Filtered-${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const filename = `Tax-Master${searchSuffix}-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    const recordCount = searchTerm ? filteredTaxes.length : taxes.length;
    alert(`Excel file exported successfully: ${recordCount} records exported as ${filename}`);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'taxCode':
        if (!value) return 'Required';
        if (value.length > 4) return 'Max 4 characters';
        break;
      case 'taxName':
        if (!value) return 'Required';
        if (value.length > 25) return 'Max 25 characters';
        break;
      case 'cgst':
      case 'igst':
        if (!value) return 'Required';
        if (value.length > 2) return 'Max 2 digits';
        break;
      default:
        return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let cleaned = value;

    switch (name) {
      case 'taxCode':
        cleaned = value.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 4);
        break;
      case 'taxName':
        cleaned = value.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 25);
        break;
      case 'cgst':
      case 'sgst':
      case 'igst':
        cleaned = value.replace(/[^0-9]/g, '').slice(0, 2);
        break;
      default:
        break;
    }

    const error = validateField(name, cleaned);
    setFormData({ ...formData, [name]: cleaned });
    setErrors({ ...errors, [name]: error });
  };

  const isFormValid = () => {
    return Object.keys(formData).every((key) => !validateField(key, formData[key]));
  };

  const resetForm = () => {
    setFormData({ taxCode: '', taxName: '', cgst: '', sgst: '', igst: '' });
    setErrors({});
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.entries(formData).forEach(([key, val]) => {
      const err = validateField(key, val);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Prepare data for submission
    const submissionData = {
      ...formData,
      companyId: companyId,
      financialYear: financialYear
    };
    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/tax/${editId}`, submissionData);
        alert('Tax updated!');
      } else {
        await axios.post('http://localhost:8080/api/tax', submissionData);
        alert('Tax added!');
      }

      resetForm();
      fetchTaxes();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
  };

  const handleEdit = (tax) => {
    setFormData({
      taxCode: tax.taxCode,
      taxName: tax.taxName,
      cgst: tax.cgst,
      sgst: tax.sgst,
      igst: tax.igst,
    });
    setEditId(tax._id);
  };

  const [showModal, setShowModal] = useState(false);
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    if (!editId) {
      resetForm();
    }
  };

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Taxes Master</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Master
              </li>
              <li className="breadcrumb-item active" aria-current="page">Taxes Master</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="d-flex d-block align-items-center justify-content-between flex-wrap gap-3">
            {/* Search Box */}
            <div className="d-flex align-items-center gap-2">
              <div className="input-group" style={{ width: '300px' }}>
                <span className="input-group-text">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by code, name, or percentage..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="d-flex my-xl-auto ms-auto right-content align-items-center flex-wrap gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowDataImportModal(true)}
              >
                <i className="ti ti-file-import me-1"></i>Import
              </button>

              <button
                className="btn btn-outline-success btn-sm"
                onClick={exportToExcel}
                title={searchTerm ? "Export filtered results to Excel" : "Export all data to Excel"}
              >
                <i className="ti ti-file-export me-1"></i>Export
                {searchTerm && <span className="badge bg-primary ms-1">{filteredTaxes.length}</span>}
              </button>

              <div>
                <a
                  onClick={() => {
                    resetForm();
                    handleOpenModal();
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <i className="ti ti-circle-plus me-1"></i>Add New Tax
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>CGST %</th>
                  <th>SGST %</th>
                  <th>IGST %</th>
                  <th>Total %</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentTaxes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {searchTerm ? 'No taxes found matching your search criteria' : 'No taxes found'}
                    </td>
                  </tr>
                ) : (
                  currentTaxes.map((tax) => (
                    <tr key={tax._id}>
                      <td><strong>{tax.taxCode}</strong></td>
                      <td>{tax.taxName}</td>
                      <td className="text-center">{tax.cgst}%</td>
                      <td className="text-center">{tax.sgst}%</td>
                      <td className="text-center">{tax.igst}%</td>
                      <td className="text-center">
                        <strong>
                          {((parseFloat(tax.cgst) || 0) + (parseFloat(tax.sgst) || 0) + (parseFloat(tax.igst) || 0))}%
                        </strong>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => {
                            handleEdit(tax);
                            handleOpenModal();
                          }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-md-flex d-block align-items-center justify-content-between mt-3">
              <div className="text-muted">
                Page {currentPage} of {totalPages}
              </div>
              <nav aria-label="Page navigation">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <a
                      className="page-link"
                      href="javascript:void(0);"
                      aria-label="Previous"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          handlePageClick(currentPage - 1);
                        }
                      }}
                    >
                      <span aria-hidden="true">
                        <i className="fas fa-angle-left"></i>
                      </span>
                    </a>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <a
                        className="page-link"
                        href="javascript:void(0);"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageClick(i + 1);
                        }}
                      >
                        {i + 1}
                      </a>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <a
                      className="page-link"
                      href="javascript:void(0);"
                      aria-label="Next"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          handlePageClick(currentPage + 1);
                        }
                      }}
                    >
                      <span aria-hidden="true">
                        <i className="fas fa-angle-right"></i>
                      </span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="myLargeModalLabel" aria-modal="true" role="dialog">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title" id="myLargeModalLabel">
                    {editId ? 'Edit' : 'Add'} Tax Code
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      {['taxCode', 'taxName', 'cgst', 'sgst', 'igst'].map((field) => (
                        <div className={` ${field==='taxName' ? 'col-md-4' : 'col-md-2'} mb-3`} key={field}>
                          <div className="row">
                            <div className={`${field==='taxName' ? 'col-3' : 'col-6'}`}>
                              <label className="form-label ">
                                {field === "taxCode" ? "Tax Code" :
                                  field === "taxName" ? "Tax Name" :
                                    field==="sgst"?"SGST/UGST%":
                                    `${field.toUpperCase()}%`}
                              </label>
                            </div>
                            <div className={`${field==='taxName' ? 'col-9' : 'col-6'}`}>
                              <input
                                type="text"
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                                placeholder={
                                  field === "taxCode" ? "Enter tax code (max 4 chars)" :
                                    field === "taxName" ? "Enter tax name (max 25 chars)" :
                                      "Enter percentage (max 2 digits)"
                                }
                              />
                              {errors[field] && (
                                <div className="invalid-feedback">{errors[field]}</div>
                              )}
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
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={!isFormValid()}
                    >
                      {editId ? 'Update Tax' : 'Save Tax'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImportSuccess={handleImportSuccess}
        masterDataType="tax"
      />
    </div>
  );
};

export default TaxForm;