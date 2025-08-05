// import React, { useState, useEffect } from 'react';

// const ContactsList = () => {
//     const [state, setState] = useState({
//         contacts: [],
//         loading: false,
//         totalCount: 0,
//         currentPage: 1,
//         pageSize: 10,
//         searchTerm: '',
//         sortBy: 'name',
//         sortOrder: 'asc',
//     });

//     const [showAddModal, setShowAddModal] = useState(false);
//     const [selectedContacts, setSelectedContacts] = useState([]);

//     const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';


//     // API calls integrated directly
//     const apiCall = async (endpoint, options = {}) => {
//         try {
//             const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...options.headers,
//                 },
//                 ...options,
//             });

//             if (!response.ok) {
//                 throw new Error(`API call failed: ${response.statusText}`);
//             }

//             return await response.json();
//         } catch (error) {
//             console.error('API Error:', error);
//             throw error;
//         }
//     };

//     useEffect(() => {
//         fetchContacts();
//     }, [state.currentPage, state.pageSize, state.searchTerm, state.sortBy, state.sortOrder, state.filters]);

//     const fetchContacts = async () => {
//         setState(prev => ({ ...prev, loading: true }));

//         try {
//             const params = {
//                 page: state.currentPage,
//                 limit: state.pageSize,
//                 search: state.searchTerm,
//                 sortBy: state.sortBy,
//                 sortOrder: state.sortOrder,
//                 ...state.filters
//             };

//             const queryString = new URLSearchParams(params).toString();
//             const response = await apiCall(`/contacts?${queryString}`);

//             setState(prev => ({
//                 ...prev,
//                 contacts: response.data.contacts,
//                 totalCount: response.data.totalCount,
//                 loading: false
//             }));
//         } catch (error) {
//             console.error('Error fetching contacts:', error);
//             setState(prev => ({ ...prev, loading: false }));
//         }
//     };

//     const handleSearch = (searchTerm) => {
//         setState(prev => ({ ...prev, searchTerm, currentPage: 1 }));
//     };

//     const handleSort = (sortBy) => {
//         setState(prev => ({
//             ...prev,
//             sortBy,
//             sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
//         }));
//     };


//     const handleDeleteContacts = async (contactIds) => {
//         try {
//             await apiCall('/contacts', {
//                 method: 'DELETE',
//                 body: JSON.stringify({ ids: contactIds }),
//             });
//             fetchContacts();
//             setSelectedContacts([]);
//         } catch (error) {
//             console.error('Error deleting contacts:', error);
//         }
//     };



//     const handleCreateContact = async (contactData) => {
//         try {
//             await apiCall('/contacts', {
//                 method: 'POST',
//                 body: JSON.stringify(contactData),
//             });
//             fetchContacts();
//             setShowAddModal(false);
//         } catch (error) {
//             console.error('Error creating contact:', error);
//         }
//     };

//     const renderRating = (rating) => {
//         return (
//             <span className="rating">
//                 {[1, 2, 3, 4, 5].map(star => (
//                     <i
//                         key={star}
//                         className={`ti ti-star-filled ${star <= rating ? 'text-warning' : ''}`}
//                     />
//                 ))}
//                 <span className="ms-1">{rating}.0</span>
//             </span>
//         );
//     };

//     const renderTags = (tags) => {
//         return (
//             <div className="d-flex gap-1 flex-wrap">
//                 {tags.map((tag, index) => (
//                     <span key={index} className="badge badge-soft-primary">
//                         {tag}
//                     </span>
//                 ))}
//             </div>
//         );
//     };

//     const getSortIcon = (field) => {
//         if (state.sortBy !== field) return <i className="ti ti-selector"></i>;
//         return state.sortOrder === 'asc'
//             ? <i className="ti ti-chevron-up"></i>
//             : <i className="ti ti-chevron-down"></i>;
//     };

//     const renderTable = () => {
//         if (state.loading) {
//             return (
//                 <div className="text-center py-4">
//                     <div className="spinner-border" role="status">
//                         <span className="visually-hidden">Loading...</span>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="">
//                 <table className="table table-sm" id="contactslist">
//                     <thead className="table-light">
//                         <tr>

//                             <th className="no-sort"></th>
//                             <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
//                                 Name {getSortIcon('name')}
//                             </th>
//                             <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>
//                                 Phone {getSortIcon('phone')}
//                             </th>
//                             <th>Tags</th>
//                             <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
//                                 Location {getSortIcon('location')}
//                             </th>
//                             <th className="pe-3" onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
//                                 Rating {getSortIcon('rating')}
//                             </th>
//                             <th>Contact</th>
//                             <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
//                                 Status {getSortIcon('status')}
//                             </th>
//                             <th className="text-end no-sort">Action</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {state.contacts.map((contact) => (
//                             <tr key={contact._id}>

