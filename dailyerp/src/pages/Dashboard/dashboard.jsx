import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  ShoppingCart, DollarSign, Archive, Calendar, Users, TrendingUp,
  Activity, Package, FileText, CreditCard
} from 'lucide-react';

const Dashboard = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [poRes, soRes, stockRes, invoiceRes, billingRes] = await Promise.all([
          fetch('http://localhost:8080/api/purchase-orders'),
          fetch('http://localhost:8080/api/sales-orders'),
          fetch('http://localhost:8080/api/stock'),
          fetch('http://localhost:8080/api/invoiceform'),
          fetch('http://localhost:8080/api/billingform')
        ]);

        const [poData, soData, stockData, invoiceData, billingData] = await Promise.all([
          poRes.json(), soRes.json(), stockRes.json(), invoiceRes.json(), billingRes.json()
        ]);

        setPurchaseOrders(poData);
        setSalesOrders(soData);
        setMaterials(stockData);
        setInvoices(invoiceData);
        setBillings(billingData);
      } catch (error) {
        console.error("Data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
    purchases: 0,
    sales: 0,
    inventory: 0,
    invoices: 0,
    billings: 0
  }));

  const accumulate = (list, dateKey, amountKey, targetKey) => {
    list.forEach(item => {
      const date = new Date(item[dateKey]);
      if (!isNaN(date) && date.getFullYear() === Number(selectedYear)) {
        const idx = date.getMonth();
        monthlyData[idx][targetKey] += amountKey ? (item[amountKey] || 0) : 1;
      }
    });
  };

  // Updated accumulation calls with correct field names based on your JSON structure
  accumulate(purchaseOrders, 'date', 'finalTotal', 'purchases');           // Purchase orders use 'date' and 'finalTotal'
  accumulate(salesOrders, 'date', 'finalTotal', 'sales');                 // Sales orders use 'date' and 'finalTotal' (not 'total')
  accumulate(materials, 'createdAt', null, 'inventory');                   // Materials use 'createdAt' for count only
  accumulate(invoices, 'documentDate', 'finalTotal', 'invoices');          // Invoices use 'documentDate' and 'finalTotal'
  accumulate(billings, 'documentDate', 'finalTotal', 'billings');          // Billings use 'documentDate' and 'finalTotal'

  // Calculate totals and growth - Updated to use correct field names
  const totalPurchases = purchaseOrders.reduce((sum, po) => sum + (po.finalTotal || 0), 0);
  const totalSales = salesOrders.reduce((sum, so) => sum + (so.finalTotal || 0), 0);      // Changed from 'total' to 'finalTotal'
  const totalInvoices = invoices.reduce((sum, inv) => sum + (inv.finalTotal || 0), 0);
  const totalBillings = billings.reduce((sum, bill) => sum + (bill.finalTotal || 0), 0);

  const profitMargin = totalSales > 0 ? ((totalSales - totalPurchases) / totalSales * 100) : 0;

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
      <style jsx>{`
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
              title: 'Stock Items',
              value: materials.length,
              icon: Archive,
              color: 'warning',
              bgColor: 'bg-warning',
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
          {/* // Complete Monthly Trends Chart Section */}
          <div className="col-lg-12">
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



        </div>
      </div>
    </div>
  );
};

export default Dashboard;
