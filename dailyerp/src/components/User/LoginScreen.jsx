// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// const LoginScreen = ({ onOpen }) => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [loginDate, setLoginDate] = useState('');
//   const [financialYears, setFinancialYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState('');
// const navigate = useNavigate();
//   // ✅ Get userId from localStorage
// const userId = JSON.parse(localStorage.getItem('user'))?.id;
//     console.log('Fetching companies for user ID:', userId);

//   useEffect(() => {
//     if (!userId) return;


//     axios.get(`http://localhost:8080/api/users/${userId}/companies`)
//       .then(res => {
//         setCompanies(res.data);
//         if (res.data.length > 0) setSelectedCompany(res.data[0]._id);
//       });

//     const years = [];
//     const now = new Date();
//     const current = now.getFullYear();
//     for (let y = 2017; y <= current + 1; y++) {
//       years.push(`01/04/${y} - 31/03/${y + 1}`);
//     }
//     setFinancialYears(years.reverse());
//   }, [userId]);

//   const handleSubmit = () => {
//     if (!selectedCompany || !loginDate || !selectedYear) {
//       return alert('Please select all fields');
//     }
//     onOpen?.({ companyId: selectedCompany, loginDate, financialYear: selectedYear });
//     navigate('/Dashboard'); // Redirect to Dashboard after opening transaction
//   };

//   return (
//     <div className="border p-4 rounded max-w-lg mx-auto mt-10 bg-white shadow">
//       <h2 className="text-xl font-bold mb-4">Open Transaction</h2>

//       <label className="block mb-2">Login Date</label>
//       <input
//         type="date"
//         className="border p-2 w-full mb-4"
//         value={loginDate}
//         onChange={(e) => setLoginDate(e.target.value)}
//       />

//       <label className="block mb-2">Company</label>
//       <select
//         className="border p-2 w-full mb-4"
//         value={selectedCompany}
//         onChange={(e) => setSelectedCompany(e.target.value)}
//       >
//         {companies.map((c) => (
//           <option key={c._id} value={c._id}>
//             {c.name}
//           </option>
//         ))}
//       </select>

//       <label className="block mb-2">Transaction Period</label>
//       <select
//         className="border p-2 w-full mb-4"
//         value={selectedYear}
//         onChange={(e) => setSelectedYear(e.target.value)}
//       >
//         <option value="">Select</option>
//         {financialYears.map((fy, idx) => (
//           <option key={idx} value={fy}>
//             {fy}
//           </option>
//         ))}
//       </select>

//       <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
//         Open
//       </button>
//     </div>
//   );
// };

// export default LoginScreen;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginScreen = ({ onOpen }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loginDate, setLoginDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  });

  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Get userId from localStorage
  const userId = JSON.parse(localStorage.getItem('user'))?.id;
  console.log('User ID from localStorage:', localStorage.getItem('user'));
  console.log('Fetching companies for user ID:', userId);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    axios.get(`http://localhost:8080/api/users/${userId}/companies`)
      .then(res => {
        setCompanies(res.data);
        if (res.data.length > 0) setSelectedCompany(res.data[0]._id);
      })
      .catch(err => {
        console.error('Error fetching companies:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    const years = [];
    const now = new Date();
    const current = now.getFullYear();
    for (let y = 2020; y <= current; y++) {
      years.push(`01/04/${y} - 31/03/${y + 1}`);
    }
    setFinancialYears(years.reverse());
  }, [userId]);

  const handleSubmit = () => {
    if (!selectedCompany || !loginDate || !selectedYear) {
      return alert('Please select all fields');
    }
    localStorage.setItem('selectedCompanyId', selectedCompany);

    localStorage.setItem('financialYear', selectedYear);
    console.log("financial", localStorage.getItem('financialYear'))
    console.log("company", localStorage.getItem('selectedCompanyId'))
    onOpen?.({ companyId: selectedCompany, financialYear: selectedYear });
    navigate('/');
  };

  return (
    <>



      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      >
        <div className="row w-100">
          <div className="col-12 col-md-6 col-lg-4 mx-auto">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center py-4">
                <h3 className="mb-0">

                </h3>
              </div>

              <div className="card-body p-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading companies...</p>
                  </div>
                ) : (
                  <form>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="ti ti-building me-2 text-primary"></i>
                        Company
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        required
                      >
                        <option value="">Choose a company...</option>
                        {companies.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Financial Year */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-calendar-range me-2 text-primary"></i>
                        Transaction Period
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        required
                      >
                        <option value="">Select financial year...</option>
                        {financialYears.map((fy, idx) => (
                          <option key={idx} value={fy}>
                            {fy}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-primary btn-sm"
                        disabled={!selectedCompany || !loginDate || !selectedYear}
                      >
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Open Transaction
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="card-footer text-center py-3 bg-light">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Secure transaction portal
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />
    </>
  );
};

export default LoginScreen;