//                                 <td>
//                                     <span className="avatar avatar-sm rounded-circle">
//                                         {contact.avatar ? (
//                                             <img
//                                                 src={contact.avatar}
//                                                 className="flex-shrink-0 rounded-circle"
//                                                 alt={contact.name}
//                                             />
//                                         ) : (
//                                             <div className="avatar-initial rounded-circle bg-primary">
//                                                 {contact.name.charAt(0).toUpperCase()}
//                                             </div>
//                                         )}
//                                     </span>
//                                 </td>
//                                 <td>
//                                     <div>
//                                         <h6 className="mb-0">{contact.name}</h6>
//                                         <small className="text-muted">{contact.email}</small>
//                                     </div>
//                                 </td>
//                                 <td>{contact.phone}</td>
//                                 <td>{renderTags(contact.tags)}</td>
//                                 <td>{contact.location}</td>
//                                 <td>{renderRating(contact.rating)}</td>
//                                 <td>{contact.email}</td>
//                                 <td>
//                                     <span className={`badge ${contact.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
//                                         {contact.status}
//                                     </span>
//                                 </td>
//                                 <td className="text-end">
//                                     <div className="dropdown">
//                                         <button
//                                             className="btn btn-outline-light btn-sm"
//                                             data-bs-toggle="dropdown"
//                                         >
//                                             <i className="ti ti-dots-vertical"></i>
//                                         </button>
//                                         <div className="dropdown-menu">
//                                             <a className="dropdown-item" href="javascript:void(0);">
//                                                 <i className="ti ti-edit me-1"></i>Edit
//                                             </a>
//                                             <a
//                                                 className="dropdown-item text-danger"
//                                                 href="javascript:void(0);"
//                                                 onClick={() => handleDeleteContacts([contact._id])}
//                                             >
//                                                 <i className="ti ti-trash me-1"></i>Delete
//                                             </a>
//                                         </div>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };

//     const renderAddModal = () => {
//         if (!showAddModal) return null;

//         return (
//             <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                 <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h5 className="modal-title">Add Contact</h5>
//                             <button
//                                 type="button"
//                                 className="btn-close"
//                                 onClick={() => setShowAddModal(false)}
//                             ></button>
//                         </div>
//                         <div className="modal-body">
//                             <form
//                                 onSubmit={(e) => {
//                                     e.preventDefault();
//                                     const formData = new FormData(e.target);
//                                     const contactData = {
//                                         name: formData.get('name'),
//                                         phone: formData.get('phone'),
//                                         email: formData.get('email'),
//                                         location: formData.get('location'),
//                                         owner: currentUser,
//                                         rating: parseInt(formData.get('rating')) || 3,
//                                         status: formData.get('status') || 'active',
//                                         tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : []
//                                     };
//                                     handleCreateContact(contactData);
//                                 }}
//                             >
//                                 <div className="mb-3">
//                                     <label className="form-label">Name</label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         className="form-control"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Phone</label>
//                                     <input
//                                         type="tel"
//                                         name="phone"
//                                         className="form-control"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Email</label>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         className="form-control"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Location</label>
//                                     <input
//                                         type="text"
//                                         name="location"
//                                         className="form-control"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Tags (comma separated)</label>
//                                     <input
//                                         type="text"
//                                         name="tags"
//                                         className="form-control"
//                                         placeholder="VIP, Client, Prospect"
//                                     />
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Rating</label>
//                                     <select name="rating" className="form-control">
//                                         {[1, 2, 3, 4, 5].map(rating => (
//                                             <option key={rating} value={rating} selected={rating === 3}>
//                                                 {rating} Star
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                                 <div className="mb-3">
//                                     <label className="form-label">Status</label>
//                                     <select name="status" className="form-control">
//                                         <option value="active" selected>Active</option>
//                                         <option value="inactive">Inactive</option>
//                                     </select>
//                                 </div>
//                                 <div className="text-end">
//                                     <button
//                                         type="button"
//                                         className="btn btn-secondary me-2"
//                                         onClick={() => setShowAddModal(false)}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button type="submit" className="btn btn-primary">
//                                         Add Contact
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <>
//             <div className="content pb-0">
//                 {/* Page Header */}
//                 <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
//                     <div>
//                         <h4 className="mb-1">
//                             Contacts
//                         </h4>
//                         <nav aria-label="breadcrumb">
//                             <ol className="breadcrumb mb-0 p-0">
//                                 <li className="breadcrumb-item">
//                                     <a href="/dashboard">Home</a>
//                                 </li>
//                                 <li className="breadcrumb-item active" aria-current="page">
//                                     Contacts
//                                 </li>
//                             </ol>
//                         </nav>
//                     </div>

