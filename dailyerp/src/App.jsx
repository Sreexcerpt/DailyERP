import { React, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar/sidebar';
import Header from './components/header/header';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Dashboard from './pages/Dashboard/dashboard';
import LoginForm from './components/User/Login';
import LoginScreen from './components/User/LoginScreen';
import Register from './components/User/Register';
import MaterialPage from "./pages/masterdata/MaterialForm";
import ProcessList from './pages/masterdata/Process-list';
import GeneralCondition from './pages/masterdata/GeneralCondition';
import PurchaseIndent from './pages/Purchase/PurchaseIndent/PurchaseIndentForm';
import PurchaseIndentsummary from './pages/Purchase/PurchaseIndent/PurchaseIndentSummary';
import PurchaseQuotationForm from './pages/Purchase/purchaseQuotation/PurchaseQuotationForm';
import PurchaseQuotationsDisplay from './pages/Purchase/purchaseQuotation/PurchaseQuotationsDisplay';
import PurchaseOrderForm from './pages/Purchase/purchaseOrder/PurchaseOrderForm';
import PurchaseOrderDisplay from './pages/Purchase/purchaseOrder/POList';

import Salesrequest from './pages/sales/SalesIndent/SalesIndent';
import SalesIndentsummary from './pages/sales/SalesIndent/salesIndentsummary';
import SalesQuotationForm from './pages/sales/salesQuotation/SalesQuotationForm';
import SalesQuotationListPage from './pages/sales/salesQuotation/SalesQuotationList';
import SalesOrderForm from './pages/sales/salesOrder/SalesOrderForm';
import SalesOrderDisplay from './pages/sales/salesOrder/SalesOrderDisplay'


import CustomerForm from "./pages/masterdata/CustomerForm";
import CustomerPriceListForm from "./pages/masterdata/CustomerPriceList";
import LocationMaster from "./pages/masterdata/LocationMaster";
import TaxForm from "./pages/masterdata/Tax";
import VendorForm from "./pages/masterdata/VendorForm";
import VendorPriceListForm from "./pages/masterdata/VendorPriceListForm";
import GoodsIssue from "./pages/Inventory/GoodsIssueForm";
import GoodsIssueList from "./pages/Inventory/GoodsIssueList";
import GoodsReceipt from "./pages/Inventory/GoodsReceipt";
import GoodsReceiptList from "./pages/Inventory/GoodsReceiptList";
import GoodsTransfer from "./pages/Inventory/GoodsTransfer";
import StockListERP from "./pages/Inventory/Stocklist";
import InvoiceDisplay from "./pages/Accounts/Invoice/InvoiceL";
import InvoiceForm from "./pages/Accounts/Invoice/InvoiceForm";
import BillingForm from "./pages/Accounts/Billing/BillingForm";
import BillingDisplay from "./pages/Accounts/Billing/BillingDisplay";
import EWayBillForm from './pages/Accounts/EWayBill';
import AccessControl from './components/RoleBased-Access-Control/Roleaccess';
import GST from './pages/GST/Gst';
import PurchaseContractDisplay from './pages/Purchase/purchaseContract/PurchaseContractDisplay';
import PurchaseContractForm from './pages/Purchase/purchaseContract/PurchaseContractForm';
import SalesContractForm from './pages/sales/salesContract/SalesContractForm';
import ContractListPage from './pages/sales/salesContract/SalesContractList';
import SaleContractCategoryForm from './pages/category/SaleContractCategoryForm';
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const LoginScreenWrapper = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return <LoginScreen userId={user?._id} />;
  }

  const ProtectedLayout = ({ children }) => {
    return (
      <PrivateRoute>
        <div className={`  main-wrapper ${isSidebarOpen ? 'slide-nav' : ''}`}>
          <Sidebar />
          <Header toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
          <div className="page-wrapper ">
            {children}
          </div>
        </div>
      </PrivateRoute>
    );
  };
  return (
    <>
      <Router>
        {/* <Header />
        <Sidebar /> */}
        <Routes>
          <Route path='/login' element={<LoginForm />} />
          <Route path='/register' element={<Register />} />
          <Route path='/Access' element={<AccessControl />} />
          <Route path='/gst' element={<ProtectedLayout><GST /></ProtectedLayout>} />
          <Route path='loginscreen' element={<LoginScreen />} />
          <Route path='/' element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path='/PurchaseIndentsummary' element={
            <ProtectedLayout>
              <PurchaseIndentsummary />
            </ProtectedLayout>
          } />
          <Route path='/PurchaseOrderList' element={
            <ProtectedLayout>
              <PurchaseOrderDisplay />
            </ProtectedLayout>
          } />
          <Route path='/SaleContractCategory' element={
            <ProtectedLayout>
              <SaleContractCategoryForm />
            </ProtectedLayout>
          } />
          <Route path="/PurchaseQuotation" element={
            <ProtectedLayout>
              <PurchaseQuotationForm />
            </ProtectedLayout>
          } />
          <Route path="/PurchaseQuotationsDisplay" element={
            <ProtectedLayout>
              <PurchaseQuotationsDisplay />
            </ProtectedLayout>
          } />
          <Route path="/PurchaseOrder" element={
            <ProtectedLayout>
              <PurchaseOrderForm />
            </ProtectedLayout>
          } />
          <Route path="/PurchaseEnquiry" element={
            <ProtectedLayout>
              <PurchaseIndent />
            </ProtectedLayout>
          } />
          <Route path='/PurchaseContractsummary' element={
            <ProtectedLayout>
              <PurchaseContractDisplay />
            </ProtectedLayout>
          } />
          <Route path='/PurchaseContract' element={
            <ProtectedLayout>
              <PurchaseContractForm />
            </ProtectedLayout>
          } />
          <Route path='/SalesContract' element={
            <ProtectedLayout>
              <SalesContractForm />
            </ProtectedLayout>
          } />
          <Route path='/SalesContractsummary' element={
            <ProtectedLayout>
              <ContractListPage />
            </ProtectedLayout>
          } />
          <Route path="/SalesEnquiry" element={
            <ProtectedLayout>
              <Salesrequest />
            </ProtectedLayout>
          } />
          <Route path="/SalesEnquiryList" element={
            <ProtectedLayout>
              <SalesIndentsummary />
            </ProtectedLayout>
          } />
          <Route path="/SalesQuotation" element={
            <ProtectedLayout>
              <SalesQuotationForm />
            </ProtectedLayout>
          } />
          <Route path="/SalesQuotationList" element={
            <ProtectedLayout>
              <SalesQuotationListPage />
            </ProtectedLayout>
          } />
          <Route path="/SalesOrder" element={
            <ProtectedLayout>
              <SalesOrderForm />
            </ProtectedLayout>
          } />
          <Route path="/SalesOrderList" element={
            <ProtectedLayout>
              <SalesOrderDisplay />
            </ProtectedLayout>
          } />
          <Route path='/MatrialIssue' element={
            <ProtectedLayout>
              <GoodsIssue />
            </ProtectedLayout>
          } />

          <Route path='/MatrialReceipt' element={
            <ProtectedLayout>
              <GoodsReceipt />
            </ProtectedLayout>
          } />

          <Route path='/MatrialTransfer' element={
            <ProtectedLayout>
              <GoodsTransfer />
            </ProtectedLayout>
          } />

          <Route path='/MatrialIssueList' element={
            <ProtectedLayout>
              <GoodsIssueList />
            </ProtectedLayout>
          } />

          <Route path='/MatrialReceiptList' element={
            <ProtectedLayout>
              <GoodsReceiptList />
            </ProtectedLayout>
          } />

          <Route path='/StockListERP' element={
            <ProtectedLayout>
              <StockListERP />
            </ProtectedLayout>
          } />
          <Route path='/GeneralCondition' element={
            <ProtectedLayout>
              < GeneralCondition />
            </ProtectedLayout>
          } />
          <Route path='/ProcessList' element={
            <ProtectedLayout>
              <ProcessList />
            </ProtectedLayout>
          } />
          <Route
            path="/customer-form"
            element={
              <ProtectedLayout>
                <CustomerForm />
              </ProtectedLayout>
            }
          />

          <Route
            path="/customer-price-list"
            element={
              <ProtectedLayout>
                <CustomerPriceListForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/locationmaster"
            element={
              <ProtectedLayout>
                <LocationMaster />
              </ProtectedLayout>
            }
          />
          <Route
            path="/material-form"
            element={
              <ProtectedLayout>
                <MaterialPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tax-form"
            element={
              <ProtectedLayout>
                <TaxForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/vendor-form"
            element={
              <ProtectedLayout>
                <VendorForm />
              </ProtectedLayout>
            }
          />

          <Route
            path="/vendor-price-list"
            element={
              <ProtectedLayout>
                <VendorPriceListForm />
              </ProtectedLayout>
            }
          />

          <Route
            path="/GoodsIssueFormUI"
            element={
              <ProtectedLayout>
                <GoodsIssue />
              </ProtectedLayout>
            }
          />

          <Route
            path="/goods-issue-list"
            element={
              <ProtectedLayout>
                <GoodsIssueList />
              </ProtectedLayout>
            }
          />

          <Route
            path="/GoodsReciept"
            element={
              <ProtectedLayout>
                <GoodsReceipt />
              </ProtectedLayout>
            }
          />

          <Route
            path="/GoodsReceiptList"
            element={
              <ProtectedLayout>
                <GoodsReceiptList />
              </ProtectedLayout>
            }
          />

          <Route
            path="/GoodsTransfer"
            element={
              <ProtectedLayout>
                <GoodsTransfer />
              </ProtectedLayout>
            }
          />

          <Route
            path="/StockListERP"
            element={
              <ProtectedLayout>
                <StockListERP />
              </ProtectedLayout>
            }
          />

          <Route
            path="/InvoiceList"
            element={
              <ProtectedLayout>
                <InvoiceDisplay />
              </ProtectedLayout>
            }
          />
          <Route
            path="/InvoiceForm"
            element={
              <ProtectedLayout>
                <InvoiceForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/BillingForm"
            element={
              <ProtectedLayout>
                <BillingForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/BillingDisplay"
            element={
              <ProtectedLayout>
                <BillingDisplay />
              </ProtectedLayout>
            }
          />
        </Routes>
      </Router>
    </>
  )
}

export default App