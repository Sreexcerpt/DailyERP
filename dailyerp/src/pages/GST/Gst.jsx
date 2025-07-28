import React, { useEffect, useState } from "react";
import axios from 'axios';

function GST() {
    const [error, setError] = useState(null);
    const [totalInputTax, setTotalInputTax] = useState(0);
    const [totalOutputTax, setTotalOutputTax] = useState(0);
    const [activeTab, setActiveTab] = useState('input');
    const [totalInputGST, setTotalInputGST] = useState(0);
    const [totalOutputGST, setTotalOutputGST] = useState(0);
    const [monthlyGSTSummary, setMonthlyGSTSummary] = useState([]);
    const [locations, setLocations] = useState([]);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendorinvoices, setVendorInvoices] = useState([]);
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filteredvendorinvoices, setFilteredVendorInvoices] = useState([]);
    const [filteredcustomerInvoices, setFilteredCustomerInvoices] = useState([]);
    const [financialYear, setFinancialYear] = useState('');
    const [monthYearOptions, setMonthYearOptions] = useState([]);

    // Helper: months in order
    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    useEffect(() => {
        // Get financial year from localStorage
        const year = localStorage.getItem('financialYear');
        setFinancialYear(year);

        axios.get("http://localhost:8080/api/locations")
            .then((res) => setLocations(res.data))
            .catch((err) => console.error("Error fetching locations", err));

        axios.get("http://localhost:8080/api/billingform")
            .then((res) => setCustomerInvoices(res.data))
            .catch((err) => console.error("Error fetching customer invoices", err));

        setMonths(monthNames);
    }, []);

    // Calculate month/year options based on financial year
    useEffect(() => {
        if (!financialYear) {
            setMonthYearOptions([]);
            return;
        }
        // Format: "01/04/2025 - 31/03/2026"
        const [start, end] = financialYear.split(' - ');
        if (!start || !end) {
            setMonthYearOptions(monthNames.map(m => ({ key: m, label: m })));
            return;
        }
        const [sd, sm, sy] = start.split('/');
        const [ed, em, ey] = end.split('/');
        const startYear = Number(sy);
        const endYear = Number(ey);

        // Build month-year options
        let options = [];
        for (let i = 0; i < monthNames.length; i++) {
            // Apr-Dec = start year, Jan-Mar = end year
            let label = "";
            if (i < 9) { // Apr (0) to Dec (8)
                label = `${monthNames[i]} ${startYear}`;
            } else { // Jan (9) to Mar (11)
                label = `${monthNames[i]} ${endYear}`;
            }
            options.push({
                key: `${monthNames[i]}-${i < 9 ? startYear : endYear}`,
                month: monthNames[i],
                year: i < 9 ? startYear : endYear,
                label: label,
            });
        }
        setMonthYearOptions(options);
    }, [financialYear]);

    // Helper to check if invoice date is in the selected financial year
    const isInFinancialYear = (dateString) => {
        if (!financialYear) return true;
        const [start, end] = financialYear.split(' - ');
        if (!start || !end) return true; // fallback
        const [sd, sm, sy] = start.split('/');
        const [ed, em, ey] = end.split('/');
        const startDate = new Date(`${sy}-${sm}-${sd}T00:00:00`);
        const endDate = new Date(`${ey}-${em}-${ed}T23:59:59`);
        const invoiceDate = new Date(dateString);
        return invoiceDate >= startDate && invoiceDate <= endDate;
    };

    useEffect(() => {
        const calculateMonthlyGSTSummary = () => {
            // Map months to month-year options
            const monthMap = {};
            monthYearOptions.forEach((opt) => {
                monthMap[opt.label] = {
                    month: opt.label,
                    input: 0,
                    output: 0,
                    balance: 0,
                };
            });

            vendorinvoices.forEach((invoice) => {
                if (!isInFinancialYear(invoice.createdAt)) return;
                const date = new Date(invoice.createdAt);
                const invoiceMonth = date.toLocaleString('en-US', { month: 'short' });
                const invoiceYear = date.getMonth() < 3 ? date.getFullYear() : date.getFullYear(); // Jan-Mar: year, Apr-Dec: year
                // Find corresponding label in monthYearOptions
                const label = monthYearOptions.find(opt => opt.month === invoiceMonth && opt.year === invoiceYear)?.label;
                const gst = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
                if (label && monthMap[label]) {
                    monthMap[label].input += gst;
                }
            });

            customerInvoices.forEach((invoice) => {
                if (!isInFinancialYear(invoice.createdAt)) return;
                const date = new Date(invoice.createdAt);
                const invoiceMonth = date.toLocaleString('en-US', { month: 'short' });
                const invoiceYear = date.getMonth() < 3 ? date.getFullYear() : date.getFullYear();
                const label = monthYearOptions.find(opt => opt.month === invoiceMonth && opt.year === invoiceYear)?.label;
                const gst = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
                if (label && monthMap[label]) {
                    monthMap[label].output += gst;
                }
            });

            const summary = Object.values(monthMap).map((entry) => ({
                ...entry,
                balance: entry.output - entry.input,
            }));

            setMonthlyGSTSummary(summary);
        };

        if (vendorinvoices.length || customerInvoices.length) {
            calculateMonthlyGSTSummary();
        }
    }, [vendorinvoices, customerInvoices, financialYear, months, monthYearOptions]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/invoiceform');
                const filtered = response.data.filter(invoice => {
                    if (!isInFinancialYear(invoice.createdAt)) return false;
                    const matchesLocation = !selectedLocation || invoice.location === selectedLocation;
                    // Get month and year for select match
                    const date = new Date(invoice.createdAt);
                    const invoiceMonth = date.toLocaleString('en-US', { month: 'short' });
                    const invoiceYear = date.getMonth() < 3 ? date.getFullYear() : date.getFullYear();
                    const matchesMonth = !selectedMonth ||
                        `${invoiceMonth} ${invoiceYear}` === selectedMonth;
                    return matchesLocation && matchesMonth;
                });
                const sorted = filtered?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const totalTax = filtered.reduce((sum, invoice) => {
                    return sum + (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
                }, 0);
                setTotalInputTax(totalTax);
                setTotalInputGST(totalTax);
                setVendorInvoices(response.data);
                setFilteredVendorInvoices(sorted);
                setError(null);
            } catch (err) {
                setError('Failed to fetch invoices');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [selectedMonth, selectedLocation, financialYear, monthYearOptions]);

    useEffect(() => {
        const fetchcInvoices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/billingform');
                const filtered = response.data.filter(invoice => {
                    if (!isInFinancialYear(invoice.createdAt)) return false;
                    const matchesLocation = !selectedLocation || invoice.location === selectedLocation;
                    const date = new Date(invoice.createdAt);
                    const invoiceMonth = date.toLocaleString('en-US', { month: 'short' });
                    const invoiceYear = date.getMonth() < 3 ? date.getFullYear() : date.getFullYear();
                    const matchesMonth = !selectedMonth ||
                        `${invoiceMonth} ${invoiceYear}` === selectedMonth;
                    return matchesLocation && matchesMonth;
                });
                const totalTax = filtered.reduce((sum, invoice) => {
                    return sum + (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
                }, 0);
                setTotalOutputTax(totalTax);

                const sorted = filtered?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setCustomerInvoices(response.data);
                setFilteredCustomerInvoices(sorted);
                setError(null);
            } catch (err) {
                setError('Failed to fetch invoices');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchcInvoices();
    }, [selectedMonth, selectedLocation, financialYear, monthYearOptions]);

    const taxBalance = totalOutputTax - totalInputTax;
    const taxStatus = taxBalance > 0 ? 'You need to pay GST' : taxBalance < 0 ? 'You will get a GST refund' : 'No GST to pay or refund';

    return (
        <>
            <div className="content">
                <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">GST List</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/dashboard"><i className="ti ti-smart-home"></i></a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">GST List</li>
              </ol>
            </nav>
          </div>

        </div>
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col-xl-3 row">
                                        <div className="col-xl-5">Month</div>
                                        <div className="col-xl-7">
                                            <select
                                                name="month"
                                                className="form-select"
                                                id="month-select"
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                            >
                                                <option value="">Select Month</option>
                                                {monthYearOptions.map((opt, idx) => (
                                                    <option key={idx} value={opt.label}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 row">
                                        <div className="col-xl-4">Location</div>
                                        <div className="col-xl-8">
                                            <select name="location" className="form-select" id="location-select" onChange={(e) => setSelectedLocation(e.target.value)}>
                                                <option value="">Select Location</option>
                                                {locations.map((loc, idx) => (
                                                    <option key={idx} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 ms-auto mt-3">
                                        {activeTab === 'input' && (
                                            <h5 style={{ color: 'blue' }}>
                                                Total Input GST: ₹{totalInputTax.toFixed(2)}
                                            </h5>
                                        )}
                                        {activeTab === 'output' && (
                                            <h5 style={{ color: 'orange' }}>
                                                Total Output GST: ₹{totalOutputTax.toFixed(2)}
                                            </h5>
                                        )}
                                        {activeTab === 'gstr' && (
                                            <h5 style={{ color: taxBalance > 0 ? 'red' : taxBalance < 0 ? 'green' : 'black' }}>
                                                {taxStatus} — ₹{Math.abs(taxBalance).toFixed(2)}
                                            </h5>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <ul className="nav nav-tabs mb-3 tab-style-6" id="myTab-3" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === 'input' ? 'active' : ''}`} id="products-tab" data-bs-toggle="tab"
                                            data-bs-target="#products-tab-pane" type="button" role="tab"
                                            aria-controls="products-tab-pane" aria-selected={activeTab === 'input'}
                                            onClick={() => setActiveTab('input')}>
                                            <i className="feather-gift me-1 align-middle d-inline-block"></i>Input Tax
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === 'output' ? 'active' : ''}`} id="sales-tab" data-bs-toggle="tab"
                                            data-bs-target="#sales-tab-pane" type="button" role="tab"
                                            aria-controls="sales-tab-pane" aria-selected={activeTab === 'output'}
                                            onClick={() => setActiveTab('output')}>
                                            <i className="feather-file me-1 align-middle d-inline-block"></i>Output Tax
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className={`nav-link ${activeTab === 'gstr' ? 'active' : ''}`} id="profit-tab" data-bs-toggle="tab"
                                            data-bs-target="#profit-tab-pane" type="button" role="tab"
                                            aria-controls="profit-tab-pane" aria-selected={activeTab === 'gstr'}
                                            onClick={() => setActiveTab('gstr')}>
                                            <i className="feather-file-text me-1 align-middle d-inline-block"></i>GSTR
                                        </button>
                                    </li>
                                </ul>
                                <div className="tab-content" id="myTabContent2">
                                    <div className={`tab-pane fade ${activeTab === 'input' ? 'show active' : ''} p-0 border-bottom-0`} id="products-tab-pane"
                                        role="tabpanel" aria-labelledby="products-tab" tabIndex="0">
                                        <div className="table-responsive">
                                            <table className="table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Invoice No</th>
                                                        <th scope="col">Date</th>
                                                        <th scope="col">Amount</th>
                                                        <th scope="col">CGST</th>
                                                        <th scope="col">SGST/UTGST</th>
                                                        <th scope="col">IGST</th>
                                                        <th scope="col">Total GST</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredvendorinvoices.map((invoice, idx) => (
                                                        <tr key={idx}>
                                                            <td>{invoice.docnumber}</td>
                                                            <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                                            <td>{invoice.finalTotal}</td>
                                                            <td>{invoice.cgst}</td>
                                                            <td>{invoice.sgst}</td>
                                                            <td>{invoice.igst}</td>
                                                            <td>{(invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${activeTab === 'output' ? 'show active' : ''}`} id="sales-tab-pane" role="tabpanel"
                                        aria-labelledby="sales-tab" tabIndex="0">
                                        <div className="table-responsive">
                                            <table className="table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Invoice No</th>
                                                        <th scope="col">Date</th>
                                                        <th scope="col">Amount</th>
                                                        <th scope="col">CGST</th>
                                                        <th scope="col">SGST/UTGST</th>
                                                        <th scope="col">IGST</th>
                                                        <th scope="col">Total GST</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredcustomerInvoices.map((invoice, idx) => (
                                                        <tr key={idx}>
                                                            <td>{invoice.docnumber}</td>
                                                            <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                                            <td>{invoice.finalTotal}</td>
                                                            <td>{invoice.cgst}</td>
                                                            <td>{invoice.sgst}</td>
                                                            <td>{invoice.igst}</td>
                                                            <td>{(invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${activeTab === 'gstr' ? 'show active' : ''}`} id="profit-tab-pane" role="tabpanel"
                                        aria-labelledby="profit-tab" tabIndex="0">
                                        <div className="table-responsive">
                                            <table className="table mb-0">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">Month</th>
                                                        <th scope="col">Input</th>
                                                        <th scope="col">Output</th>
                                                        <th scope="col">Balance</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {monthlyGSTSummary.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td>{row.month}</td>
                                                            <td>{row.input.toFixed(2)}</td>
                                                            <td>{row.output.toFixed(2)}</td>
                                                            <td>{row.balance.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GST;