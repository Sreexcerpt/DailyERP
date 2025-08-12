import { useState, useEffect } from "react";

const FacultyLeaveRequests = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock user data - replace with your actual user data source
  const mockUser = {
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Doe"
  };

  // Initialize form with user data on component mount
  useEffect(() => {
    const fullName = `${mockUser.firstName} ${mockUser.lastName}`;
    setFormData(prev => ({
      ...prev,
      employeeId: mockUser.employeeId,
      name: fullName
    }));
  }, []);


// Replace submitLeaveRequest function
const submitLeaveRequest = async (requestData) => {
  const response = await fetch('http://localhost:8080/api/leave', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData)
  });
  return await response.json();
};

// Replace fetchLeaveRequests function  
const fetchLeaveRequests = async (employeeId) => {
  const response = await fetch(`http://localhost:8080/api/leave?employeeId=${employeeId}`);
  return await response.json();
};

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      alert("From date cannot be later than to date");
      return;
    }
    
    try {
      const response = await submitLeaveRequest(formData);
      
      if (response.success) {
        alert(response.message);
        
        // Add new request to the list
        setLeaveRequests(prev => [...prev, response.data]);
        
        // Reset form fields except employeeId and name
        setFormData(prev => ({
          ...prev,
          leaveType: "",
          fromDate: "",
          toDate: "",
          reason: ""
        }));
        
        setShowModal(false);
      }
    } catch (error) {
      alert("Failed to submit leave request");
      console.error("Submission error:", error);
    }
  };

  // Fetch leave requests when component mounts
  useEffect(() => {
    if (mockUser.employeeId) {
      fetchLeaveRequests(mockUser.employeeId)
        .then(requests => setLeaveRequests(requests))
        .catch(error => console.error("Error fetching leave requests:", error));
    }
  }, []);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    
    <div className="d-flex justify-content-between align-items-center mb-3" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Main content */}
      <div className="content container-fluid" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <div className="row align-items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="col">
              <h3 className="page-title" style={{ color: '#333', fontSize: '24px', margin: 0 }}>Employee Leave Request</h3>
            </div>
            <div className="col-auto text-end">
              <button 
                className="btn btn-danger" 
                onClick={() => setShowModal(true)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <span style={{ marginRight: '5px' }}>+</span> Apply for Leave
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div className="card-body" style={{ padding: '20px' }}>
                <h4 className="card-title" style={{ marginBottom: '20px', color: '#333' }}>My Leave Requests</h4>
                <div className="table-responsive">
                  <table className="table table-bordered" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '600' }}>Leave Type</th>
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '600' }}>From Date</th>
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '600' }}>To Date</th>
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '600' }}>Reason</th>
                        <th style={{ padding: '12px', border: '1px solid #dee2e6', fontWeight: '600' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.length > 0 ? (
                        leaveRequests.map((leave, index) => (
                          <tr key={index}>
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{leave.leaveType}</td>
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                              {new Date(leave.fromDate).toLocaleDateString("en-GB", { 
                                day: "2-digit", 
                                month: "short", 
                                year: "numeric" 
                              })}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                              {new Date(leave.toDate).toLocaleDateString("en-GB", { 
                                day: "2-digit", 
                                month: "short", 
                                year: "numeric" 
                              })}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{leave.reason}</td>
                            <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                              <span
                                className={`badge ${
                                  leave.status === "Approved" ? "bg-success" : 
                                  leave.status === "Rejected" ? "bg-danger" : "bg-warning"
                                }`}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  backgroundColor: 
                                    leave.status === "Approved" ? "#28a745" : 
                                    leave.status === "Rejected" ? "#dc3545" : "#ffc107"
                                }}
                              >
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ 
                            padding: '20px', 
                            textAlign: 'center', 
                            color: '#666',
                            border: '1px solid #dee2e6'
                          }}>
                            No leave requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leave Request Modal */}
      {showModal && (
        <>
          <div 
            className="modal fade show" 
            style={{ 
              display: 'block', 
              zIndex: 1050,
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              outline: 0,
              overflow: 'auto'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div 
              className="modal-dialog modal-dialog-centered" 
              onClick={(e) => e.stopPropagation()}
              style={{
                margin: '1.75rem auto',
                maxWidth: '500px',
                pointerEvents: 'all'
              }}
            >
              <div className="modal-content" style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
              }}>
                <div className="modal-header" style={{ 
                  borderBottom: '1px solid #e9ecef', 
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h5 className="modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    Apply for Leave
                  </h5>
                  <button 
                    type="button" 
                    className="close" 
                    onClick={() => setShowModal(false)}
                    style={{ 
                      cursor: 'pointer', 
                      background: 'none', 
                      border: 'none', 
                      fontSize: '24px',
                      padding: 0,
                      lineHeight: 1
                    }}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body" style={{ padding: '1rem' }}>
                  <div>
                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        className="form-control"
                        readOnly
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </div>
                    
                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        className="form-control"
                        readOnly
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </div>

                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Leave Type
                      </label>
                      <select
                        name="leaveType"
                        value={formData.leaveType}
                        onChange={handleChange}
                        className="form-control"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px'
                        }}
                      >
                        <option value="">Select Leave Type</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                      </select>
                    </div>

                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        From Date
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        value={formData.fromDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        To Date
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        value={formData.toDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px'
                        }}
                      />
                    </div>

                    <div className="form-group mb-3" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                        Reason
                      </label>
                      <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="form-control"
                        rows="4"
                        required
                        placeholder="Please provide the reason for your leave request..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div className="submit-section" style={{ marginTop: '20px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowModal(false)}
                        style={{
                          width: "100%", 
                          marginBottom: "10px",
                          backgroundColor: "#6c757d",
                          color: "#fff",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="btn btn-danger"
                        disabled={loading}
                        style={{
                          width: "100%",
                          backgroundColor: loading ? "#ccc" : "#dc3545",
                          color: "#fff",
                          padding: "10px",
                          borderRadius: "5px",
                          border: "none",
                          cursor: loading ? "not-allowed" : "pointer"
                        }}
                      >
                        {loading ? "Submitting..." : "Submit Request"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop fade show" 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: 1040,
              width: '100vw',
              height: '100vh',
              backgroundColor: '#000',
              opacity: 0.5
            }}
            onClick={() => setShowModal(false)}
          />
        </>
      )}
    </div>
  );
};

export default FacultyLeaveRequests;