


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     phone: '',
//     address: '',
//     password: '',
//     companies: [],
//     roles: [] // <- Only _id values here
//   });

//   const [allCompanies, setAllCompanies] = useState([]);
//   const [allRoles, setAllRoles] = useState([]);

//   useEffect(() => {
//     axios.get('http://localhost:8080/api/companies')
//       .then(res => setAllCompanies(res.data));

//     axios.get('http://localhost:8080/api/roles')
//       .then(res => setAllRoles(res.data));
//   }, []);

//   const addCompanyField = () => {
//     setFormData({
//       ...formData,
//       companies: [...formData.companies, { companyId: '' }]
//     });
//   };

// const handleCompanyChange = (idx, selectedIds) => {
//   const updatedCompanies = [...formData.companies];
//   updatedCompanies[idx].companyIds = selectedIds;
//   setFormData({ ...formData, companies: updatedCompanies });
// };

//   const handleRoleToggle = (roleId) => {
//     const exists = formData.roles.includes(roleId);
//     const updatedRoles = exists
//       ? formData.roles.filter(id => id !== roleId)
//       : [...formData.roles, roleId];
//     setFormData({ ...formData, roles: updatedRoles });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await axios.post('http://localhost:8080/api/users/create', formData);
//     alert('User created!');
//     setFormData({
//       username: '',
//       email: '',
//       phone: '',
//       address: '',
//       password: '',
//       companies: [],
//       roles: []
//     });
//   };

//   const isRoleSelected = (roleId) => formData.roles.includes(roleId);

//   return (
//     <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
//       <h2 className="font-bold mb-2">Create User</h2>

//       <input
//         type="text"
//         placeholder="Username"
//         className="border p-2 w-full mb-2"
//         value={formData.username}
//         onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//         required
//       />

//       <input
//         type="email"
//         placeholder="Email"
//         className="border p-2 w-full mb-2"
//         value={formData.email}
//         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//         required
//       />

//       <input
//         type="text"
//         placeholder="Phone"
//         className="border p-2 w-full mb-2"
//         value={formData.phone}
//         onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//         required
//       />

//       <input
//         type="text"
//         placeholder="Address"
//         className="border p-2 w-full mb-2"
//         value={formData.address}
//         onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//         required
//       />

//       <input
//         type="password"
//         placeholder="Password"
//         className="border p-2 w-full mb-2"
//         value={formData.password}
//         onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//         required
//       />

//       <button
//         type="button"
//         onClick={addCompanyField}
//         className="bg-gray-600 text-white px-3 py-1 rounded mb-2"
//       >
//         + Add Company Access
//       </button>

//   <label className="block font-medium mb-1">Select Companies</label>
// <select
//   multiple
//   className="border p-2 w-full mb-3"
//   value={formData.companies}
//   onChange={(e) =>
//     setFormData({
//       ...formData,
//       companies: Array.from(e.target.selectedOptions, option => option.value)
//     })
//   }
//   required
// >
//   {allCompanies.map((c) => (
//     <option key={c._id} value={c._id}>
//       {c.name}
//     </option>
//   ))}
// </select>


//       <h3 className="font-semibold mt-4 mb-2">Assign Roles:</h3>
//       <div className="grid grid-cols-2 gap-2">
//         {allRoles.map((role) => (
//           <label key={role._id} className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={isRoleSelected(role._id)}
//               onChange={() => handleRoleToggle(role._id)}
//             />
//             <span>{role.roleName} ({role.roleId})</span>
//           </label>
//         ))}
//       </div>

//       <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded mt-4">
//         Create User
//       </button>
//     </form>
//   );
// };

// export default Register;




import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    companies: [],
    roles: [] // <- Only _id values here
  });

  const [allCompanies, setAllCompanies] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, rolesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/companies'),
          axios.get('http://localhost:8080/api/roles')
        ]);
        setAllCompanies(companiesRes.data);
        setAllRoles(rolesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading companies and roles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRoleToggle = (roleId) => {
    const exists = formData.roles.includes(roleId);
    const updatedRoles = exists
      ? formData.roles.filter(id => id !== roleId)
      : [...formData.roles, roleId];
    setFormData({ ...formData, roles: updatedRoles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/users/create', formData);
      alert('User created successfully!');
      setFormData({
        username: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        companies: [],
        roles: []
      });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const isRoleSelected = (roleId) => formData.roles.includes(roleId);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading form data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Create New User
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information Section */}
                <div className="row">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <i className="fas fa-user me-2"></i>
                      Basic Information
                    </h5>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      placeholder="Enter username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
             
                  <div className="col-md-3 mb-3">
                    <label htmlFor="phone" className="form-label">
                      <i className="fas fa-phone me-2"></i>
                      Phone <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => {
                        // Validate phone number format if needed
                        const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        // Only allow if first digit is 6, 7, 8, or 9
                        if (cleaned.length === 0 || /^[6-9]/.test(cleaned)) {
                          handleInputChange('phone', cleaned);
                        }     
                      }}
                       
                      required
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label htmlFor="address" className="form-label">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="address"
                    className="form-control"
                    rows="3"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  ></textarea>
                </div>


                <div className="mb-4">
                  <label htmlFor="companies" className="form-label">
                    <i className="fas fa-building me-2"></i>
                    Select Companies <span className="text-danger">*</span>
                  </label>
                  <select
                    id="companies"
                    multiple
                    className="form-select"
                    style={{ minHeight: '120px' }}
                    value={formData.companies}
                    onChange={(e) =>
                      handleInputChange('companies', Array.from(e.target.selectedOptions, option => option.value))
                    }
                    required
                  >
                    {allCompanies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Hold Ctrl (Cmd on Mac) to select multiple companies
                  </div>
                </div>

        

                {/* Roles Section */}
                <div className="row">
                  <div className="col-12">
                    <h5 className="text-primary mb-2">
                      <i className="fas fa-users-cog me-2"></i>
                      Assign Roles
                    </h5>
                  </div>
                </div>

                <div className="row">
                  {allRoles.map((role) => (
                    <div key={role._id} className="col-md-6 col-lg-4 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`role-${role._id}`}
                          checked={isRoleSelected(role._id)}
                          onChange={() => handleRoleToggle(role._id)}
                        />
                        <label className="form-check-label" htmlFor={`role-${role._id}`}>
                          <strong>{role.roleName}</strong>
                          <br />
                          <small className="text-muted">({role.roleId})</small>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-success btn-lg">
                    <i className="fas fa-user-plus me-2"></i>
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>

      
        </div>
      </div>
    </div>
  );
};

export default Register;