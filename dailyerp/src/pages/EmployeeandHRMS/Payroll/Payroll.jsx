import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";

function Payroll() {
    const [faculties, setFaculties] = useState([]);
    const [salaryRecords, setSalaryRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [departments, setDepartments] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [historyModalIsOpen, setHistoryModalIsOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [employeeSalaryHistory, setEmployeeSalaryHistory] = useState([]);
    const [leaveCount, setLeaveCount] = useState(0);
    const [sundayCount, setSundayCount] = useState(0);
    const [totalLeaveCount, setTotalLeaveCount] = useState(0);
    const [deductionPerDay, setDeductionPerDay] = useState(0);
    const [paidLeaveCount, setPaidLeaveCount] = useState(1);
    const [salaryDetails, setSalaryDetails] = useState({
        salary: "",
        date: new Date().toISOString().split("T")[0],
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        year: new Date().getFullYear().toString()
    });
    const [activeRole, setActiveRole] = useState(localStorage.getItem("activeRole") || "");
    const user = JSON.parse(localStorage.getItem("user"));
    
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
        years.push(i.toString());
    }

    useEffect(() => {
        fetchFaculties();
        fetchSalaryRecords();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/departments");
            setDepartments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchFaculties = async () => {
        try {
            const activeRole = localStorage.getItem("activeRole") || "";
            
            let response;
            if (activeRole === "SuperAdmin") {
                // Fetch all faculties
                response = await axios.get("http://localhost:8080/api/faculties");
            } else {
                // Fetch faculties based on user role or organization
                response = await axios.get("http://localhost:8080/api/faculties");
            }

            setFaculties(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching faculties:", error);
        }
    };

    const fetchSalaryRecords = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/salary-records");
            setSalaryRecords(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching salary records:", error);
        }
    };

    const fetchEmployeeSalaryHistory = async (employeeId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/salary-records/employee/${employeeId}`);
            setEmployeeSalaryHistory(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching employee salary history:", error);
            setEmployeeSalaryHistory([]);
        }
    };

    const openModal = (faculty) => {
        const joinDate = faculty.joinDate || new Date().toISOString().split("T")[0];
        const joinDateObj = new Date(joinDate);
        const joinMonth = joinDateObj.toLocaleString('en-US', { month: 'long' });
        const joinYear = joinDateObj.getFullYear().toString();
        
        setSelectedFaculty(faculty);
        setSalaryDetails({
            salary: faculty.salary || "",
            date: new Date().toISOString().split("T")[0],
            month: new Date().toLocaleString('en-US', { month: 'long' }),
            year: new Date().getFullYear().toString(),
            minDate: joinDate,
            joinMonth: joinMonth,
            joinYear: joinYear
        });
        setDeductionPerDay(0);
        setLeaveCount(0);
        setSundayCount(0);
        setTotalLeaveCount(0);
        setPaidLeaveCount(1);
        setModalIsOpen(true);

        // Initial leave count fetch
        fetchLeaveCount(faculty.employeeId, new Date().toLocaleString('en-US', { month: 'long' }), new Date().getFullYear().toString());
    };

    const openHistoryModal = (faculty) => {
        setSelectedFaculty(faculty);
        setSelectedEmployeeId(faculty.employeeId);
        fetchEmployeeSalaryHistory(faculty.employeeId);
        setHistoryModalIsOpen(true);
    };

    const fetchLeaveCount = async (employeeId, month, year) => {
        try {
            const monthIndex = months.indexOf(month) + 1;
            const monthFormatted = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;

            const response = await axios.get(`http://localhost:8080/api/salary-records/leave-count`, {
                params: {
                    employeeId: employeeId,
                    month: monthFormatted,
                    year: year
                }
            });

            setLeaveCount(response.data.leaveCount || 0);
            setSundayCount(response.data.sundayCount || 0);
            setTotalLeaveCount(response.data.totalDays || 0);
        } catch (error) {
            console.error("Error fetching leave count:", error);
            setLeaveCount(0);
            setSundayCount(0);
            setTotalLeaveCount(0);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedFaculty(null);
    };

    const closeHistoryModal = () => {
        setHistoryModalIsOpen(false);
        setSelectedEmployeeId(null);
        setSelectedFaculty(null);
        setEmployeeSalaryHistory([]);
    };

    const handleChange = (e) => {
        setSalaryDetails({ ...salaryDetails, [e.target.name]: e.target.value });
    };

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setSalaryDetails({ ...salaryDetails, month: newMonth });

        if (selectedFaculty) {
            fetchLeaveCount(selectedFaculty.employeeId, newMonth, salaryDetails.year);
        }
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;

        if (newYear === salaryDetails.joinYear) {
            const currentMonthIndex = months.indexOf(salaryDetails.month);
            const joinMonthIndex = months.indexOf(salaryDetails.joinMonth);

            if (currentMonthIndex < joinMonthIndex) {
                setSalaryDetails({
                    ...salaryDetails,
                    year: newYear,
                    month: salaryDetails.joinMonth
                });

                if (selectedFaculty) {
                    fetchLeaveCount(selectedFaculty.employeeId, salaryDetails.joinMonth, newYear);
                }
                return;
            }
        }

        setSalaryDetails({ ...salaryDetails, year: newYear });

        if (selectedFaculty) {
            fetchLeaveCount(selectedFaculty.employeeId, salaryDetails.month, newYear);
        }
    };

    const handleDeductionChange = (e) => {
        setDeductionPerDay(e.target.value);
    };

    const handlePaidLeaveChange = (e) => {
        const value = parseInt(e.target.value);
        setPaidLeaveCount(isNaN(value) || value < 0 ? 0 : value);
    };

    const getDeductibleLeaveDays = () => {
        const deductibleDays = Math.max(0, leaveCount - paidLeaveCount);
        return deductibleDays;
    };

    const calculatePayableSalary = () => {
        const totalDeduction = getDeductibleLeaveDays() * deductionPerDay;
        return salaryDetails.salary - totalDeduction;
    };

    const saveSalary = async () => {
        try {
            const deductibleDays = getDeductibleLeaveDays();
            const totalDeduction = deductibleDays * deductionPerDay;
            const payableSalary = calculatePayableSalary();

            await axios.post("http://localhost:8080/api/salary-records/save", {
                facultyId: selectedFaculty._id,
                employeeId: selectedFaculty.employeeId,
                month: salaryDetails.month,
                year: salaryDetails.year,
                salary: salaryDetails.salary,
                leaveCount: leaveCount,
                sundayCount: sundayCount,
                totalLeaveCount: totalLeaveCount,
                paidLeaveCount: paidLeaveCount,
                deductibleDays: deductibleDays,
                deductionPerDay: deductionPerDay,
                totalDeduction: totalDeduction,
                payableSalary: payableSalary,
                date: salaryDetails.date,
            });

            var modalElement = document.getElementById('standard-modal');
            var modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement);
            }

            modalInstance.hide();
            fetchSalaryRecords();
            alert("Salary saved successfully!");
            closeModal();

        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("Salary already recorded for this employee in the same month!");
            } else {
                console.error("Error saving salary:", error);
            }
        }
    };

    const generatePDF = async (payableSalary, deductibleDays, totalDeduction, record = null) => {
        const employee = record ?
            {
                firstName: record.facultyId?.firstName || "Unknown",
                lastName: record.facultyId?.lastName || "Unknown",
                employeeId: record.employeeId,
                department: record.facultyId?.department || "Unknown",
            } : selectedFaculty;

        if (!employee) {
            throw new Error("Employee information is required");
        }

        try {
            const paymentDate = record ? record.date : salaryDetails.date;
            const month = record ? record.month : salaryDetails.month;
            const year = record ? record.year : salaryDetails.year;
            const salary = record ? record.salary : salaryDetails.salary;
            const leaveInfo = record ? record.leaveCount : leaveCount;
            const sundayInfo = record ? (record.sundayCount || 0) : sundayCount;
            const paidLeaveInfo = record ? (record.paidLeaveCount || 0) : paidLeaveCount;
            const deductibleDaysInfo = record ? (record.deductibleDays || 0) : deductibleDays;
            const deductionPerDayInfo = record ? (record.deductionPerDay || 0) : deductionPerDay;
            const totalDeductionInfo = record ? (record.totalDeduction || 0) : totalDeduction;
            const finalPayableSalary = record ? record.payableSalary : payableSalary;

            const doc = new jsPDF();

            // Company Header with logo
            // You can add your company logo here
            // doc.addImage(logoBase64, "PNG", 70, 10, 80, 20);

            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text("Your Company Name", doc.internal.pageSize.width / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text("Company Address Line 1", doc.internal.pageSize.width / 2, 30, { align: 'center' });
            doc.text("Company Address Line 2", doc.internal.pageSize.width / 2, 35, { align: 'center' });
            doc.text("Phone: (123) 456-7890 | Email: company@email.com", doc.internal.pageSize.width / 2, 40, { align: 'center' });

            // Add horizontal line
            doc.setLineWidth(0.5);
            doc.line(20, 45, 190, 45);

            // Title
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text("Salary Receipt", doc.internal.pageSize.width / 2, 55, { align: 'center' });

            // Date
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const dateObj = new Date(paymentDate);
            const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
            doc.text(`Date: ${formattedDate}`, 170, 55, { align: 'right' });

            // Employee Details
            doc.setFontSize(11);
            doc.text(`Employee Name:`, 20, 70);
            doc.text(`${employee.firstName} ${employee.lastName}`, 80, 70);

            doc.text(`Employee ID:`, 20, 77);
            doc.text(`${employee.employeeId}`, 80, 77);

            doc.text(`Department:`, 20, 84);
            doc.text(`${employee.department}`, 80, 84);
            
            doc.text(`Month & Year:`, 20, 91);
            doc.text(`${month} ${year}`, 80, 91);

            // Salary Details - Table Header
            doc.setLineWidth(0.1);
            doc.line(20, 105, 190, 105);

            doc.setFont(undefined, 'bold');
            doc.text("Description", 25, 112);
            doc.text("Amount", 170, 112);

            doc.line(20, 115, 190, 115);
            doc.setFont(undefined, 'normal');

            // Salary Details
            doc.text("Basic Salary", 25, 122);
            doc.text(`${salary?.toFixed(2)}/-`, 185, 122, { align: 'right' });

            doc.text(`Leave Information`, 25, 129);

            doc.text(`Paid Leave`, 25, 136);
            doc.text(`${paidLeaveInfo}`, 185, 136, { align: 'right' });

            doc.text(`Deductible Leave Days`, 25, 143);
            doc.text(`${deductibleDaysInfo}`, 185, 143, { align: 'right' });

            doc.text(`Deduction Per Day`, 25, 150);
            doc.text(`${deductionPerDayInfo.toFixed(2)}/-`, 185, 150, { align: 'right' });

            doc.line(20, 155, 190, 155);

            doc.text(`Total Deduction`, 25, 162);
            doc.text(`${totalDeductionInfo.toFixed(2)}/-`, 185, 162, { align: 'right' });

            doc.line(20, 167, 190, 167);

            // Final Payable
            doc.setFont(undefined, 'bold');
            doc.text(`Payable Salary`, 25, 174);
            doc.text(`${finalPayableSalary.toFixed(2)}/-`, 185, 174, { align: 'right' });

            doc.line(20, 178, 190, 178);

            // Footer
            doc.setFontSize(8);
            doc.text("This is a computer-generated document. No signature required.", doc.internal.pageSize.width / 2, 270, { align: 'center' });

            doc.save(`Salary_Receipt_${employee.firstName}_${month}_${year}.pdf`);

        } catch (error) {
            console.error("Error generating salary receipt:", error);
            throw new Error(`Failed to generate salary receipt: ${error.message}`);
        }
    };

    const downloadSalaryReceipt = async (record) => {
        if (!record) return;

        const deductibleDays = record.deductibleDays || 0;
        const totalDeduction = record.totalDeduction || 0;
        const payableSalary = record.payableSalary || record.salary;

        try {
            await generatePDF(payableSalary, deductibleDays, totalDeduction, record);
        } catch (error) {
            console.error("Error downloading salary receipt:", error);
            alert("Failed to generate salary receipt. Please try again.");
        }
    };

    const filteredFaculties = faculties.filter((faculty) => {
        const fullName = `${faculty.firstName} ${faculty.lastName}`.toLowerCase();
        const searchTerms = searchQuery.toLowerCase();

        const matchesSearch =
            !searchQuery ||
            fullName.includes(searchTerms) ||
            (faculty.employeeId && faculty.employeeId.toLowerCase().includes(searchTerms)) ||
            (faculty.phone && faculty.phone.includes(searchTerms));

        const matchesDepartment = !selectedDepartment || faculty.department === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [facultiesPerPage] = useState(5);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const indexOfLastFaculty = currentPage * facultiesPerPage;
    const indexOfFirstFaculty = indexOfLastFaculty - facultiesPerPage;

    const currentFaculties = filteredFaculties.slice(indexOfFirstFaculty, indexOfLastFaculty);
    const totalPages = Math.ceil(filteredFaculties.length / facultiesPerPage);

    return (
        <div className="contanier">
        <div className="d-flex justify-content-between align-items-center mb-3">
            
                <div className="content container-fluid">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="page-header">
                                <div className="row align-items-center">
                                    <div className="col-md-4">
                                        <h3 className="page-title">Payroll Management</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-header">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>Search</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search by name, employee ID, phone"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label>All Departments</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedDepartment}
                                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                                >
                                                    <option value="">All Departments</option>
                                                    {departments.map(dept => (
                                                        <option key={dept._id} value={dept.name}>{dept.departmentName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover table-bordered">
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Employee ID</th>
                                                    <th>Name</th>
                                                    <th>Role</th>
                                                    <th>Department</th>
                                                    <th>Base Salary</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentFaculties.length > 0 ? (
                                                    currentFaculties.map((faculty) => (
                                                        <tr key={faculty._id}>
                                                            <td>{faculty.employeeId}</td>
                                                            <td>{faculty.firstName} {faculty.lastName}</td>
                                                            <td>{faculty.role}</td>
                                                            <td>{faculty.department}</td>
                                                            <td><strong>₹{faculty.salary}</strong></td>
                                                            <td className="text-center">
                                                                <div className="d-flex justify-content-center gap-2">
                                                                    <button
                                                                        className="btn btn-primary btn-icon btn-sm"
                                                                        onClick={() => openModal(faculty)}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#standard-modal"
                                                                        title="Generate Payslip"
                                                                    >
                                                                        <i className="ti ti-file-dollar"></i>
                                                                    </button>

                                                                    <button
                                                                        className="btn btn-secondary btn-icon btn-sm"
                                                                        onClick={() => openHistoryModal(faculty)}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#history-modal"
                                                                        title="View History"
                                                                    >
                                                                        <i className="ti ti-history"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">No employees found matching your criteria</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="col-md-12">
                                        <nav aria-label="Page navigation">
                                            <ul className="pagination justify-content-left">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => paginate(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        &laquo;
                                                    </button>
                                                </li>

                                                {(() => {
                                                    const current = currentPage;
                                                    const total = totalPages;
                                                    const pages = [];

                                                    if (total <= 3) {
                                                        for (let i = 1; i <= total; i++) {
                                                            pages.push(
                                                                <li key={i} className={`page-item ${current === i ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => paginate(i)}>
                                                                        {i}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }
                                                    } else {
                                                        pages.push(
                                                            <li key={1} className={`page-item ${current === 1 ? 'active' : ''}`}>
                                                                <button className="page-link" onClick={() => paginate(1)}>1</button>
                                                            </li>
                                                        );

                                                        if (current <= 2) {
                                                            pages.push(
                                                                <li key={2} className={`page-item ${current === 2 ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => paginate(2)}>2</button>
                                                                </li>
                                                            );
                                                        }

                                                        if (current > 3) {
                                                            pages.push(
                                                                <li key="start-ellipsis" className="page-item disabled">
                                                                    <span className="page-link">...</span>
                                                                </li>
                                                            );
                                                        }

                                                        if (current > 2 && current < total - 1) {
                                                            pages.push(
                                                                <li key={current} className="page-item active">
                                                                    <button className="page-link" onClick={() => paginate(current)}>
                                                                        {current}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }

                                                        if (current < total - 2) {
                                                            pages.push(
                                                                <li key="end-ellipsis" className="page-item disabled">
                                                                    <span className="page-link">...</span>
                                                                </li>
                                                            );
                                                        }

                                                        if (current >= total - 1) {
                                                            pages.push(
                                                                <li key={total - 1} className={`page-item ${current === total - 1 ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => paginate(total - 1)}>
                                                                        {total - 1}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }

                                                        if (total > 1) {
                                                            pages.push(
                                                                <li key={total} className={`page-item ${current === total ? 'active' : ''}`}>
                                                                    <button className="page-link" onClick={() => paginate(total)}>
                                                                        {total}
                                                                    </button>
                                                                </li>
                                                            );
                                                        }
                                                    }

                                                    return pages;
                                                })()}

                                                <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => paginate(currentPage + 1)}
                                                        disabled={currentPage >= totalPages}
                                                    >
                                                        &raquo;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Generate Salary Modal */}
                    <div id="standard-modal" className="modal fade" tabIndex="-1" role="dialog"
                        aria-labelledby="standard-modalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h4 className="modal-title" id="standard-modalLabel">Generate Salary</h4>
                                    <button type="button" className="btn-close custom-btn-close border p-1 me-0 text-dark" data-bs-dismiss="modal"
                                        aria-label="Close">
                                        <i className="ti ti-x"></i>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {selectedFaculty && (
                                        <div>
                                            <div className="card mb-3">
                                                <div className="card-body bg-light-primary">
                                                    <div className="row">
                                                        <div className="col-md-2">
                                                            {selectedFaculty.profileImage ? (
                                                                <div className="avatar avatar-lg">
                                                                    <img src={selectedFaculty.profileImage} alt="Profile" className="avatar-img rounded-circle" />
                                                                </div>
                                                            ) : (
                                                                <div className="avatar avatar-lg bg-soft-primary">
                                                                    <span className="avatar-text rounded-circle">{selectedFaculty.firstName?.charAt(0)}{selectedFaculty.lastName?.charAt(0)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="col-md-10">
                                                            <h4>{selectedFaculty.firstName} {selectedFaculty.lastName}</h4>
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <p className="mb-1"><strong>Employee ID:</strong> {selectedFaculty.employeeId}</p>
                                                                    <p className="mb-1"><strong>Department:</strong> {selectedFaculty.department}</p>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <p className="mb-1"><strong>Role:</strong> {selectedFaculty.role}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-3">
                                                    <label className="form-label">Month:</label>
                                                    <select
                                                        className="form-select"
                                                        name="month"
                                                        value={salaryDetails.month}
                                                        onChange={handleMonthChange}
                                                    >
                                                        {months
                                                            .filter(month => {
                                                                if (salaryDetails.year === salaryDetails.joinYear) {
                                                                    const monthIndex = months.indexOf(month);
                                                                    const joinMonthIndex = months.indexOf(salaryDetails.joinMonth);
                                                                    return monthIndex >= joinMonthIndex;
                                                                }
                                                                return true;
                                                            })
                                                            .map(month => (
                                                                <option key={month} value={month}>{month}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label">Year:</label>
                                                    <select
                                                        className="form-select"
                                                        name="year"
                                                        value={salaryDetails.year}
                                                        onChange={handleYearChange}
                                                    >
                                                        {years
                                                            .filter(year => parseInt(year) >= parseInt(salaryDetails.joinYear))
                                                            .map(year => (
                                                                <option key={year} value={year}>{year}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label">Payment Date:</label>
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="form-control"
                                                        value={salaryDetails.date}
                                                        onChange={handleChange}
                                                        min={salaryDetails.minDate}
                                                    />
                                                </div>

                                                <div className="col-md-3">
                                                    <label className="form-label">Base Salary (₹):</label>
                                                    <input
                                                        type="number"
                                                        name="salary"
                                                        className="form-control"
                                                        value={salaryDetails.salary}
                                                        onChange={handleChange}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label">Per Day (₹):</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={deductionPerDay}
                                                        onChange={handleDeductionChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Base Salary (₹):</label>
                                                    <input
                                                        type="number"
                                                        name="salary"
                                                        className="form-control"
                                                        value={salaryDetails.salary}
                                                        onChange={handleChange}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Deduction Per Day (₹):</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={deductionPerDay}
                                                        onChange={handleDeductionChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="card mb-3">
                                                <div className="card-header bg-light">
                                                    <h5 className="card-title mb-0">Attendance & Leave Information</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <div className="mb-3">
                                                                <label className="form-label">Total Leave Days:</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={leaveCount}
                                                                    readOnly
                                                                />
                                                                <small className="text-muted">
                                                                    Excluding {sundayCount} Sundays
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="mb-3">
                                                                <label className="form-label">Paid Leave Allowed:</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={paidLeaveCount}
                                                                    onChange={handlePaidLeaveChange}
                                                                />
                                                                <small className="text-muted">
                                                                    Default: 1 paid leave per month
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="mb-0">
                                                                <label className="form-label">Deductible Leave Days:</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={getDeductibleLeaveDays()}
                                                                    readOnly
                                                                />
                                                                <small className="text-muted">
                                                                    After deducting paid leave
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="mb-0">
                                                                <label className="form-label">Total Deduction (₹):</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={getDeductibleLeaveDays() * deductionPerDay}
                                                                    readOnly
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card mb-3">
                                                <div className="card-header bg-light-success">
                                                    <h5 className="card-title mb-0">Final Salary</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row align-items-center">
                                                        <div className="col-md-8">
                                                            <label className="form-label">Payable Salary (₹):</label>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-lg"
                                                                value={calculatePayableSalary()}
                                                                readOnly
                                                            />
                                                            <small className="text-info">
                                                                Sundays and {paidLeaveCount} paid leave days are not included in salary deductions
                                                            </small>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="text-center">
                                                                <div className="h1 mb-0 text-success">₹{calculatePayableSalary()}</div>
                                                                <div className="small text-muted">Final Amount</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex justify-content-end p-3 gap-2">
                                    <button className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                    <button className="btn btn-primary" onClick={saveSalary}>
                                        <i className="ti ti-device-floppy me-1"></i> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Salary History Modal */}
                    <div id="history-modal" className="modal fade" tabIndex="-1" role="dialog"
                        aria-labelledby="history-modalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header bg-secondary text-white">
                                    <h4 className="modal-title" id="history-modalLabel">Salary History</h4>
                                    <button type="button" className="btn-close custom-btn-close border p-1 me-0 text-dark" data-bs-dismiss="modal"
                                        aria-label="Close">
                                        <i className="ti ti-x"></i>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {selectedFaculty && (
                                        <div className="card mb-3">
                                            <div className="card-body bg-light">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        {selectedFaculty.profileImage ? (
                                                            <div className="avatar avatar-lg">
                                                                <img src={selectedFaculty.profileImage} alt="Profile" className="avatar-img rounded-circle" />
                                                            </div>
                                                        ) : (
                                                            <div className="avatar avatar-lg bg-soft-secondary">
                                                                <span className="avatar-text rounded-circle">{selectedFaculty.firstName?.charAt(0)}{selectedFaculty.lastName?.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-10">
                                                        <h4>{selectedFaculty.firstName} {selectedFaculty.lastName}</h4>
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <p className="mb-1"><strong>Employee ID:</strong> {selectedFaculty.employeeId}</p>
                                                                <p className="mb-1"><strong>Department:</strong> {selectedFaculty.department}</p>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <p className="mb-1"><strong>Role:</strong> {selectedFaculty.role}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {employeeSalaryHistory.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Month & Year</th>
                                                        <th>Basic Salary</th>
                                                        <th>Leave Days</th>
                                                        <th>Total Deduction</th>
                                                        <th>Payable Salary</th>
                                                        <th>Payment Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[...employeeSalaryHistory]
                                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                                        .map((record) => (
                                                            <tr key={record._id}>
                                                                <td>{record.month} {record.year}</td>
                                                                <td>₹{record.salary}</td>
                                                                <td>
                                                                    Total: {record.leaveCount || 0}
                                                                    <span className="text-muted d-block small">
                                                                        {record.sundayCount > 0 && ` (Sundays: ${record.sundayCount})`}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="text-danger">₹{record.totalDeduction || 0}</span>
                                                                </td>
                                                                <td><strong className="text-success">₹{record.payableSalary || record.salary}</strong></td>
                                                                <td>{new Date(record.date).toLocaleDateString()}</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => downloadSalaryReceipt(record)}
                                                                    >
                                                                        <i className="ti ti-download me-1"></i> Download
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div className="mb-3">
                                                <i className="ti ti-file-off text-muted" style={{ fontSize: '48px' }}></i>
                                            </div>
                                            <h5>No salary records found</h5>
                                            <p className="text-muted">No salary has been processed for this employee yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <button
                                        className="btn btn-secondary m-3"
                                        onClick={closeHistoryModal}
                                        data-bs-dismiss="modal"
                                        style={{width:"200px"}}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
          
            </div>
        </div>
        </div>
    );
}

export default Payroll;