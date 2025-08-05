import React, { useState, useEffect } from "react";
import axios from "axios";

function Payment() {
  const [paymentData, setPaymentData] = useState({
    type: "vendor", // vendor or customer
    recordId: "",
    selectedRecord: null,
    paymentAmount: "",
    paymentMethod: "cash",
    description: "",
    docnumber: ""
  });
  const companyId = localStorage.getItem("selectedCompanyId");
  const financialYear = localStorage.getItem("financialYear");
  const selectedCompanyId = localStorage.getItem('selectedCompanyId');
  const [vendorInvoices, setVendorInvoices] = useState([]);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const vendorResponse = await axios.get("http://localhost:8080/api/invoiceform", {
        params: { companyId, financialYear }
      });
      const customerResponse = await axios.get("http://localhost:8080/api/billingform", {
        params: { companyId, financialYear }
      });

      setVendorInvoices(vendorResponse.data || []);
      setCustomerInvoices(customerResponse.data || []);
    } catch (error) {
      console.error("Error fetching invoices", error);
    }
  };

  const getCurrentRecords = () => {
    const records = paymentData.type === "vendor" ? vendorInvoices : customerInvoices;
    return records.filter(record => {
      const name = paymentData.type === "vendor"
        ? (record.vendor || "")
        : (record.salesOrderId?.customer || "");
      const docNumber = record.docnumber || "";

      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        docNumber.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const handleRecordSelection = (record) => {
    setPaymentData(prev => ({
      ...prev,
      recordId: record._id || record.id,
      selectedRecord: record,
      docnumber: record.docnumber || ""
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      // Reset selection when type changes
      setPaymentData(prev => ({
        ...prev,
        [name]: value,
        recordId: "",
        selectedRecord: null,
        docnumber: ""
      }));
      setSearchTerm("");
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateNewBalance = () => {
    if (!paymentData.selectedRecord || !paymentData.paymentAmount) return null;

    const currentBalance = paymentData.selectedRecord.balance || 0;
    const paymentAmount = parseFloat(paymentData.paymentAmount);

    // For vendor: payment reduces balance (we owe less)
    // For customer: payment reduces balance (they owe less)
    return currentBalance - paymentAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!paymentData.selectedRecord) {
        throw new Error("Please select a record to update");
      }

      const paymentAmount = parseFloat(paymentData.paymentAmount);
      const currentBalance = paymentData.selectedRecord.balance || 0;
      const newBalance = currentBalance - paymentAmount;

      // Prepare update payload
      const updatePayload = {
        balance: newBalance,
        lastPaymentAmount: paymentAmount,
        lastPaymentDate: new Date().toISOString(),
        lastPaymentMethod: paymentData.paymentMethod,
        paymentDescription: paymentData.description || `Payment via ${paymentData.paymentMethod}`
      };

      const endpoint = paymentData.type === "vendor"
        ? `http://localhost:8080/api/invoiceform/${paymentData.recordId}`
        : `http://localhost:8080/api/billingform/${paymentData.recordId}`;

      await axios.put(endpoint, updatePayload);

      // Create payment history record (optional)
      const paymentHistoryPayload = {
        recordType: paymentData.type,
        recordId: paymentData.recordId,
        docnumber: paymentData.docnumber,
        entityName: paymentData.type === "vendor"
          ? paymentData.selectedRecord.vendor
          : paymentData.selectedRecord.salesOrderId?.customer,
        paymentAmount: paymentAmount,
        previousBalance: currentBalance,
        newBalance: newBalance,
        paymentMethod: paymentData.paymentMethod,
        description: paymentData.description,
        paymentDate: new Date().toISOString()
      };

      // Save payment history (create this endpoint)
      try {
        await axios.post("http://localhost:8080/api/payment", paymentHistoryPayload);
      } catch (historyError) {
        console.warn("Payment history not saved:", historyError);
      }

      setMessage({
        type: "success",
        text: `Payment of ₹${paymentAmount} recorded successfully. New balance: ₹${newBalance.toFixed(2)}`
      });

      // Refresh invoices and reset form
      await fetchInvoices();
      setPaymentData({
        type: "vendor",
        recordId: "",
        selectedRecord: null,
        paymentAmount: "",
        paymentMethod: "cash",
        description: "",
        docnumber: ""
      });
      setSearchTerm("");

    } catch (error) {
      console.error("Error recording payment", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to record payment. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = getCurrentRecords();
  const newBalance = calculateNewBalance();

  return (
    <div className="content">
      <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
        <div className="my-auto mb-2">
          <h2 className="mb-1">Record Payment</h2>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="/dashboard">
                  <i className="ti ti-smart-home"></i>
                </a>
              </li>
              <li className="breadcrumb-item">
                <a href="/ledger">Ledger</a>
              </li>
              <li className="breadcrumb-item">Payment</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header text-white">
              <h5 className="mb-0">Update Balance with Payment</h5>
            </div>
            <div className="card-body">
              {message.text && (
                <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible`}>
                  {message.text}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMessage({ type: "", text: "" })}
                  ></button>
                </div>
              )}

              <div className="row">
                {/* Left side - Record Selection */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Payment Type *</label>
                    <select
                      className="form-select"
                      name="type"
                      value={paymentData.type}
                      onChange={handleInputChange}
                    >
                      <option value="vendor">Vendor Payment</option>
                      <option value="customer">Customer Payment</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Search Records</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Search by ${paymentData.type} name or document number...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Select Record to Update *</label>
                    <div className="border rounded" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {filteredRecords.length === 0 ? (
                        <div className="p-3 text-muted text-center">
                          No records found
                        </div>
                      ) : (
                        filteredRecords.map((record) => {
                          const entityName = paymentData.type === "vendor"
                            ? record.vendor
                            : record.salesOrderId?.customer;
                          const isSelected = paymentData.recordId === (record._id || record.id);

                          return (
                            <div
                              key={record._id || record.id}
                              className={`p-3 border-bottom cursor-pointer ${isSelected ? "bg-primary text-white" : "bg-light"}`}
                              onClick={() => handleRecordSelection(record)}
                              style={{ cursor: "pointer" }}
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <strong>{entityName || "Unknown"}</strong>
                                  <br />
                                  <small>Doc: {record.docnumber || "N/A"}</small>
                                </div>
                                <div className="text-end">
                                  <strong>₹{(record.balance || 0).toFixed(2)}</strong>
                                  <br />
                                  <small>Balance</small>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Payment Form */}
                <div className="col-md-6">
                  <form onSubmit={handleSubmit}>
                    {paymentData.selectedRecord && (
                      <div className="alert alert-info mb-3">
                        <h6>Selected Record:</h6>
                        <p className="mb-1">
                          <strong>
                            {paymentData.type === "vendor"
                              ? paymentData.selectedRecord.vendor
                              : paymentData.selectedRecord.salesOrderId?.customer}
                          </strong>
                        </p>
                        <p className="mb-1">Document: {paymentData.selectedRecord.docnumber}</p>
                        <p className="mb-0">Current Balance: <strong>₹{(paymentData.selectedRecord.balance || 0).toFixed(2)}</strong></p>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Payment Amount *</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="ti ti-currency-rupee"></i></span>
                        <input
                          type="number"
                          className="form-control"
                          name="paymentAmount"
                          value={paymentData.paymentAmount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                          disabled={!paymentData.selectedRecord}
                        />
                      </div>
                      {newBalance !== null && (
                        <small className="text-muted">
                          New balance will be: <strong>₹{newBalance.toFixed(2)}</strong>
                        </small>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className="form-select"
                        name="paymentMethod"
                        value={paymentData.paymentMethod}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={paymentData.description}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Payment description or notes..."
                      ></textarea>
                    </div>

                    <div className="d-flex justify-content-between">
                      <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !paymentData.selectedRecord || !paymentData.paymentAmount}
                      >
                        {loading ? "Updating..." : "Update Balance"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;