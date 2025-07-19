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

  await axios.post('http://localhost:8080/api/companies/create', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  alert('Company added!');
  setFormData({
    name: '',
    address: '',
    pincode: '',
    country: '',
    phone: '',
    email: ''
  });
  setLogoFile(null);
};

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 space-y-3">
      <h2 className="font-bold mb-2">Create Company</h2>

      {[
        { label: 'Company Name', name: 'name' },
        { label: 'Address', name: 'address' },
        { label: 'Pincode', name: 'pincode' },
        { label: 'Country', name: 'country' },
        { label: 'Phone', name: 'phone' },
        { label: 'Email', name: 'email', type: 'email' },
      ].map(({ label, name, type = 'text' }) => (
        <div key={name}>
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={label}
            className="border p-2 w-full"
            required={name === 'name'}
          />
        </div>
      ))}
<input type="file" accept="image/*" onChange={handleFileChange} className="border p-2 w-full" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Company
      </button>
    </form>
  );
};

export default CompanyForm;
