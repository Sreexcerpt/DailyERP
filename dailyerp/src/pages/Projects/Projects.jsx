// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// const Projects = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);
//   const [faculties, setFaculties] = useState([]);
//   const [formData, setFormData] = useState({
//     projectName: '',
//     description: '',
//     clientName: '',
//     startDate: '',
//     endDate: '',
//     budget: '',
//     status: 'Planning',
//     priority: 'Medium',
//     projectManager: '',
//     teamMembers: '',
//     technologies: '',
//     category: ''
//   });

//   const statuses = ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled'];
//   const priorities = ['Low', 'Medium', 'High', 'Critical'];
//   const categories = ['Web Development', 'Mobile App', 'Desktop App', 'API Development', 'Data Analysis', 'Other'];

//   // Get required localStorage values
//   const companyId = localStorage.getItem("selectedCompanyId");
//   const financialYear = localStorage.getItem("financialYear");

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost:8080/api/projects?companyId=${companyId}&financialYear=${financialYear}`);
//       const data = await response.json();
//       setProjects(data);
//       setError('');
//     } catch (err) {
//       setError('Failed to load projects');
//     } finally {
//       setLoading(false);
//     }
//   };

//     const fetchFaculties = async () => {
//       try {
//           const companyId = localStorage.getItem('selectedCompanyId');
//     const financialYear = localStorage.getItem('financialYear');
//         const response = await axios.get("http://localhost:8080/api/faculties",{
//         params: { companyId, financialYear }});
//         setFaculties(response.data);
//         console.log("Fetched faculties:", response.data);
        
//         // Calculate current counter for employee ID generation
        
//       } catch (error) {
//         console.error("Error fetching faculties:", error);
//       }
//     };
//     useEffect(() => {
//       fetchFaculties();
//     }, []);
//   const handleAdd = () => {
//     setEditingProject(null);
//     setFormData({
//       projectName: '',
//       description: '',
//       clientName: '',
//       startDate: '',
//       endDate: '',
//       budget: '',
//       status: 'Planning',
//       priority: 'Medium',
//       projectManager: '',
//       teamMembers: '',
//       technologies: '',
//       category: ''
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (project) => {
//     setEditingProject(project);
//     setFormData({
//       projectName: project.projectName,
//       description: project.description,
//       clientName: project.clientName,
//       startDate: project.startDate ? project.startDate.split('T')[0] : '',
//       endDate: project.endDate ? project.endDate.split('T')[0] : '',
//       budget: project.budget,
//       status: project.status,
//       priority: project.priority,
//       projectManager: project.projectManager,
//       teamMembers: project.teamMembers.join(', '),
//       technologies: project.technologies.join(', '),
//       category: project.category
//     });
//     setShowModal(true);
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     try {
//       const url = editingProject 
//         ? `http://localhost:8080/api/projects/${editingProject._id}`
//         : 'http://localhost:8080/api/projects';
      
//       const method = editingProject ? 'PUT' : 'POST';
      
//       const projectData = {
//         ...formData,
//         teamMembers: formData.teamMembers.split(',').map(member => member.trim()).filter(member => member),
//         technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
//         companyId,
//         financialYear
//       };
      
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(projectData)
//       });