//                 </div>

//                 {/* Card */}
//                 <div className="card border-0 rounded-0">
//                     <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
//                         <div className="input-icon input-icon-start position-relative">
//                             <span className="input-icon-addon text-dark">
//                                 <i className="ti ti-search"></i>
//                             </span>
//                             <input
//                                 type="text"
//                                 className="form-control"
//                                 placeholder="Search"
//                                 value={state.searchTerm}
//                                 onChange={(e) => handleSearch(e.target.value)}
//                             />
//                         </div>
//                         <button
//                             className="btn btn-primary"
//                             onClick={() => setShowAddModal(true)}
//                         >
//                             <i className="ti ti-square-rounded-plus-filled me-1"></i>Add Contacts
//                         </button>
//                     </div>

//                     <div className="card-body">

//                         {renderTable()}

//                         {/* Pagination */}
//                         <div className="row align-items-center">
//                             <div className="col-md-6">
//                                 <div className="datatable-length">
//                                     Showing {(state.currentPage - 1) * state.pageSize + 1} to {Math.min(state.currentPage * state.pageSize, state.totalCount)} of {state.totalCount} entries
//                                 </div>
//                             </div>
//                             <div className="col-md-6">
//                                 <div className="datatable-paginate text-end">
//                                     <button
//                                         className="btn btn-outline-primary btn-sm me-2"
//                                         disabled={state.currentPage === 1}
//                                         onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
//                                     >
//                                         Previous
//                                     </button>
//                                     <span className="me-2">Page {state.currentPage}</span>
//                                     <button
//                                         className="btn btn-outline-primary btn-sm"
//                                         disabled={state.currentPage * state.pageSize >= state.totalCount}
//                                         onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
//                                     >
//                                         Next
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {renderAddModal()}
//             </div>
//         </>
//     );
// };

// export default ContactsList;


import React, { useState, useEffect } from 'react';

