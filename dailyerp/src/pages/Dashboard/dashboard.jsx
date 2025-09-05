import React, { useEffect, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import {
  ShoppingCart, DollarSign, FileText, CreditCard, TrendingUp,
  Activity, Package
} from 'lucide-react';
import axios from 'axios';
/**
 * Dashboard Component - Fixed Issues:
 * - `fetch` does not support a `params` option. Query params are now appended to the URL.
 * - Monthly data accumulation is now inside useMemo, depending on fetched data and selectedYear.
 * - No more accumulation on every render.
 * - Removed unused imports.
 * - Cleaned up minor lint/React warnings.
 */

const Dashboard = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [companyId] = useState(localStorage.getItem('selectedCompanyId') || '');
  const [financialYear] = useState(localStorage.getItem('financialYear') || '');
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  // Utility to append query params for fetch

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const params = { companyId, financialYear };
        const [poRes, soRes, stockRes, invoiceRes, billingRes] = await Promise.all([
          axios.get('http://localhost:8080/api/purchase-orders', { params }),
          axios.get('http://localhost:8080/api/sales-orders', { params }),
          axios.get('http://localhost:8080/api/stock/data', { params }),
          axios.get('http://localhost:8080/api/invoiceform', { params }),
          axios.get('http://localhost:8080/api/billingform', { params })
        ]);

        setPurchaseOrders(poRes.data);
        setSalesOrders(soRes.data);
        setMaterials(stockRes.data);
        setInvoices(invoiceRes.data);
        console.log('Fetched Invoices:', invoiceRes.data);
        setBillings(billingRes.data);
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // Only refetch if these change
    // eslint-disable-next-line
  }, [companyId, financialYear]);

  // Memoized monthly data calculation
  const monthlyData = useMemo(() => {
    // Determine start and end months for the selected financial year
    // Example: financialYear = "2023-2024" means April 2023 to March 2024
    let startMonth = 0, endMonth = 11, year = selectedYear;
    if (financialYear && /^\d{4}-\d{4}$/.test(financialYear)) {
      const [fyStart, fyEnd] = financialYear.split('-').map(Number);
      // Most Indian financial years: April (3) to March (2) next year
      startMonth = 3; // April
      endMonth = 2;   // March
      year = fyStart;
    }

    // Build months array for the financial year
    const months = [];
    for (let i = 0; i < 12; i++) {
      let monthIndex = (startMonth + i) % 12;
      let displayYear = year + (monthIndex < startMonth ? 1 : 0);
      months.push({
        month: new Date(displayYear, monthIndex).toLocaleString('default', { month: 'short' }),
        purchases: 0,
        sales: 0,
        inventory: 0,
        invoices: 0,
        billings: 0,
        profitMargin: 0
      });
    }

    // Helper to accumulate data into months
    const accumulate = (list, dateKey, amountKey, targetKey) => {
      list?.forEach(item => {
        const date = new Date(item[dateKey]);
        if (!isNaN(date)) {
          let fyStartYear = year;
          let fyEndYear = financialYear && /^\d{4}-\d{4}$/.test(financialYear)
            ? Number(financialYear.split('-')[1])
            : year;
          let inFY = false;
          if (financialYear && /^\d{4}-\d{4}$/.test(financialYear)) {
            // April to March
            if (
              (date.getFullYear() === fyStartYear && date.getMonth() >= startMonth) ||
              (date.getFullYear() === fyEndYear && date.getMonth() <= endMonth)
            ) {
              inFY = true;
            }
          } else {
            inFY = date.getFullYear() === selectedYear;
          }
          if (inFY) {
            let idx;
            if (financialYear && /^\d{4}-\d{4}$/.test(financialYear)) {
              idx = (date.getMonth() - startMonth + 12) % 12;
            } else {
              idx = date.getMonth();
            }
            months[idx][targetKey] += amountKey ? (item[amountKey] || 0) : 1;
          }
        }
      });
    };

    accumulate(purchaseOrders, 'date', 'finalTotal', 'purchases');
    accumulate(salesOrders, 'date', 'finalTotal', 'sales');
    accumulate(materials, 'createdAt', null, 'inventory');
    accumulate(invoices, 'documentDate', 'finalTotal', 'invoices');
    accumulate(billings, 'documentDate', 'finalTotal', 'billings');

    return months;
  }, [purchaseOrders, salesOrders, materials, invoices, billings, selectedYear, financialYear]);



  // Calculate totals
  const totalPurchases = purchaseOrders.reduce((sum, po) => sum + (po.finalTotal || 0), 0);
  const totalSales = salesOrders.reduce((sum, so) => sum + (so.finalTotal || 0), 0);
  const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.finalTotal || 0), 0);
  const totalBillings = billings.reduce((sum, bill) => sum + (bill.finalTotal || 0), 0);

  // Profit margin calculation
  const profitMargin = totalSales > 0 ? ((totalSales - totalPurchases) / totalSales * 100) : 0;

  const [invoiceStatuses, setInvoiceStatuses] = useState({
    paid: 0,
    pending: 0
  });
  const [billingStatuses, setBillingStatuses] = useState({
    paid: 0,
    pending: 0
  });
  useEffect(() => {
    // Calculate invoice statuses
    console.log('Calculating invoice statuses...', invoices);
    const paidInvoices = invoices.filter(inv => inv.balance === 0).length;
    const pendingInvoices = invoices.filter(inv => inv.balance > 0).length;

    setInvoiceStatuses({
      paid: paidInvoices,
      pending: pendingInvoices
    });
    const paidBillings = billings.filter(bill => bill.balance === 0).length;
    const pendingBillings = billings.filter(bill => bill.balance > 0).length;

    setBillingStatuses({
      paid: paidBillings,
      pending: pendingBillings
    });
  }, [invoices, billings]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" >
        <div className="text-center text-white">
          <div className="spinner-border text-light mb-3" role="status" style={{ width: '4rem', height: '4rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="fs-5">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Custom Styles */}
      <style>{`
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .metric-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
          position: relative;
        }
        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
        .chart-container {
          border-radius: 15px;
          border: none;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .stat-item {
          padding: 12px;
          margin: 5px 0;
          border-radius: 10px;
          background: rgba(255,255,255,0.7);
          transition: all 0.3s ease;
        }
        .stat-item:hover {
          background: rgba(255,255,255,0.9);
          transform: translateX(5px);
        }
        .progress-custom {
          height: 8px;
          border-radius: 10px;
          background: rgba(0,0,0,0.1);
        }
        .progress-bar-custom {
          border-radius: 10px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }
      `}</style>

      <div className="container-fluid py-4">
        {/* Key Metrics Cards */}
        <div
          className="d-grid gap-4 mb-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          {[
            {
              title: 'Purchase Orders',
              value: purchaseOrders.length,
              icon: ShoppingCart,
              color: 'primary',
              bgColor: 'bg-primary',
            },
            {
              title: 'Sales Orders',
              value: salesOrders.length,
              icon: DollarSign,
              color: 'success',
              bgColor: 'bg-success',
            },
            {
              title: 'Vendor Invoices',
              value: invoices.length,
              icon: FileText,
              color: 'info',
              bgColor: 'bg-info',
            },
            {
              title: 'Customer Invoices',
              value: billings.length,
              icon: CreditCard,
              color: 'danger',
              bgColor: 'bg-danger',
            },
          ].map((card, index) => (
            <div key={index} className="card metric-card card-hover h-100">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-4">
                    <div
                      className={`${card.bgColor} bg-opacity-10 p-3 rounded-3 text-center`}
                    >
                      <card.icon size={24} className={`text-${card.color}`} />
                    </div>
                  </div>
                  <div className="col-8 text-end">
                    <div className={`h4 fw-bold text-${card.color} mb-1`}>
                      {card.value}
                    </div>
                    <div className="small text-muted">{card.title}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="row g-4 mb-4">
          {/* Monthly Trends */}
          <div className="col-lg-8">
            <div className="card chart-container">
              <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center">
                  <TrendingUp size={20} className="text-primary me-2" />
                  Monthly Financial Trends ({selectedYear})
                </h5>
                <select
                  className="form-select w-auto"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#28a745" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#28a745" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007bff" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#007bff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInvoices" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6f42c1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6f42c1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBillings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc3545" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="#6c757d" />
                    <Tooltip
                      formatter={(val, name) => {
                        return ['inventory'].includes(name.toLowerCase())
                          ? [`${val}`, name]
                          : [`₹${val.toLocaleString()}`, name];
                      }}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#28a745"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      strokeWidth={2}
                      name="Sales Orders"
                    />
                    <Area
                      type="monotone"
                      dataKey="purchases"
                      stroke="#007bff"
                      fillOpacity={1}
                      fill="url(#colorPurchases)"
                      strokeWidth={2}
                      name="Purchase Orders"
                    />
                    <Area
                      type="monotone"
                      dataKey="invoices"
                      stroke="#6f42c1"
                      fillOpacity={1}
                      fill="url(#colorInvoices)"
                      strokeWidth={2}
                      name="Invoices"
                    />
                    <Area
                      type="monotone"
                      dataKey="billings"
                      stroke="#dc3545"
                      fillOpacity={1}
                      fill="url(#colorBillings)"
                      strokeWidth={2}
                      name="Billings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card chart-container">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title fw-bold mb-0">
                  <FileText size={20} className="text-info me-2" />
                  Vendor Invoice Status
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: invoiceStatuses.paid },
                        { name: 'Pending', value: invoiceStatuses.pending }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#28a745" />
                      <Cell fill="#ffc107" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Sales vs Purchases Comparison */}
          <div className="col-lg-8">
            <div className="card chart-container">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title fw-bold mb-0">
                  <TrendingUp size={20} className="text-primary me-2" />
                  Sales vs Purchases
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value / 1000)}k`} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" name="Sales" fill="#28a745" />
                    <Bar dataKey="purchases" name="Purchases" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card chart-container">
              <div className="card-header bg-transparent border-0">
                <h5 className="card-title fw-bold mb-0">
                  <FileText size={20} className="text-info me-2" />
                  Customer Invoice Status
                </h5>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: billingStatuses.paid },
                        { name: 'Pending', value: billingStatuses.pending }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#28a745" />
                      <Cell fill="#ffc107" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;