// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Sidebar = () => {
//     const [openSubmenus, setOpenSubmenus] = useState({
//         dashboard: false,
//         superAdmin: false,
//         application: false,
//         call: false,
//         master: false,
//         category: false,
//         purchase: false,
//         sales: false,
//         inventory: false,
//         accounts: false,
//         invoice: false,
//         billing: false,
//     });

//     const [permissions, setPermissions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [activeRole, setActiveRole] = useState('');
//     const navigate = useNavigate();

//     // Helper function to check if user has permission for a main menu
//     const hasPermission = (permissionName) => {
//         return permissions.some(p => p.name === permissionName);
//     };

//     // Helper function to check if user has sub-permission
//     const hasSubPermission = (permissionName, subPermissionName) => {
//         const permission = permissions.find(p => p.name === permissionName);
//         return permission?.subPermissions?.includes(subPermissionName) || false;
//     };

//     // Check if current path is active
//     const isActive = (path) => {
//         return window.location.pathname === path;
//     };

//     const handleToggle = (key) => {
//         const updated = {
//             ...openSubmenus,
//             [key]: !openSubmenus[key]
//         };
//         setOpenSubmenus(updated);
//         localStorage.setItem('openSubmenus', JSON.stringify(updated));
//     };
//     useEffect(() => {
//         const storedSubmenus = localStorage.getItem('openSubmenus');
//         if (storedSubmenus) {
//             setOpenSubmenus(JSON.parse(storedSubmenus));
//         }
//     }, []);

//     // Fetch permissions when component mounts or role changes
//     useEffect(() => {
//         const fetchPermissions = async () => {
//             setLoading(true);
//             try {
//                 // Get active role from localStorage
//                 const storedRole = localStorage.getItem('activeRole');
//                 if (storedRole) {
//                     setActiveRole(storedRole);

//                     const response = await axios.get(`http://localhost:8080/api/permissions/${storedRole}`);
//                     const perms = response.data.data || [];
//                     setPermissions(perms);

//                     // Save permissions and role to localStorage for caching
//                     localStorage.setItem("cachedPermissions", JSON.stringify(perms));
//                     localStorage.setItem("prevActiveRole", storedRole);

//                     // Navigate to first available sub-permission on role change
//                     if (perms.length > 0) {
//                         const firstSub = perms[0].subPermissions?.[0];
//                         if (firstSub) {
//                             setTimeout(() => {
//                                 const anchorTags = document.querySelectorAll("a");
//                                 for (let anchor of anchorTags) {
//                                     const anchorText = anchor.textContent?.trim();
//                                     if (anchorText === firstSub) {
//                                         const href = anchor.getAttribute("href");
//                                         if (href) {
//                                             navigate(href);
//                                         }
//                                         break;
//                                     }
//                                 }
//                             }, 150);
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error fetching permissions:", error);
//                 setPermissions([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         const prevRole = localStorage.getItem("prevActiveRole");
//         const currentRole = localStorage.getItem('activeRole');

//         if (currentRole && currentRole !== prevRole) {
//             console.log("New role detected, fetching permissions");
//             fetchPermissions();
//         } else {
//             console.log("Same role as before — loading cached permissions");
//             // Load cached permissions to avoid blank sidebar
//             const cached = localStorage.getItem("cachedPermissions");
//             if (cached) {
//                 setPermissions(JSON.parse(cached));
//                 setActiveRole(currentRole);
//                 setLoading(false);
//             } else {
//                 fetchPermissions();
//             }
//         }
//     }, [navigate]);

//     if (loading) {
//         return (
//             <div className="two-col-sidebar" id="two-col-sidebar">
//                 <div className="sidebar" id="sidebar-two">
//                     <div className="sidebar-inner">
//                         <div className="text-center p-3">
//                             <div className="spinner-border" role="status">
//                                 <span className="visually-hidden">Loading...</span>
//                             </div>
//                             <p className="mt-2">Loading permissions...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (


//         <>
//             <div className="sidebar" id="sidebar">
//                 {/* <!-- Logo --> */}
//                 <div className="sidebar-logo">
//                     <a href="/" className="logo logo-normal">

//                         <img src="assets/img/logo.png" alt="Logo" />
//                     </a>
//                     <a href="/" className="logo-small">

//                         <img src="assets/img/logo.png" alt="Logo" />
//                     </a>
//                     <a href="/" className="dark-logo">

//                         <img src="assets/img/logo.png" alt="Logo" />
//                     </a>
//                 </div>
//                 {/* <!-- /Logo --> */}
//                 <div className="modern-profile p-3 pb-0">
//                     <div className="text-center rounded bg-light p-3 mb-4 user-profile">
//                         <div className="avatar avatar-lg online mb-3">
//                             <img src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
//                         </div>
//                         <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
//                         <p className="fs-10">System Admin</p>
//                     </div>
//                     <div className="sidebar-nav mb-3">
//                         <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified bg-transparent" role="tablist">
//                             <li className="nav-item"><a className="nav-link active border-0" href="#">Menu</a></li>
//                             <li className="nav-item"><a className="nav-link border-0" href="chat.html">Chats</a></li>
//                             <li className="nav-item"><a className="nav-link border-0" href="email.html">Inbox</a></li>
//                         </ul>
//                     </div>
//                 </div>
//                 <div className="sidebar-header p-3 pb-0 pt-2">
//                     <div className="text-center rounded bg-light p-2 mb-4 sidebar-profile d-flex align-items-center">
//                         <div className="avatar avatar-md onlin">
//                             <img src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
//                         </div>
//                         <div className="text-start sidebar-profile-info ms-2">
//                             <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
//                             <p className="fs-10">System Admin</p>
//                         </div>
//                     </div>
//                     <div className="input-group input-group-flat d-inline-flex mb-4">
//                         <span className="input-icon-addon">
//                             <i className="ti ti-search"></i>
//                         </span>
//                         <input type="text" className="form-control" placeholder="Search in HRMS" />
//                         <span className="input-group-text">
//                             <kbd>CTRL + / </kbd>
//                         </span>
//                     </div>
//                     <div className="d-flex align-items-center justify-content-between menu-item mb-3">
//                         <div className="me-3">
//                             <a href="calendar.html" className="btn btn-menubar">
//                                 <i className="ti ti-layout-grid-remove"></i>
//                             </a>
//                         </div>
//                         <div className="me-3">
//                             <a href="chat.html" className="btn btn-menubar position-relative">
//                                 <i className="ti ti-brand-hipchat"></i>
//                                 <span className="badge bg-info rounded-pill d-flex align-items-center justify-content-center header-badge">5</span>
//                             </a>
//                         </div>
//                         <div className="me-3 notification-item">
//                             <a href="activity.html" className="btn btn-menubar position-relative me-1">
//                                 <i className="ti ti-bell"></i>
//                                 <span className="notification-status-dot"></span>
//                             </a>
//                         </div>
//                         <div className="me-0">
//                             <a href="email.html" className="btn btn-menubar">
//                                 <i className="ti ti-message"></i>
//                             </a>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="sidebar-inner slimscroll">
//                     <div id="sidebar-menu" className="sidebar-menu">
//                         <ul>
//                             {hasPermission("Dashboard") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu"><a href="/" className={isActive("/Dashboard") ? "active" : ""}><i className="ti ti-smart-home"></i><span>Dashboard</span></a></li>
//                                         </ul>
//                                     </li>
//                                 </>
//                             )}
//                             {/* Master Data Section */}

