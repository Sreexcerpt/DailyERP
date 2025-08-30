import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Modal, Button } from 'react-bootstrap';
import DataImportModal from '../../components/DataImportModal';

function GeneralCondition() {
  const [conditions, setConditions] = useState([]);
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
    name: '',
    description: '',
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

  // Filter conditions based on search term
  const filteredConditions = conditions.filter(condition => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const status = (!condition.isDeleted && !condition.isBlocked) ? 'Active' : 
                  (condition.isDeleted && condition.isBlocked) ? 'Deleted & Blocked' :
                  condition.isDeleted ? 'Deleted' : 'Blocked';
    
    return (
      condition.name?.toLowerCase().includes(searchLower) ||
      condition.description?.toLowerCase().includes(searchLower) ||
      status.toLowerCase().includes(searchLower) ||
      (condition.isDeleted ? 'yes deleted' : 'no active').includes(searchLower) ||
      (condition.isBlocked ? 'yes blocked' : 'no active').includes(searchLower)
    );
  });

  // Pagination calculations (based on filtered data)
  const totalPages = Math.ceil(filteredConditions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConditions = filteredConditions.slice(startIndex, endIndex);

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
    const dataToExport = searchTerm ? filteredConditions : conditions;
    
    // Prepare data for Excel
    const excelData = dataToExport.map((condition, index) => ({
      'S.No': index + 1,
      'Condition Name': condition.name || '',
      'Description': condition.description || '',
      'Is Deleted': condition.isDeleted ? 'Yes' : 'No',
      'Is Blocked': condition.isBlocked ? 'Yes' : 'No',
      'Status': (!condition.isDeleted && !condition.isBlocked) ? 'Active' : 
                (condition.isDeleted && condition.isBlocked) ? 'Deleted & Blocked' :
                condition.isDeleted ? 'Deleted' : 'Blocked',
      'Created Date': condition.createdAt ? new Date(condition.createdAt).toLocaleDateString() : '',
      'Updated Date': condition.updatedAt ? new Date(condition.updatedAt).toLocaleDateString() : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 },  // S.No
      { wch: 25 }, // Condition Name
      { wch: 50 }, // Description
      { wch: 12 }, // Is Deleted
      { wch: 12 }, // Is Blocked
      { wch: 15 }, // Status
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'General Condition Master');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY format
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }).replace(/:/g, '-'); // HH-MM-SS format
    const searchSuffix = searchTerm ? `-Filtered-${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const filename = `General-Condition-Master${searchSuffix}-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
    
    // Show success message
    const recordCount = searchTerm ? filteredConditions.length : conditions.length;
    alert(`Excel file exported successfully: ${recordCount} records exported as ${filename}`);
  };

  // Fetch all data
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/general-conditions', {
        params: {
          companyId: companyId,
          financialYear: financialYear
        }
      });
      setConditions(res.data);
      setCurrentPage(1); // Reset to first page when data is fetched
    } catch (err) {
      console.error('Failed to fetch:', err);
      alert('Error loading general conditions');
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (data = null) => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        isDeleted: data.isDeleted || false,
        isBlocked: data.isBlocked || false,
      });
      setEditingData(data);
    } else {
      setFormData({
        name: '',
        description: '',
        isDeleted: false,
        isBlocked: false,
      });
      setEditingData(null);
    }
    setShowModal(true);
  };

  // Save new or updated data
  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.name.trim()) {
        alert('Condition name is required');
        return;
      }
      if (!formData.description.trim()) {
        alert('Description is required');
        return;
      }

      const submissionData = {
        ...formData,
        companyId: companyId,
        financialYear: financialYear
      };

      if (editingData) {
        await axios.put(`http://localhost:8080/api/general-conditions/${editingData._id}`, submissionData);
        alert('General condition updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/general-conditions', submissionData);
        alert('General condition added successfully!');
      }
      
      fetchData();
      setShowModal(false);
      setEditingData(null);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving general condition. Please try again.');
    }
  };

  // Toggle isDeleted / isBlocked
  const handleStatusChange = async (id, field, value) => {
    try {
      const updateData = {
        [field]: value,
        companyId: companyId,
        financialYear: financialYear
      };
      
      await axios.put(`http://localhost:8080/api/general-conditions/${id}`, updateData);
      alert(`General condition ${field === 'isDeleted' ? 'delete status' : 'block status'} updated successfully!`);
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
      name: '',
      description: '',
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
          <h2 className="mb-1">General Condition Master</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">
                Master
              </li>
              <li className="breadcrumb-item active" aria-current="page">General Condition Master</li>
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
                  placeholder="Search by name, description, or status..."
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
                {searchTerm && <span className="badge bg-primary ms-1">{filteredConditions.length}</span>}
              </button>

              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => handleOpenModal()}
              >
                <i className="ti ti-circle-plus me-1"></i>Add General Condition
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
                  <th>Condition Name</th>
                  <th>Description</th>
                  <th>Deleted</th>
                  <th>Blocked</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentConditions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      {searchTerm ? 'No general conditions found matching your search criteria' : 'No general conditions found'}
                    </td>
                  </tr>
                ) : (
                  currentConditions.map((condition, index) => (
                    <tr key={condition._id}>
                      <td>{startIndex + index + 1}</td>
                      <td><strong>{condition.name}</strong></td>
                      <td className='text-wrap'>{condition.description}</td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          style={{ borderColor: 'black' }}
                          checked={condition.isDeleted || false}
                          onChange={(e) => handleStatusChange(condition._id, 'isDeleted', e.target.checked)}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          style={{ borderColor: 'black' }}
                          checked={condition.isBlocked || false}
                          onChange={(e) => handleStatusChange(condition._id, 'isBlocked', e.target.checked)}
                        />
                      </td>
                      <td>
                        <span className={`badge ${
                          (!condition.isDeleted && !condition.isBlocked) ? 'bg-success' : 
                          (condition.isDeleted && condition.isBlocked) ? 'bg-danger' :
                          condition.isDeleted ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {(!condition.isDeleted && !condition.isBlocked) ? 'Active' : 
                           (condition.isDeleted && condition.isBlocked) ? 'Deleted & Blocked' :
                           condition.isDeleted ? 'Deleted' : 'Blocked'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary me-2" 
                          onClick={() => handleOpenModal(condition)}
                        >
                          Edit
                        </button>
                        {/* Uncomment if delete functionality is needed
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDelete(condition._id)}
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

         
        </div>
      </div>
 {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-md-flex d-block align-items-center justify-content-between mt-3">
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingData ? 'Edit' : 'Add'} General Condition</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Condition Name <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter General Condition Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Description <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="row ">
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='me-3' onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingData ? 'Update' : 'Save'} Condition
          </Button>
        </Modal.Footer>
      </Modal>

      <DataImportModal
        show={showDataImportModal}
        onClose={() => setShowDataImportModal(false)}
        onImportSuccess={handleImportSuccess}
        masterDataType="generalCondition"
      />
    </div>
  );
}

export default GeneralCondition;