const ContactsList = () => {
    const [state, setState] = useState({
        contacts: [],
        loading: false,
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [editingContact, setEditingContact] = useState(null);
    const [deletingContactId, setDeletingContactId] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const MAX_IMAGE_SIZE = 512 * 1024; // 512KB

    // API calls integrated directly
    const apiCall = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`API call failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // File upload API call
    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${API_BASE_URL}/contacts/upload/avatar`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [state.currentPage, state.pageSize, state.searchTerm, state.sortBy, state.sortOrder]);

    const fetchContacts = async () => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            const params = {
                page: state.currentPage,
                limit: state.pageSize,
                search: state.searchTerm,
                sortBy: state.sortBy,
                sortOrder: state.sortOrder,
            };

            const queryString = new URLSearchParams(params).toString();
            const response = await apiCall(`/contacts?${queryString}`);

            setState(prev => ({
                ...prev,
                contacts: response.data.contacts,
                totalCount: response.data.totalCount,
                loading: false
            }));
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size
        if (file.size > MAX_IMAGE_SIZE) {
            alert('Image size must be less than 512KB');
            e.target.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            e.target.value = '';
            return;
        }

        setProfileImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setProfileImage(null);
        setImagePreview(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleSearch = (searchTerm) => {
        setState(prev => ({ ...prev, searchTerm, currentPage: 1 }));
    };

    const handleSort = (sortBy) => {
        setState(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setImagePreview(contact.avatar);
        setShowEditModal(true);
    };

    const handleDeleteClick = (contactId) => {
        setDeletingContactId(contactId);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiCall('/contacts', {
                method: 'DELETE',
                body: JSON.stringify({ ids: [deletingContactId] }),
            });
            fetchContacts();
            setShowDeleteModal(false);
            setDeletingContactId(null);
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    const handleCreateContact = async (contactData) => {
        try {
            setUploading(true);
            let avatarUrl = null;

            // Upload image if selected
            if (profileImage) {
                const uploadResponse = await uploadFile(profileImage);
                avatarUrl = uploadResponse.data.url;
            }

            const finalContactData = {
                ...contactData,
                avatar: avatarUrl,
            };

            await apiCall('/contacts', {
                method: 'POST',
                body: JSON.stringify(finalContactData),
            });

            fetchContacts();
            setShowAddModal(false);
            clearImage();
        } catch (error) {
            console.error('Error creating contact:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateContact = async (contactData) => {
        try {
            setUploading(true);
            let avatarUrl = editingContact.avatar;

            // Upload new image if selected
            if (profileImage) {
                const uploadResponse = await uploadFile(profileImage);
                avatarUrl = uploadResponse.data.url;
            }

            const finalContactData = {
                ...contactData,
                avatar: avatarUrl,
            };

            await apiCall(`/contacts/${editingContact._id}`, {
                method: 'PUT',
                body: JSON.stringify(finalContactData),
            });

            fetchContacts();
            setShowEditModal(false);
            setEditingContact(null);
            clearImage();
        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setUploading(false);
        }
    };

    const renderRating = (rating) => {
        return (
            <span className="rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <i
                        key={star}
                        className={`ti ti-star-filled ${star <= rating ? 'text-warning' : ''}`}
                    />
                ))}
                <span className="ms-1">{rating}.0</span>
            </span>
        );
    };

    const renderTags = (tags) => {
        return (
            <div className="d-flex gap-1 flex-wrap">
                {tags.map((tag, index) => (
                    <span key={index} className="badge badge-soft-primary">
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    const getSortIcon = (field) => {
        if (state.sortBy !== field) return <i className="ti ti-selector"></i>;
        return state.sortOrder === 'asc'
            ? <i className="ti ti-chevron-up"></i>
            : <i className="ti ti-chevron-down"></i>;
    };

    const renderImageUpload = () => {
        return (
            <div className="mb-3">
                <label className="form-label">Profile Image (Max 512KB)</label>
                <div className="d-flex align-items-center gap-3">
                    <div className="avatar avatar-lg">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="rounded-circle"
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="avatar-initial rounded-circle bg-secondary d-flex align-items-center justify-content-center">
                                <i className="ti ti-user fs-3"></i>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow-1">
                        <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <small className="text-muted">JPG, PNG, GIF (Max 512KB)</small>
                        {imagePreview && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger mt-1"
                                onClick={clearImage}
                            >
                                Remove Image
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderTable = () => {
        if (state.loading) {
            return (
                <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="">
                <table className="table table-sm" id="contactslist">
                    <thead className="table-light">
                        <tr>
                            <th className="no-sort"></th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>
                                Phone {getSortIcon('phone')}
                            </th>
                            <th>Tags</th>
                            <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                                Location {getSortIcon('location')}
                            </th>
                            <th className="pe-3" onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                                Rating {getSortIcon('rating')}
                            </th>
                            <th>Contact</th>
                            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                Status {getSortIcon('status')}
                            </th>
                            <th className="text-end no-sort">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.contacts.map((contact) => (
                            <tr key={contact._id}>
                                <td>
                                    <span className="avatar avatar-sm rounded-circle">
                                        {contact.avatar ? (
                                            <img
                                                src={`http://localhost:8080${contact.avatar}`}
                                                className="flex-shrink-0 rounded-circle"
                                                alt={contact.name}
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="avatar-initial rounded-circle bg-primary">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </span>
                                </td>
                                <td>
                                    <div>
                                        <h6 className="mb-0">{contact.name}</h6>
                                        <small className="text-muted">{contact.email}</small>
                                    </div>
                                </td>
                                <td>{contact.phone}</td>
                                <td>{renderTags(contact.tags)}</td>
                                <td>{contact.location}</td>
                                <td>{renderRating(contact.rating)}</td>
                                <td>{contact.email}</td>
                                <td>
                                    <span className={`badge ${contact.status === 'active' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
                                        {contact.status}
                                    </span>
                                </td>
                                <td className="text-end">
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-outline-light btn-sm"
                                            data-bs-toggle="dropdown"
                                        >
                                            <i className="ti ti-dots-vertical"></i>
                                        </button>
                                        <div className="dropdown-menu">
                                            <a 
                                                className="dropdown-item" 
                                                href="javascript:void(0);"
                                                onClick={() => handleEdit(contact)}
                                            >
                                                <i className="ti ti-edit me-1"></i>Edit
                                            </a>
                                            <a
                                                className="dropdown-item text-danger"
                                                href="javascript:void(0);"
                                                onClick={() => handleDeleteClick(contact._id)}
                                            >
                                                <i className="ti ti-trash me-1"></i>Delete
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderAddModal = () => {
        if (!showAddModal) return null;

        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Add Contact</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowAddModal(false);
                                    clearImage();
                                }}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const contactData = {
                                        name: formData.get('name'),
                                        phone: formData.get('phone'),
                                        email: formData.get('email'),
                                        location: formData.get('location'),
                                        rating: parseInt(formData.get('rating')) || 3,
                                        status: formData.get('status') || 'active',
                                        tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : []
                                    };
                                    handleCreateContact(contactData);
                                }}
                            >
                                {renderImageUpload()}
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                   
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Rating</label>
                                            <select name="rating" className="form-control">
                                                {[1, 2, 3, 4, 5].map(rating => (
                                                    <option key={rating} value={rating} selected={rating === 3}>
                                                        {rating} Star
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select name="status" className="form-control">
                                                <option value="active" selected>Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Tags</label>
                                            <input
                                                type="text"
                                                name="tags"
                                                className="form-control"
                                                placeholder="VIP, Client"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-2"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            clearImage();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Contact'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEditModal = () => {
        if (!showEditModal || !editingContact) return null;

        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Contact</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingContact(null);
                                    clearImage();
                                }}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const contactData = {
                                        name: formData.get('name'),
                                        phone: formData.get('phone'),
                                        email: formData.get('email'),
                                        location: formData.get('location'),
                                        rating: parseInt(formData.get('rating')) || 3,
                                        status: formData.get('status') || 'active',
                                        tags: formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()) : []
                                    };
                                    handleUpdateContact(contactData);
                                }}
                            >
                                {renderImageUpload()}
                                
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                defaultValue={editingContact.name}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                defaultValue={editingContact.phone}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                defaultValue={editingContact.email}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                className="form-control"
                                                defaultValue={editingContact.location}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Rating</label>
                                            <select name="rating" className="form-control" defaultValue={editingContact.rating}>
                                                {[1, 2, 3, 4, 5].map(rating => (
                                                    <option key={rating} value={rating}>
                                                        {rating} Star
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select name="status" className="form-control" defaultValue={editingContact.status}>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Tags</label>
                                            <input
                                                type="text"
                                                name="tags"
                                                className="form-control"
                                                defaultValue={editingContact.tags.join(', ')}
                                                placeholder="VIP, Client"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-2"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingContact(null);
                                            clearImage();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                                        {uploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Contact'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDeleteModal = () => {
        if (!showDeleteModal) return null;

        const contactToDelete = state.contacts.find(c => c._id === deletingContactId);

        return (
            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Delete</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingContactId(null);
                                }}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="text-center">
                                <div className="mb-3">
                                    <i className="ti ti-alert-triangle text-warning" style={{ fontSize: '48px' }}></i>
                                </div>
                                <h6>Are you sure you want to delete this contact?</h6>
                                {contactToDelete && (
                                    <p className="text-muted">
                                        <strong>{contactToDelete.name}</strong><br />
                                        {contactToDelete.email}
                                    </p>
                                )}
                                <p className="text-danger small">This action cannot be undone.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingContactId(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDeleteConfirm}
                            >
                                Delete Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="content pb-0">
                {/* Page Header */}
                <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
                    <div>
                        <h4 className="mb-1">
                            Contacts
                        </h4>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0 p-0">
                                <li className="breadcrumb-item">
                                    <a href="/dashboard">Home</a>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    Contacts
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>

                {/* Card */}
                <div className="card border-0 rounded-0">
                    <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
                        <div className="input-icon input-icon-start position-relative">
                            <span className="input-icon-addon text-dark">
                                <i className="ti ti-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search"
                                value={state.searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="ti ti-square-rounded-plus-filled me-1"></i>Add Contacts
                        </button>
                    </div>

                    <div className="card-body">
                        {renderTable()}

                        {/* Pagination */}
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="datatable-length">
                                    Showing {(state.currentPage - 1) * state.pageSize + 1} to {Math.min(state.currentPage * state.pageSize, state.totalCount)} of {state.totalCount} entries
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="datatable-paginate text-end">
                                    <button
                                        className="btn btn-outline-primary btn-sm me-2"
                                        disabled={state.currentPage === 1}
                                        onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    >
                                        Previous
                                    </button>
                                    <span className="me-2">Page {state.currentPage}</span>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        disabled={state.currentPage * state.pageSize >= state.totalCount}
                                        onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {renderAddModal()}
                {renderEditModal()}
                {renderDeleteModal()}
            </div>
        </>
    );
};

export default ContactsList;