//                             {hasPermission("Master Data") && (
//                                 <li>
//                                     <ul>
//                                         <li className="submenu">
//                                             <a
//                                                 href="#"
//                                                 className={
//                                                     ["/material-form", "/customer-form", "/vendor-form", "/customer-price-list", "/vendor-price-list", "/tax-form", "/LocationMaster", "/ProcessList", "/GeneralCondition"].some(path => isActive(path)) && openSubmenus.master
//                                                         ? "active subdrop"
//                                                         : ""
//                                                 }
//                                                 onClick={e => {
//                                                     e.preventDefault();
//                                                     handleToggle("master");
//                                                 }}>
//                                                 <i className="ti ti-server"></i><span>Master Data</span>
//                                                 <span className="menu-arrow"></span>
//                                             </a>
//                                             <ul style={{ display: openSubmenus.master ? "block" : "none" }}>
//                                                 {hasSubPermission("Master Data", "Material Master") && (
//                                                     <li><a href="/material-form" className={isActive("/material-form") ? "active" : ""}>Material Master</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Material Master") && (
//                                                     <li><a href="/MRP" className={isActive("/MRP") ? "active" : ""}>MRP</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Customer Master") && (
//                                                     <li><a href="/customer-form" className={isActive("/customer-form") ? "active" : ""}>Customer Master</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Vendor Master") && (
//                                                     <li><a href="/vendor-form" className={isActive("/vendor-form") ? "active" : ""}>Vendor Master</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Customer Price List") && (
//                                                     <li><a href="/customer-price-list" className={isActive("/customer-price-list") ? "active" : ""}>Customer Price List</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Vendor Price List") && (
//                                                     <li><a href="/vendor-price-list" className={isActive("/vendor-price-list") ? "active" : ""}>Vendor Price List</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Tax List") && (
//                                                     <li><a href="/tax-form" className={isActive("/tax-form") ? "active" : ""}>Tax List</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Location Master") && (
//                                                     <li><a href="/LocationMaster" className={isActive("/LocationMaster") ? "active" : ""}>Location Master</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Location Master") && (
//                                                     <li><a href="/ProcessList" className={isActive("/ProcessList") ? "active" : ""}>Process List Master</a></li>
//                                                 )}
//                                                 {hasSubPermission("Master Data", "Location Master") && (
//                                                     <li><a href="/GeneralCondition" className={isActive("/GeneralCondition") ? "active" : ""}>General Condition Master</a></li>
//                                                 )}
//                                             </ul>
//                                         </li>


//                                         {/* {hasPermission("Category") && (
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     className={openSubmenus.category ? "active subdrop" : ""}
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("category");
//                                                     }}>
//                                                     <i className="bi bi-database"></i><span>Category</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.category ? "block" : "none" }}>
//                                                     {hasSubPermission("Category", "Material Category") && (
//                                                         <li><a href="/MaterialCategory" className={isActive("/MaterialCategory") ? "active" : ""}>Material Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Customer Category") && (
//                                                         <li><a href="/customer-category-form" className={isActive("/customer-category-form") ? "active" : ""}>Customer Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Vendor Category") && (
//                                                         <li><a href="/vendor-category" className={isActive("/vendor-category") ? "active" : ""}>Vendor Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Purchase Indent Category") && (
//                                                         <li><a href="/Purchaserequestcat" className={isActive("/Purchaserequestcat") ? "active" : ""}>Purchase Indent Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Sales Indent Category") && (
//                                                         <li><a href="/SalesCategory" className={isActive("/SalesCategory") ? "active" : ""}>Sales Indent Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "PO Category") && (
//                                                         <li><a href="/POCategory" className={isActive("/POCategory") ? "active" : ""}>PO Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Sales RFQ Category") && (
//                                                         <li><a href="/sale-quotation-category-form" className={isActive("/sale-quotation-category-form") ? "active" : ""}>Sales RFQ Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Sales Order Category") && (
//                                                         <li><a href="/SalesOrderCategoryForm" className={isActive("/SalesOrderCategoryForm") ? "active" : ""}>Sales Order Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Goods Receipt Category") && (
//                                                         <li><a href="/GoodsReceiptCategory" className={isActive("/GoodsReceiptCategory") ? "active" : ""}>Goods Receipt Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Goods Issue Category") && (
//                                                         <li><a href="/GoodsIssueCategory" className={isActive("/GoodsIssueCategory") ? "active" : ""}>Goods Issue Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Invoice Category") && (
//                                                         <li><a href="/InvoiceCategory" className={isActive("/InvoiceCategory") ? "active" : ""}>Invoice Category</a></li>
//                                                     )}
//                                                     {hasSubPermission("Category", "Billing Category") && (
//                                                         <li><a href="/BillingCategory" className={isActive("/BillingCategory") ? "active" : ""}>Billing Category</a></li>
//                                                     )}

//                                                 </ul>
//                                             </li>
//                                         )} */}
//                                     </ul>
//                                 </li>
//                             )}

