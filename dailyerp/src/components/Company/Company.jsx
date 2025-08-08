// import React, { useState } from 'react';
// import axios from 'axios';

// const CompanyForm = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     address: '',
//     pincode: '',
//     country: '',
//     phone: '',
//     email: ''
//   });

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const [logoFile, setLogoFile] = useState(null);

//   const handleFileChange = (e) => {
//     setLogoFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const form = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       form.append(key, value);
//     });
//     if (logoFile) {
//       form.append('logo', logoFile);
//     }

//     await axios.post('http://localhost:8080/api/companies/create', form, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     });

//     alert('Company added!');
//     setFormData({
//       name: '',
//       address: '',
//       pincode: '',
//       country: '',
//       phone: '',
//       email: ''
//     });
//     setLogoFile(null);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 space-y-3">
//       <h2 className="font-bold mb-2">Create Company</h2>

//       {[
//         { label: 'Company Name', name: 'name' },
//         { label: 'Address', name: 'address' },
//         { label: 'Pincode', name: 'pincode' },
//         { label: 'Country', name: 'country' },
//         { label: 'Phone', name: 'phone' },
//         { label: 'Email', name: 'email', type: 'email' },
//       ].map(({ label, name, type = 'text' }) => (
//         <div key={name}>
//           <input
//             type={type}
//             name={name}
//             value={formData[name]}
//             onChange={handleChange}
//             placeholder={label}
//             className="border p-2 w-full"
//             required={name === 'name'}
//           />
//         </div>
//       ))}
//       <input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 w-full" />

//       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//         Add Company
//       </button>
//     </form>
//   );
// };

// export default CompanyForm;



import React, { useState } from 'react';
import axios from 'axios';

const CompanyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pincode: '',
    country: '',
    phone: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const [logoFile, setLogoFile] = useState(null);

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    if (logoFile) {
      form.append('logo', logoFile);
    }

    try {
      await axios.post('http://localhost:8080/api/companies/create', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Company added successfully!');
      setFormData({
        name: '',
        address: '',
        pincode: '',
        country: '',
        phone: '',
        email: ''
      });
      setLogoFile(null);
      // Reset file input
      document.getElementById('logoInput').value = '';
    } catch (error) {
      alert('Error adding company. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="content">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-building me-2"></i>
                Create Company
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {[
                    { label: 'Company Name', name: 'name', icon: 'fas fa-building' },
                    { label: 'Address', name: 'address', icon: 'fas fa-map-marker-alt' },
                    { label: 'Pincode', name: 'pincode', icon: 'fas fa-map-pin' },
                    { label: 'Country', name: 'country', icon: 'fas fa-globe' },
                    { label: 'Phone', name: 'phone', icon: 'fas fa-phone' },
                    { label: 'Email', name: 'email', type: 'email', icon: 'fas fa-envelope' },
                  ].map(({ label, name, type = 'text', icon }) => (
                    <div className="col-xl-4 mb-3" key={name}>
                      <label htmlFor={name} className="form-label">
                        <i className={`${icon} me-2`}></i>
                        {label}
                        {name === 'name' && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="form-control"
                        required={name === 'name'}
                      />
                    </div>
                  ))}

                  <div className="mb-4">
                    <label htmlFor="logoInput" className="form-label">
                      <i className="fas fa-image me-2"></i>
                      Company Logo
                    </label>
                    <input
                      type="file"
                      id="logoInput"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="form-control form-control-sm"
                    />
                    <div className="form-text">
                      Upload your company logo (PNG, JPG, or GIF format)
                    </div>
                  </div>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary btn-lg">
                      <i className="fas fa-plus me-2"></i>
                      Add Company
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;