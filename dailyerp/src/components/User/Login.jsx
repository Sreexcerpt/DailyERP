import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/users/login', { identifier, password });
      console.log('✅ Logged in user:', res.data.user);

      const user = res.data.user;
      // Store user data in memory instead of localStorage for Claude environment
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data:', user);

      // Show success message
      alert('Login successful!');

      // Navigate to login screen
      navigate('/loginscreen');

    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (<>

    <div className="container-fuild">
      <div className="w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
          <div className="card col-md-4 mx-auto ">
            <form onSubmit={handleLogin} className="">
              <div className=" d-flex flex-column justify-content-between p-4 pb-0">
                <div className=" mx-auto mb-5 text-center">
                  {/* <img src="assets/img/logo.svg"
                    className="img-fluid" alt="Logo" /> */}
                </div>
                <div className="">
                  <div className="text-center mb-3">
                    <h2 className="mb-2">Sign In</h2>
                    <p className="mb-0">Please enter your details to sign in</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">

                      <input
                        type="text"
                        id="identifier"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter email or phone number"
                        required
                      />
                      <span className="input-group-text border-start-0">
                        <i className="ti ti-mail"></i>
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="pass-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Enter your password"
                        required
                      />

                      <span className={`ti toggle-password ${showPassword ? 'ti-eye' : 'ti-eye-off'} `} onClick={() => setShowPassword(!showPassword)}></span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <button type="submit" className="btn btn-primary w-100">Sign In</button>
                  </div>

                </div>
                <div className="mt-5 pb-4 text-center">
                  <p className="mb-0 text-gray-9">Copyright &copy; 2024 - Jyothi Cloud ERP</p>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  </>
  );
};

export default LoginForm;