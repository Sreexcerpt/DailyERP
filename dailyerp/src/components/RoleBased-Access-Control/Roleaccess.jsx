import React, { useState, useEffect } from "react";
import axios from "axios";

const AccessControl = () => {
    const [roles, setRoles] = useState([]);
    const [roleId, setRoleId] = useState("");
    const [roleName, setRoleName] = useState("");
    const [permissions, setPermissions] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [nextRoleId, setNextRoleId] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rolesPerPage] = useState(5);
    const [roleNameExists, setRoleNameExists] = useState(false);

    // Add modal state
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (roles.length > 0) {
            const filtered = roles.filter(role =>
                role.roleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRoles(filtered);
            setCurrentPage(1);
        }
    }, [searchTerm, roles]);

    const permissionsStructure = {
        "Dashboard": ["Dashboard"],
        "Master Data": [
            "Material Master", "Customer Master", "Vendor Master",
            "Customer Price List", "Vendor Price List", "Tax List",
            "Location Master", "Process List Master", "General Condition Master"
        ],
        "MRP": ["MRP"],
        "Category": [
            "Material Category", "Customer Category", "Vendor Category",
            "Purchase Indent Category", "Sales Indent Category", "PO Category",
            "Sales RFQ Category", "Sales Order Category", "Goods Receipt Category",
            "Goods Issue Category", "Purchase Contract Category", "Billing Category", "Invoice Category",
            "Purchase Quotation Category", "Sale Contract Category", "Transfer Category"
        ],
        "Purchase": [
            "Purchase Indent", "Purchase Quotation", "Purchase Contract", "Purchase Order",
            "Purchase Indent List", "Purchase Quotations List", "Purchase Contract List", "Purchase Order List"
        ],
        "Sales": [
            "Sales Indent", "Sales Quotation Form", "Sales Contract", "Sales Order",
            "Sales Indent List", "Sales Quotations List", "Sales Contract List", "Sales Order List"
        ],
        "Inventory": [
            "Material Receipt", "Material Receipt List", "Material Issue",
            "Material Transfer", "Material Issue List", "Stock List"
        ],
        "Invoice": ["Invoice Form", "Invoice List"],
        "Billing": ["Billing Form", "Billing List"],
        "Accounts": ["GST", "Ledger", "Payments"],
        "CRM": [
            "Contacts List", "Leads", "Proposals", "Sources",
            "Lost Reason", "Contact Stage", "Industry", "Calls"
        ],
    "Project Management": [  // Add this new section
        "Projects", "Tasks", "Milestones", "Time Entries"
    ],
    "Campaigns": [  // Add this new section
        "Campaigns", "Analytics"
    ]
};



    const availablePermissions = Object.keys(permissionsStructure);

    useEffect(() => {
        fetchRoles();
        fetchNextRoleId();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/roles");
            setRoles(res.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    const fetchNextRoleId = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/roles/next-id");
            setNextRoleId(res.data.nextId);
            if (!editingId) {
                setRoleId(res.data.nextId);
            }
        } catch (error) {
            console.error("Error fetching next role ID:", error);
            setNextRoleId("R-XX");
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!/^[A-Za-z\s]+$/.test(roleName)) {
            errors.roleName = "Role name should contain only alphabets and spaces";
        }

        if (permissions.length === 0) {
            errors.permissions = "At least one permission is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        if (roleNameExists) {
            setFormErrors({ ...formErrors, roleName: "Role name already exists" });
            alert("Role name already exists so choose another name");
            return;
        }

        const roleData = { roleId, roleName, permissions };

        try {
            if (editingId) {
                await axios.put(`http://localhost:8080/api/roles/${editingId}`, roleData);
                alert("Role updated successfully!");
            } else {
                await axios.post("http://localhost:8080/api/roles", roleData);
                alert("Role created successfully!");
            }

            fetchRoles();
            resetForm();
            closeModal();
        } catch (error) {
            console.error("Error saving role:", error);
        }
    };

    const handleEdit = (role) => {
        setEditingId(role._id);
        setRoleId(role.roleId);
        setRoleName(role.roleName);
        setPermissions(role.permissions || []);
        openModal();
    };

    const isProtectedRole = (roleName) => {
        const protectedRoles = ["SuperAdmin", "Telecaller", "Faculty", "Student"];
        return protectedRoles.includes(roleName);
    };

    const handleDelete = async (id, roleName) => {
        if (isProtectedRole(roleName)) {
            alert(`The role "${roleName}" is a system role and cannot be deleted.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            try {
                await axios.delete(`http://localhost:8080/api/roles/${id}`);
                fetchRoles();
            } catch (error) {
                console.error("Error deleting role:", error);
            }
        }
    };

    const indexOfLastRole = currentPage * rolesPerPage;
    const indexOfFirstRole = indexOfLastRole - rolesPerPage;
    const currentRoles = filteredRoles.slice(indexOfFirstRole, indexOfLastRole);
    const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const resetForm = () => {
        setFormErrors({});
        if (!editingId) {
            fetchNextRoleId();
        } else {
            setRoleId("");
        }
        setRoleName("");
        setPermissions([]);
        setEditingId(null);
        setRoleNameExists(false);
    };

    // Updated modal functions
    const openModal = () => {
        if (!editingId) {
            fetchNextRoleId();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setDropdownOpen(false);
        setShowModal(false);
        resetForm();
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handlePermissionSelect = (perm) => {
        const updatedPermissions = [...permissions];
        const subPerms = permissionsStructure[perm] || [];

        if (updatedPermissions.includes(perm)) {
            const filteredPermissions = updatedPermissions.filter(p =>
                p !== perm && !subPerms.includes(p)
            );
            setPermissions(filteredPermissions);
        } else {
            if (!updatedPermissions.includes(perm)) {
                updatedPermissions.push(perm);
            }
            subPerms.forEach(subPerm => {
                if (!updatedPermissions.includes(subPerm)) {
                    updatedPermissions.push(subPerm);
                }
            });
            setPermissions(updatedPermissions);
        }

        if (updatedPermissions.length > 0 && formErrors.permissions) {
            setFormErrors({ ...formErrors, permissions: null });
        }
    };

    const handleSubPermissionSelect = (mainPerm, subPerm) => {
        const updatedPermissions = [...permissions];

        if (updatedPermissions.includes(subPerm)) {
            const index = updatedPermissions.indexOf(subPerm);
            if (index > -1) {
                updatedPermissions.splice(index, 1);
            }

            const subPerms = permissionsStructure[mainPerm] || [];
            const anySubPermSelected = subPerms.some(sp => updatedPermissions.includes(sp));

            if (!anySubPermSelected && updatedPermissions.includes(mainPerm)) {
                const mainIndex = updatedPermissions.indexOf(mainPerm);
                if (mainIndex > -1) {
                    updatedPermissions.splice(mainIndex, 1);
                }
            }
        } else {
            if (!updatedPermissions.includes(mainPerm)) {
                updatedPermissions.push(mainPerm);
            }
            updatedPermissions.push(subPerm);
        }

        setPermissions(updatedPermissions);

        if (updatedPermissions.length > 0 && formErrors.permissions) {
            setFormErrors({ ...formErrors, permissions: null });
        }
    };

    const removePermission = (perm) => {
        if (permissionsStructure[perm]) {
            const subPerms = permissionsStructure[perm] || [];
            const filteredPermissions = permissions.filter(p =>
                p !== perm && !subPerms.includes(p)
            );
            setPermissions(filteredPermissions);
        } else {
            const updatedPermissions = permissions.filter(p => p !== perm);

            for (const [main, subs] of Object.entries(permissionsStructure)) {
                if (subs.includes(perm)) {
                    const anyOtherSubSelected = subs.some(subP =>
                        subP !== perm && updatedPermissions.includes(subP)
                    );

                    if (!anyOtherSubSelected && updatedPermissions.includes(main)) {
                        const mainIndex = updatedPermissions.indexOf(main);
                        if (mainIndex > -1) {
                            updatedPermissions.splice(mainIndex, 1);
                        }
                    }
                    break;
                }
            }

            setPermissions(updatedPermissions);
        }

        if (permissions.length === 0) {
            setFormErrors({ ...formErrors, permissions: "At least one permission is required" });
        }
    };

    const isSubPermissionSelected = (subPerm) => {
        return permissions.includes(subPerm);
    };

    const areAllSubPermissionsSelected = (mainPerm) => {
        const subPerms = permissionsStructure[mainPerm] || [];
        return subPerms.every(subPerm => permissions.includes(subPerm));
    };

    const formatPermissions = (permissionsArray) => {
        if (!permissionsArray || permissionsArray.length === 0) return "None";

        const groupedPermissions = {};

        permissionsArray.forEach(perm => {
            if (permissionsStructure[perm]) {
                if (!groupedPermissions[perm]) {
                    groupedPermissions[perm] = [];
                }
            }
        });

        permissionsArray.forEach(perm => {
            if (permissionsStructure[perm]) return;

            for (const [main, subs] of Object.entries(permissionsStructure)) {
                if (subs.includes(perm)) {
                    if (!groupedPermissions[main]) {
                        groupedPermissions[main] = [];
                    }
                    groupedPermissions[main].push(perm);
                    break;
                }
            }
        });

        return Object.entries(groupedPermissions).map(([main, subs]) => {
            return (
                <div key={main} className="permission-group mb-1">
                    <span className="fw-bold">{main}</span>
                    {subs.length > 0 && (
                        <div className="sub-permissions ms-2 small">
                            {subs.join(", ")}
                        </div>
                    )}
                </div>
            );
        });
    };

    const checkRoleNameExists = async (name) => {
        if (!name) {
            setRoleNameExists(false);
            return;
        }

        try {
            if (editingId) {
                const currentRole = roles.find(r => r._id === editingId);
                if (currentRole && currentRole.roleName === name) {
                    setRoleNameExists(false);
                    return;
                }
            }

            const res = await axios.get(`http://localhost:8080/api/roles/check-name?name=${encodeURIComponent(name)}`);
            setRoleNameExists(res.data.exists);

            if (res.data.exists) {
                setFormErrors({ ...formErrors, roleName: "Role name already exists" });
            } else {
                const newErrors = { ...formErrors };
                if (newErrors.roleName === "Role name already exists") {
                    delete newErrors.roleName;
                    setFormErrors(newErrors);
                }
            }
        } catch (error) {
            console.error("Error checking role name:", error);
        }
    };

    const handleRoleNameChange = (e) => {
        const value = e.target.value;
        setRoleName(value);

        if (!/^[A-Za-z\s]*$/.test(value)) {
            setFormErrors({ ...formErrors, roleName: "Role name should contain only alphabets and spaces" });
        } else {
            const newErrors = { ...formErrors };
            delete newErrors.roleName;
            setFormErrors(newErrors);

            if (value.trim()) {
                checkRoleNameExists(value);
            }
        }
    };

    return (
        <>
            <div className="">
                <div className="page-wrapper cardhead">
                    <div className="content container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="page-header">
                                    <div className="row align-items-center">
                                        <div className="col-xl-7">
                                            <h4>Access Control</h4>
                                        </div>
                                        <div className="col-xl-5 float-end ms-auto">
                                            <div className="d-flex title-head">
                                                <div className="daterange-picker d-flex align-items-center justify-content-center">
                                                    <div className="head-icons">
                                                        <a href="/AccessControl" data-bs-toggle="tooltip" data-bs-placement="top"
                                                            data-bs-original-title="Refresh"><i className="ti ti-refresh-dot"></i></a>
                                                        <a href="javascript:void(0);" data-bs-toggle="tooltip" data-bs-placement="top"
                                                            data-bs-original-title="Collapse" id="collapse-header"><i className="ti ti-chevrons-up"></i></a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roles List */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search by Role ID or Role Name"
                                                            value={searchTerm}
                                                            onChange={handleSearchChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="d-flex title-head">
                                                        <div className="daterange-picker d-flex align-items-center justify-content-center">
                                                            <div className="head-icons">
                                                                <button
                                                                    className="btn btn-primary mt-2"
                                                                    type="button"
                                                                    onClick={() => { resetForm(); openModal(); }}
                                                                >
                                                                    Add Role
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive mt-3">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "15%" }}>Role ID</th>
                                                        <th style={{ width: "15%" }}>Role Name</th>
                                                        <th style={{ width: "40%" }}>Permissions</th>
                                                        <th style={{ width: "20%" }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentRoles.length > 0 ? (
                                                        currentRoles.map((role) => (
                                                            <tr key={role._id}>
                                                                <td>{role.roleId}</td>
                                                                <td>{role.roleName}</td>
                                                                <td style={{ width: "100%" }}>
                                                                    <div style={{
                                                                        maxHeight: "100px",
                                                                        overflowY: "auto",
                                                                        fontSize: "0.85rem",
                                                                        textWrap: "wrap",
                                                                    }}>
                                                                        {formatPermissions(role.permissions)}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="hstack gap-2 fs-15">
                                                                        <button onClick={() => handleEdit(role)}
                                                                            className="btn btn-icon btn-sm btn-soft-info rounded-pill">
                                                                            <i className="feather-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(role._id, role.roleName)}
                                                                            className="btn btn-icon btn-sm btn-soft-danger rounded-pill"
                                                                            disabled={isProtectedRole(role.roleName)}
                                                                            style={{
                                                                                opacity: isProtectedRole(role.roleName) ? "0.5" : "1",
                                                                                cursor: isProtectedRole(role.roleName) ? "not-allowed" : "pointer"
                                                                            }}
                                                                        >
                                                                            <i className="feather-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="text-center">No roles found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination code remains the same */}
                                        {filteredRoles.length > 0 && (
                                            <div className="d-flex justify-content-left mt-4">
                                                <nav>
                                                    <ul className="pagination" style={{ gap: '0px' }}>
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => paginate(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                style={{
                                                                    fontSize: '28px',
                                                                    width: '48px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                &laquo;
                                                            </button>
                                                        </li>
                                                        {/* Pagination logic remains the same */}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => paginate(currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                style={{
                                                                    fontSize: '28px',
                                                                    width: '48px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                &raquo;
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Updated Modal with React state control */}
                        {showModal && (
                            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h4 className="modal-title">{editingId ? "Edit Role" : "Add New Role"}</h4>
                                            <button type="button" className="btn-close" onClick={closeModal}></button>
                                        </div>
                                        <div className="modal-body p-4">
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label className="form-label">Role ID</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editingId ? roleId : nextRoleId}
                                                        disabled={true}
                                                    />
                                                    <small className="text-muted">Role ID is automatically generated</small>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Role Name</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${formErrors.roleName || roleNameExists ? 'is-invalid' : ''}`}
                                                        value={roleName}
                                                        onChange={handleRoleNameChange}
                                                        disabled={editingId ? true : false}
                                                        placeholder="Enter role name"
                                                        required
                                                    />
                                                    {formErrors.roleName && (
                                                        <div className="invalid-feedback">
                                                            {formErrors.roleName}
                                                        </div>
                                                    )}
                                                    {!formErrors.roleName && roleNameExists && (
                                                        <div className="invalid-feedback">
                                                            Role name already exists
                                                        </div>
                                                    )}
                                                    {!formErrors.roleName && !roleNameExists && roleName.trim() && (
                                                        <div className="text-success small mt-1">
                                                            Role name is available
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label">Permissions</label>
                                                    <div className={`permissions-container p-3 border rounded ${formErrors.permissions ? 'border-danger' : ''}`}
                                                        style={{ maxHeight: "400px", overflowY: "auto" }}>
                                                        {availablePermissions.map((perm) => (
                                                            <div key={perm} className="permission-item mb-3">
                                                                <div className="form-check">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        id={`perm-${perm}`}
                                                                        checked={permissions.includes(perm)}
                                                                        onChange={() => handlePermissionSelect(perm)}
                                                                    />
                                                                    <label className="form-check-label fw-bold" htmlFor={`perm-${perm}`}>
                                                                        {perm}
                                                                    </label>
                                                                    {permissions.includes(perm) && (
                                                                        <span className="ms-2 small">
                                                                            {areAllSubPermissionsSelected(perm) ?
                                                                                "(All selected)" :
                                                                                "(Some selected)"}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {permissionsStructure[perm]?.length > 0 && (
                                                                    <div className="sub-permissions ms-4 mt-2">
                                                                        {permissionsStructure[perm].map((subPerm) => (
                                                                            <div key={subPerm} className="form-check">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="form-check-input"
                                                                                    id={`subperm-${subPerm}`}
                                                                                    checked={isSubPermissionSelected(subPerm)}
                                                                                    onChange={() => handleSubPermissionSelect(perm, subPerm)}
                                                                                />
                                                                                <label className="form-check-label" htmlFor={`subperm-${subPerm}`}>
                                                                                    {subPerm}
                                                                                </label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {formErrors.permissions && (
                                                        <div className="text-danger small mt-1">
                                                            {formErrors.permissions}
                                                        </div>
                                                    )}

                                                    <div className="mt-3">
                                                        <h6>Selected Permissions:</h6>
                                                        <div className="selected-permissions mt-2">
                                                            {permissions.length > 0 ? (
                                                                permissions.map((perm) => (
                                                                    <span key={perm} className="badge bg-soft-primary mb-1 m-1">
                                                                        {perm}{" "}
                                                                        <button
                                                                            type="button"
                                                                            className="btn-close btn-close-primary rounded-pill"
                                                                            onClick={() => removePermission(perm)}
                                                                        ></button>
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-muted">No permissions selected</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-primary">Save Role</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccessControl;