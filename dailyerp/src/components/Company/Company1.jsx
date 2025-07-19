import React, { useState } from 'react';
import axios from 'axios';

const CompanyForm = () => {
  const [name, setName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:8080/api/companies/create', { name });
    alert('Company added!');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
      <h2 className="font-bold mb-2">Create Company</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company Name"
        className="border p-2 w-full mb-2"
        required
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Company
      </button>
    </form>
  );
};

export default CompanyForm;