//       if (response.ok) {
//         await loadProjects();
//         setShowModal(false);
//         setError('');
//       } else {
//         setError('Failed to save project');
//       }
//     } catch (err) {
//       setError('Failed to save project');
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       try {
//         const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
//           method: 'DELETE'
//         });

//         if (response.ok) {
//           await loadProjects();
//           setError('');
//         } else {
//           setError('Failed to delete project');
//         }
//       } catch (err) {
//         setError('Failed to delete project');
//       }
//     }
//   };

//   const getStatusBadgeClass = (status) => {
//     const badges = {
//       'Planning': 'bg-info',
//       'In Progress': 'bg-primary',
//       'Testing': 'bg-warning',
//       'Completed': 'bg-success',
//       'On Hold': 'bg-secondary',
//       'Cancelled': 'bg-danger'
//     };
//     return badges[status] || 'bg-secondary';
//   };

//   const getPriorityBadgeClass = (priority) => {
//     const badges = {
//       'Low': 'bg-success',
//       'Medium': 'bg-warning',
//       'High': 'bg-danger',
//       'Critical': 'bg-dark'
//     };
//     return badges[priority] || 'bg-secondary';
//   };

//   const calculateProgress = (startDate, endDate) => {
//     if (!startDate || !endDate) return 0;
    
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const now = new Date();
    
//     if (now < start) return 0;
//     if (now > end) return 100;
    
//     const total = end - start;
//     const elapsed = now - start;
//     return Math.round((elapsed / total) * 100);
//   };

//   return (
//     <div className="container-fluid py-4">
//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-header d-flex justify-content-between align-items-center">
//               <h4 className="card-title mb-0">
//                 <i className="fas fa-project-diagram me-2"></i>Projects Management
//               </h4>
//               <button 
//                 className="btn btn-primary"
//                 onClick={handleAdd}
//               >
//                 <i className="fas fa-plus me-2"></i>Add Project
//               </button>
//             </div>
            
//             <div className="card-body">
//               {error && (
//                 <div className="alert alert-danger" role="alert">
//                   {error}
//                 </div>
//               )}

//               {loading ? (
//                 <div className="text-center">
//                   <div className="spinner-border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="table-responsive">
//                   <table className="table table-striped table-hover">
//                     <thead className="table-dark">
//                       <tr>
//                         <th>Project Name</th>
//                         <th>Client</th>
//                         <th>Status</th>
//                         <th>Priority</th>
//                         <th>Progress</th>
//                         <th>Budget</th>
//                         <th>Start Date</th>
//                         <th>End Date</th>
//                         <th>Project Manager</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {projects.map((project) => (
//                         <tr key={project._id}>
//                           <td>
//                             <div>
//                               <strong>{project.projectName}</strong>
//                               {project.category && (
//                                 <div className="text-muted small">{project.category}</div>
//                               )}
//                             </div>
//                           </td>
//                           <td>{project.clientName}</td>
//                           <td>
//                             <span className={`badge ${getStatusBadgeClass(project.status)}`}>
//                               {project.status}
//                             </span>
//                           </td>
//                           <td>
//                             <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
//                               {project.priority}
//                             </span>
//                           </td>
//                           <td>
//                             <div className="progress" style={{height: '20px'}}>
//                               <div 
//                                 className="progress-bar bg-success" 
//                                 role="progressbar" 
//                                 style={{width: `${calculateProgress(project.startDate, project.endDate)}%`}}
//                               >
//                                 {calculateProgress(project.startDate, project.endDate)}%
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A'}
//                           </td>
//                           <td>
//                             {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
//                           </td>
//                           <td>
//                             {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
//                           </td>
//                           <td>{project.projectManager}</td>
//                           <td>
//                             <button 
//                               className="btn btn-sm btn-outline-primary me-2"
//                               onClick={() => handleEdit(project)}
//                             >
//                               <i className="fas fa-edit"></i>
//                             </button>
//                             <button 
//                               className="btn btn-sm btn-outline-danger"
//                               onClick={() => handleDelete(project._id)}
//                             >
//                               <i className="fas fa-trash"></i>
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {editingProject ? 'Edit Project' : 'Add Project'}
//                 </h5>
//                 <button 
//                   type="button" 
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <form onSubmit={handleSave}>
//                 <div className="modal-body">
//                   <div className="row">
//                     <div className="col-md-6">
//                       <div className="mb-3">
//                         <label className="form-label">Project Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={formData.projectName}
//                           onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-6">
//                       <div className="mb-3">
//                         <label className="form-label">Client Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={formData.clientName}
//                           onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mb-3">
//                     <label className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       rows="3"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     ></textarea>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Status</label>
//                         <select
//                           className="form-select"
//                           value={formData.status}
//                           onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                           required
//                         >
//                           {statuses.map((status) => (
//                             <option key={status} value={status}>{status}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Priority</label>
//                         <select
//                           className="form-select"
//                           value={formData.priority}
//                           onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                           required
//                         >
//                           {priorities.map((priority) => (
//                             <option key={priority} value={priority}>{priority}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Category</label>
//                         <select
//                           className="form-select"
//                           value={formData.category}
//                           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                         >
//                           <option value="">Select Category</option>
//                           {categories.map((category) => (
//                             <option key={category} value={category}>{category}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Start Date</label>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={formData.startDate}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">End Date</label>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={formData.endDate}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Budget ($)</label>
//                         <input
//                           type="number"
//                           className="form-control"
//                           value={formData.budget}
//                           onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Project Manager</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={formData.projectManager}
//                       onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Team Members (comma-separated)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={formData.teamMembers}
//                       onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
//                       placeholder="John Doe, Jane Smith, Bob Johnson"
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Technologies (comma-separated)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={formData.technologies}
//                       onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
//                       placeholder="React, Node.js, MongoDB"
//                     />
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button 
//                     type="button" 
//                     className="btn btn-secondary"
//                     onClick={() => setShowModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     {editingProject ? 'Update' : 'Create'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Projects;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Projects = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);
//   const [faculties, setFaculties] = useState([]);
  
//   // Employee selection modal states
//   const [showEmployeeModal, setShowEmployeeModal] = useState(false);
//   const [employeeModalType, setEmployeeModalType] = useState(''); // 'manager' or 'team'
//   const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
//   const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  
//   const [formData, setFormData] = useState({
//     projectName: '',
//     description: '',
//     clientName: '',
//     startDate: '',
//     endDate: '',
//     budget: '',
//     status: 'Planning',
//     priority: 'Medium',
//     projectManager: '',
//     projectManagerId: '', // Store the ID
//     teamMembers: '',
//     teamMemberIds: [], // Store the IDs
//     technologies: '',
//     category: ''
//   });

//   const statuses = ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled'];
//   const priorities = ['Low', 'Medium', 'High', 'Critical'];
//   const categories = ['Web Development', 'Mobile App', 'Desktop App', 'API Development', 'Data Analysis', 'Other'];

//   // Get required localStorage values
//   const companyId = localStorage.getItem("selectedCompanyId");
//   const financialYear = localStorage.getItem("financialYear");

//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost:8080/api/projects?companyId=${companyId}&financialYear=${financialYear}`);
//       const data = await response.json();
//       setProjects(data);
//       setError('');
//     } catch (err) {
//       setError('Failed to load projects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchFaculties = async () => {
//     try {
//       const companyId = localStorage.getItem('selectedCompanyId');
//       const financialYear = localStorage.getItem('financialYear');
//       const response = await axios.get("http://localhost:8080/api/faculties", {
//         params: { companyId, financialYear }
//       });
//       setFaculties(response.data);
//       console.log("Fetched faculties:", response.data);
//     } catch (error) {
//       console.error("Error fetching faculties:", error);
//     }
//   };

//   useEffect(() => {
//     fetchFaculties();
//   }, []);

//   // Filter employees based on search term
//   const filteredEmployees = faculties.filter(employee => 
//     `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
//     employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
//     employee.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
//   );

//   const handleAdd = () => {
//     setEditingProject(null);
//     setSelectedTeamMembers([]);
//     setFormData({
//       projectName: '',
//       description: '',
//       clientName: '',
//       startDate: '',
//       endDate: '',
//       budget: '',
//       status: 'Planning',
//       priority: 'Medium',
//       projectManager: '',
//       projectManagerId: '',
//       teamMembers: '',
//       teamMemberIds: [],
//       technologies: '',
//       category: ''
//     });
//     setShowModal(true);
//   };

//   const handleEdit = (project) => {
//     setEditingProject(project);
    
//     // Find team members from faculties
//     const teamMemberObjects = project.teamMemberIds?.map(id => 
//       faculties.find(emp => emp._id === id)
//     ).filter(Boolean) || [];
    
//     setSelectedTeamMembers(teamMemberObjects);
    
//     setFormData({
//       projectName: project.projectName,
//       description: project.description,
//       clientName: project.clientName,
//       startDate: project.startDate ? project.startDate.split('T')[0] : '',
//       endDate: project.endDate ? project.endDate.split('T')[0] : '',
//       budget: project.budget,
//       status: project.status,
//       priority: project.priority,
//       projectManager: project.projectManager,
//       projectManagerId: project.projectManagerId || '',
//       teamMembers: teamMemberObjects.map(member => `${member.firstName} ${member.lastName}`).join(', '),
//       teamMemberIds: project.teamMemberIds || [],
//       technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
//       category: project.category
//     });
//     setShowModal(true);
//   };

//   const openEmployeeModal = (type) => {
//     setEmployeeModalType(type);
//     setEmployeeSearchTerm('');
//     setShowEmployeeModal(true);
//   };

//   const closeEmployeeModal = () => {
//     setShowEmployeeModal(false);
//     setEmployeeModalType('');
//     setEmployeeSearchTerm('');
//   };

//   const handleSelectProjectManager = (employee) => {
//     setFormData({
//       ...formData,
//       projectManager: `${employee.firstName} ${employee.lastName}`,
//       projectManagerId: employee._id
//     });
//     closeEmployeeModal();
//   };

//   const handleSelectTeamMember = (employee) => {
//     const isAlreadySelected = selectedTeamMembers.some(member => member._id === employee._id);
    
//     if (!isAlreadySelected) {
//       const updatedTeamMembers = [...selectedTeamMembers, employee];
//       setSelectedTeamMembers(updatedTeamMembers);
      
//       setFormData({
//         ...formData,
//         teamMembers: updatedTeamMembers.map(member => `${member.firstName} ${member.lastName}`).join(', '),
//         teamMemberIds: updatedTeamMembers.map(member => member._id)
//       });
//     }
//   };

//   const removeTeamMember = (employeeId) => {
//     const updatedTeamMembers = selectedTeamMembers.filter(member => member._id !== employeeId);
//     setSelectedTeamMembers(updatedTeamMembers);
    
//     setFormData({
//       ...formData,
//       teamMembers: updatedTeamMembers.map(member => `${member.firstName} ${member.lastName}`).join(', '),
//       teamMemberIds: updatedTeamMembers.map(member => member._id)
//     });
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     try {
//       const url = editingProject 
//         ? `http://localhost:8080/api/projects/${editingProject._id}`
//         : 'http://localhost:8080/api/projects';
      
//       const method = editingProject ? 'PUT' : 'POST';
      
//       const projectData = {
//         ...formData,
//         technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
//         companyId,
//         financialYear
//       };
      
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(projectData)
//       });

//       if (response.ok) {
//         await loadProjects();
//         setShowModal(false);
//         setSelectedTeamMembers([]);
//         setError('');
//       } else {
//         setError('Failed to save project');
//       }
//     } catch (err) {
//       setError('Failed to save project');
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this project?')) {
//       try {
//         const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
//           method: 'DELETE'
//         });

//         if (response.ok) {
//           await loadProjects();
//           setError('');
//         } else {
//           setError('Failed to delete project');
//         }
//       } catch (err) {
//         setError('Failed to delete project');
//       }
//     }
//   };

//   const getStatusBadgeClass = (status) => {
//     const badges = {
//       'Planning': 'bg-info',
//       'In Progress': 'bg-primary',
//       'Testing': 'bg-warning',
//       'Completed': 'bg-success',
//       'On Hold': 'bg-secondary',
//       'Cancelled': 'bg-danger'
//     };
//     return badges[status] || 'bg-secondary';
//   };

//   const getPriorityBadgeClass = (priority) => {
//     const badges = {
//       'Low': 'bg-success',
//       'Medium': 'bg-warning',
//       'High': 'bg-danger',
//       'Critical': 'bg-dark'
//     };
//     return badges[priority] || 'bg-secondary';
//   };

//   const calculateProgress = (startDate, endDate) => {
//     if (!startDate || !endDate) return 0;
    
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const now = new Date();
    
//     if (now < start) return 0;
//     if (now > end) return 100;
    
//     const total = end - start;
//     const elapsed = now - start;
//     return Math.round((elapsed / total) * 100);
//   };

//   return (
//     <div className="container-fluid py-4">
//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-header d-flex justify-content-between align-items-center">
//               <h4 className="card-title mb-0">
//                 <i className="fas fa-project-diagram me-2"></i>Projects Management
//               </h4>
//               <button 
//                 className="btn btn-primary"
//                 onClick={handleAdd}
//               >
//                 <i className="fas fa-plus me-2"></i>Add Project
//               </button>
//             </div>
            
//             <div className="card-body">
//               {error && (
//                 <div className="alert alert-danger" role="alert">
//                   {error}
//                 </div>
//               )}

//               {loading ? (
//                 <div className="text-center">
//                   <div className="spinner-border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="table-responsive">
//                   <table className="table table-striped table-hover">
//                     <thead className="table-dark">
//                       <tr>
//                         <th>Project Name</th>
//                         <th>Client</th>
//                         <th>Status</th>
//                         <th>Priority</th>
//                         <th>Progress</th>
//                         <th>Budget</th>
//                         <th>Start Date</th>
//                         <th>End Date</th>
//                         <th>Project Manager</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {projects.map((project) => (
//                         <tr key={project._id}>
//                           <td>
//                             <div>
//                               <strong>{project.projectName}</strong>
//                               {project.category && (
//                                 <div className="text-muted small">{project.category}</div>
//                               )}
//                             </div>
//                           </td>
//                           <td>{project.clientName}</td>
//                           <td>
//                             <span className={`badge ${getStatusBadgeClass(project.status)}`}>
//                               {project.status}
//                             </span>
//                           </td>
//                           <td>
//                             <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
//                               {project.priority}
//                             </span>
//                           </td>
//                           <td>
//                             <div className="progress" style={{height: '20px'}}>
//                               <div 
//                                 className="progress-bar bg-success" 
//                                 role="progressbar" 
//                                 style={{width: `${calculateProgress(project.startDate, project.endDate)}%`}}
//                               >
//                                 {calculateProgress(project.startDate, project.endDate)}%
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A'}
//                           </td>
//                           <td>
//                             {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
//                           </td>
//                           <td>
//                             {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
//                           </td>
//                           <td>{project.projectManager}</td>
//                           <td>
//                             <button 
//                               className="btn btn-sm btn-outline-primary me-2"
//                               onClick={() => handleEdit(project)}
//                             >
//                               <i className="fas fa-edit"></i>
//                             </button>
//                             <button 
//                               className="btn btn-sm btn-outline-danger"
//                               onClick={() => handleDelete(project._id)}
//                             >
//                               <i className="fas fa-trash"></i>
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Project Modal */}
//       {showModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {editingProject ? 'Edit Project' : 'Add Project'}
//                 </h5>
//                 <button 
//                   type="button" 
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <form onSubmit={handleSave}>
//                 <div className="modal-body">
//                   <div className="row">
//                     <div className="col-md-6">
//                       <div className="mb-3">
//                         <label className="form-label">Project Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={formData.projectName}
//                           onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-6">
//                       <div className="mb-3">
//                         <label className="form-label">Client Name</label>
//                         <input
//                           type="text"
//                           className="form-control"
//                           value={formData.clientName}
//                           onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="mb-3">
//                     <label className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       rows="3"
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     ></textarea>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Status</label>
//                         <select
//                           className="form-select"
//                           value={formData.status}
//                           onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                           required
//                         >
//                           {statuses.map((status) => (
//                             <option key={status} value={status}>{status}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Priority</label>
//                         <select
//                           className="form-select"
//                           value={formData.priority}
//                           onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                           required
//                         >
//                           {priorities.map((priority) => (
//                             <option key={priority} value={priority}>{priority}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Category</label>
//                         <select
//                           className="form-select"
//                           value={formData.category}
//                           onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                         >
//                           <option value="">Select Category</option>
//                           {categories.map((category) => (
//                             <option key={category} value={category}>{category}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="row">
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Start Date</label>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={formData.startDate}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">End Date</label>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={formData.endDate}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-4">
//                       <div className="mb-3">
//                         <label className="form-label">Budget ($)</label>
//                         <input
//                           type="number"
//                           className="form-control"
//                           value={formData.budget}
//                           onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Project Manager Field with Search */}
//                   <div className="mb-3">
//                     <label className="form-label">Project Manager</label>
//                     <div className="input-group">
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={formData.projectManager}
//                         onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
//                         placeholder="Search and select project manager"
                       
//                       />
//                       <button 
//                         type="button" 
//                         className="btn btn-outline-secondary"
//                         onClick={() => openEmployeeModal('manager')}
//                       >
//                         <i className="fas fa-search"></i>
//                       </button>
//                     </div>
//                   </div>

//                   {/* Team Members Field with Search */}
//                   <div className="mb-3">
//                     <label className="form-label">Team Members</label>
//                     <div className="input-group">
//                       <input
//                         type="text"
//                         className="form-control"
//                         value={formData.teamMembers}
//                         placeholder="Search and select team members"
//                         readOnly
//                       />
//                       <button 
//                         type="button" 
//                         className="btn btn-outline-secondary"
//                         onClick={() => openEmployeeModal('team')}
//                       >
//                         <i className="fas fa-search"></i>
//                       </button>
//                     </div>
                    
//                     {/* Selected Team Members Display */}
//                     {selectedTeamMembers.length > 0 && (
//                       <div className="mt-2">
//                         <small className="text-muted">Selected team members:</small>
//                         <div className="d-flex flex-wrap gap-2 mt-1">
//                           {selectedTeamMembers.map((member) => (
//                             <span key={member._id} className="badge bg-primary d-flex align-items-center">
//                               {member.firstName} {member.lastName}
//                               <button
//                                 type="button"
//                                 className="btn-close btn-close-white ms-2"
//                                 style={{fontSize: '0.75rem'}}
//                                 onClick={() => removeTeamMember(member._id)}
//                               ></button>
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Technologies (comma-separated)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={formData.technologies}
//                       onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
//                       placeholder="React, Node.js, MongoDB"
//                     />
//                   </div>
//                 </div>
//                 <div className="modal-footer">
//                   <button 
//                     type="button" 
//                     className="btn btn-secondary"
//                     onClick={() => setShowModal(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     {editingProject ? 'Update' : 'Create'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Employee Selection Modal */}
//       {showEmployeeModal && (
//         <>
//           <div className="modal-backdrop fade show"></div>
//           <div
//             className="modal fade show"
//             style={{ display: "block" }}
//             tabIndex="-1"
//             aria-modal="true"
//             role="dialog"
//           >
//             <div className="modal-dialog modal-lg">
//               <div className="modal-content">
//                 <div className="modal-header">
//                   <h4 className="modal-title">
//                     Select {employeeModalType === 'manager' ? 'Project Manager' : 'Team Members'}
//                   </h4>
//                   <button
//                     type="button"
//                     className="btn-close"
//                     onClick={closeEmployeeModal}
//                     aria-label="Close"
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   {/* Search Input */}
//                   <div className="mb-3">
//                     <div className="input-group">
//                       <span className="input-group-text">
//                         <i className="fas fa-search"></i>
//                       </span>
//                       <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Search by name, email, or employee ID..."
//                         value={employeeSearchTerm}
//                         onChange={(e) => setEmployeeSearchTerm(e.target.value)}
//                       />
//                     </div>
//                   </div>

//                   {/* Employee List */}
//                   <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//                     {filteredEmployees.length > 0 ? (
//                       <div className="list-group">
//                         {filteredEmployees.map((employee) => (
//                           <div
//                             key={employee._id}
//                             className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
//                               selectedTeamMembers.some(member => member._id === employee._id) ? 'active' : ''
//                             }`}
//                             onClick={() => {
//                               if (employeeModalType === 'manager') {
//                                 handleSelectProjectManager(employee);
//                               } else {
//                                 handleSelectTeamMember(employee);
//                               }
//                             }}
//                             style={{ cursor: 'pointer' }}
//                           >
//                             <div className="d-flex align-items-center">
//                               <div className="me-3">
//                                 {employee.profilePhoto ? (
//                                   <img
//                                     src={`http://localhost:8080${employee.profilePhoto}`}
//                                     alt="Profile"
//                                     className="rounded-circle"
//                                     style={{ width: '40px', height: '40px', objectFit: 'cover' }}
//                                   />
//                                 ) : (
//                                   <div 
//                                     className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
//                                     style={{ width: '40px', height: '40px' }}
//                                   >
//                                     {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
//                                   </div>
//                                 )}
//                               </div>
//                               <div>
//                                 <h6 className="mb-0">{employee.firstName} {employee.lastName}</h6>
//                                 <small className="text-muted">
//                                   {employee.employeeId} • {employee.email} • {employee.department}
//                                 </small>
//                               </div>
//                             </div>
//                             {selectedTeamMembers.some(member => member._id === employee._id) && (
//                               <i className="fas fa-check text-success"></i>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-4">
//                         <i className="fas fa-users fa-3x text-muted mb-3"></i>
//                         <p className="text-muted">
//                           {employeeSearchTerm ? 'No employees found matching your search.' : 'No employees available.'}
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   {employeeModalType === 'team' && selectedTeamMembers.length > 0 && (
//                     <div className="mt-3">
//                       <small className="text-muted">
//                         Selected: {selectedTeamMembers.length} member(s)
//                       </small>
//                     </div>
//                   )}
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={closeEmployeeModal}
//                   >
//                     {employeeModalType === 'team' ? 'Done' : 'Cancel'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Projects;


import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [faculties, setFaculties] = useState([]);
  
  // Employee selection modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeModalType, setEmployeeModalType] = useState(''); // 'manager' or 'team'
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedProjectManager, setSelectedProjectManager] = useState(null);
  
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: 'Planning',
    priority: 'Medium',
    projectManager: [], // Array of project manager details
    teamMembers: [], // Array of team member details
    technologies: '',
    category: ''
  });

  const statuses = ['Planning', 'In Progress', 'Testing', 'Completed', 'On Hold', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const categories = ['Web Development', 'Mobile App', 'Desktop App', 'API Development', 'Data Analysis', 'Other'];

  // Get required localStorage values
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/projects?companyId=${companyId}&financialYear=${financialYear}`);
      const data = await response.json();
      setProjects(data);
      setError('');
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const companyId = localStorage.getItem('selectedCompanyId');
      const financialYear = localStorage.getItem('financialYear');
      const response = await axios.get("http://localhost:8080/api/faculties", {
        params: { companyId, financialYear }
      });
      setFaculties(response.data);
      console.log("Fetched faculties:", response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = faculties.filter(employee => 
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.employeeId?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProject(null);
    setSelectedTeamMembers([]);
    setSelectedProjectManager(null);
    setFormData({
      projectName: '',
      description: '',
      clientName: '',
      startDate: '',
      endDate: '',
      budget: '',
      status: 'Planning',
      priority: 'Medium',
      projectManager: [],
      teamMembers: [],
      technologies: '',
      category: ''
    });
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    
    // Set project manager
    const projectManagerData = project.projectManager || [];
    setSelectedProjectManager(projectManagerData.length > 0 ? projectManagerData[0] : null);
    
    // Set team members
    const teamMembersData = project.teamMembers || [];
    setSelectedTeamMembers(teamMembersData);
    
    setFormData({
      projectName: project.projectName,
      description: project.description,
      clientName: project.clientName,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      budget: project.budget,
      status: project.status,
      priority: project.priority,
      projectManager: projectManagerData,
      teamMembers: teamMembersData,
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies || '',
      category: project.category
    });
    setShowModal(true);
  };

  const openEmployeeModal = (type) => {
    setEmployeeModalType(type);
    setEmployeeSearchTerm('');
    setShowEmployeeModal(true);
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEmployeeModalType('');
    setEmployeeSearchTerm('');
  };

  const handleSelectProjectManager = (employee) => {
    const managerData = {
      _id: employee._id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      employeeId: employee.employeeId,
      department: employee.department,
      profilePhoto: employee.profilePhoto
    };
    
    setSelectedProjectManager(managerData);
    setFormData({
      ...formData,
      projectManager: [managerData]
    });
    closeEmployeeModal();
  };

  const handleSelectTeamMember = (employee) => {
    const isAlreadySelected = selectedTeamMembers.some(member => member._id === employee._id);
    
    if (!isAlreadySelected) {
      const memberData = {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department,
        profilePhoto: employee.profilePhoto
      };
      
      const updatedTeamMembers = [...selectedTeamMembers, memberData];
      setSelectedTeamMembers(updatedTeamMembers);
      
      setFormData({
        ...formData,
        teamMembers: updatedTeamMembers
      });
    }
  };

  const removeTeamMember = (employeeId) => {
    const updatedTeamMembers = selectedTeamMembers.filter(member => member._id !== employeeId);
    setSelectedTeamMembers(updatedTeamMembers);
    
    setFormData({
      ...formData,
      teamMembers: updatedTeamMembers
    });
  };

  const removeProjectManager = () => {
    setSelectedProjectManager(null);
    setFormData({
      ...formData,
      projectManager: []
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingProject 
        ? `http://localhost:8080/api/projects/${editingProject._id}`
        : 'http://localhost:8080/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
        companyId,
        financialYear
      };
      
      console.log('Sending project data:', projectData); // Debug log
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        await loadProjects();
        setShowModal(false);
        setSelectedTeamMembers([]);
        setSelectedProjectManager(null);
        setError('');
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      setError('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await loadProjects();
          setError('');
        } else {
          setError('Failed to delete project');
        }
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      'Planning': 'bg-info',
      'In Progress': 'bg-primary',
      'Testing': 'bg-warning',
      'Completed': 'bg-success',
      'On Hold': 'bg-secondary',
      'Cancelled': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getPriorityBadgeClass = (priority) => {
    const badges = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-dark'
    };
    return badges[priority] || 'bg-secondary';
  };

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">
                <i className="fas fa-project-diagram me-2"></i>Projects Management
              </h4>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="fas fa-plus me-2"></i>Add Project
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th>Project Name</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Progress</th>
                        <th>Budget</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Project Manager</th>
                        <th>Team Size</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id}>
                          <td>
                            <div>
                              <strong>{project.projectName}</strong>
                              {project.category && (
                                <div className="text-muted small">{project.category}</div>
                              )}
                            </div>
                          </td>
                          <td>{project.clientName}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
                              {project.priority}
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{height: '20px'}}>
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{width: `${calculateProgress(project.startDate, project.endDate)}%`}}
                              >
                                {calculateProgress(project.startDate, project.endDate)}%
                              </div>
                            </div>
                          </td>
                          <td>
                            {project.budget ? `$${Number(project.budget).toLocaleString()}` : 'N/A'}
                          </td>
                          <td>
                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            {project.projectManager && project.projectManager.length > 0 
                              ? `${project.projectManager[0].firstName} ${project.projectManager[0].lastName}`
                              : 'Not assigned'
                            }
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {project.teamMembers ? project.teamMembers.length : 0} members
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleEdit(project)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(project._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Project Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProject ? 'Edit Project' : 'Add Project'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Project Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.projectName}
                          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Client Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Priority</label>
                        <select
                          className="form-select"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          required
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Budget ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Manager Field */}
                  <div className="mb-3">
                    <label className="form-label">Project Manager</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProjectManager ? `${selectedProjectManager.firstName} ${selectedProjectManager.lastName}` : ''}
                        placeholder="Select project manager"
                      
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => openEmployeeModal('manager')}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                    
                    {/* Selected Project Manager Display */}
                    {selectedProjectManager && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center p-2 bg-light rounded">
                          <div className="me-2">
                           
                              <div 
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: '30px', height: '30px', fontSize: '12px' }}
                              >
                                {selectedProjectManager.firstName?.charAt(0)}{selectedProjectManager.lastName?.charAt(0)}
                              </div>
                            
                          </div>
                          <div className="flex-grow-1">
                            <strong>{selectedProjectManager.firstName} {selectedProjectManager.lastName}</strong>
                            <div className="text-muted small">
                              {selectedProjectManager.employeeId} • {selectedProjectManager.department}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeProjectManager}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Team Members Field */}
                  <div className="mb-3">
                    <label className="form-label">Team Members</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={selectedTeamMembers.length > 0 ? `${selectedTeamMembers.length} members selected` : ''}
                        placeholder="Select team members"
                        readOnly
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => openEmployeeModal('team')}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                    
                    {/* Selected Team Members Display */}
                    {selectedTeamMembers.length > 0 && (
                      <div className="mt-2">
                        <small className="text-muted">Selected team members:</small>
                        <div className="row mt-2">
                          {selectedTeamMembers.map((member) => (
                            <div key={member._id} className="col-md-6 mb-2">
                              <div className="d-flex align-items-center p-2 bg-light rounded">
                                <div className="me-2">
                                  
                                    <div 
                                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                      style={{ width: '30px', height: '30px', fontSize: '12px' }}
                                    >
                                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                                    </div>
                                  
                                </div>
                                <div className="flex-grow-1">
                                  <strong className="small">{member.firstName} {member.lastName}</strong>
                                  <div className="text-muted" style={{fontSize: '11px'}}>
                                    {member.employeeId}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeTeamMember(member._id)}
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Technologies (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.technologies}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProject ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Employee Selection Modal */}
      {showEmployeeModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">
                    Select {employeeModalType === 'manager' ? 'Project Manager' : 'Team Members'}
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeEmployeeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {/* Search Input */}
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, or employee ID..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Employee List */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {filteredEmployees.length > 0 ? (
                      <div className="list-group">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee._id}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                              (employeeModalType === 'team' && selectedTeamMembers.some(member => member._id === employee._id)) ||
                              (employeeModalType === 'manager' && selectedProjectManager?._id === employee._id)
                                ? 'active' : ''
                            }`}
                            onClick={() => {
                              if (employeeModalType === 'manager') {
                                handleSelectProjectManager(employee);
                              } else {
                                handleSelectTeamMember(employee);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                               
                                  <div 
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                    style={{ width: '40px', height: '40px' }}
                                  >
                                    {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                                  </div>
                              
                              </div>
                              <div>
                                <h6 className="mb-0">{employee.firstName} {employee.lastName}</h6>
                                <small className="text-muted">
                                  {employee.employeeId} • {employee.email} • {employee.department}
                                </small>
                              </div>
                            </div>
                            {((employeeModalType === 'team' && selectedTeamMembers.some(member => member._id === employee._id)) ||
                              (employeeModalType === 'manager' && selectedProjectManager?._id === employee._id)) && (
                              <i className="fas fa-check text-success"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-users fa-3x text-muted mb-3"></i>
                        <p className="text-muted">
                          {employeeSearchTerm ? 'No employees found matching your search.' : 'No employees available.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {employeeModalType === 'team' && selectedTeamMembers.length > 0 && (
                    <div className="mt-3">
                      <small className="text-muted">
                        Selected: {selectedTeamMembers.length} member(s)
                      </small>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEmployeeModal}
                  >
                    {employeeModalType === 'team' ? 'Done' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;