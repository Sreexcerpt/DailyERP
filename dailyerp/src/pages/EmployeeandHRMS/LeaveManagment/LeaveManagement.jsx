import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Apply filters and pagination whenever filter values change
  useEffect(() => {
    applyFilters();
  }, [leaveRequests, selectedStatus, startDate, endDate, currentPage, searchQuery]);

  // Fetch all leave requests
  const fetchLeaveRequests = () => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/leave/all")
      .then((response) => {
        // Sort by createdAt (newest first)
        const sortedData = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log("Sorted Data:", sortedData);
        setLeaveRequests(sortedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching leave requests:", error);
        setLoading(false);
      });
  };

  // Update leave status
  const updateLeaveStatus = (id, newStatus) => {
    axios
      .put(`http://localhost:8080/api/leave/${id}`, { status: newStatus })
      .then(() => {
        fetchLeaveRequests(); // Refresh after update
      })
      .catch((error) => {
        console.error("Error updating leave status:", error);
      });
  };

  // Apply all filters
  const applyFilters = () => {
    let filtered = [...leaveRequests];

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(leave => leave.status === selectedStatus);
    }

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter(leave => {
        const requestDate = new Date(leave.requestedDate);
        
        // Normalize dates to compare only date part (set time to 00:00:00)
        const normalizedRequestDate = new Date(requestDate.getFullYear(), requestDate.getMonth(), requestDate.getDate());
        const normalizedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        return normalizedRequestDate >= normalizedStartDate && normalizedRequestDate <= normalizedEndDate;
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(leave =>
        (leave.employeeId && leave.employeeId.toLowerCase().includes(query)) ||
        ((leave.name || leave.employeeName) && (leave.name || leave.employeeName).toLowerCase().includes(query)) ||
        (leave.leaveType && leave.leaveType.toLowerCase().includes(query)) ||
        (leave.reason && leave.reason.toLowerCase().includes(query))
      );
    }

    // Calculate total pages
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total);

    // Apply pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

    setFilteredRequests(currentItems);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedStatus("");
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // Handle pagination
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).replace(" ", "/");
    } catch (e) {
      return "-";
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="content container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="page-header">
              <div className="row">
                <div className="col-md-4">
                  <h3>Leave Request Management</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="card">
          <div className="card-body">
            <div className="row gx-3">
              {/* Status Filter */}
              <div className="col-md-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hold">Hold</option>
                </select>
              </div>

              {/* Search Filter */}
              <div className="col-md-3">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by employee ID, name, leave type, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Date Range Filter */}
              <div className="col-md-6">
                <label className="form-label">Request Date Range</label>
                <div className="d-flex gap-2">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="dd/mm/yyyy"
                    className="form-control me-2"
                    dateFormat="dd/MM/yyyy"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="dd/mm/yyyy"
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
              </div>
            </div>
            
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-end">
                <button
                  className="btn btn-primary me-2"
                  onClick={applyFilters}
                  style={{ width: "120px" }}
                >
                  Apply Filters
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={resetFilters}
                  style={{ width: "120px" }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Leave Type</th>
                      <th>Requested Date</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((leave) => (
                        <tr key={leave._id}>
                          <td style={{ textWrap: "wrap" }}>{leave.employeeId}</td>
                          <td style={{ textWrap: "wrap" }}>{leave.name || leave.employeeName}</td>
                          <td>{leave.leaveType}</td>
                          <td>{leave.requestedDate ? formatDate(leave.requestedDate) : "-"}</td>
                          <td>{formatDate(leave.fromDate)}</td>
                          <td>{formatDate(leave.toDate)}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: "200px" }}>
                              {leave.reason}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                leave.status === "Approved" ? "bg-success" :
                                leave.status === "Rejected" ? "bg-danger" :
                                leave.status === "Hold" ? "bg-info" :
                                "bg-warning"
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: "120px" }}
                              value={leave.status}
                              onChange={(e) => updateLeaveStatus(leave._id, e.target.value)}
                              disabled={leave.status === "Approved" || leave.status === "Rejected"}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Hold">Hold</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center">No leave requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="d-flex justify-content-left mt-4">
                  <nav>
                    <ul className="pagination">
                      {/* Previous button */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-angle-double-left"></i>
                        </button>
                      </li>

                      {/* First page */}
                      <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => goToPage(1)}
                        >
                          1
                        </button>
                      </li>

                      {/* Left ellipsis */}
                      {currentPage > 3 && totalPages > 4 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}

                      {/* Current page and adjacent pages */}
                      {Array.from({ length: totalPages }, (_, index) => {
                        const pageNum = index + 1;
                        if (pageNum > 1 && pageNum < totalPages) {
                          if (Math.abs(pageNum - currentPage) <= 1) {
                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => goToPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                        }
                        return null;
                      })}

                      {/* Right ellipsis */}
                      {currentPage < totalPages - 2 && totalPages > 4 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}

                      {/* Last page */}
                      {totalPages > 1 && (
                        <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => goToPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      )}

                      {/* Next button */}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="fas fa-angle-double-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;