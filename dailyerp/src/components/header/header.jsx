import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ toggleSidebar }) {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));
    console.log("user",user)
    const userRoles = user?.roles?.map(role => role.roleName) || [];

    // Get from localStorage or default to first role
    const [activeRole, setActiveRole] = useState(() => {
        return localStorage.getItem('activeRole') || userRoles[0] || '';
    });

    // Set active role on mount if not already in localStorage
    useEffect(() => {
        if (!localStorage.getItem('activeRole') && userRoles.length > 0) {
            localStorage.setItem('activeRole', user.roles[0]?.roleName || '');

            setActiveRole(userRoles[0]);
        }
    }, [userRoles]);
    console.log('Active Role:', activeRole);
    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        setActiveRole(selectedRole);
        localStorage.setItem('activeRole', user.roles[0]?.roleName || '');

    };


    const handleLogout = () => {
        // Clear all relevant user data
        localStorage.removeItem('user');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('openSubmenus');

        // Optional: clear everything
        // localStorage.clear();

        // Refresh the page
        window.location.href = '/login'; // This resets the app state too
    };

    return (

        <div className="header">
            <div className="main-header">

                <div className="header-left">
                    <a href="index.html" className="logo">
                        {/* <img src="assets/img/logo.svg" alt="Logo" />   */}
                        <h2>Jyothi Cloud Erp</h2>
                    </a>
                    <a href="index.html" className="dark-logo">
                        <h2>Jyothi Cloud Erp</h2>
                        {/* <img src="assets/img/logo-white.svg" alt="Logo" /> */}
                    </a>
                </div>

                <a id="mobile_btn" className="mobile_btn" onClick={(e) => {
                    e.preventDefault();
                    toggleSidebar(); // This updates App.jsx state
                }}>
                    <span className="bar-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </a>

                <div className="header-user">
                    <div className="nav user-menu nav-list">

                        <div className="me-auto d-flex align-items-center" id="header-search">
                            {/* <a id="toggle_btn" href="javascript:void(0);" className="btn btn-menubar me-1">
                                <i className="ti ti-arrow-bar-to-left"></i>
                            </a> */}



                        </div>




                        <div className="d-flex align-items-center">



                            <div className="me-1 notification_item">
                                <a href="#" className="btn btn-menubar position-relative me-1" id="notification_popup" data-bs-toggle="dropdown">
                                    <i className="ti ti-bell"></i>
                                    <span className="notification-status-dot"></span>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end notification-dropdown p-4">
                                    <div className="d-flex align-items-center justify-content-between border-bottom p-0 pb-3 mb-3">
                                        <h4 className="notification-title">Notifications (2)</h4>
                                        <div className="d-flex align-items-center">
                                            <a href="#" className="text-primary fs-15 me-3 lh-1">Mark all as read</a>
                                            <div className="dropdown">
                                                <a href="javascript:void(0);" className="bg-white dropdown-toggle" data-bs-toggle="dropdown">
                                                    <i className="ti ti-calendar-due me-1"></i>Today
                                                </a>
                                                <ul className="dropdown-menu mt-2 p-3">
                                                    <li>
                                                        <a href="javascript:void(0);" className="dropdown-item rounded-1">
                                                            This Week
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" className="dropdown-item rounded-1">
                                                            Last Week
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a href="javascript:void(0);" className="dropdown-item rounded-1">
                                                            Last Month
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="noti-content">
                                        <div className="d-flex flex-column">
                                            <div className="border-bottom mb-3 pb-3">
                                                <a href="activity.html">
                                                    <div className="d-flex">
                                                        <span className="avatar avatar-lg me-2 flex-shrink-0">
                                                            <img src="assets/img/profiles/avatar-27.jpg" alt="Profile" />
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1"><span className="text-dark fw-semibold">Shawn</span> performance in Math is below the threshold.</p>
                                                            <span>Just Now</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                            <div className="border-bottom mb-3 pb-3">
                                                <a href="activity.html" className="pb-0">
                                                    <div className="d-flex">
                                                        <span className="avatar avatar-lg me-2 flex-shrink-0">
                                                            <img src="assets/img/profiles/avatar-23.jpg" alt="Profile" />
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1"><span className="text-dark fw-semibold">Sylvia</span> added appointment on 02:00 PM</p>
                                                            <span>10 mins ago</span>
                                                            <div className="d-flex justify-content-start align-items-center mt-1">
                                                                <span className="btn btn-light btn-sm me-2">Deny</span>
                                                                <span className="btn btn-primary btn-sm">Approve</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                            <div className="border-bottom mb-3 pb-3">
                                                <a href="activity.html">
                                                    <div className="d-flex">
                                                        <span className="avatar avatar-lg me-2 flex-shrink-0">
                                                            <img src="assets/img/profiles/avatar-25.jpg" alt="Profile" />
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1">New student record <span className="text-dark fw-semibold"> George</span> is created by <span className="text-dark fw-semibold">Teressa</span></p>
                                                            <span>2 hrs ago</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                            <div className="border-0 mb-3 pb-0">
                                                <a href="activity.html">
                                                    <div className="d-flex">
                                                        <span className="avatar avatar-lg me-2 flex-shrink-0">
                                                            <img src="assets/img/profiles/avatar-01.jpg" alt="Profile" />
                                                        </span>
                                                        <div className="flex-grow-1">
                                                            <p className="mb-1">A new teacher record for <span className="text-dark fw-semibold">Elisa</span> </p>
                                                            <span>09:45 AM</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex p-0">
                                        <a href="#" className="btn btn-light w-100 me-2">Cancel</a>
                                        <a href="activity.html" className="btn btn-primary w-100">View All</a>
                                    </div>
                                </div>
                            </div>
                            <div className="dropdown profile-dropdown">
                                <a href="javascript:void(0);" className="dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
                                    <span className="avatar avatar-sm online">
                                        <img src="assets/img/profiles/avatar-12.jpg" alt="Img" className="img-fluid rounded-circle" />
                                    </span>
                                </a>
                                <div className="dropdown-menu shadow-none">
                                    <div className="card mb-0">
                                        <div className="card-header">
                                            <div className="d-flex align-items-center">
                                                <span className="avatar avatar-lg me-2 avatar-rounded">
                                                    <img src="assets/img/profiles/avatar-12.jpg" alt="img" />
                                                </span>
                                                <div>
                                                    <h5 className="mb-0">{user?.username || 'User'}</h5>
                                                    <p className="fs-12 fw-medium mb-0">
                                                        Active Role: <strong>{activeRole}</strong> </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">


                                            {/* Role Switch Dropdown */}
                                            <div className="dropdown-item d-inline-flex align-items-center p-0 py-2">
                                                <label className="mb-1 fw-medium">Switch Role</label>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={activeRole}
                                                    onChange={handleRoleChange}
                                                >
                                                    {userRoles.map(roleName => (
                                                        <option key={roleName} value={roleName}>
                                                            {roleName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <a className="dropdown-item d-inline-flex align-items-center p-0 py-2" href="/profile">
                                                <i className="isax isax-profile-circle me-2"></i>Profile Settings
                                            </a>

                                            <a className="dropdown-item d-inline-flex align-items-center p-0 py-2" href="/reports">
                                                <i className="isax isax-document-text me-2"></i>Reports
                                            </a>

                                            <div className="form-check form-switch form-check-reverse d-flex align-items-center justify-content-between dropdown-item mb-0">
                                                <label className="form-check-label" htmlFor="notify">
                                                    <i className="isax isax-notification me-2"></i>Notifications
                                                </label>
                                                <input className="form-check-input" type="checkbox" id="notify" />
                                            </div>




                                        </div>
                                        <div className="card-footer">
                                            <button
                                                className="dropdown-item logout d-flex align-items-center"
                                                onClick={handleLogout}
                                                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                                            >
                                                <i className="isax isax-logout me-2"></i>Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="dropdown mobile-user-menu">
                    <a href="javascript:void(0);" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="fa fa-ellipsis-v"></i></a>
                    <div className="dropdown-menu dropdown-menu-end">
                        <a className="dropdown-item" href="profile.html">My Profile</a>
                        <a className="dropdown-item" href="profile-settings.html">Settings</a>
                        <a className="dropdown-item" onClick={handleLogout}>Logout</a>
                    </div>
                </div>


            </div>

        </div>
    );
}
export default Header;