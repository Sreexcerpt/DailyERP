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

  const handleDateFilter = () => {
    fetchAttendanceByDate(selectedDate);
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

  const getStatusBadge = (status, outTime) => {
    if (status === 'OUT' || outTime) {
      return <span style={{
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>🔴 OUT</span>;
    } else {
      return <span style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>🟢 IN</span>;
    }
  };

  const getTotalWorkingHours = () => {
    const total = attendanceRecords.reduce((sum, record) => {
      return sum + (record.workingHours || 0);
    }, 0);
    
    return formatWorkingHours(total);
  };

  const getFilterTitle = () => {
    switch(filterType) {
      case 'today': return "Today's Attendance";
      case 'date': return `Attendance for ${formatDate(selectedDate)}`;
      case 'all': return "All Attendance Records";
      default: return "Attendance Records";
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Employee Attendance Dashboard</h2>
      
      {/* Filter Controls */}
      <div style={{ 
        margin: '20px 0', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>📅 Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          <button 
            onClick={handleDateFilter}
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            🔍 Filter
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchTodayAttendance}
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            📍 Today
          </button>
          
          <button 
            onClick={handleAllRecords}
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            📋 All Records
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ margin: '20px 0' }}>
        <h3 style={{ color: '#495057', margin: '10px 0' }}>{getFilterTitle()}</h3>
        
        {attendanceRecords.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '20px',
            padding: '10px 15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#1976d2'
          }}>
            <span><strong>📊 Total Records:</strong> {attendanceRecords.length}</span>
            {filterType !== 'all' && (
              <span><strong>⏰ Total Hours:</strong> {getTotalWorkingHours()}</span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '16px', color: '#6c757d' }}>🔄 Loading attendance records...</p>
        </div>
      ) : (
        <div>
          {attendanceRecords.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7'
            }}>
              <p style={{ fontSize: '16px', color: '#856404', margin: 0 }}>
                📭 No attendance records found for the selected criteria.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                border: '1px solid #dee2e6',
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#495057', color: 'white' }}>
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold' }}>
                      👤 Employee Name
                    </th>
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold' }}>
                      🆔 Employee ID
                    </th>
                    {filterType === 'all' && (
                      <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: 'bold' }}>
                        📅 Date
                      </th>
                    )}
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      🟢 IN Time
                    </th>
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      🔴 OUT Time
                    </th>
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      ⏰ Working Hours
                    </th>
                    <th style={{ border: '1px solid #dee2e6', padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                      📊 Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={`${record.employeeObjectId}-${record.date}-${index}`} style={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#e8f4f8'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                    >
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', fontWeight: 'bold', color: '#495057' }}>
                        {`${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown Employee'}
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', color: '#6c757d', fontSize: '13px' }}>
                        {record.employeeId || 'N/A'}
                      </td>
                      {filterType === 'all' && (
                        <td style={{ border: '1px solid #dee2e6', padding: '12px', color: '#6c757d' }}>
                          {formatDate(record.date)}
                        </td>
                      )}
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>
                        {record.inTime ? (
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                            {formatTime(record.inTime)}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>-</span>
                        )}
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>
                        {record.outTime ? (
                          <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                            {formatTime(record.outTime)}
                          </span>
                        ) : (
                          <span style={{ color: '#ffc107', fontStyle: 'italic' }}>Still Working</span>
                        )}
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                          color: record.workingHours > 0 ? '#17a2b8' : '#6c757d',
                          fontWeight: record.workingHours > 0 ? 'bold' : 'normal'
                        }}>
                          {formatWorkingHours(record.workingHours)}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px', textAlign: 'center' }}>
                        {getStatusBadge(record.status, record.outTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      {attendanceRecords.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>📈 Summary Statistics</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{
              padding: '10px 15px',
              backgroundColor: '#d4edda',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
                {attendanceRecords.length}
              </div>
              <div style={{ fontSize: '12px', color: '#155724' }}>Total Records</div>
            </div>
            
            <div style={{
              padding: '10px 15px',
              backgroundColor: '#d1ecf1',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
                {attendanceRecords.filter(r => r.status === 'IN' && !r.outTime).length}
              </div>
              <div style={{ fontSize: '12px', color: '#0c5460' }}>Currently Working</div>
            </div>
            
            <div style={{
              padding: '10px 15px',
              backgroundColor: '#f8d7da',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                {attendanceRecords.filter(r => r.outTime).length}
              </div>
              <div style={{ fontSize: '12px', color: '#721c24' }}>Completed Shifts</div>
            </div>

            {filterType !== 'all' && (
              <div style={{
                padding: '10px 15px',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#856404' }}>
                  {getTotalWorkingHours()}
                </div>
                <div style={{ fontSize: '12px', color: '#856404' }}>Total Hours</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '6px' }}>
        <h5 style={{ marginTop: 0, color: '#0056b3' }}>📝 How to Read the Data:</h5>
        <ul style={{ textAlign: 'left', color: '#004085', fontSize: '13px', margin: '10px 0 0 0' }}>
          <li><strong>👤 Employee Name:</strong> Full name from attendance record</li>
          <li><strong>🆔 Employee ID:</strong> Unique employee identifier</li>
          <li><strong>🟢 IN Time:</strong> When employee checked in</li>
          <li><strong>🔴 OUT Time:</strong> When employee checked out</li>
          <li><strong>⏰ Working Hours:</strong> Automatically calculated duration between IN and OUT</li>
          <li><strong>"Still Working":</strong> Employee checked IN but hasn't checked OUT yet</li>
          <li><strong>Status Badges:</strong> 🟢 = Currently IN, 🔴 = Checked OUT</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceReport;

