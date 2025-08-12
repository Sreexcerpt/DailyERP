// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const DepartmentForm = () => {
//   const [formData, setFormData] = useState({ departmentName: '' });
//   const [departments, setDepartments] = useState([]);
//   const [message, setMessage] = useState('');
//   const [editId, setEditId] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 5;

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   const fetchDepartments = async () => {
//     try {
//       const res = await axios.get('http://localhost:8080/api/departments');
//       setDepartments(res.data);
//     } catch (err) {
//       console.error('Error fetching departments:', err);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editId) {
//         await axios.put(`http://localhost:8080/api/departments/${editId}`, formData);
//       } else {
//         await axios.post('http://localhost:8080/api/departments', formData);
//       }
//       setFormData({ departmentName: '' });
//       setEditId(null);
//       fetchDepartments();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleEdit = (dept) => {
//     setFormData({ departmentName: dept.departmentName });
//     setEditId(dept._id);
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this department?')) {
//       try {
//         await axios.delete(`http://localhost:8080/api/departments/${id}`);
//         fetchDepartments();
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   };

//   // Pagination logic
//   const indexOfLastRecord = currentPage * recordsPerPage;
//   const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//   const currentRecords = departments.slice(indexOfFirstRecord, indexOfLastRecord);
//   const totalPages = Math.ceil(departments.length / recordsPerPage);
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="main-wrapper">
//       <div className="page-wrapper cardhead">
//         <div className="content container-fluid">
//           <div className="row">
//             <div className="col-md-12">
//               <div className="page-header">
//                 <div className="row">
//                   <div className="col-md-9">
//                     <h3>Department Form</h3>
//                   </div>
//                   <div className="col-md-2 float-end ms-auto">
//                     <button
//                       data-bs-toggle="modal"
//                       className="btn btn-primary btn-sm float-end sm-auto"
//                       data-bs-target="#department-modal"
//                     >
//                       Add New Department
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="row">
//             <div className="card">
//               <div className="card-body">
//                 <div className="table-responsive">
//                   {departments.length > 0 ? (
//                     <table className="table table-bordered mt-3">
//                       <thead>
//                         <tr>
//                           <th>Department ID</th>
//                           <th>Department Name</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {currentRecords.map((dept) => (
//                           <tr key={dept._id}>
//                             <td>{dept.dep_id}</td>
//                             <td>{dept.departmentName}</td>
//                             <td>
//                               <a
//                                 className="btn btn-sm btn-soft-info rounded-pill me-2"
//                                 data-bs-toggle="modal"
//                                 data-bs-target="#department-modal"
//                                 onClick={() => handleEdit(dept)}
//                               >
//                                 <i className="feather-edit"></i>
//                               </a>
//                               <a
//                                 className="btn btn-sm btn-soft-danger rounded-pill"
//                                 onClick={() => handleDelete(dept._id)}
//                               >
//                                 <i className="feather-trash"></i>
//                               </a>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <p>No departments added yet.</p>
//                   )}
//                 </div>
//                  {/* Pagination */}
//               <div className="ms-3 mt-3">
//                 <nav>
//                   <ul className="pagination">
//                     <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                       <button
//                         className="page-link"
//                         onClick={() => paginate(currentPage - 1)}
//                         disabled={currentPage === 1}
//                       >
//                         <i className="fas fa-angle-double-left"></i>
//                       </button>
//                     </li>
//                     {Array.from({ length: totalPages }, (_, i) => (
//                       <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
//                         <button className="page-link" onClick={() => paginate(i + 1)}>
//                           {i + 1}
//                         </button>
//                       </li>
//                     ))}
//                     <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                       <button
//                         className="page-link"
//                         onClick={() => paginate(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                       >
//                         <i className="fas fa-angle-double-right"></i>
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               </div>
//               </div>

             
//             </div>

//             {/* Modal */}
//             <div
//               id="department-modal"
//               className="modal fade"
//               tabIndex="-1"
//               role="dialog"
//               aria-labelledby="standard-modalLabel"
//               aria-hidden="true"
//             >
//               <div className="modal-dialog modal-sm">
//                 <div className="modal-content">
//                   <div className="modal-header">
//                     <h4 className="modal-title" id="standard-modalLabel">
//                       {editId ? 'Edit Department' : 'Add Department'}
//                     </h4>
//                     <button
//                       type="button"
//                       className="btn-close custom-btn-close border p-1 me-0 text-dark"
//                       data-bs-dismiss="modal"
//                       aria-label="Close"
//                       onClick={() => {
//                         setFormData({ departmentName: '' });
//                         setEditId(null);
//                       }}
//                     >
//                       <i class="ti ti-x"></i>
//                     </button>
//                   </div>

//                   <div className="modal-body">
//                     {message && <p className="alert alert-info">{message}</p>}
//                     <form onSubmit={handleSubmit}>
//                       <div className="mb-3">
//                         <label className="form-label">Department Name</label>
//                         <input
//                           type="text"
//                           name="departmentName"
//                           className="form-control"
//                           value={formData.departmentName}
//                           onChange={handleChange}
//                           required
//                         />
//                       </div>
//                       <button
//                         className="btn btn-primary col-xl-12"
//                         data-bs-dismiss="modal"
//                         type="submit"
//                       >
//                         Save
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* End Modal */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DepartmentForm;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DepartmentForm = () => {
  const [formData, setFormData] = useState({ departmentName: '' });
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/departments/${editId}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/departments', formData);
      }
      setFormData({ departmentName: '' });
      setEditId(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (dept) => {
    setFormData({ departmentName: dept.departmentName });
    setEditId(dept._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`http://localhost:8080/api/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = departments.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(departments.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary">Department Master</h3>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#department-modal"
          onClick={() => {
            setFormData({ departmentName: '' });
            setEditId(null);
          }}
        >
          + Add Department
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            {departments.length > 0 ? (
              <table className="table table-bordered table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Department ID</th>
                    <th>Department Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((dept) => (
                    <tr key={dept._id}>
                      <td>{dept.dep_id || dept._id.slice(-5)}</td>
                      <td>{dept.departmentName}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          data-bs-toggle="modal"
                          data-bs-target="#department-modal"
                          onClick={() => handleEdit(dept)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(dept._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">No departments added yet.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-left">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    <button className="page-link" onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="department-modal"
        tabIndex="-1"
        aria-labelledby="departmentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title" id="departmentModalLabel">
                  {editId ? 'Edit Department' : 'Add Department'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setFormData({ departmentName: '' });
                    setEditId(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    name="departmentName"
                    className="form-control"
                    value={formData.departmentName}
                    onChange={handleChange}
                    placeholder="Enter department name"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary w-100" data-bs-dismiss="modal">
                  {editId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* End Modal */}
    </div>
  );
};

export default DepartmentForm;
