import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MonochromaticDashboard from './components/Dashboard/MonochromaticDashboard';
import GlassmorphismAuth from './components/auth/GlassmorphismAuth';
import Layout from './components/common/layout';
import Transactions from './components/Transaction';
import PaymentPage from './components/payments/PaymentPage';
import ContactMaster from './components/contacts/ContactMaster';
import ProductMaster from './components/products/ProductMaster';
import Reports from './components/Reports';
import ChartOfAccounts from './components/accounts/ChartOfAccounts';
import SalesOrderMaster from './components/orders/SalesOrderMaster';
import PurchaseOrderMaster from './components/orders/PurchaseOrderMaster';
import ClientPortal from './components/Dashboard/ClientPortal';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to={user?.role === 'contact' ? '/client' : '/dashboard'} replace />} />
              <Route path="/dashboard" element={<MonochromaticDashboard />} />
              <Route path="/client" element={<ClientPortal user={user} />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/payments" element={<PaymentPage onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              <Route path="/contacts" element={<ContactMaster onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              <Route path="/products" element={<ProductMaster onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/coa" element={<ChartOfAccounts onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              <Route path="/orders/sales" element={<SalesOrderMaster onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              <Route path="/orders/purchase" element={<PurchaseOrderMaster onBack={() => window.history.back()} onHome={() => { window.location.href = '/dashboard'; }} />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to={user?.role === 'contact' ? '/client' : '/dashboard'} replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      ) : (
        <GlassmorphismAuth />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
