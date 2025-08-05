// import React, { useState } from 'react';
// import axios from 'axios';
// import { Link, useNavigate } from 'react-router-dom';

// const LoginForm = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [identifier, setIdentifier] = useState('');

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const res = await axios.post('http://localhost:8080/api/users/login', { identifier, password });
//       console.log('✅ Logged in user:', res.data.user);

//       const user = res.data.user;
//       // Store user data in memory instead of localStorage for Claude environment
//       localStorage.setItem('user', JSON.stringify(user));
//       console.log('User data:', user);

//       // Show success message
//       alert('Login successful!');

//       // Navigate to login screen
//       navigate('/loginscreen');

//     } catch (err) {
//       alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (<>
// <div
//       className="container-fluid"
//       style={{
//         backgroundImage: 'url("/assets/img/loginbg.png")',
//         backgroundSize: 'cover',
//         backgroundRepeat: 'no-repeat',
//         backgroundPosition: 'center',
//       }}
//     >
//       <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
//         <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
//           <div className="card col-md-4 mx-auto ">
//             <form onSubmit={handleLogin} className="">
//               <div className=" d-flex flex-column justify-content-between p-4 pb-0">
//                 <div className=" mx-auto mb-5 text-center">
//                   {/* <img src="assets/img/logo.svg"
//                     className="img-fluid" alt="Logo" /> */}
//                 </div>
//                 <div className="">
//                   <div className="text-center mb-3">
//                     <h1 className='header-text'>Jyothi Cloud ERP</h1>
//                     <h2 className="mb-2">Sign In</h2>
//                     <p className="mb-0">Please enter your details to sign in</p>
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Email Address</label>
//                     <div className="input-group">

//                       <input
//                         type="text"
//                         id="identifier"
//                         value={identifier}
//                         onChange={(e) => setIdentifier(e.target.value)}
//                         className="form-control border-start-0 ps-0"
//                         placeholder="Enter email or phone number"
//                         required
//                       />
//                       <span className="input-group-text border-start-0">
//                         <i className="ti ti-mail"></i>
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Password</label>
//                     <div className="pass-group">
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         id="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="form-control border-start-0 border-end-0 ps-0"
//                         placeholder="Enter your password"
//                         required
//                       />

//                       <span className={`ti toggle-password ${showPassword ? 'ti-eye' : 'ti-eye-off'} `} onClick={() => setShowPassword(!showPassword)}></span>
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <button type="submit" className="btn btn-primary w-100">Sign In</button>
//                   </div>

//                 </div>
//                 <div className="mt-5 pb-4 text-center">
//                   <p className="mb-0 text-gray-9">Copyright &copy; 2024 - Jyothi Cloud ERP</p>
//                   <p className="mb-0 text-gray-9">Designed & Devloped By <Link to="https://excerptech.com/">Excerpt Technologies Private Limited</Link></p>
//                 </div>
//               </div>
//             </form>
//           </div>

//         </div>
//       </div>
//     </div>
//   </>
//   );
// };

// export default LoginForm;


import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');

  // ERP-related quotes
  const erpQuotes = [
    {
      text: "ERP is not just software, it's a journey to operational excellence.",
      author: "Business Excellence"
    },
    {
      text: "Integrate. Automate. Accelerate. Transform your business with ERP.",
      author: "Digital Transformation"
    },
    {
      text: "In the cloud, your business finds its wings to soar higher.",
      author: "Cloud Innovation"
    },
    {
      text: "Data is the new oil, and ERP is the refinery that transforms it into insights.",
      author: "Data Analytics"
    },
    {
      text: "Efficiency is doing things right; ERP is doing the right things efficiently.",
      author: "Process Excellence"
    } 
  ];

  // Get random quote
  const randomQuote = erpQuotes[Math.floor(Math.random() * erpQuotes.length)];

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/users/login', { identifier, password });
      console.log('✅ Logged in user:', res.data.user);

      const user = res.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data:', user);

      // Show success message
      alert('Login successful!');
      navigate('/loginscreen');

    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: 'url("/assets/img/loginbg.png")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
          <div className="card shadow-lg border-0 rounded-4" style={{ maxHeight: '90vh', height: 'auto' }}>
            <div className="card-body p-4 overflow-auto">
              {/* Logo Section - Compact */}
              <div className="text-center mb-3">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-2" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="ti ti-building text-white" style={{ fontSize: '1.8rem' }}></i>
                </div>
              </div>

              {/* Header Section - Compact */}
              <div className="text-center mb-3">
                <h1 className="fw-bold text-primary mb-1" style={{ fontSize: '1.5rem' }}>
                  Jyothi Cloud ERP
                </h1>
                <h2 className="h5 fw-semibold text-dark mb-1">Welcome Back</h2>
                <p className="text-muted mb-0 small">Enter your credentials to access your account</p>
                <p style={{ textAlign: 'center' }}>(Endless Possibilities)</p>
              </div>

              {/* ERP Quote Section */}
              <div className="text-center mb-3">
                <div className="bg-light border border-primary border-opacity-25 rounded-3 p-3">
                  <blockquote className="blockquote mb-2">
                    <p className="mb-1 text-dark small font-italic">
                      {/* <i className="ti ti-quote text-primary me-1"></i> */}
                      "{randomQuote.text}"
                      {/* <i className="ti ti-quote text-primary ms-1"></i> */}
                    </p>
                  </blockquote>
                </div>
              </div>

              <form onSubmit={handleLogin}>
                {/* Email/Phone Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    <i className="ti ti-mail me-2 text-primary"></i>
                    Email or Phone
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-user text-muted"></i>
                    </span>
                    <input
                      type="text"
                      id="identifier"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="form-control border-start-0 py-2"
                      placeholder="Enter your email or phone number"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">
                    <i className="ti ti-lock me-2 text-primary"></i>
                    Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="ti ti-key text-muted"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-control border-start-0 border-end-0 py-2"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <span 
                      className="input-group-text bg-light border-start-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={`ti ${showPassword ? 'ti-eye text-primary' : 'ti-eye-off text-muted'}`}></i>
                    </span>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                {/* <div className="row mb-1">
                  <div className="col-6">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label text-muted small" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <Link to="#" className="text-primary text-decoration-none small fw-semibold">
                      Forgot Password?
                    </Link>
                  </div>
                </div> */}

                {/* Submit Button */}
                <div className="mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-login me-2"></i>
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer - Compact */}
            <div className="card-footer bg-light border-0 text-center py-3">
              <p className="text-muted small mb-1">
                © 2025 Jyothi Cloud ERP. All rights reserved.
              </p>
              <p className="text-muted small mb-0">
                By{' '}
                <Link 
                  to="https://excerptech.com/" 
                  className="text-primary text-decoration-none fw-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Excerpt Technologies
                </Link>
              </p>
            </div>
          </div>

          {/* Help Section - Outside card for space efficiency */}
          <div className="text-center mt-3">
            <div className="bg-white bg-opacity-90 rounded-3 p-2 d-inline-block">
              <div className="d-flex gap-3 justify-content-center">
                <Link to="#" className="text-primary text-decoration-none small">
                  <i className="ti ti-phone me-1"></i>Support
                </Link>
                <Link to="#" className="text-primary text-decoration-none small">
                  <i className="ti ti-mail me-1"></i>Contact
                </Link>
                <Link to="#" className="text-primary text-decoration-none small">
                  <i className="ti ti-book me-1"></i>Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;