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

  // Export to Excel Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = processes.map((process, index) => ({
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
    const filename = `Process-List-Master-${currentDate}-${currentTime}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    // Show success message
    alert(`Excel file exported successfully as: ${filename}`);
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

      if (editingData) {
        await axios.put(`http://localhost:8080/api/processes/${editingData._id}`, formData);
        alert('Process updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/processes', formData);
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
      await axios.put(`http://localhost:8080/api/processes/${id}`, { [field]: value });
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
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
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
            <div></div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowDataImportModal(true)}
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
                  {/* <th>Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {processes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No processes found
                    </td>
                  </tr>
                ) : (
                  processes.map((proc, index) => (
                    <tr key={proc._id}>
                      <td>{index + 1}</td>
                      <td>{proc.processId}</td>
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
                      {/* <td>
                        
                          {(!proc.isDeleted && !proc.isBlocked) ? 'Active' :
                            (proc.isDeleted && proc.isBlocked) ? 'Deleted & Blocked' :
                              proc.isDeleted ? 'Deleted' : 'Blocked'}
                        
                      </td> */}
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
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingData ? 'Edit' : 'Add'} Process</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Process ID <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Process ID"
              value={formData.processId}
              onChange={(e) => setFormData({ ...formData, processId: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Process Description <span className="text-danger">*</span></label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter Process Description"
              value={formData.processDescription}
              onChange={(e) => setFormData({ ...formData, processDescription: e.target.value })}
              required
            />
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} className="me-3">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingData ? 'Update' : 'Save'} Process
          </Button>
        </Modal.Footer>
      </Modal>

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