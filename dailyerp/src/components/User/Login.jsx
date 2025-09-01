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
  // const erpQuotes = [
  //   {
  //     text: "ERP is not just software, it's a journey to operational excellence.",
  //     author: "Business Excellence"
  //   },
  //   {
  //     text: "Integrate. Automate. Accelerate. Transform your business with ERP.",
  //     author: "Digital Transformation"
  //   },
  //   {
  //     text: "In the cloud, your business finds its wings to soar higher.",
  //     author: "Cloud Innovation"
  //   },
  //   {
  //     text: "Data is the new oil, and ERP is the refinery that transforms it into insights.",
  //     author: "Data Analytics"
  //   },
  //   {
  //     text: "Efficiency is doing things right; ERP is doing the right things efficiently.",
  //     author: "Process Excellence"
  //   } 
  // ];

  // // Get random quote
  // const randomQuote = erpQuotes[Math.floor(Math.random() * erpQuotes.length)];

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
                {/* <h2 className="h5 fw-semibold text-dark mb-1">Welcome Back</h2> */}
                <p style={{ textAlign: 'center' }}>(Endless Possibilities)</p>
                <p className="text-muted mb-0 small">Enter your credentials to access your account</p>
                
              </div>

              {/* ERP Quote Section */}
              {/*  */}

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
              
              <p className="text-muted small mb-0">
                 Designed and Developed By{' '}
                <Link 
                  to="https://excerptech.com/" 
                  className="text-primary text-decoration-none fw-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Excerpt Technologies Pvt Ltd
                </Link> @ 2025
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