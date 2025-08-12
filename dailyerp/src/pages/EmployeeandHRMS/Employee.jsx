import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Employee = () => {
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5,
    totalPages: 1
  });
  
  const [facultyData, setFacultyData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: [],
    department: "",
    qualification: "",
    otherQualification: "",
    experience: "",
    dob: "",
    joinDate: "",
    address: "",
    gender: "",
    employmentType: "Full-Time",
    status: "Active",
    salary: "",
    employeeId: "",

    password: '',
    profilePhoto: "",
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [facultyCounter, setFacultyCounter] = useState(0);

  // Fetch initial data
  useEffect(() => {
    fetchFaculties();
  
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/roles");
      if (Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        console.error("Unexpected roles format:", response.data);
        const uniqueRoles = getUniqueRoles();
        setRoles(uniqueRoles.map(name => ({ _id: name, roleName: name })));
      }
    } catch (error) {
      const uniqueRoles = getUniqueRoles();
      setRoles(uniqueRoles.map(name => ({ _id: name, roleName: name })));
      console.error("Error fetching roles:", error);
    }
  };

  const getUniqueRoles = () => {
    const uniqueRoles = new Set();
    faculties.forEach(faculty => {
      if (Array.isArray(faculty.role)) {
        faculty.role.forEach(role => {
          if (role) uniqueRoles.add(role);
        });
      }
    });
    return Array.from(uniqueRoles).sort();
  };



  const fetchFaculties = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/faculties");
      setFaculties(response.data);
      
      // Calculate current counter for employee ID generation
      const maxId = response.data.reduce((max, faculty) => {
        if (faculty.employeeId) {
          const match = faculty.employeeId.match(/FAC-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            return num > max ? num : max;
          }
        }
        return max;
      }, 0);
      
      setFacultyCounter(maxId);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  // Email validation
  const [emailValidation, setEmailValidation] = useState({
    isChecking: false,
    exists: false,
    message: ""
  });

  const checkEmailExists = async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;

    setEmailValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await axios.get(`http://localhost:8080/api/Faculty/check-email-exists?email=${email}`);
      const exists = response.data.exists;

      setEmailValidation({
        isChecking: false,
        exists: exists,
        message: exists ? "This email is already registered" : "Email is available"
      });
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailValidation({
        isChecking: false,
        exists: false,
        message: "Unable to verify email"
      });
    }
  };

  const emailCheckTimeout = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, options } = e.target;
    let updatedValue = value;
    let errorMsg = "";

    // Phone validation
    if (name === "phone") {
      let rawValue = value.replace(/\D/g, "");
      if (rawValue.startsWith("91")) {
        rawValue = rawValue.slice(2);
      }

      if (/^\d{0,10}$/.test(rawValue)) {
        if (rawValue.length > 10) {
          rawValue = rawValue.slice(0, 10);
        }

        setFacultyData((prev) => ({ ...prev, [name]: rawValue }));

        if (rawValue.length === 0) {
          errorMsg = "Phone number is required.";
        } else if (rawValue.length === 1 && !/^[6-9]$/.test(rawValue)) {
          errorMsg = "Phone number must start with 6, 7, 8, or 9.";
        } else if (rawValue.length < 10) {
          errorMsg = "Phone number must be exactly 10 digits.";
        } else if (rawValue.length === 10 && !/^[6-9]\d{9}$/.test(rawValue)) {
          errorMsg = "Invalid phone number format. It must start with 6, 7, 8, or 9.";
        }

        if (rawValue.length === 10 && !errorMsg) {
          errorMsg = "";
        }

        setErrors((prev) => ({ ...prev, [name]: errorMsg }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "Only numbers are allowed." }));
      }
      return;
    }

    // Other validations
    if (name === "firstName" || name === "lastName") {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        errorMsg = "Only alphabets are allowed.";
      }
    }

    if (name === "email") {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = "Enter a valid email.";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMsg,
    }));

    if (type === "select-multiple") {
      updatedValue = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
    }

    let updatedData = { ...facultyData, [name]: updatedValue };


   
    setFacultyData(updatedData);

    // Email checking with debounce
    if (name === "email") {
      if (emailCheckTimeout.current) {
        clearTimeout(emailCheckTimeout.current);
      }
      emailCheckTimeout.current = setTimeout(() => {
        checkEmailExists(updatedValue);
      }, 500);
    }

    // Auto-generate employee ID when first name is entered
    if (name === "firstName" && value && !editId) {
      const newCounter = facultyCounter + 1;
      const employeeId = `FAC-${String(newCounter).padStart(3, '0')}`;
      setFacultyData(prev => ({ ...prev, employeeId }));
    }
  };

  // Table filtering
  const [tableFilter, setTableFilter] = useState({
    searchQuery: "",
    roleName: "",
  });

  const handleTableFilterChange = (e) => {
    const { name, value } = e.target;
    setTableFilter(prev => ({ ...prev, [name]: value }));
  };

  const getFilteredFaculties = () => {
    return faculties.filter(faculty => {
      if (tableFilter.roleName && !faculty.role.includes(tableFilter.roleName)) {
        return false;
      }

      if (tableFilter.searchQuery) {
        const query = tableFilter.searchQuery.toLowerCase();
        return (
          faculty.firstName?.toLowerCase().includes(query) ||
          faculty.lastName?.toLowerCase().includes(query) ||
          faculty.email?.toLowerCase().includes(query) ||
          faculty.employeeId?.toLowerCase().includes(query) ||
          faculty.department?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some(err => err);

    // Validate age at joining
    const dobDate = new Date(facultyData.dob);
    const joinDate = new Date(facultyData.joinDate);
    let ageAtJoin = joinDate.getFullYear() - dobDate.getFullYear();
    const monthDiff = joinDate.getMonth() - dobDate.getMonth();
    const dayDiff = joinDate.getDate() - dobDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      ageAtJoin--;
    }

    if (ageAtJoin < 19) {
      alert("Faculty must be at least 19 years old on the joining date.");
      return;
    }

    if (hasErrors) {
      alert("Please fix the validation errors before submitting.");
      return;
    }

    let phoneNumber = facultyData.phone;
    if (!phoneNumber.startsWith("+91")) {
      phoneNumber = "+91" + phoneNumber;
    }

    const submitData = {
    firstName: facultyData.firstName,
    lastName: facultyData.lastName,
    email: facultyData.email,
    phone: phoneNumber,
    department: facultyData.department,
    qualification: facultyData.qualification,
    otherQualification: facultyData.otherQualification,
    experience: facultyData.experience,
    dob: facultyData.dob,
    joinDate: facultyData.joinDate,
    address: facultyData.address,
    gender: facultyData.gender,
    employmentType: facultyData.employmentType,
    status: facultyData.status,
    salary: facultyData.salary,
    employeeId: facultyData.employeeId,
    role: facultyData.role, // Already an array, no need to stringify
  };

  if (facultyData.password && facultyData.password.trim() !== '') {
    submitData.password = facultyData.password;
  }

  console.log("submitData", submitData); // This will show the data

  try {
    let response;
    if (editId) {
      response = await axios.put(
        `http://localhost:8080/api/faculties/${editId}`,
        submitData,
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      response = await axios.post(
        "http://localhost:8080/api/faculties",
        submitData,
        { headers: { 'Content-Type': 'application/json' } }
      );
    }



      alert(response.data.message || "Faculty saved successfully!");
      resetForm();
      fetchFaculties();
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred while saving faculty.");
    }
  };

  const resetForm = () => {
    setFacultyData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: [],
      department: "",
      qualification: "",
      otherQualification: "",
      experience: "",
      dob: "",
      joinDate: "",
      address: "",
      gender: "",
      employmentType: "Full-Time",
      status: "Active",
      salary: "",
      employeeId: "",

      password: "",
      profilePhoto: "",
    });
    setSelectedFile(null);
    setPhotoPreview(null);
    setEmailValidation({});

    setEditId(null);
  };

  const handleEdit = (faculty) => {
    console.log("Editing faculty:", faculty);
    const facultyDataForEdit = {
      ...faculty,
      password: ""
    };

    setFacultyData(facultyDataForEdit);
   
    setEditId(faculty._id);

    if (faculty.profilePhoto) {
      const profilePhotoPath = faculty.profilePhoto.startsWith('/')
        ? faculty.profilePhoto.substring(1)
        : faculty.profilePhoto;
      const fullPhotoUrl = `/${profilePhotoPath}`;
      setPhotoPreview(fullPhotoUrl);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty?")) {
      try {
        await axios.delete(`http://localhost:8080/api/faculties/${id}`);
        alert("Faculty deleted successfully");
        fetchFaculties();
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting faculty");
      }
    }
  };

  // Pagination functions
  const getPaginatedFaculties = () => {
    const filtered = getFilteredFaculties();
    const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.itemsPerPage));

    if (pagination.totalPages !== totalPages) {
      setPagination(prev => ({ ...prev, totalPages: totalPages }));
    }

    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="content container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="page-header">
                  <div className="row">
                    <div className="col-md-4">
                      <h3>Staff Management</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by name, email, employee ID..."
                          name="searchQuery"
                          value={tableFilter.searchQuery}
                          onChange={handleTableFilterChange}
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <select
                          className="form-select"
                          name="roleName"
                          value={tableFilter.roleName}
                          onChange={handleTableFilterChange}
                        >
                          <option value="">All Roles</option>
                          {getUniqueRoles().map(roleName => (
                            <option key={roleName} value={roleName}>
                              {roleName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <button 
                          className="btn btn-primary" 
                          type="button" 
                          data-bs-toggle="offcanvas"
                          data-bs-target="#offcanvasRight" 
                          aria-controls="offcanvasRight" 
                          onClick={resetForm}
                        >
                          Add Staff
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover table-center mb-0 table-bordered">
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Experience</th>
                            <th>Join Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPaginatedFaculties().length > 0 ? (
                            getPaginatedFaculties().map((faculty) => (
                              <tr key={faculty._id}>
                                <td>{faculty.employeeId}</td>
                                <td>{faculty.firstName} {faculty.lastName}</td>
                                <td>{faculty.email}</td>
                                <td>{faculty.phone}</td>
                                <td>{faculty.department}</td>
                                <td>{faculty.experience} years</td>
                                <td>{faculty.joinDate}</td>
                                <td>
                                  <div className="hstack gap-2 fs-15">
                                    <button 
                                      className="btn btn-icon btn-sm btn-soft-warning rounded-pill" 
                                      data-bs-toggle="modal" 
                                      data-bs-target="#viewModal" 
                                      onClick={() => setSelectedFaculty(faculty)}
                                    >
                                      <i className="feather-eye"></i>
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(faculty)}
                                      className="btn btn-icon btn-sm btn-soft-info rounded-pill" 
                                      data-bs-toggle="offcanvas"
                                      data-bs-target="#offcanvasRight" 
                                      aria-controls="offcanvasRight"
                                    >
                                      <i className="feather-edit"></i>
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(faculty._id)}
                                      className="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                                    >
                                      <i className="feather-trash"></i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="text-center">
                                No faculties found matching your criteria
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-left mt-3">
                      <nav>
                        <ul className="pagination">
                          <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>
                              <i className="fas fa-angle-double-left"></i>
                            </button>
                          </li>

                          {[...Array(pagination.totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                              pageNum === 1 ||
                              pageNum === pagination.totalPages ||
                              (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                            ) {
                              return (
                                <li key={i} className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNum)}
                                  >
                                    {pageNum}
                                  </button>
                                </li>
                              );
                            }
                            return null;
                          })}
                          
                          <li className={`page-item ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}`}>
                            <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>
                              <i className="fas fa-angle-double-right"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>

                  {/* Add/Edit Faculty Offcanvas */}
                  <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
                    <div className="offcanvas-header">
                      <h5 className="modal-title">{editId ? "Edit Staff" : "Add Staff"}</h5>
                      <button className="btn-close custom-btn-close border p-1 me-0 text-dark" data-bs-dismiss="offcanvas" aria-label="Close">
                        <i className="ti ti-x"></i>
                      </button>
                    </div>

                    <div className="offcanvas-body">
                      <form onSubmit={handleSubmit}>
                        {/* Profile Photo */}
                        <div className="mb-3">
                          <label>Profile Photo</label>
                          <div className="d-flex align-items-center gap-2">
                            <input
                              type="file"
                              name="profilePhoto"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="form-control"
                              style={{ maxWidth: '300px' }}
                            />
                            {photoPreview && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setPhotoPreview(null);
                                  setFacultyData(prev => ({ ...prev, profilePhoto: "" }));
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          {photoPreview && (
                            <div className="mt-2">
                              <img
                                src={photoPreview}
                                alt="Profile Preview"
                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                                className="rounded"
                              />
                            </div>
                          )}
                        </div>

                        {/* Basic Information */}
                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">First Name</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="firstName" 
                              placeholder="First Name" 
                              value={facultyData.firstName} 
                              onChange={handleChange} 
                              required 
                            />
                            {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
                          </div>
                          <div className="col-md-6">
                            <label className="col-form-label">Last Name</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="lastName" 
                              placeholder="Last Name" 
                              value={facultyData.lastName} 
                              onChange={handleChange} 
                              required 
                            />
                            {errors.lastName && <p style={{ color: "red" }}>{errors.lastName}</p>}
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">Email</label>
                            <input
                              type="email"
                              name="email"
                              className="form-control"
                              value={facultyData.email}
                              onChange={handleChange}
                              placeholder="Email"
                              required
                            />
                            {emailValidation.isChecking && <small className="text-muted">Checking email...</small>}
                            {emailValidation.message && !emailValidation.isChecking && (
                              <small className={emailValidation.exists ? "text-danger" : "text-success"}>
                                {emailValidation.message}
                              </small>
                            )}
                            {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
                          </div>
                          <div className="col-md-6">
                            <label className="col-form-label">Phone Number</label>
                            <input 
                              type="text" 
                              name="phone" 
                              placeholder="Phone" 
                              className="form-control" 
                              value={facultyData.phone} 
                              onChange={handleChange} 
                              required 
                            />
                            {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}
                          </div>
                        </div>
<div className="row">
  <div className="col-md-6">
    <label className="col-form-label">Department</label>
    <select
      name="department"
      value={facultyData.department}
      onChange={handleChange}
      required
      className="form-select"
    >
      <option value="">--Select--</option>
      {departments.length > 0 ? (
        departments.map((dept) => (
          <option key={dept._id} value={dept.departmentName}>
            {dept.departmentName}
          </option>
        ))
      ) : (
        <option disabled>Loading departments...</option>
      )}
    </select>
  </div>
  <div className="col-md-6">
    <label className="col-form-label">Employee ID</label>
    <input
      type="text"
      name="employeeId"
      placeholder="Employee ID"
      value={facultyData.employeeId}
      onChange={handleChange}
      readOnly
      className="form-control"
    />
    <small className="text-muted">Auto-generated</small>
  </div>
</div>

                        {/* Role Selection */}
                       
                         {roles.length > 0 ? (
  roles.map((role, index) => {
    const roleName = role.roleName;
    if (roleName?.toLowerCase() === "student") return null;

    return (
      <div
        className="form-check"
        key={role._id || index}
        style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "9px" }}
      >
        <input
          type="checkbox"
          className="form-check-input"
          id={`role-${index}`}
          value={role.roleName}
          checked={facultyData.role.includes(role.roleName)}
          onChange={(e) => {
            const isChecked = e.target.checked;

            setFacultyData((prev) => {
              let newRoles;
              if (isChecked) {
                newRoles = [...prev.role];
                if (!newRoles.includes(roleName)) {
                  newRoles.push(roleName);
                }
              } else {
                newRoles = prev.role.filter((r) => r !== roleName);
              }

            

              return { ...prev, role: newRoles };
            });
          }}
        />
        <label className="form-check-label mt-1" htmlFor={`role-${index}`}>
          {role.roleName}
        </label>
      </div>
    );
  })
) : (
  <p>No roles found.</p>
)}

                     
                        
                    

                   
                        {/* Qualification */}
                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">Qualification <span className="text-danger">*</span></label>
                            <select
                              name="qualification"
                              className="form-control"
                              value={facultyData.qualification}
                              onChange={handleChange}
                              required
                            >
                              <option value="">Select Qualification</option>
                              <option value="BE">BE</option>
                              <option value="BTech">BTech</option>
                              <option value="MCA">MCA</option>
                              <option value="ME">ME</option>
                              <option value="MTech">MTech</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {facultyData.qualification === "Other" && (
                            <div className="col-md-6">
                              <label className="col-form-label">Other Qualification <span className="text-danger">*</span></label>
                              <input
                                type="text"
                                name="otherQualification"
                                className="form-control"
                                value={facultyData.otherQualification || ""}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          )}

                          <div className="col-md-6">
                            <label className="col-form-label">Experience (Years)</label>
                            <input
                              type="number"
                              name="experience"
                              placeholder="Experience in years"
                              value={facultyData.experience}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || (/^\d{1,2}$/.test(value) && Number(value) > 0 && Number(value) <= 50)) {
                                  handleChange(e);
                                }
                              }}
                              min="1"
                              max="50"
                              required
                              className="form-control"
                            />
                          </div>
                        </div>

                        {/* Personal Information */}
                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">Date of Birth</label>
                            <input 
                              type="date" 
                              name="dob" 
                              value={facultyData.dob} 
                              onChange={handleChange} 
                              required 
                              className="form-control" 
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="col-form-label">Joining Date</label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="joinDate" 
                              value={facultyData.joinDate} 
                              onChange={handleChange} 
                              required 
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">Gender</label>
                            <select 
                              name="gender" 
                              value={facultyData.gender} 
                              onChange={handleChange} 
                              required 
                              className="form-select"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="col-form-label">Address</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="address" 
                              placeholder="Address" 
                              value={facultyData.address} 
                              onChange={handleChange} 
                              required 
                            />
                          </div>
                        </div>

                        {/* Employment Details */}
                        <div className="row">
                          <div className="col-md-6">
                            <label htmlFor="employmentType" className="form-label">Employment Type</label>
                            <select
                              id="employmentType"
                              name="employmentType"
                              value={facultyData.employmentType}
                              onChange={handleChange}
                              required
                              className="form-select"
                            >
                              <option value="Full-Time">Full-Time</option>
                              <option value="Part-Time">Part-Time</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select
                              id="status"
                              name="status"
                              value={facultyData.status}
                              onChange={handleChange}
                              required
                              className="form-select"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <label className="col-form-label">Salary</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="salary" 
                              placeholder="Salary per month" 
                              value={facultyData.salary} 
                              onChange={handleChange} 
                              required 
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="col-form-label">Password {editId ? "(Leave blank to keep current)" : ""}</label>
                            <input
                              type="password"
                              name="password"
                              placeholder={editId ? "Leave blank to keep current" : "Password"}
                              value={facultyData.password}
                              onChange={handleChange}
                              required={!editId}
                              className="form-control"
                            />
                          </div>
                        </div>

                        {/* Form Actions */}
                        <div className="row mt-4">
                          <div className="col-6">
                            <button type="submit" className="btn btn-primary">
                              {editId ? "Update" : "Submit"}
                            </button>
                          </div>
                          <div className="col-6 text-end">
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              data-bs-dismiss="offcanvas"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Faculty Modal */}
      <div className="modal fade" id="viewModal" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Faculty Details</h5>
              <button 
                className="btn-close custom-btn-close border p-1 me-0 text-dark" 
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="modal-body">
              {selectedFaculty ? (
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>Employee ID</th>
                      <td>{selectedFaculty.employeeId}</td>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <td>{selectedFaculty.firstName} {selectedFaculty.lastName}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{selectedFaculty.email}</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{selectedFaculty.phone}</td>
                    </tr>
                    <tr>
                      <th>Department</th>
                      <td>{selectedFaculty.department}</td>
                    </tr>
                    <tr>
                      <th>Qualification</th>
                      <td>{selectedFaculty.qualification}</td>
                    </tr>
                    <tr>
                      <th>Experience</th>
                      <td>{selectedFaculty.experience} years</td>
                    </tr>
                    <tr>
                      <th>Role</th>
                      <td>
                        {Array.isArray(selectedFaculty.role)
                          ? selectedFaculty.role.join(", ")
                          : selectedFaculty.role}
                      </td>
                    </tr>
                   
                    <tr>
                      <th>Employment Type</th>
                      <td>{selectedFaculty.employmentType}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        <span className={`badge ${selectedFaculty.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                          {selectedFaculty.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <h6>No faculty selected</h6>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkbox-group {
          display: flex;
          gap: 10px;
          padding: 10px;
          flex-wrap: wrap;
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          padding: 0.5rem;
        }
        .form-check {
          margin: 5px 0;
        }
        .form-select[multiple] option {
          padding: 8px 12px;
          margin: 2px 0;
        }
        .form-select[multiple] option:checked {
          background-color: #0d6efd;
          color: white;
        }
        .badge {
          font-size: 0.75em;
          padding: 0.25em 0.5em;
        }
      `}</style>
    </>
  );
};

export default Employee;
                               