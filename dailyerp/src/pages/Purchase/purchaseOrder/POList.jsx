import React, { useEffect, useState } from "react";
import axios from "axios";

function PurchaseOrderDisplay() {
  const [pos, setPos] = useState([]);
  const [filteredPos, setFilteredPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const storedRole = localStorage.getItem('activeRole');
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({
    fromDate: "",
    toDate: "",
  });
  // Search functionality
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchType, setSearchType] = useState("poNumber");
  const [searchResults, setSearchResults] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [approvalData, setApprovalData] = useState({
    approvedBy: "",
    approvalDate: "",
    approvalComments: ""
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    poNumber: "",
    category: "",
    date: "",
    vendor: "",
    deliveryLocation: "",
    deliveryAddress: "",
    quotationNumber: "",
    items: [],
    remarks: "",
    notes: "",
    preparedby: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    taxDiscount: 0,
    total: 0,
    finalTotal: 0
  });

  // Vendors and categories for dropdowns
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
    fetchCategories();
  }, []);

  const fetchVendors = async () => {
    try {
      const companyId = localStorage.getItem("selectedCompanyId");
      const financialYear = localStorage.getItem("financialYear");
      const response = await axios.get("http://localhost:8080/api/vendors", {
        params: { companyId, financialYear }
      });
      setVendors(response.data);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const companyId = localStorage.getItem("selectedCompanyId");
      const response = await axios.get("http://localhost:8080/api/po-categories", {
        params: { companyId }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPurchaseOrders = () => {
    setLoading(true);
    const companyId = localStorage.getItem("selectedCompanyId");
    const financialYear = localStorage.getItem("financialYear");

    axios
      .get("http://localhost:8080/api/purchase-orders", {
        params: { companyId, financialYear },
      })
      .then((res) => {
        const sortedData = res.data.slice().sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.date || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.date || 0);
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
        });
        setPos(sortedData);
        setFilteredPos(sortedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching POs:", err);
        alert("Failed to fetch POs");
        setLoading(false);
      });
  };

  const applyFilters = () => {
    let filtered = pos;

    if (searchQuery.trim()) {
      filtered = filtered.filter((po) => {
        const searchFields = [
          po.poNumber,
          po.vendor,
          po.category,
          po.quotationNumber,
          po.deliveryLocation,
          po.deliveryAddress,
          po.date,
        ];

        return searchFields.some(
          (field) =>
            field &&
            field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    if (dateFilter.fromDate || dateFilter.toDate) {
      filtered = filtered.filter((po) => {
        const createdDate = new Date(po.date);
        const fromDate = dateFilter.fromDate
          ? new Date(dateFilter.fromDate)
          : null;
        const toDate = dateFilter.toDate ? new Date(dateFilter.toDate) : null;

        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
        }

        let matchesDateRange = true;

        if (fromDate && createdDate < fromDate) {
          matchesDateRange = false;
        }

        if (toDate && createdDate > toDate) {
          matchesDateRange = false;
        }

        return matchesDateRange;
      });
    }

    setFilteredPos(filtered);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter((prev) => ({ ...prev, [field]: value }));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setDateFilter({ fromDate: "", toDate: "" });
    setFilteredPos(pos);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, dateFilter, pos]);

  // Search functionality
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = pos.filter((po) => {
      switch (searchType) {
        case "poNumber":
          return po.poNumber?.toLowerCase().includes(query.toLowerCase());
        case "vendor":
          return po.vendor?.toLowerCase().includes(query.toLowerCase());
        case "category":
          return po.category?.toLowerCase().includes(query.toLowerCase());
        case "quotationNumber":
          return po.quotationNumber?.toLowerCase().includes(query.toLowerCase());
        default:
          return po.poNumber?.toLowerCase().includes(query.toLowerCase());
      }
    });

    setSearchResults(results);
  };

  const handleViewAll = () => {
    setSearchResults(pos);
    setSearchQuery("");
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchQuery("");
  };

  const selectPOFromSearch = (selectedPO) => {
    setFilteredPos([selectedPO]);
    setCurrentPage(1);
    closeSearchModal();
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchResults([]);
    setSearchQuery("");
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const resetFilter = () => {
    setFilteredPos(pos);
    setCurrentPage(1);
  };

  // Edit functionality
  const handleEdit = (po) => {
    setEditData({
      _id: po._id,
      poNumber: po.poNumber || "",
      category: po.category || "",
      date: po.date || "",
      vendor: po.vendor || "",
      deliveryLocation: po.deliveryLocation || "",
      deliveryAddress: po.deliveryAddress || "",
      quotationNumber: po.quotationNumber || "",
      items: po.items || [],
      remarks: po.remarks || "",
      notes: po.notes || "",
      preparedby: po.preparedby || "",
      cgst: po.cgst || 0,
      sgst: po.sgst || 0,
      igst: po.igst || 0,
      taxDiscount: po.taxDiscount || 0,
      total: po.total || 0,
      finalTotal: po.finalTotal || 0
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditData({
      poNumber: "",
      category: "",
      date: "",
      vendor: "",
      deliveryLocation: "",
      deliveryAddress: "",
      quotationNumber: "",
      items: [],
      remarks: "",
      notes: "",
      preparedby: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxDiscount: 0,
      total: 0,
      finalTotal: 0
    });
  };

  const handleEditInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate item total if price or quantity changes
    if (field === 'price' || field === 'quantity') {
      const price = field === 'price' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].price) || 0;
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].quantity) || 0;
      updatedItems[index].total = price * quantity;
    }

    setEditData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Recalculate totals
    calculateTotals(updatedItems);
  };

  const addNewItem = () => {
    const newItem = {
      materialId: "",
      description: "",
      quantity: 0,
      unit: "",
      price: 0,
      deliveryDate: "",
      total: 0
    };

    setEditData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index) => {
    const updatedItems = editData.items.filter((_, i) => i !== index);
    setEditData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items = editData.items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0));
    }, 0);

    const cgstAmount = (subtotal * (parseFloat(editData.cgst) || 0)) / 100;
    const sgstAmount = (subtotal * (parseFloat(editData.sgst) || 0)) / 100;
    const igstAmount = (subtotal * (parseFloat(editData.igst) || 0)) / 100;
    const taxDiscount = parseFloat(editData.taxDiscount) || 0;

    const finalTotal = subtotal + cgstAmount + sgstAmount + igstAmount - taxDiscount;

    setEditData(prev => ({
      ...prev,
      total: subtotal,
      finalTotal: finalTotal
    }));
  };

  // Update calculateTotals to be triggered on tax changes
  useEffect(() => {
    if (editData.items.length > 0) {
      calculateTotals();
    }
  }, [editData.cgst, editData.sgst, editData.igst, editData.taxDiscount]);

  const submitEdit = async () => {
    try {
      if (!editData.poNumber || !editData.vendor) {
        alert("Please fill in all required fields (PO Number and Vendor)");
        return;
      }

      const companyId = localStorage.getItem("selectedCompanyId");
      const financialYear = localStorage.getItem("financialYear");

      const updatePayload = {
        ...editData,
        companyId,
        financialYear,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(
        `http://localhost:8080/api/purchase-orders/${editData._id}`,
        updatePayload
      );

      // Update the local state with the response data
      const updatedPos = pos.map(po =>
        po._id === editData._id ? response.data : po
      );

      setPos(updatedPos);
      setFilteredPos(updatedPos.filter(po =>
        filteredPos.some(filteredPo => filteredPo._id === po._id)
      ));

      closeEditModal();

      alert("Purchase Order updated successfully!");

    } catch (error) {
      console.error("Error updating PO:", error);
      alert(`Failed to update Purchase Order: ${error.response?.data?.error || error.message}`);
    }
  };

  // Approval functionality
  const handleApprove = (po) => {
    setSelectedPO(po);
    setApprovalData({
      approvedBy: '', // Auto-fill with current user
      approvalDate: "", // Current date from context
      approvalComments: ""
    });
    setShowApprovalModal(true);
  };

  const submitApproval = async () => {
    try {
      if (!approvalData.approvedBy || !approvalData.approvalDate) {
        alert("Please fill in all required approval fields");
        return;
      }

      const companyId = localStorage.getItem("selectedCompanyId");
      const financialYear = localStorage.getItem("financialYear");

      const approvalPayload = {
        status: "approved",
        approvedBy: approvalData.approvedBy,
        approvalDate: approvalData.approvalDate,
        approvalComments: approvalData.approvalComments,
        companyId,
        financialYear
      };

      const response = await axios.put(
        `http://localhost:8080/api/purchase-orders/${selectedPO._id}/approve`,
        approvalPayload
      );

      // Update the local state with the response data
      const updatedPos = pos.map(po =>
        po._id === selectedPO._id ? response.data.purchaseOrder || response.data : po
      );

      setPos(updatedPos);
      setFilteredPos(updatedPos.filter(po =>
        filteredPos.some(filteredPo => filteredPo._id === po._id)
      ));

      setShowApprovalModal(false);
      setSelectedPO(null);

      alert("Purchase Order approved successfully!");

    } catch (error) {
      console.error("Error approving PO:", error);
      alert(`Failed to approve Purchase Order: ${error.response?.data?.error || error.message}`);
    }
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setSelectedPO(null);
    setApprovalData({
      approvedBy: "",
      approvalDate: "2025-01-02",
      approvalComments: ""
    });
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPos.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePrint = async (po) => {
    try {
      const companyId = localStorage.getItem("selectedCompanyId");
      const financialYear = localStorage.getItem("financialYear");

      const [vendorResponse, companyResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/vendors/${po.vendor}`, {
          params: { companyId, financialYear },
        }),
        axios.get(`http://localhost:8080/api/companies/${companyId}`),
      ]);

      const vendor = vendorResponse.data;
      const company = companyResponse.data;

      const getImageAsBase64 = async (imagePath) => {
        try {
          const filename = imagePath.includes('/')
            ? imagePath.split('/').pop()
            : imagePath;

          const url = `http://localhost:8080/api/image/${filename}`;
          const response = await axios.get(url, {
            responseType: 'arraybuffer'
          });

          const base64 = btoa(
            new Uint8Array(response.data)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          return `data:image/jpeg;base64,${base64}`;
        } catch (error) {
          console.error('Error fetching image:', error);
          return null;
        }
      };

      let logoBase64 = null;
      if (company.logo) {
        logoBase64 = await getImageAsBase64(company.logo);
      }

      // Generate item rows
      const itemRows = po.items
        .map(
          (item, idx) => `
     <tr>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${idx + 1}</td>
       <td style="border: 1px solid #000; padding: 4px;">${item.materialId || ""}</td>
       <td style="border: 1px solid #000; padding: 4px;">${item.description || ""}</td>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.deliveryDate || ""}</td>
       <td style="text-align: center; border: 1px solid #000; padding: 4px;">${item.quantity || ""} ${item.unit || ""}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${item.price || 0}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${item.price || 0}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
       <td style="text-align: right; border: 1px solid #000; padding: 4px;">₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
     </tr>
   `
        )
        .join("");

      // Generate notes from po.notes field
      const notesRows = (() => {
        if (po.notes) {
          if (typeof po.notes === 'string') {
            const noteLines = po.notes.split('\n').filter(line => line.trim() !== '');
            if (noteLines.length > 0) {
              return noteLines.map((note, idx) => `
           <tr>
             <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">${idx + 1}.</td>
             <td style="border: 1px solid #000; padding: 4px;">${note.trim()}</td>
           </tr>
         `).join("");
            }
          } else if (Array.isArray(po.notes) && po.notes.length > 0) {
            return po.notes.map((note, idx) => `
         <tr>
           <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">${idx + 1}.</td>
           <td style="border: 1px solid #000; padding: 4px;">${note}</td>
         </tr>
       `).join("");
          }
        }

        return `
     <tr>
       <td style="border: 1px solid #000; padding: 4px; vertical-align: top; width: 30px;">-</td>
       <td style="border: 1px solid #000; padding: 4px; color: #666; font-style: italic;">No notes available</td>
     </tr>
   `;
      })();

      const generalConditionsDisplay = po.generalConditions && po.generalConditions.length > 0
        ? po.generalConditions.map((condition, idx) => `
           <div style="margin-bottom: 8px;">
             <strong>${idx + 1}. ${condition.name}:</strong><br>
             ${condition.description}
           </div>
         `).join("")
        : "";

      const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (num === 0) return 'Zero';
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
        if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
        if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
        return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
      };

      const html = `
     <!DOCTYPE html>
     <html>
     <head>
       <title>Purchase Order - ${po.poNumber}</title>
       <style>
         @page {
           size: A4;
           margin: 0.5in;
         }
         body {
           font-family: Arial, sans-serif;
           font-size: 11px;
           line-height: 1.2;
           margin: 0;
           padding: 0;
           color: #000;
         }
         .header-table {
           width: 100%;
           border-collapse: collapse;
           border: 2px solid #000;
           margin-bottom: 0;
         }
         .header-table td {
           border: 1px solid #000;
           padding: 4px;
           vertical-align: top;
         }
         .main-table {
           width: 100%;
           border-collapse: collapse;
           border: 2px solid #000;
           margin-top: 0;
         }
         .main-table td, .main-table th {
           border: 1px solid #000;
           padding: 4px;
           vertical-align: top;
         }
         .center {
           text-align: center;
         }
         .bold {
           font-weight: bold;
         }
         .section-header {
           background-color: #f0f0f0;
           font-weight: bold;
           text-align: center;
           padding: 6px;
         }
         .amount-cell {
           text-align: right;
           padding-right: 8px;
         }
         .print-note {
           font-size: 10px;
           color: #666;
           text-align: center;
           margin-top: 10px;
         }
         .no-border {
           border: none !important;
         }
         .logo-img {
           max-width: 100px;
           max-height: 80px;
           object-fit: contain;
         }
         .general-conditions {
           padding: 8px;
           font-size: 10px;
           line-height: 1.3;
         }
       </style>
     </head>
     <body>
       <!-- Header Section -->
       <table class="header-table">
         <tr>
           <td colspan="6" class="section-header">PURCHASE ORDER</td>
         </tr>
         <tr>
           <td class="bold" style="width: 120px;">PO No.:</td>
           <td style="width: 150px;">${po.poNumber}</td>
           <td rowspan="6" style="text-align: center; vertical-align: middle; width: 200px;">
           ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="logo-img">` : `<div style="border: 1px dashed #ccc; padding: 20px; color: #999;">No Logo</div>`}
           </td>
         </tr>
         <tr>
           <td class="bold">PO Date:</td>
           <td>${po.date}</td>
         </tr>
         <tr>
           <td class="bold">Rev. No.:</td>
           <td>${po.revisionNumber || "1.0"}</td>
         </tr>
         <tr>
           <td class="bold">Rev. Date:</td>
           <td>${po.revisionDate || po.date}</td>
         </tr>
         <tr>
           <td class="bold">Ref No.:</td>
           <td>${po.refNumber || ""}</td>
         </tr>
         <tr>
           <td class="bold">Ref Date:</td>
           <td>${po.refDate || po.date}</td>
         </tr>
         <tr>
           <td class="bold">Supplier Details:</td>
           <td colspan="2">
             <strong>M/s. ${vendor.name1 || vendor.name}</strong><br>
             ${vendor.address1 || ""}<br>
             ${vendor.address2 || ""}<br>
             ${vendor.city || ""}, ${vendor.region || ""}<br>
             ${vendor.country || ""}<br>
             ${vendor.pincode || ""}<br>
             Contact Details: ${vendor.contactNo || ""}<br>
             ${vendor.email || ""}
           </td>
         </tr>
         <tr>
           <td class="bold">GSTIN:</td>
           <td>${company.gstin || ""}</td>
           <td></td>
         </tr>
       </table>
 
       <!-- Bill To and Ship To -->
       <table class="main-table">
         <tr>
           <td class="bold section-header">BILL TO:</td>
           <td class="bold section-header">SHIP TO:</td>
         </tr>
         <tr>
           <td style="width: 50%; padding: 8px;">
             <strong>M/s. ${company.name || ""}</strong><br>
             ${company.address1 || ""}<br>
             ${company.address || ""}<br>
             ${company.city || ""} ${company.state || ""}<br>
             <strong>Tel:</strong> ${company.phone || ""}<br>
             <strong>Email:</strong> ${company.email || ""}
           </td>
           <td style="width: 50%; padding: 8px;">
             <strong>M/s. ${company.name || ""}</strong><br>
             ${company.address1 || ""}<br>
             ${company.address || ""}<br>
             ${company.city || ""} ${company.state || ""}<br>
             <strong>Tel:</strong> ${company.phone || ""}<br>
             <strong>Email:</strong> ${company.email || ""}
           </td>
         </tr>
       </table>
 
       <!-- Items Section -->
       <table class="main-table">
         <tr>
           <td colspan="9" class="section-header">PLEASE SUPPLY THE FOLLOWING ITEMS AS PER THE DETAILS MENTIONED BELOW:</td>
         </tr>
         <tr class="bold" style="background-color: #f0f0f0;">
           <td class="center">SI No</td>
           <td class="center">Part No</td>
           <td class="center">Description</td>
           <td class="center">Schedule</td>
           <td class="center">Quantity & Unit</td>
           <td class="center">Unit Price</td>
           <td class="center">Unit Price (₹)</td>
           <td class="center">Int (₹)</td>
           <td class="center">Total</td>
         </tr>
         ${itemRows}
         <tr>
           <td colspan="6" class="bold">Basic Total:</td>
           <td class="amount-cell bold">₹${po.total || 0}</td>
           <td colspan="2"></td>
         </tr>
       </table>
 
       <!-- Notes Section -->
       <table class="main-table">
         <tr>
           <td colspan="2" class="section-header">NOTES:</td>
         </tr>
         ${notesRows}
       </table>
 
       <!-- Tax Summary -->
       <table class="main-table">
         <tr>
           <td style="width: 60%;">
             <strong>Total Amount (In Words):</strong><br>
             Rupees ${numberToWords(Math.floor(po.finalTotal || po.total || 0))} Only
           </td>
           <td style="width: 40%;">
             <table style="width: 100%; border-collapse: collapse;">
               <tr>
                 <td class="no-border" style="padding: 2px;"><strong>SGST(${po.sgst || 0}%):</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;">₹${((po.total * (po.sgst || 0)) / 100).toFixed(2)}</td>
               </tr>
               <tr>
                 <td class="no-border" style="padding: 2px;"><strong>CGST(${po.cgst || 0}%):</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;">₹${((po.total * (po.cgst || 0)) / 100).toFixed(2)}</td>
               </tr>
               <tr style="border-top: 1px solid #000;">
                 <td class="no-border" style="padding: 2px;"><strong>Net Total:</strong></td>
                 <td class="no-border" style="padding: 2px; text-align: right;"><strong>₹${po.finalTotal || po.total || 0}</strong></td>
               </tr>
             </table>
           </td>
         </tr>
       </table>
 
       <!-- Remarks -->
       <table class="main-table">
         <tr>
           <td class="bold" style="width: 100px;">REMARKS:</td>
           <td>${po.remarks || ""}</td>
         </tr>
       </table>
 
       <!-- Terms and Conditions -->
       <table class="main-table">
         <tr>
           <td style="width: 50%;">
             <strong>TERMS & CONDITIONS:</strong><br>
             <div class="general-conditions">
               ${generalConditionsDisplay || po.termsAndConditions || ""}
             </div>
           </td>
           <td style="width: 50%;">
             <strong>PREPARED BY:</strong> ${po.preparedby || ""}<br><br>
             <strong>APPROVED BY:</strong> ${po.approvedBy || po.approvedby || ""}
           </td>
         </tr>
       </table>
 
       <div class="print-note">
         This is an electronically generated document and does not require signature.
       </div>
     </body>
     </html>
   `;

      const printWindow = window.open("", "_blank", "width=800,height=600");
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();

      printWindow.onload = function () {
        printWindow.print();
      };
    } catch (error) {
      console.error("Error generating print:", error);
      alert("Error generating print. Please try again.");
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      default:
        return <span className="badge bg-secondary">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="content">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading Purchase Orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb">
        <div className="my-auto">
          <h2 className="mb-1">Purchase Order Display</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
              </li>
              <li className="breadcrumb-item">Purchase</li>
              <li className="breadcrumb-item active" aria-current="page">Purchase Order Display</li>
            </ol>
          </nav>
        </div>
        {/* <div className="head-icons">
          <button
            className="btn btn-primary btn-sm"
            onClick={openSearchModal}
            title="Advanced Search"
          >
            <i className="fas fa-search me-1"></i>Advanced Search
          </button>
        </div> */}
      </div>

      {/* Purchase Orders Table */}
      <div className="card">
        <div className="card-header">
          <div className="row">
            <div className="col-md-6">
            </div>
            <div className="col-md-2">
              <label className="form-label">Search All Fields</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search across all fields..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter.fromDate}
                onChange={(e) =>
                  handleDateFilterChange("fromDate", e.target.value)
                }
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={dateFilter.toDate}
                onChange={(e) =>
                  handleDateFilterChange("toDate", e.target.value)
                }
              />
            </div>
          </div>
          {(searchQuery || dateFilter.fromDate || dateFilter.toDate) && (
            <div className="row mt-2">
              <div className="col-12">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearAllFilters}
                >
                  <i className="fas fa-times me-1"></i>Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>PO Number</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Quotation Number</th>
                  <th>Delivery Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((po) => (
                    <tr key={po._id}>
                      <td>
                        <span className="badge bg-primary">{po.poNumber}</span>
                      </td>
                      <td>{po.date}</td>
                      <td>{po.vendor}</td>
                      <td>{po.category}</td>
                      <td>{po.quotationNumber}</td>
                      <td>{po.deliveryLocation}</td>
                      <td>{getStatusBadge(po.status)}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(po)}
                            title="Edit Purchase Order"
                            disabled={po.status === 'approved'}
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          {po.status !== 'approved' && storedRole.toLowerCase() === 'admin' && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleApprove(po)}
                              title="Approve Purchase Order"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}

                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handlePrint(po)}
                            title="Print Purchase Order"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <i className="fas fa-inbox fa-2x text-muted mb-2"></i>
                      <p className="text-muted mb-0">
                        No purchase orders found
                      </p>
                      {(searchQuery || dateFilter.fromDate || dateFilter.toDate) && (
                        <button
                          className="btn btn-outline-primary btn-sm mt-2"
                          onClick={clearAllFilters}
                        >
                          <i className="fas fa-times me-1"></i>Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Purchase Orders pagination">
          <ul className="pagination justify-content-end">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <li
                  key={number}
                  className={`page-item ${currentPage === number ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                </li>
              )
            )}

            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>Edit Purchase Order - {editData.poNumber}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeEditModal}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>

                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-info-circle me-2"></i>Basic Information
                    </h6>

                    <div className="mb-3">
                      <label className="form-label">PO Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editData.poNumber}
                        onChange={(e) => handleEditInputChange('poNumber', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Date <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={editData.date}
                        onChange={(e) => handleEditInputChange('date', e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={editData.category}
                        onChange={(e) => handleEditInputChange('category', e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-truck me-2"></i>Delivery Information
                    </h6>

                    <div className="mb-3">
                      <label className="form-label">Vendor <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={editData.vendor}
                        onChange={(e) => handleEditInputChange('vendor', e.target.value)}
                        required
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id} value={vendor.name}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Delivery Location</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editData.deliveryLocation}
                        onChange={(e) => handleEditInputChange('deliveryLocation', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Delivery Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editData.deliveryAddress}
                        onChange={(e) => handleEditInputChange('deliveryAddress', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-primary mb-0">
                      <i className="fas fa-list me-2"></i>Items ({editData.items.length})
                    </h6>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={addNewItem}
                    >
                      <i className="fas fa-plus me-1"></i>Add Item
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Material ID</th>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Price</th>
                          <th>Delivery Date</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editData.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.materialId || ''}
                                onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.description || ''}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={item.quantity || ''}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={item.unit || ''}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                step="0.01"
                                className="form-control form-control-sm"
                                value={item.price || ''}
                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={item.deliveryDate || ''}
                                onChange={(e) => handleItemChange(index, 'deliveryDate', e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)).toFixed(2)}
                                readOnly
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeItem(index)}
                                disabled={editData.items.length <= 1}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tax and Totals */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-percentage me-2"></i>Tax Information
                    </h6>

                    <div className="row">
                      <div className="col-md-4">
                        <label className="form-label">CGST (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={editData.cgst}
                          onChange={(e) => handleEditInputChange('cgst', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">SGST (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={editData.sgst}
                          onChange={(e) => handleEditInputChange('sgst', e.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">IGST (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={editData.igst}
                          onChange={(e) => handleEditInputChange('igst', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="text-primary mb-3">
                      <i className="fas fa-calculator me-2"></i>Totals
                    </h6>

                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <strong>Subtotal:</strong>
                          <span>₹{editData.total.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>CGST ({editData.cgst}%):</span>
                          <span>₹{((editData.total * editData.cgst) / 100).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>SGST ({editData.sgst}%):</span>
                          <span>₹{((editData.total * editData.sgst) / 100).toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>IGST ({editData.igst}%):</span>
                          <span>₹{((editData.total * editData.igst) / 100).toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Final Total:</strong>
                          <strong>₹{editData.finalTotal.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Quotation Number</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editData.quotationNumber}
                        onChange={(e) => handleEditInputChange('quotationNumber', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Prepared By</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editData.preparedby}
                        onChange={(e) => handleEditInputChange('preparedby', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Remarks</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editData.remarks}
                        onChange={(e) => handleEditInputChange('remarks', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editData.notes}
                        onChange={(e) => handleEditInputChange('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  <i className="fas fa-times me-1"></i>Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={submitEdit}
                  disabled={!editData.poNumber || !editData.vendor}
                >
                  <i className="fas fa-save me-1"></i>Update Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="fas fa-check me-2"></i>Approve Purchase Order
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeApprovalModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>PO Number:</strong> {selectedPO?.poNumber}
                </div>
                <div className="mb-3">
                  <strong>Vendor:</strong> {selectedPO?.vendor}
                </div>
                <div className="mb-3">
                  <strong>Total Amount:</strong> ₹{(selectedPO?.finalTotal || selectedPO?.total || 0).toLocaleString('en-IN')}
                </div>

                <hr />

                <div className="mb-3">
                  <label className="form-label">Approved By <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={approvalData.approvedBy}
                    onChange={(e) =>
                      setApprovalData(prev => ({
                        ...prev,
                        approvedBy: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Approval Date <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={approvalData.approvalDate}
                    onChange={(e) =>
                      setApprovalData(prev => ({
                        ...prev,
                        approvalDate: e.target.value
                      }))
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Comments (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={approvalData.approvalComments}
                    onChange={(e) =>
                      setApprovalData(prev => ({
                        ...prev,
                        approvalComments: e.target.value
                      }))
                    }
                    placeholder="Enter approval comments..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeApprovalModal}
                >
                  <i className="fas fa-times me-1"></i>Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={submitApproval}
                  disabled={!approvalData.approvedBy || !approvalData.approvalDate}
                >
                  <i className="fas fa-check me-1"></i>Approve Purchase Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-search me-2"></i>Search Purchase Orders
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeSearchModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Search By</label>
                    <select
                      className="form-select"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="poNumber">PO Number</option>
                      <option value="vendor">Vendor</option>
                      <option value="category">Category</option>
                      <option value="quotationNumber">Quotation Number</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Search Query</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Search by ${searchType === "poNumber" ? "PO Number" : searchType}...`}
                        value={searchQuery}
                        onChange={handleSearchInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button className="btn btn-info" onClick={handleViewAll}>
                        <i className="fas fa-list me-1"></i>View All
                      </button>
                      {searchResults.length > 0 && (
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleClearResults}
                        >
                          <i className="fas fa-times me-1"></i>Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {searchResults.length > 0 ? (
                    <table className="table table-hover">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>PO Number</th>
                          <th>Date</th>
                          <th>Vendor</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {searchResults.map((po, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="badge bg-primary">
                                {po.poNumber}
                              </span>
                            </td>
                            <td>{po.date}</td>
                            <td>{po.vendor}</td>
                            <td>{po.category}</td>
                            <td>{getStatusBadge(po.status)}</td>
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => selectPOFromSearch(po)}
                              >
                                <i className="fas fa-check me-1"></i>Select
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {pos.length === 0
                          ? "No purchase orders loaded from API"
                          : searchQuery
                            ? `No purchase orders found matching "${searchQuery}"`
                            : 'Enter search term or click "View All"'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeSearchModal}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderDisplay;