//                             {/* Purchase Section */}
//                             {hasPermission("Purchase") && (
//                                 <>
//                                     <li>
//                                         <ul>
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     className={
//                                                         [
//                                                             "/PurchaseEnquiry",
//                                                             "/PurchaseQuotation",
//                                                             "/PurchaseOrder",
//                                                             "/PurchaseIndentsummary",
//                                                             "/PurchaseQuotationsDisplay",
//                                                             "/PurchaseOrderList"
//                                                         ].some(path => isActive(path)) || openSubmenus.purchase
//                                                             ? "active subdrop"
//                                                             : ""
//                                                     }
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("purchase");
//                                                     }}>
//                                                     <i className="ti ti-shopping-cart-dollar"></i><span>Purchase</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.purchase ? "block" : "none" }}>
//                                                     {hasSubPermission("Purchase", "Purchase Indent") && (
//                                                         <li><a href="/PurchaseEnquiry" className={isActive("/PurchaseEnquiry") ? "active" : ""}>Purchase Enquiry</a></li>
//                                                     )}
//                                                     {hasSubPermission("Purchase", "Purchase Quotation") && (
//                                                         <li><a href="/PurchaseQuotation" className={isActive("/PurchaseQuotation") ? "active" : ""}>Purchase Quotation</a></li>
//                                                     )}
//                                                     {hasSubPermission("Purchase", "Purchase Order") && (
//                                                         <li><a href="/PurchaseContract" className={isActive("/PurchaseContract") ? "active" : ""}>Purchase Contract</a></li>
//                                                     )}
//                                                     {hasSubPermission("Purchase", "Purchase Order") && (
//                                                         <li><a href="/PurchaseOrder" className={isActive("/PurchaseOrder") ? "active" : ""}>Purchase Order</a></li>
//                                                     )}
//                                                     <li className="submenu submenu-two">
//                                                         <a
//                                                             style={{ cursor: "pointer" }}
//                                                             className={
//                                                                 ["/PurchaseIndentsummary", "/PurchaseQuotationsDisplay", "/PurchaseOrderList"].some(path => isActive(path)) || openSubmenus.purchasereport
//                                                                     ? "active subdrop"
//                                                                     : ""
//                                                             }
//                                                             onClick={e => {
//                                                                 e.preventDefault();
//                                                                 handleToggle("purchasereport");
//                                                             }}
//                                                         >
//                                                             Purchase Report <span className="menu-arrow inside-submenu"></span>
//                                                         </a>
//                                                         <ul
//                                                             style={{
//                                                                 display:
//                                                                     ["/PurchaseIndentsummary", "/PurchaseQuotationsDisplay", "/PurchaseOrderList"].some(path => isActive(path)) || openSubmenus.purchasereport
//                                                                         ? "block"
//                                                                         : "none"
//                                                             }}
//                                                         >
//                                                             {hasSubPermission("Purchase", "Purchase Indent List") && (
//                                                                 <li>
//                                                                     <a href="/PurchaseIndentsummary" className={isActive("/PurchaseIndentsummary") ? "active" : ""}>
//                                                                         Purchase Enquiry List
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                             {hasSubPermission("Purchase", "Purchase Quotations List") && (
//                                                                 <li>
//                                                                     <a href="/PurchaseQuotationsDisplay" className={isActive("/PurchaseQuotationsDisplay") ? "active" : ""}>
//                                                                         Purchase Quotations List
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                             {hasSubPermission("Purchase", "Purchase Order List") && (
//                                                                 <li>
//                                                                     <a href="/PurchaseContractsummary" className={isActive("/PurchaseContractsummary") ? "active" : ""}>
//                                                                         Purchase Contract List
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                             {hasSubPermission("Purchase", "Purchase Order List") && (
//                                                                 <li>
//                                                                     <a href="/PurchaseOrderList" className={isActive("/PurchaseOrderList") ? "active" : ""}>
//                                                                         Purchase Order List
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                         </ul>
//                                                     </li>

//                                                 </ul>
//                                             </li>

//                                         </ul>
//                                     </li>
//                                 </>
//                             )}

//                             {/* Sales Section */}
//                             {hasPermission("Sales") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     className={
//                                                         [
//                                                             "/SalesEnquiry",
//                                                             "/SalesQuotation",
//                                                             "/SalesOrder",
//                                                             "/SalesEnquiryList",
//                                                             "/SalesQuotationList",
//                                                             "/SalesOrderList"
//                                                         ].some(path => isActive(path)) || openSubmenus.sales
//                                                             ? "active subdrop"
//                                                             : ""
//                                                     }
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("sales");
//                                                     }}>
//                                                     <i className="ti ti-shopping-cart-dollar"></i><span>Sales</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.sales ? "block" : "none" }}>
//                                                     {hasSubPermission("Sales", "Sales Indent") && (
//                                                         <li><a href="/SalesEnquiry" className={isActive("/SalesEnquiry") ? "active" : ""}>Sales Enquiry</a></li>
//                                                     )}
//                                                     {hasSubPermission("Sales", "Sales Quotation Form") && (
//                                                         <li><a href="/SalesQuotation" className={isActive("/SalesQuotation") ? "active" : ""}>Sales Quotation</a></li>
//                                                     )}
//                                                     {hasSubPermission("Sales", "Sales Quotation Form") && (
//                                                         <li><a href="/SalesContract" className={isActive("/SalesContract") ? "active" : ""}>Sales Contract</a></li>
//                                                     )}
//                                                     {hasSubPermission("Sales", "Sales Order") && (
//                                                         <li><a href="/SalesOrder" className={isActive("/SalesOrder") ? "active" : ""}>Sales Order</a></li>
//                                                     )}

//                                                     <li className="submenu submenu-two">
//                                                         <a
//                                                             style={{ cursor: "pointer" }}
//                                                             className={
//                                                                 ["/SalesEnquiryList", "/SalesQuotationList", "/SalesOrderList"].some(path => isActive(path)) || openSubmenus.salesreport
//                                                                     ? "active subdrop"
//                                                                     : ""
//                                                             }
//                                                             onClick={e => {
//                                                                 e.preventDefault();
//                                                                 handleToggle("salesreport");
//                                                             }}>
//                                                             Sales Report <span className="menu-arrow inside-submenu"></span>
//                                                         </a>
//                                                         <ul
//                                                             style={{
//                                                                 display:
//                                                                     ["/SalesEnquiryList", "/SalesQuotationList", "/SalesOrderList"].some(path => isActive(path)) || openSubmenus.salesreport
//                                                                         ? "block"
//                                                                         : "none"
//                                                             }}>
//                                                             {hasSubPermission("Sales", "Sales Indent List") && (
//                                                                 <li><a href="/SalesEnquiryList" className={isActive("/SalesEnquiryList") ? "active" : ""}>Sales Enquiry List</a></li>
//                                                             )}
//                                                             {hasSubPermission("Sales", "Sales Quotations List") && (
//                                                                 <li><a href="/SalesQuotationList" className={isActive("/SalesQuotationList") ? "active" : ""}>Sales Quotations List</a></li>
//                                                             )}
//                                                             {hasSubPermission("Sales", "Sales Quotations List") && (
//                                                                 <li><a href="/SalesContractsummary" className={isActive("/SalesContractsummary") ? "active" : ""}>Sales Contract List</a></li>
//                                                             )}
//                                                             {hasSubPermission("Sales", "Sales Order List") && (
//                                                                 <li><a href="/SalesOrderList" className={isActive("/SalesOrderList") ? "active" : ""}>Sales Order List</a></li>
//                                                             )}
//                                                         </ul>
//                                                     </li>
//                                                 </ul>
//                                             </li>

//                                         </ul>
//                                     </li>
//                                 </>
//                             )}

//                             {/* Inventory Section */}
//                             {hasPermission("Inventory") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     className={
//                                                         [
//                                                             "/MatrialReceipt",
//                                                             "/MatrialIssue",
//                                                             "/MatrialTransfer",
//                                                             "/StockListERP",
//                                                             "/MatrialReceiptList"
//                                                         ].some(path => isActive(path)) || openSubmenus.inventory
//                                                             ? "active subdrop"
//                                                             : ""
//                                                     }
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("inventory");
//                                                     }}>
//                                                     <i className="ti ti-box"></i><span>Inventory</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.inventory ? "block" : "none" }}>
//                                                     {hasSubPermission("Inventory", "Material Receipt") && (
//                                                         <li><a href="/MatrialReceipt" className={isActive("/MatrialReceipt") ? "active" : ""}>Material Receipt</a></li>
//                                                     )}
//                                                     {hasSubPermission("Inventory", "Material Issue") && (
//                                                         <li><a href="/MatrialIssue" className={isActive("/MatrialIssue") ? "active" : ""}>Material Issue</a></li>
//                                                     )}
//                                                     {hasSubPermission("Inventory", "Material Transfer") && (
//                                                         <li><a href="/MatrialTransfer" className={isActive("/MatrialTransfer") ? "active" : ""}>Delivery Challan</a></li>
//                                                     )}
//                                                     {hasSubPermission("Inventory", "Stock List") && (
//                                                         <li><a href="/StockListERP" className={isActive("/StockListERP") ? "active" : ""}>Stock List</a></li>
//                                                     )}

//                                                     <li className="submenu submenu-two">
//                                                         <a
//                                                             style={{ cursor: "pointer" }}
//                                                             className={
//                                                                 ["/MatrialReceiptList", "/StockListERP"].some(path => isActive(path)) || openSubmenus.inventoryreport
//                                                                     ? "active subdrop"
//                                                                     : ""
//                                                             }
//                                                             onClick={e => {
//                                                                 e.preventDefault();
//                                                                 handleToggle("inventoryreport");
//                                                             }}>
//                                                             Inventory Report <span className="menu-arrow inside-submenu"></span>
//                                                         </a>
//                                                         <ul
//                                                             style={{
//                                                                 display:
//                                                                     ["/MatrialReceiptList", "/StockListERP"].some(path => isActive(path)) || openSubmenus.inventoryreport
//                                                                         ? "block"
//                                                                         : "none"
//                                                             }}>
//                                                             {hasSubPermission("Inventory", "Material Receipt List") && (
//                                                                 <li><a href="/MatrialReceiptList" className={isActive("/MatrialReceiptList") ? "active" : ""}>Material Receipt List</a></li>
//                                                             )}
//                                                             {hasSubPermission("Inventory", "Material Issue List") && (
//                                                                 <li><a href="/StockListERP" className={isActive("/StockListERP") ? "active" : ""}>Stock List</a></li>
//                                                             )}
//                                                         </ul>
//                                                     </li>
//                                                 </ul>
//                                             </li>

//                                         </ul>
//                                     </li>
//                                 </>
//                             )}

//                             {/* Invoice Section */}
//                             {hasPermission("Invoice") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("invoice");
//                                                     }}
//                                                     className={
//                                                         ["/InvoiceForm", "/InvoiceList"].some(path => isActive(path)) && openSubmenus.invoice
//                                                             ? "active subdrop"
//                                                             : ""
//                                                     }
//                                                 >
//                                                     <i className="ti ti-file-dollar"></i><span>Vendor Invoice</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.invoice ? "block" : "none" }}>
//                                                     <li className="submenu submenu-two">
//                                                         <a
//                                                             style={{ cursor: "pointer" }}
//                                                             className={
//                                                                 ["/MatrialReceiptList", "/StockListERP"].some(path => isActive(path)) || openSubmenus.invoice
//                                                                     ? "active subdrop"
//                                                                     : ""
//                                                             }
//                                                             onClick={e => {
//                                                                 e.preventDefault();
//                                                                 handleToggle("invoice");
//                                                             }}>
//                                                             Vendor Invoice <span className="menu-arrow inside-submenu"></span>
//                                                         </a>
//                                                         <ul style={{ display: openSubmenus.invoice ? "block" : "none" }}>
//                                                             {hasSubPermission("Invoice", "Invoice Form") && (
//                                                                 <li>
//                                                                     <a href="/InvoiceForm" className={isActive("/InvoiceForm") ? "active" : ""}>
//                                                                         Vendor Invoice Creation
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                             {hasSubPermission("Invoice", "Invoice List") && (
//                                                                 <li>
//                                                                     <a href="/InvoiceList" className={isActive("/InvoiceList") ? "active" : ""}>
//                                                                         Vendor Invoice List
//                                                                     </a>
//                                                                 </li>
//                                                             )}
//                                                         </ul>
//                                                     </li>
//                                                     {hasPermission("Billing") && (
//                                                     <li>
//                                                         <ul>
//                                                             <li className="submenu submenu-two">
//                                                                 <a
//                                                                     href="#"
//                                                                     onClick={e => {
//                                                                         e.preventDefault();
//                                                                         handleToggle("billing");
//                                                                     }}>
//                                                                     <i className="ti ti-file-dollar"></i><span>Customer Invoice</span>
//                                                                     <span className="menu-arrow"></span>
//                                                                 </a>
//                                                                 <ul style={{ display: openSubmenus.billing ? "block" : "none" }}>
//                                                                     {hasSubPermission("Billing", "Billing Form") && (
//                                                                         <li>
//                                                                             <a href="/BillingForm" className={isActive("/BillingForm") ? "active" : ""}>
//                                                                                 Customer Invoice Creation
//                                                                             </a>
//                                                                         </li>
//                                                                     )}
//                                                                     {hasSubPermission("Billing", "Billing List") && (
//                                                                         <li>
//                                                                             <a href="/BillingDisplay" className={isActive("/BillingDisplay") ? "active" : ""}>
//                                                                                 Customer Invoice List
//                                                                             </a>
//                                                                         </li>
//                                                                     )}
//                                                                 </ul>
//                                                             </li>

//                                                         </ul>
//                                                     </li>)}
//                                                 </ul>
//                                             </li>

//                                         </ul>
//                                     </li>
//                                 </>
//                             )}

//                             {/* Billing Section */}
//                             {/* {hasPermission("Billing") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu">
//                                                 <a
//                                                     href="#"
//                                                     className={
//                                                         ["/BillingForm", "/BillingDisplay"].some(path => isActive(path)) && openSubmenus.billing
//                                                             ? "active subdrop"
//                                                             : ""
//                                                     }
//                                                     onClick={e => {
//                                                         e.preventDefault();
//                                                         handleToggle("billing");
//                                                     }}>
//                                                     <i className="ti ti-file-dollar"></i><span>Customer Invoice</span>
//                                                     <span className="menu-arrow"></span>
//                                                 </a>
//                                                 <ul style={{ display: openSubmenus.billing ? "block" : "none" }}>
//                                                     {hasSubPermission("Billing", "Billing Form") && (
//                                                         <li>
//                                                             <a href="/BillingForm" className={isActive("/BillingForm") ? "active" : ""}>
//                                                                 Customer Invoice Creation
//                                                             </a>
//                                                         </li>
//                                                     )}
//                                                     {hasSubPermission("Billing", "Billing List") && (
//                                                         <li>
//                                                             <a href="/BillingDisplay" className={isActive("/BillingDisplay") ? "active" : ""}>
//                                                                 Customer Invoice List
//                                                             </a>
//                                                         </li>
//                                                     )}
//                                                 </ul>
//                                             </li>

//                                         </ul>
//                                     </li>
//                                 </>
//                             )} */}

//                             {hasPermission("Dashboard") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu"><a href="/gst" className={isActive("/gst") ? "active" : ""}><i className="ti ti-smart-home"></i><span>GST</span></a></li>
//                                         </ul>
//                                     </li>
//                                 </>
//                             )}
//                             {hasPermission("Dashboard") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu"><a href="/Ledger" className={isActive("/Ledger") ? "active" : ""}><i className="ti ti-smart-home"></i><span>Ledger</span></a></li>
//                                         </ul>
//                                     </li>
//                                 </>
//                             )}
//                             {hasPermission("Dashboard") && (
//                                 <>

//                                     <li>
//                                         <ul>
//                                             <li className="submenu"><a href="/Payments" className={isActive("/Payments") ? "active" : ""}><i className="ti ti-smart-home"></i><span>Payments</span></a></li>
//                                         </ul>
//                                     </li>
//                                 </>
//                             )}
//                             {/* Show message if no permissions */}
//                             {permissions.length === 0 && (
//                                 <li className="menu-title">
//                                     <span>No permissions assigned for role: {activeRole}</span>
//                                 </li>
//                             )}
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Sidebar;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const [openSubmenus, setOpenSubmenus] = useState({
        dashboard: false,
        superAdmin: false,
        application: false,
        call: false,
        master: false,
        category: false,
        purchase: false,
        sales: false,
        inventory: false,
        accounts: false,
        invoice: false,
        billing: false,
        purchasereport: false,
        salesreport: false,
        inventoryreport: false,
        accountsreport: false, // for future use if needed
    });

    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState('');
    const navigate = useNavigate();

    // Helper function to check if user has permission for a main menu
    const hasPermission = (permissionName) => {
        return permissions.some(p => p.name === permissionName);
    };

    // Helper function to check if user has sub-permission
    const hasSubPermission = (permissionName, subPermissionName) => {
        const permission = permissions.find(p => p.name === permissionName);
        return permission?.subPermissions?.includes(subPermissionName) || false;
    };

    // Check if current path is active
    const isActive = (path) => {
        return window.location.pathname === path;
    };

    const handleToggle = (key) => {
        const updated = {
            ...openSubmenus,
            [key]: !openSubmenus[key]
        };
        setOpenSubmenus(updated);
        localStorage.setItem('openSubmenus', JSON.stringify(updated));
    };
    useEffect(() => {
        const storedSubmenus = localStorage.getItem('openSubmenus');
        if (storedSubmenus) {
            setOpenSubmenus(JSON.parse(storedSubmenus));
        }
    }, []);

    // Fetch permissions when component mounts or role changes
    useEffect(() => {
        const fetchPermissions = async () => {
            setLoading(true);
            try {
                // Get active role from localStorage
                const storedRole = localStorage.getItem('activeRole');
                if (storedRole) {
                    setActiveRole(storedRole);

                    const response = await axios.get(`http://localhost:8080/api/permissions/${storedRole}`);
                    const perms = response.data.data || [];
                    setPermissions(perms);

                    // Save permissions and role to localStorage for caching
                    localStorage.setItem("cachedPermissions", JSON.stringify(perms));
                    localStorage.setItem("prevActiveRole", storedRole);

                    // Navigate to first available sub-permission on role change
                    if (perms.length > 0) {
                        const firstSub = perms[0].subPermissions?.[0];
                        if (firstSub) {
                            setTimeout(() => {
                                const anchorTags = document.querySelectorAll("a");
                                for (let anchor of anchorTags) {
                                    const anchorText = anchor.textContent?.trim();
                                    if (anchorText === firstSub) {
                                        const href = anchor.getAttribute("href");
                                        if (href) {
                                            navigate(href);
                                        }
                                        break;
                                    }
                                }
                            }, 150);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching permissions:", error);
                setPermissions([]);
            } finally {
                setLoading(false);
            }
        };

        const prevRole = localStorage.getItem("prevActiveRole");
        const currentRole = localStorage.getItem('activeRole');

        if (currentRole && currentRole !== prevRole) {
            console.log("New role detected, fetching permissions");
            fetchPermissions();
        } else {
            console.log("Same role as before — loading cached permissions");
            // Load cached permissions to avoid blank sidebar
            const cached = localStorage.getItem("cachedPermissions");
            if (cached) {
                setPermissions(JSON.parse(cached));
                setActiveRole(currentRole);
                setLoading(false);
            } else {
                fetchPermissions();
            }
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="two-col-sidebar" id="two-col-sidebar">
                <div className="sidebar" id="sidebar-two">
                    <div className="sidebar-inner">
                        <div className="text-center p-3">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading permissions...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="sidebar" id="sidebar">
                {/* <!-- Logo --> */}
                <div className="sidebar-logo">
                    <a href="/" className="logo logo-normal">
                        <img src="assets/img/logo.png" alt="Logo" />
                    </a>
                    <a href="/" className="logo-small">
                        <img src="assets/img/logo.png" alt="Logo" />
                    </a>
                    <a href="/" className="dark-logo">
                        <img src="assets/img/logo.png" alt="Logo" />
                    </a>
                </div>
                {/* <!-- /Logo --> */}
                <div className="modern-profile p-3 pb-0">
                    <div className="text-center rounded bg-light p-3 mb-4 user-profile">
                        <div className="avatar avatar-lg online mb-3">
                            <img src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
                        </div>
                        <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
                        <p className="fs-10">System Admin</p>
                    </div>
                    <div className="sidebar-nav mb-3">
                        <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified bg-transparent" role="tablist">
                            <li className="nav-item"><a className="nav-link active border-0" href="#">Menu</a></li>
                            <li className="nav-item"><a className="nav-link border-0" href="chat.html">Chats</a></li>
                            <li className="nav-item"><a className="nav-link border-0" href="email.html">Inbox</a></li>
                        </ul>
                    </div>
                </div>
                <div className="sidebar-header p-3 pb-0 pt-2">
                    <div className="text-center rounded bg-light p-2 mb-4 sidebar-profile d-flex align-items-center">
                        <div className="avatar avatar-md onlin">
                            <img src="assets/img/profiles/avatar-02.jpg" alt="Img" className="img-fluid rounded-circle" />
                        </div>
                        <div className="text-start sidebar-profile-info ms-2">
                            <h6 className="fs-12 fw-normal mb-1">Adrian Herman</h6>
                            <p className="fs-10">System Admin</p>
                        </div>
                    </div>
                    <div className="input-group input-group-flat d-inline-flex mb-4">
                        <span className="input-icon-addon">
                            <i className="ti ti-search"></i>
                        </span>
                        <input type="text" className="form-control" placeholder="Search in HRMS" />
                        <span className="input-group-text">
                            <kbd>CTRL + / </kbd>
                        </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between menu-item mb-3">
                        <div className="me-3">
                            <a href="calendar.html" className="btn btn-menubar">
                                <i className="ti ti-layout-grid-remove"></i>
                            </a>
                        </div>
                        <div className="me-3">
                            <a href="chat.html" className="btn btn-menubar position-relative">
                                <i className="ti ti-brand-hipchat"></i>
                                <span className="badge bg-info rounded-pill d-flex align-items-center justify-content-center header-badge">5</span>
                            </a>
                        </div>
                        <div className="me-3 notification-item">
                            <a href="activity.html" className="btn btn-menubar position-relative me-1">
                                <i className="ti ti-bell"></i>
                                <span className="notification-status-dot"></span>
                            </a>
                        </div>
                        <div className="me-0">
                            <a href="email.html" className="btn btn-menubar">
                                <i className="ti ti-message"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="sidebar-inner slimscroll">
                    <div id="sidebar-menu" className="sidebar-menu">
                        <ul>
                            {hasPermission("Dashboard") && (
                                <li>
                                    <ul>
                                        <li className="submenu"><a href="/" className={isActive("/Dashboard") ? "active" : ""}><i className="ti ti-smart-home"></i><span>Dashboard</span></a></li>
                                    </ul>
                                </li>
                            )}
                            {/* Master Data Section */}
                            {hasPermission("Master Data") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                className={
                                                    ["/material-form", "/customer-form", "/vendor-form", "/customer-price-list", "/vendor-price-list", "/tax-form", "/LocationMaster", "/ProcessList", "/GeneralCondition"].some(path => isActive(path)) && openSubmenus.master
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("master");
                                                }}>
                                                <i className="ti ti-server"></i><span>Master Data</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.master ? "block" : "none" }}>
                                                {hasSubPermission("Master Data", "Material Master") && (
                                                    <li><a href="/material-form" className={isActive("/material-form") ? "active" : ""}>Material Master</a></li>
                                                )}
                                                {/* {hasSubPermission("Master Data", "Material Master") && (
                                                    <li><a href="/MRP" className={isActive("/MRP") ? "active" : ""}>MRP</a></li>
                                                )} */}
                                                {hasSubPermission("Master Data", "Customer Master") && (
                                                    <li><a href="/customer-form" className={isActive("/customer-form") ? "active" : ""}>Customer Master</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Vendor Master") && (
                                                    <li><a href="/vendor-form" className={isActive("/vendor-form") ? "active" : ""}>Vendor Master</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Customer Price List") && (
                                                    <li><a href="/customer-price-list" className={isActive("/customer-price-list") ? "active" : ""}>Customer Price List</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Vendor Price List") && (
                                                    <li><a href="/vendor-price-list" className={isActive("/vendor-price-list") ? "active" : ""}>Vendor Price List</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Tax List") && (
                                                    <li><a href="/tax-form" className={isActive("/tax-form") ? "active" : ""}>Tax List</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Location Master") && (
                                                    <li><a href="/LocationMaster" className={isActive("/LocationMaster") ? "active" : ""}>Location Master</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Location Master") && (
                                                    <li><a href="/ProcessList" className={isActive("/ProcessList") ? "active" : ""}>Process List Master</a></li>
                                                )}
                                                {hasSubPermission("Master Data", "Location Master") && (
                                                    <li><a href="/GeneralCondition" className={isActive("/GeneralCondition") ? "active" : ""}>General Condition Master</a></li>
                                                )}
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}
                            {/* {hasPermission("Category") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                className={openSubmenus.category ? "active subdrop" : ""}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("category");
                                                }}
                                            >
                                                <i className="bi bi-database"></i>
                                                <span>Category</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.category ? "block" : "none" }}>
                                                {hasSubPermission("Category", "Material Category") && (
                                                    <li>
                                                        <a href="/MaterialCategory" className={isActive("/MaterialCategory") ? "active" : ""}>Material Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Customer Category") && (
                                                    <li>
                                                        <a href="/customer-category-form" className={isActive("/customer-category-form") ? "active" : ""}>Customer Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Vendor Category") && (
                                                    <li>
                                                        <a href="/vendor-category" className={isActive("/vendor-category") ? "active" : ""}>Vendor Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Purchase Indent Category") && (
                                                    <li>
                                                        <a href="/Purchaserequestcat" className={isActive("/Purchaserequestcat") ? "active" : ""}>Purchase Indent Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Sales Indent Category") && (
                                                    <li>
                                                        <a href="/SalesCategory" className={isActive("/SalesCategory") ? "active" : ""}>Sales Indent Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "PO Category") && (
                                                    <li>
                                                        <a href="/POCategory" className={isActive("/POCategory") ? "active" : ""}>PO Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Sales RFQ Category") && (
                                                    <li>
                                                        <a href="/sale-quotation-category-form" className={isActive("/sale-quotation-category-form") ? "active" : ""}>Sales RFQ Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Sales Order Category") && (
                                                    <li>
                                                        <a href="/SalesOrderCategoryForm" className={isActive("/SalesOrderCategoryForm") ? "active" : ""}>Sales Order Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Goods Receipt Category") && (
                                                    <li>
                                                        <a href="/GoodsReceiptCategory" className={isActive("/GoodsReceiptCategory") ? "active" : ""}>Goods Receipt Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Goods Issue Category") && (
                                                    <li>
                                                        <a href="/GoodsIssueCategory" className={isActive("/GoodsIssueCategory") ? "active" : ""}>Goods Issue Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Invoice Category") && (
                                                    <li>
                                                        <a href="/InvoiceCategory" className={isActive("/InvoiceCategory") ? "active" : ""}>Invoice Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Billing Category") && (
                                                    <li>
                                                        <a href="/BillingCategory" className={isActive("/BillingCategory") ? "active" : ""}>Billing Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Sale Contract Category") && (
                                                    <li>
                                                        <a href="/SaleContractCategoryForm" className={isActive("/SaleContractCategoryForm") ? "active" : ""}>Sale Contract Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "Transfer Category") && (
                                                    <li>
                                                        <a href="/TransferCategory" className={isActive("/TransferCategory") ? "active" : ""}>Transfer Category</a>
                                                    </li>
                                                )}
                                                {hasSubPermission("Category", "RFQ Category") && (
                                                    <li>
                                                        <a href="/RFQCategoryForm" className={isActive("/RFQCategoryForm") ? "active" : ""}>RFQ Category</a>
                                                    </li>
                                                )}
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )} */}

                             {hasPermission("Dashboard") && (
                                <li>
                                    <ul>
                                        
                                        <li className="submenu"><a href="/MRP" className={isActive("/MRP") ? "active" : ""}><i className="ti ti-smart-home"></i><span>MRP</span></a></li>
                                    </ul>
                                </li>
                            )}
                            {/* Purchase Section */}
                            {hasPermission("Purchase") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                className={
                                                    [
                                                        "/PurchaseEnquiry",
                                                        "/PurchaseQuotation",
                                                        "/PurchaseOrder",
                                                        "/PurchaseIndentsummary",
                                                        "/PurchaseQuotationsDisplay",
                                                        "/PurchaseOrderList"
                                                    ].some(path => isActive(path)) || openSubmenus.purchase
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("purchase");
                                                }}>
                                                <i className="ti ti-shopping-cart-dollar"></i><span>Purchase</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.purchase ? "block" : "none" }}>
                                                {hasSubPermission("Purchase", "Purchase Indent") && (
                                                    <li><a href="/PurchaseEnquiry" className={isActive("/PurchaseEnquiry") ? "active" : ""}>Purchase Enquiry</a></li>
                                                )}
                                                {hasSubPermission("Purchase", "Purchase Quotation") && (
                                                    <li><a href="/PurchaseQuotation" className={isActive("/PurchaseQuotation") ? "active" : ""}>Purchase Quotation</a></li>
                                                )}
                                                {hasSubPermission("Purchase", "Purchase Order") && (
                                                    <li><a href="/PurchaseContract" className={isActive("/PurchaseContract") ? "active" : ""}>Purchase Contract</a></li>
                                                )}
                                                {hasSubPermission("Purchase", "Purchase Order") && (
                                                    <li><a href="/PurchaseOrder" className={isActive("/PurchaseOrder") ? "active" : ""}>Purchase Order</a></li>
                                                )}
                                                <li className="submenu submenu-two">
                                                    <a
                                                        style={{ cursor: "pointer" }}
                                                        className={
                                                            ["/PurchaseIndentsummary", "/PurchaseQuotationsDisplay", "/PurchaseOrderList"].some(path => isActive(path)) || openSubmenus.purchasereport
                                                                ? "active subdrop"
                                                                : ""
                                                        }
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            handleToggle("purchasereport");
                                                        }}
                                                    >
                                                        Purchase Report <span className="menu-arrow inside-submenu"></span>
                                                    </a>
                                                    <ul
                                                        style={{
                                                            display:
                                                                ["/PurchaseIndentsummary", "/PurchaseQuotationsDisplay", "/PurchaseOrderList"].some(path => isActive(path)) || openSubmenus.purchasereport
                                                                    ? "block"
                                                                    : "none"
                                                        }}
                                                    >
                                                        {hasSubPermission("Purchase", "Purchase Indent List") && (
                                                            <li>
                                                                <a href="/PurchaseIndentsummary" className={isActive("/PurchaseIndentsummary") ? "active" : ""}>
                                                                    Purchase Enquiry List
                                                                </a>
                                                            </li>
                                                        )}
                                                        {hasSubPermission("Purchase", "Purchase Quotations List") && (
                                                            <li>
                                                                <a href="/PurchaseQuotationsDisplay" className={isActive("/PurchaseQuotationsDisplay") ? "active" : ""}>
                                                                    Purchase Quotations List
                                                                </a>
                                                            </li>
                                                        )}
                                                        {hasSubPermission("Purchase", "Purchase Order List") && (
                                                            <li>
                                                                <a href="/PurchaseContractsummary" className={isActive("/PurchaseContractsummary") ? "active" : ""}>
                                                                    Purchase Contract List
                                                                </a>
                                                            </li>
                                                        )}
                                                        {hasSubPermission("Purchase", "Purchase Order List") && (
                                                            <li>
                                                                <a href="/PurchaseOrderList" className={isActive("/PurchaseOrderList") ? "active" : ""}>
                                                                    Purchase Order List
                                                                </a>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Sales Section */}
                            {hasPermission("Sales") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                className={
                                                    [
                                                        "/SalesEnquiry",
                                                        "/SalesQuotation",
                                                        "/SalesOrder",
                                                        "/SalesEnquiryList",
                                                        "/SalesQuotationList",
                                                        "/SalesOrderList"
                                                    ].some(path => isActive(path)) || openSubmenus.sales
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("sales");
                                                }}>
                                                <i className="ti ti-shopping-cart-dollar"></i><span>Sales</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.sales ? "block" : "none" }}>
                                                {hasSubPermission("Sales", "Sales Indent") && (
                                                    <li><a href="/SalesEnquiry" className={isActive("/SalesEnquiry") ? "active" : ""}>Sales Enquiry</a></li>
                                                )}
                                                {hasSubPermission("Sales", "Sales Quotation Form") && (
                                                    <li><a href="/SalesQuotation" className={isActive("/SalesQuotation") ? "active" : ""}>Sales Quotation</a></li>
                                                )}
                                                {hasSubPermission("Sales", "Sales Quotation Form") && (
                                                    <li><a href="/SalesContract" className={isActive("/SalesContract") ? "active" : ""}>Sales Contract</a></li>
                                                )}
                                                {hasSubPermission("Sales", "Sales Order") && (
                                                    <li><a href="/SalesOrder" className={isActive("/SalesOrder") ? "active" : ""}>Sales Order</a></li>
                                                )}

                                                <li className="submenu submenu-two">
                                                    <a
                                                        style={{ cursor: "pointer" }}
                                                        className={
                                                            ["/SalesEnquiryList", "/SalesQuotationList", "/SalesOrderList"].some(path => isActive(path)) || openSubmenus.salesreport
                                                                ? "active subdrop"
                                                                : ""
                                                        }
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            handleToggle("salesreport");
                                                        }}>
                                                        Sales Report <span className="menu-arrow inside-submenu"></span>
                                                    </a>
                                                    <ul
                                                        style={{
                                                            display:
                                                                ["/SalesEnquiryList", "/SalesQuotationList", "/SalesOrderList"].some(path => isActive(path)) || openSubmenus.salesreport
                                                                    ? "block"
                                                                    : "none"
                                                        }}>
                                                        {hasSubPermission("Sales", "Sales Indent List") && (
                                                            <li><a href="/SalesEnquiryList" className={isActive("/SalesEnquiryList") ? "active" : ""}>Sales Enquiry List</a></li>
                                                        )}
                                                        {hasSubPermission("Sales", "Sales Quotations List") && (
                                                            <li><a href="/SalesQuotationList" className={isActive("/SalesQuotationList") ? "active" : ""}>Sales Quotations List</a></li>
                                                        )}
                                                        {hasSubPermission("Sales", "Sales Quotations List") && (
                                                            <li><a href="/SalesContractsummary" className={isActive("/SalesContractsummary") ? "active" : ""}>Sales Contract List</a></li>
                                                        )}
                                                        {hasSubPermission("Sales", "Sales Order List") && (
                                                            <li><a href="/SalesOrderList" className={isActive("/SalesOrderList") ? "active" : ""}>Sales Order List</a></li>
                                                        )}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Inventory Section */}
                            {hasPermission("Inventory") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                className={
                                                    [
                                                        "/MatrialReceipt",
                                                        "/MatrialIssue",
                                                        "/MatrialTransfer",
                                                        "/StockListERP",
                                                        "/MatrialReceiptList"
                                                    ].some(path => isActive(path)) || openSubmenus.inventory
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("inventory");
                                                }}>
                                                <i className="ti ti-box"></i><span>Inventory</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.inventory ? "block" : "none" }}>
                                                {hasSubPermission("Inventory", "Material Receipt") && (
                                                    <li><a href="/MatrialReceipt" className={isActive("/MatrialReceipt") ? "active" : ""}>Material Receipt</a></li>
                                                )}
                                                {hasSubPermission("Inventory", "Material Issue") && (
                                                    <li><a href="/MatrialIssue" className={isActive("/MatrialIssue") ? "active" : ""}>Material Issue</a></li>
                                                )}
                                                {hasSubPermission("Inventory", "Material Transfer") && (
                                                    <li><a href="/MatrialTransfer" className={isActive("/MatrialTransfer") ? "active" : ""}>Delivery Challan</a></li>
                                                )}
                                                {hasSubPermission("Inventory", "Stock List") && (
                                                    <li><a href="/StockListERP" className={isActive("/StockListERP") ? "active" : ""}>Stock List</a></li>
                                                )}

                                                <li className="submenu submenu-two">
                                                    <a
                                                        style={{ cursor: "pointer" }}
                                                        className={
                                                            ["/MatrialReceiptList", "/StockListERP"].some(path => isActive(path)) || openSubmenus.inventoryreport
                                                                ? "active subdrop"
                                                                : ""
                                                        }
                                                        onClick={e => {
                                                            e.preventDefault();
                                                            handleToggle("inventoryreport");
                                                        }}>
                                                        Inventory Report <span className="menu-arrow inside-submenu"></span>
                                                    </a>
                                                    <ul
                                                        style={{
                                                            display:
                                                                ["/MatrialReceiptList", "/StockListERP"].some(path => isActive(path)) || openSubmenus.inventoryreport
                                                                    ? "block"
                                                                    : "none"
                                                        }}>
                                                        {hasSubPermission("Inventory", "Material Receipt List") && (
                                                            <li><a href="/MatrialReceiptList" className={isActive("/MatrialReceiptList") ? "active" : ""}>Material Receipt List</a></li>
                                                        )}
                                                        {hasSubPermission("Inventory", "Material Issue List") && (
                                                            <li><a href="/StockListERP" className={isActive("/StockListERP") ? "active" : ""}>Stock List</a></li>
                                                        )}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Invoice and Billing Section */}
                           
                            {hasPermission("Invoice") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("invoice");
                                                }}
                                                className={
                                                    ["/InvoiceForm", "/InvoiceList", "/BillingForm", "/BillingDisplay", "/VendorBillingForm", "/VendorBillingDisplay"].some(path => isActive(path)) || openSubmenus.invoice
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                            >
                                                <i className="ti ti-file-dollar"></i><span>Invoice</span>
                                                <span className="menu-arrow"></span>
                                            </a>

                                            <ul style={{ display: openSubmenus.invoice ? "block" : "none" }}>
                                                {/* Vendor Invoice Section */}
                                                {hasPermission("Invoice") && (
                                                    <li className="submenu submenu-two">
                                                        <a
                                                            href="#"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleToggle("vendorBilling");
                                                            }}
                                                            className={
                                                                ["/VendorBillingForm", "/VendorBillingDisplay"].some(path => isActive(path)) || openSubmenus.vendorBilling
                                                                    ? "active subdrop"
                                                                    : ""
                                                            }
                                                        >
                                                            <i className="ti ti-file-dollar"></i><span>Vendor Invoice</span>
                                                            <span className="menu-arrow"></span>
                                                        </a>
                                                        <ul style={{ display: openSubmenus.vendorBilling ? "block" : "none" }}>
                                                            {hasSubPermission("Invoice", "Invoice Form") && (
                                                                <li>
                                                                    <a href="/InvoiceForm" className={isActive("/InvoiceForm") ? "active" : ""}>
                                                                        Vendor Invoice Creation
                                                                    </a>
                                                                </li>
                                                            )}
                                                            {hasSubPermission("Invoice", "Invoice List") && (
                                                                <li>
                                                                    <a href="/InvoiceList" className={isActive("/InvoiceList") ? "active" : ""}>
                                                                        Vendor Invoice List
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </li>
                                                )}

                                                {/* Customer Invoice Section (existing) */}
                                                {hasPermission("Billing") && (
                                                    <li className="submenu submenu-two">
                                                        <a
                                                            href="#"
                                                            onClick={e => {
                                                                e.preventDefault();
                                                                handleToggle("billing");
                                                            }}
                                                            className={
                                                                ["/BillingForm", "/BillingDisplay"].some(path => isActive(path)) || openSubmenus.billing
                                                                    ? "active subdrop"
                                                                    : ""
                                                            }
                                                        >
                                                            <i className="ti ti-file-dollar"></i><span>Customer Invoice</span>
                                                            <span className="menu-arrow"></span>
                                                        </a>
                                                        <ul style={{ display: openSubmenus.billing ? "block" : "none" }}>
                                                            {hasSubPermission("Billing", "Billing Form") && (
                                                                <li>
                                                                    <a href="/BillingForm" className={isActive("/BillingForm") ? "active" : ""}>
                                                                        Customer Invoice Creation
                                                                    </a>
                                                                </li>
                                                            )}
                                                            {hasSubPermission("Billing", "Billing List") && (
                                                                <li>
                                                                    <a href="/BillingDisplay" className={isActive("/BillingDisplay") ? "active" : ""}>
                                                                        Customer Invoice List
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </li>
                                                )}
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Accounts Section with GST, Ledger, Payments */}
                            {hasPermission("Dashboard") && (
                                <li>
                                    <ul>
                                        <li className="submenu">
                                            <a
                                                href="#"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleToggle("accounts");
                                                }}
                                                className={
                                                    ["/gst", "/Ledger", "/Payments"].some(path => isActive(path)) || openSubmenus.accounts
                                                        ? "active subdrop"
                                                        : ""
                                                }
                                            >
                                                <i className="ti ti-credit-card"></i><span>Accounts</span>
                                                <span className="menu-arrow"></span>
                                            </a>
                                            <ul style={{ display: openSubmenus.accounts ? "block" : "none" }}>
                                                <li>
                                                    <a href="/gst" className={isActive("/gst") ? "active" : ""}>
                                                        GST
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/Ledger" className={isActive("/Ledger") ? "active" : ""}>
                                                        Ledger
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/Paymentdisplay" className={isActive("/Paymentdisplay") ? "active" : ""}>
                                                        Payments
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            )}

                            {/* Show message if no permissions */}
                            {permissions.length === 0 && (
                                <li className="menu-title">
                                    <span>No permissions assigned for role: {activeRole}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar;