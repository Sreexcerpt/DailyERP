import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendanceReport = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('date');

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchAttendance = async (date = null) => {
    setLoading(true);
    try {
      let url = 'http://localhost:8080/api/attendance/records';

      if (date) {
        url += `?date=${date}`;
      }

      const response = await axios.get(url);

      let allEmployeeRecords = [];

      if (Array.isArray(response.data)) {
        // Backend already sends flattened employee records
        allEmployeeRecords = response.data;
      }

      setAttendanceRecords(allEmployeeRecords);
      console.log('URL:', url);
      console.log('Fetched attendance data:', allEmployeeRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error fetching attendance records');
      setAttendanceRecords([]);
    }
    setLoading(false);
  };


  const fetchTodayAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/attendance/today');

      // Extract employee records from today's attendance document
      let todayEmployeeRecords = [];

      if (response.data && response.data.employees && Array.isArray(response.data.employees)) {
        todayEmployeeRecords = response.data.employees.map(empRecord => ({
          ...empRecord,
          date: response.data.date,
          dateObject: response.data.dateObject
        }));
      }

      setAttendanceRecords(todayEmployeeRecords);
      console.log("Today's attendance data:", todayEmployeeRecords);
      setFilterType('today');
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
      alert('Error fetching today\'s attendance');
      setAttendanceRecords([]);
    }
    setLoading(false);
  };

  const fetchAttendanceByDate = async (date) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/attendance/date/${date}`);

      // Extract employee records from the specific date's attendance document
      let employeeRecords = [];

      if (response.data && response.data.employees && Array.isArray(response.data.employees)) {
        employeeRecords = response.data.employees.map(empRecord => ({
          ...empRecord,
          date: response.data.date,
          dateObject: response.data.dateObject
        }));
      }

      setAttendanceRecords(employeeRecords);
      console.log(`Attendance data for ${date}:`, employeeRecords);
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      if (error.response && error.response.status === 404) {
        alert(`No attendance records found for ${date}`);
      } else {
        alert('Error fetching attendance records');
      }
      setAttendanceRecords([]);
    }
    setLoading(false);
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    fetchAttendanceByDate(e.target.value);
    setFilterType('date');
  };

  const handleAllRecords = () => {
    fetchAttendance();
    setFilterType('all');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatWorkingHours = (hours) => {
    if (!hours || hours === 0) return '-';

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours % 1) * 60);

    if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

  const getTotalWorkingHours = () => {
    const total = attendanceRecords.reduce((sum, record) => {
      return sum + (record.workingHours || 0);
    }, 0);

    return formatWorkingHours(total);
  };

  const getFilterTitle = () => {
    switch (filterType) {
      case 'today': return "Today's Attendance";
      case 'date': return `Attendance for ${formatDate(selectedDate)}`;
      case 'all': return "All Attendance Records";
      default: return "Attendance Records";
    }
  };

  return (
    <div className='content'>
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1"> Employee Attendance Dashboard</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">HRMS</li>
              <li className="breadcrumb-item active" aria-current="page"> Employee Attendance Dashboard</li>
            </ol>
          </nav>
        </div>

      </div>

      {/* Filter Controls */}
      <div className='d-flex align-items-center mb-3 gap-3' >
        <div className='form-group form-group-sm' >
          <label className='form-label me-1'> Select Date:</label>
          <input
            type="date"
            className='form-control-sm'
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value), handleDateFilter(e) }}
          />
        </div>
        <div>
          <button
            onClick={fetchTodayAttendance}
            disabled={loading}
            className='btn btn-sm btn-outline-primary me-2'
          >
            Today
          </button>

          <button
            onClick={handleAllRecords}
            disabled={loading}
            className='btn btn-sm btn-outline-secondary'
          >
            All Records
          </button>
        </div>
      </div>



      {loading ? (
        <div >
          <p > Loading attendance records...</p>
        </div>
      ) : (
        <div>
          {attendanceRecords.length === 0 ? (
            <div >
              <p >
                No attendance records found for the selected criteria.
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className='table-responsive'>
                  <table className='table table-sm table-bordered' >
                    <thead>
                      <tr >
                        <th >
                          Employee Name
                        </th>
                        <th >
                          Employee ID
                        </th>
                        {filterType === 'all' && (
                          <th >
                            Date
                          </th>
                        )}
                        <th>
                          IN Time
                        </th>
                        <th>
                          OUT Time
                        </th>
                        <th>
                          Working Hours
                        </th>
                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record, index) => (
                        <tr key={`${record.employeeObjectId}-${record.date}-${index}`}>
                          <td >
                            {`${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown Employee'}
                          </td>
                          <td>
                            {record.employeeId || 'N/A'}
                          </td>
                          {filterType === 'all' && (
                            <td>
                              {formatDate(record.date)}
                            </td>
                          )}
                          <td >
                            {record.inTime ? (
                              <span>
                                {formatTime(record.inTime)}
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td >
                            {record.outTime ? (
                              <span >
                                {formatTime(record.outTime)}
                              </span>
                            ) : (
                              <span>Still Working</span>
                            )}
                          </td>
                          <td >
                            <span >
                              {formatWorkingHours(record.workingHours)}
                            </span>
                          </td>
                          <td >
                            {record.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div></div></div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {attendanceRecords.length > 0 && (
        <div className="card">
          <h4 className="card-header">📈 Summary Statistics</h4>
          <div className="card-body">
            <div className="row">
              <div className="col-xl-3">
                <div className="card">
                  <div className="card-body">
                    {attendanceRecords.length}
                 
                  <div className="statistic-label">Total Records</div>
                </div> </div>
              </div><div className="col-xl-3">
                <div className="card">
                  <div className="card-body">
                    {attendanceRecords.filter(r => r.status === 'IN' && !r.outTime).length}
                  
                  <div className="statistic-label">Currently Working</div>
                </div></div></div>
              <div className="col-xl-3">
                <div className="card">
                  <div className="card-body">
                    {attendanceRecords.filter(r => r.outTime).length}
                 
                  <div className="statistic-label">Completed Shifts</div>
                </div></div> </div>
              <div className="col-xl-3">
                {filterType !== 'all' && (
                  <div className="card">
                    <div className="card-body">
                      {getTotalWorkingHours()}
                    
                    <div className="statistic-label">Total Hours</div>
                  </div></div>
                )}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;

