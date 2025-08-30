import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Modal, Button } from 'react-bootstrap';
import DataImportModal from '../../components/DataImportModal';

function ProcessList() {
  const [processes, setProcesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const companyId = localStorage.getItem('selectedCompanyId');
  const financialYear = localStorage.getItem('financialYear');
  const [showDataImportModal, setShowDataImportModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    processId: '',
    processDescription: '',
    isDeleted: false,
    isBlocked: false,
    companyId: companyId,
    financialYear: financialYear
  });

  const handleImportSuccess = (result) => {
    alert(`Import completed: ${result.results.imported} records imported`);
    setShowDataImportModal(false);
    fetchData(); // Refresh the list after import
  };

  // Filter processes based on search term
  const filteredProcesses = processes.filter(process => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const status = (!process.isDeleted && !process.isBlocked) ? 'Active' :
      (process.isDeleted && process.isBlocked) ? 'Deleted & Blocked' :
        process.isDeleted ? 'Deleted' : 'Blocked';

    return (
      process.processId?.toLowerCase().includes(searchLower) ||
      process.processDescription?.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      (process.isDeleted ? 'yes deleted' : 'no active').includes(searchLower) ||
      (process.isBlocked ? 'yes blocked' : 'no active').includes(searchLower)
    );
  });

  // Pagination calculations (based on filtered data)
  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProcesses = filteredProcesses.slice(startIndex, endIndex);

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
    const dataToExport = searchTerm ? filteredProcesses : processes;

    // Prepare data for Excel
    const excelData = dataToExport.map((process, index) => ({
      'S.No': index + 1,
      'Process ID': process.processId || '',
      'Process Description': process.processDescription || '',
      'Is Deleted': process.isDeleted ? 'Yes' : 'No',
      'Is Blocked': process.isBlocked ? 'Yes' : 'No',
      'Status': (!process.isDeleted && !process.isBlocked) ? 'Active' :
        (process.isDeleted && process.isBlocked) ? 'Deleted & Blocked' :
          process.isDeleted ? 'Deleted' : 'Blocked',
      'Created Date': process.createdAt ? new Date(process.createdAt).toLocaleDateString() : '',
      'Updated Date': process.updatedAt ? new Date(process.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // S.No
      { wch: 15 }, // Process ID
      { wch: 40 }, // Process Description
      { wch: 12 }, // Is Deleted
      { wch: 12 }, // Is Blocked
      { wch: 15 }, // Status
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Process List Master');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const searchSuffix = searchTerm ? `-Filtered-${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const filename = `Process-List-Master${searchSuffix}-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    const recordCount = searchTerm ? filteredProcesses.length : processes.length;
    alert(`Excel file exported successfully: ${recordCount} records exported as ${filename}`);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/processes', {
        params: {
          companyId: companyId,
          financialYear: financialYear
        }
      });
      setProcesses(res.data);
      setCurrentPage(1); // Reset to first page when data is fetched
    } catch (err) {
      console.error('Fetch failed:', err);
      alert('Error loading processes');
    }
  };

  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        processId: data.processId || '',
        processDescription: data.processDescription || '',
        isDeleted: data.isDeleted || false,
        isBlocked: data.isBlocked || false,
      });
      setEditingData(data);
    } else {
      setFormData({
        processId: '',
        processDescription: '',
        isDeleted: false,
        isBlocked: false,
      });
      setEditingData(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.processId.trim()) {
        alert('Process ID is required');
        return;
      }
      if (!formData.processDescription.trim()) {
        alert('Process Description is required');
        return;
      }

      const submissionData = {
        ...formData,
        companyId: companyId,
        financialYear: financialYear
      };

      if (editingData) {
        await axios.put(`http://localhost:8080/api/processes/${editingData._id}`, submissionData);
        alert('Process updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/processes', submissionData);
        alert('Process added successfully!');
      }

      fetchData();
      setShowModal(false);
      setEditingData(null);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving process. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this process?')) {
      try {
        await axios.delete(`http://localhost:8080/api/processes/${id}`);
        alert('Process deleted successfully!');
        fetchData();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Error deleting process');
      }
    }
  };

  const handleStatusChange = async (id, field, value) => {
    try {
      const updateData = {
        [field]: value,
        companyId: companyId,
        financialYear: financialYear
      };

      await axios.put(`http://localhost:8080/api/processes/${id}`, updateData);
      alert(`Process ${field === 'isDeleted' ? 'delete status' : 'block status'} updated successfully!`);
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
      alert('Error updating status');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingData(null);
    setFormData({
      processId: '',
      processDescription: '',
      isDeleted: false,
      isBlocked: false,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="content">
      {/* Header Section */}
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Process List Master</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Master
              </li>
              <li className="breadcrumb-item active" aria-current="page">Process List Master</li>
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
                  placeholder="Search by ID, description, or status..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />

              </div>

            </div>

            <div className="d-flex gap-2">
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
                <i className="ti ti-file-export me-1"></i>Export Excel
                {searchTerm && <span className="badge bg-primary ms-1">{filteredProcesses.length}</span>}
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenModal()}
              >
                <i className="ti ti-circle-plus me-1"></i>Add Process
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Process ID</th>
                  <th>Description</th>
                  <th>Is Deleted</th>
                  <th>Is Blocked</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProcesses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {searchTerm ? 'No processes found matching your search criteria' : 'No processes found'}
                    </td>
                  </tr>
                ) : (
                  currentProcesses.map((proc, index) => (
                    <tr key={proc._id}>
                      <td>{startIndex + index + 1}</td>
                      <td><strong>{proc.processId}</strong></td>
                      <td className='text-wrap'>{proc.processDescription}</td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          style={{ borderColor: 'black' }}
                          checked={proc.isDeleted || false}
                          onChange={(e) => handleStatusChange(proc._id, 'isDeleted', e.target.checked)}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          style={{ borderColor: 'black' }}
                          checked={proc.isBlocked || false}
                          onChange={(e) => handleStatusChange(proc._id, 'isBlocked', e.target.checked)}
                        />
                      </td>
                      <td>
                        <span className={`badge ${(!proc.isDeleted && !proc.isBlocked) ? 'bg-success' :
                          (proc.isDeleted && proc.isBlocked) ? 'bg-danger' :
                            proc.isDeleted ? 'bg-warning' : 'bg-secondary'
                          }`}>
                          {(!proc.isDeleted && !proc.isBlocked) ? 'Active' :
                            (proc.isDeleted && proc.isBlocked) ? 'Deleted & Blocked' :
                              proc.isDeleted ? 'Deleted' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleOpenModal(proc)}
                        >
                          Edit
                        </button>
                        {/* Uncomment if delete functionality is needed
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(proc._id)}
                        >
                          Delete
                        </button>
                        */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

        </div>
      </div>
      {totalPages > 1 && (
        <div className="d-md-flex d-block align-items-center justify-content-between mt-3">
          <div className="text-muted">

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
      {/* <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingData ? 'Edit' : 'Add'} Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>

        </Modal.Body>
        <Modal.Footer>
         
        </Modal.Footer>
      </Modal> */}
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
                  <h4 className="modal-title" id="myLargeModalLabel">
                    {editingData ? "Edit Process" : "Add New Process"}
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="d-flex  align-items-center">
                    <div className=" col-md-2 row me-4">
                      <label className="form-label col-xl-7">Process_ID</label>
                      <input
                        type="text"
                        className=" col-xl-5  form-control-sm"
                        placeholder="Enter Process ID"
                        value={formData.processId}
                        onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-10 row">
                      <label className="form-label col-xl-2 mt-4">Process Description</label>
                      <textarea
                        type="text"
                        className="form-control-sm col-xl-10"
                        rows="4"
                        placeholder="Enter Process Description"
                        value={formData.processDescription}
                        onChange={(e) => setFormData({ ...formData, processDescription: e.target.value })}
                        required
                      />

                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isDeleted"
                          checked={formData.isDeleted}
                          onChange={(e) => setFormData({ ...formData, isDeleted: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isDeleted">
                          Is Deleted
                        </label>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isBlocked"
                          checked={formData.isBlocked}
                          onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="isBlocked">
                          Is Blocked
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary me-3" onClick={handleCloseModal} >
                    Cancel
                  </button>
                  <button className='btn btn-primary' onClick={handleSave}>
                    {editingData ? 'Update' : 'Save'} Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>)}
      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImportSuccess={handleImportSuccess}
        masterDataType="process"
      />
    </div>
  );
}

export default ProcessList;