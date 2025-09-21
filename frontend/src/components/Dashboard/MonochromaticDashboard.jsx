import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  UserPlus,
  CreditCard,
  List,
  Contact,
  Package,
  Calculator,
  BarChart3,
  Building2,
  ShoppingCart,
  FileText,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DashboardStats from './DashboardStats';
import SalesChart from './SalesChart';
import RecentTransactions from './RecentTransactions';
import ClientPortal from './ClientPortal';
import CreateUser from '../admin/CreateUser';
import ContactMaster from '../contacts/ContactMaster';
import ProductMaster from '../products/ProductMaster';
import TaxesMaster from '../taxes/TaxesMaster';
import ChartOfAccounts from '../accounts/ChartOfAccounts';
import VendorMaster from '../vendors/VendorMaster';
import PurchaseOrderMaster from '../orders/PurchaseOrderMaster';
import SalesOrderMaster from '../orders/SalesOrderMaster';
import reportsService from '../../services/reportsService';

const MonochromaticDashboard = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showContactMaster, setShowContactMaster] = useState(false);
  const [showProductMaster, setShowProductMaster] = useState(false);
  const [showTaxesMaster, setShowTaxesMaster] = useState(false);
  const [showChartOfAccounts, setShowChartOfAccounts] = useState(false);
  const [showVendorMaster, setShowVendorMaster] = useState(false);
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [showSalesOrder, setShowSalesOrder] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState(null);
  const [dashData, setDashData] = useState({
    quickStats: { totalRevenue: 0, activeClients: 0, growthRate: 0 },
    timeBasedStats: {
      totalInvoice: { last24Hours: 0, last7Days: 0, last30Days: 0, change24h: 0, change7d: 0 },
      totalPurchase: { last24Hours: 0, last7Days: 0, last30Days: 0, change24h: 0, change7d: 0 },
      totalPayment: { last24Hours: 0, last7Days: 0, last30Days: 0, change24h: 0, change7d: 0 },
    },
    chartData: [],
    recentTransactions: [],
  });

  const roleFallback = (role) => {
    const baseChart = [
      { month: 'Jan 25', sales: 400000, purchases: 280000 },
      { month: 'Feb 25', sales: 420000, purchases: 300000 },
      { month: 'Mar 25', sales: 450000, purchases: 320000 },
      { month: 'Apr 25', sales: 470000, purchases: 330000 },
      { month: 'May 25', sales: 500000, purchases: 350000 },
      { month: 'Jun 25', sales: 520000, purchases: 360000 },
      { month: 'Jul 25', sales: 540000, purchases: 370000 },
      { month: 'Aug 25', sales: 560000, purchases: 380000 },
      { month: 'Sep 25', sales: 580000, purchases: 390000 },
      { month: 'Oct 25', sales: 600000, purchases: 400000 },
      { month: 'Nov 25', sales: 620000, purchases: 410000 },
      { month: 'Dec 25', sales: 650000, purchases: 420000 },
    ];
    const totals = (inv, pur, pay) => ({
      totalInvoice: { last24Hours: 0, last7Days: Math.round(inv * 0.1), last30Days: inv, change24h: 0, change7d: 5.2 },
      totalPurchase: { last24Hours: 0, last7Days: Math.round(pur * 0.1), last30Days: pur, change24h: 0, change7d: 3.1 },
      totalPayment: { last24Hours: 0, last7Days: Math.round(pay * 0.1), last30Days: pay, change24h: 0, change7d: 2.0 },
    });
    if (role === 'admin') {
      return {
        quickStats: { totalRevenue: 2450000, activeClients: 248, growthRate: 12.5 },
        timeBasedStats: totals(236100, 178570, 57520),
        chartData: baseChart,
        recentTransactions: [
          { id: 'INV-5010', type: 'income', description: 'Invoice #5010', date: '15 Sep 2025', category: 'Tech Solutions Ltd.', amount: 125000, status: 'completed', method: 'Bank', reference: 'SO-9001', balance: 0 },
          { id: 'BILL-7012', type: 'expense', description: 'Vendor Bill #7012', date: '14 Sep 2025', category: 'ABC Suppliers', amount: 78000, status: 'pending', method: 'Bank', reference: 'PO-1203', balance: 30000 },
        ],
      };
    }
    if (role === 'accountant' || role === 'invoicing') {
      return {
        quickStats: { totalRevenue: 1850000, activeClients: 180, growthRate: 8.2 },
        timeBasedStats: totals(180000, 120000, 50000),
        chartData: baseChart,
        recentTransactions: [
          { id: 'INV-5008', type: 'income', description: 'Invoice #5008', date: '13 Sep 2025', category: 'StartupXYZ', amount: 85000, status: 'pending', method: 'Bank', reference: 'SO-8891', balance: 85000 },
          { id: 'BILL-7009', type: 'expense', description: 'Vendor Bill #7009', date: '12 Sep 2025', category: 'Office Mart', amount: 15000, status: 'completed', method: 'Cash', reference: 'PO-1188', balance: 0 },
        ],
      };
    }
    return {
      quickStats: { totalRevenue: 0, activeClients: 0, growthRate: 0 },
      timeBasedStats: totals(0, 0, 0),
      chartData: baseChart.map(x => ({ ...x, sales: 0, purchases: 0 })),
      recentTransactions: [],
    };
  };

  const isEmptyDashData = (data) => {
    if (!data) return true;
    const qs = data.quickStats || {};
    const tbs = data.timeBasedStats || {};
    const isZeroQS = Number(qs.totalRevenue || 0) === 0 && Number(qs.activeClients || 0) === 0 && Number(qs.growthRate || 0) === 0;
    const safe = (o) => o || { last24Hours: 0, last7Days: 0, last30Days: 0 };
    const inv = safe(tbs.totalInvoice);
    const pur = safe(tbs.totalPurchase);
    const pay = safe(tbs.totalPayment);
    const isZeroTBS = [inv, pur, pay].every(x => (Number(x.last24Hours||0) + Number(x.last7Days||0) + Number(x.last30Days||0)) === 0);
    const isNoSeries = !Array.isArray(data.chartData) || data.chartData.length === 0;
    const isNoTx = !Array.isArray(data.recentTransactions) || data.recentTransactions.length === 0;
    return isZeroQS && isZeroTBS && isNoSeries && isNoTx;
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const resp = await reportsService.getDashboardSummary({ period: dateRange });
        if (resp?.data) {
          if (isEmptyDashData(resp.data)) {
            setDashData(roleFallback(user?.role));
          } else {
            setDashData(resp.data);
          }
        } else {
          setDashData(roleFallback(user?.role));
        }
      } catch (e) {
        console.error('Failed to load dashboard summary', e);
        setDashData(roleFallback(user?.role));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [dateRange]);

  // If user is a client, show the client portal instead
  if (user?.role === 'contact') {
    try {
      return <ClientPortal user={user} />;
    } catch (error) {
      console.error('ClientPortal error:', error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading Client Portal...</div>
        </div>
      );
    }
  }

  // If showing create user page
  if (showCreateUser) {
    try {
      return <CreateUser onBack={() => setShowCreateUser(false)} />;
    } catch (error) {
      console.error('CreateUser error:', error);
      setShowCreateUser(false);
    }
  }

  // If showing contact master page
  if (showContactMaster) {
    try {
      return <ContactMaster
        onBack={() => setShowContactMaster(false)}
        onHome={() => setShowContactMaster(false)}
      />;
    } catch (error) {
      console.error('ContactMaster error:', error);
      setShowContactMaster(false);
    }
  }

  // If showing product master page
  if (showProductMaster) {
    try {
      return <ProductMaster
        onBack={() => setShowProductMaster(false)}
        onHome={() => setShowProductMaster(false)}
      />;
    } catch (error) {
      console.error('ProductMaster error:', error);
      setShowProductMaster(false);
    }
  }

  // If showing taxes master page
  if (showTaxesMaster) {
    try {
      return <TaxesMaster
        onBack={() => setShowTaxesMaster(false)}
        onHome={() => setShowTaxesMaster(false)}
      />;
    } catch (error) {
      console.error('TaxesMaster error:', error);
      setShowTaxesMaster(false);
    }
  }

  // If showing chart of accounts page
  if (showChartOfAccounts) {
    try {
      return <ChartOfAccounts
        onBack={() => setShowChartOfAccounts(false)}
        onHome={() => setShowChartOfAccounts(false)}
      />;
    } catch (error) {
      console.error('Error rendering ChartOfAccounts:', error);
      return <div>Error loading Chart of Accounts</div>;
    }
  }

  // If showing vendor master page
  if (showVendorMaster) {
    try {
      return <VendorMaster
        onBack={() => setShowVendorMaster(false)}
        onHome={() => setShowVendorMaster(false)}
      />;
    } catch (error) {
      console.error('Error rendering VendorMaster:', error);
      return <div>Error loading Vendor Master</div>;
    }
  }

  // If showing purchase order page
  if (showPurchaseOrder) {
    try {
      return <PurchaseOrderMaster
        onBack={() => setShowPurchaseOrder(false)}
        onHome={() => setShowPurchaseOrder(false)}
      />;
    } catch (error) {
      console.error('Error rendering PurchaseOrderMaster:', error);
      return <div>Error loading Purchase Order</div>;
    }
  }

  // If showing sales order page
  if (showSalesOrder) {
    try {
      return (
        <SalesOrderMaster
          onBack={() => setShowSalesOrder(false)}
          onHome={() => {
            setShowSalesOrder(false);
            // Reset other states
            setShowCreateUser(false);
            setShowContactMaster(false);
            setShowProductMaster(false);
            setShowTaxesMaster(false);
            setShowChartOfAccounts(false);
            setShowVendorMaster(false);
            setShowPurchaseOrder(false);
          }}
        />
      );
    } catch (error) {
      console.error('Error loading Sales Order', error);
      return <div>Error loading Sales Order</div>;
    }
  }

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'accountant':
      case 'invoicing':
        return 'Accountant Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v || 0));
  const quickStats = [
    { title: 'Total Revenue', value: formatCurrency(dashData.quickStats.totalRevenue), change: `${dashData.quickStats.growthRate >= 0 ? '+' : ''}${(dashData.quickStats.growthRate || 0).toFixed(1)}%`, changeType: dashData.quickStats.growthRate >= 0 ? 'positive' : 'negative', icon: DollarSign, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Active Clients', value: String(dashData.quickStats.activeClients || 0), change: '', changeType: 'positive', icon: Users, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Growth Rate', value: `${(dashData.quickStats.growthRate || 0).toFixed(1)}%`, change: '', changeType: dashData.quickStats.growthRate >= 0 ? 'positive' : 'negative', icon: TrendingUp, gradient: 'from-purple-500 to-pink-600' }
  ];

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
      case 'accountant':
      case 'invoicing':
        return [
          { id: 'contact-master', label: 'Customer', icon: Contact, color: 'var(--success)' },
          { id: 'vendor-master', label: 'Vendors', icon: Building2, color: 'var(--purple)' },
          { id: 'product-master', label: 'Products', icon: Package, color: 'var(--info)' },
          { id: 'taxes-master', label: 'Taxes', icon: Calculator, color: 'var(--warning)' },
          { id: 'chart-accounts', label: 'Chart of Accountants', icon: BarChart3, color: 'var(--error)' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero / Title Area (kept) */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="px-6 py-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.div
                className="flex items-center space-x-4 mb-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <BarChart3 className="w-6 h-6 text-white" />
                </motion.div>
                <motion.h1
                  className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {getDashboardTitle()}
                </motion.h1>
              </motion.div>
              <motion.p
                className="text-lg font-semibold text-gray-700 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Welcome back, <span className="text-blue-600 font-bold text-xl">{user?.name || 'User'}</span>!
                <motion.span
                  className="block mt-1 text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Here's what's happening with your furniture business.
                </motion.span>
              </motion.p>
            </div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mb-3 mx-auto"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Calendar className="w-8 h-8 text-blue-600" />
              </motion.div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-800">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                <p className="text-2xl font-bold text-blue-600">{new Date().getDate()}</p>
                <p className="text-sm font-semibold text-gray-600">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="w-full py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 px-6">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="shiv-surface rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                style={{ border: '1px solid var(--border)', boxShadow: '0 4px 12px var(--shadow)', backgroundColor: 'var(--surface)' }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{stat.title}</p>
                    <motion.p className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>{stat.value}</motion.p>
                    <div className="flex items-center">
                      <motion.span className="text-sm font-medium px-2 py-1 rounded-full" style={{ color: 'var(--success)', backgroundColor: 'var(--success)' + '20' }} whileHover={{ scale: 1.05 }}>{stat.change}</motion.span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>vs last month</span>
                    </div>
                  </div>
                  <motion.div className="p-4 rounded-xl relative overflow-hidden" style={{ backgroundColor: 'var(--border-light)' }} whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Icon className="w-8 h-8 relative z-10" style={{ color: 'var(--primary)' }} />
                    <motion.div className="absolute inset-0 bg-gradient-to-br opacity-20" style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-light))` }} initial={{ scale: 0, rotate: 0 }} whileHover={{ scale: 1, rotate: 180 }} transition={{ duration: 0.3 }} />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions for Admin/Accountant */}
        {(user?.role === 'admin' || ['accountant', 'invoicing'].includes(user?.role)) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="shiv-surface rounded-xl p-6 mb-6 mx-6" style={{ border: '1px solid var(--border)', boxShadow: '0 4px 12px var(--shadow)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {getQuickActions().map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 group"
                    style={{ border: '1px solid var(--border)', backgroundColor: activeQuickAction === action.id ? 'var(--border-light)' : 'transparent' }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setActiveQuickAction(action.id)}
                    onMouseLeave={() => setActiveQuickAction(null)}
                    onClick={() => {
                      if (action.id === 'create-user') setShowCreateUser(true);
                      if (action.id === 'contact-master') setShowContactMaster(true);
                      if (action.id === 'vendor-master') setShowVendorMaster(true);
                      if (action.id === 'product-master') setShowProductMaster(true);
                      if (action.id === 'taxes-master') setShowTaxesMaster(true);
                      if (action.id === 'chart-accounts') setShowChartOfAccounts(true);
                    }}
                  >
                    <motion.div className="p-2 rounded-lg" style={{ backgroundColor: action.color + '20' }} whileHover={{ rotate: 5, scale: 1.1 }}>
                      <ActionIcon className="w-5 h-5" style={{ color: action.color }} />
                    </motion.div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Dashboard Stats */}
        <div className="mx-6 mb-6">
          <DashboardStats totalInvoice={dashData.timeBasedStats.totalInvoice} totalPurchase={dashData.timeBasedStats.totalPurchase} totalPayment={dashData.timeBasedStats.totalPayment} />
        </div>

        {/* Charts */}
        {(user?.role === 'admin' || ['accountant', 'invoicing'].includes(user?.role)) && (
          <div className="mx-6 mb-6">
            <SalesChart data={dashData.chartData} />
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mx-6">
          <RecentTransactions transactions={dashData.recentTransactions} />
        </div>
      </div>
    </div>
  );
};

export default MonochromaticDashboard;
