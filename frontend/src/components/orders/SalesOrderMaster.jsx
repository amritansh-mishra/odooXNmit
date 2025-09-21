import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import SalesOrder from './SalesOrder';
import salesOrdersService from '../../services/salesOrdersService';

const SalesOrderMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const loadSalesOrders = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Loading sales orders from API...');
      const data = await salesOrdersService.getSalesOrders({ limit: 50 });
      console.log('📡 Sales Orders API Response:', data);
      
      const items = Array.isArray(data.items) ? data.items : [];
      const normalized = items.map((it, idx) => ({
        id: it.id ?? idx,
        soNumber: it.soNumber ?? it.so_number ?? it.number ?? `SO-${it.id ?? idx}`,
        customerName: it.customerName ?? it.customer_name ?? it.customer ?? 'Customer',
        reference: it.reference ?? it.ref ?? '',
        soDate: it.soDate ?? it.so_date ?? it.date ?? '',
        status: it.status ?? 'Draft',
        itemCount: Array.isArray(it.items) ? it.items.length : Number(it.item_count ?? it.items ?? 0),
        total: Number(it.total ?? it.total_amount ?? it.grand_total ?? 0),
        // keep original fields as fallback
        ...it,
      }));
      setSalesOrders(normalized);
      
      if (items.length === 0) {
        console.warn('⚠️ No sales orders found in database');
        setError('No sales orders found in database.');
      } else {
        console.log('✅ Successfully loaded', items.length, 'sales orders');
      }
    } catch (e) {
      console.error('❌ Failed to load sales orders:', e);
      setError(`Unable to fetch sales orders: ${e.message || 'Unknown error'}`);
      
      // Fallback to demo data
      setSalesOrders([
        {
          id: 1,
          soNumber: 'SO0001',
          customerName: 'Dinesh Pathak',
          reference: 'REF-25-0001',
          soDate: '2024-01-15',
          status: 'Draft',
          total: 23610.0,
          itemCount: 3
        },
        {
          id: 2,
          soNumber: 'SO0002',
          customerName: 'Modern Office Solutions',
          reference: 'REF-25-0002',
          soDate: '2024-01-16',
          status: 'Confirmed',
          total: 35200.0,
          itemCount: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setSalesOrders((prev) => [savedItem, ...prev]);
      showToast('Sales Order created');
    } else {
      setSalesOrders((prev) => prev.map((so) => (so.id === savedItem.id ? { ...so, ...savedItem } : so)));
      showToast('Sales Order updated');
    }
  };

  const handleDeleted = (id) => {
    setSalesOrders((prev) => prev.filter((so) => so.id !== id));
    showToast('Sales Order deleted');
  };

  const handleSOClick = (so) => {
    setSelectedSO(so);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewSO = () => {
    setSelectedSO(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedSO(null);
    // Refresh sales orders list after form submission
    loadSalesOrders();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return { color: 'var(--warning)', bg: 'var(--warning)' + '20' };
      case 'confirmed':
        return { color: 'var(--success)', bg: 'var(--success)' + '20' };
      case 'cancelled':
        return { color: 'var(--error)', bg: 'var(--error)' + '20' };
      default:
        return { color: 'var(--text-muted)', bg: 'var(--border-light)' };
    }
  };

  // If showing form, render SalesOrder
  if (showForm) {
    return (
      <SalesOrder
        onBack={handleBackFromForm}
        onHome={onHome}
        salesOrder={selectedSO}
        mode={formMode}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b"
        style={{borderColor: 'var(--border)'}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mr-4"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                Sales Orders
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shiv-surface rounded-xl overflow-hidden"
          style={{
            border: `2px solid var(--border)`,
            boxShadow: '0 8px 24px var(--shadow)',
            backgroundColor: 'var(--surface)'
          }}
        >
          {/* List View Header */}
          <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                  List View
                </h2>
                <p className="text-sm mt-1" style={{color: 'var(--text-muted)'}}>
                  Manage your sales orders and track their status
                </p>
              </div>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)'}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewSO}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
          </div>

          {/* Sales Orders List */}
          <div className="p-6 space-y-3">
            {salesOrders.map((so, index) => (
              <motion.button
                key={so?.id ?? index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: '0 2px 8px var(--shadow)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 24px var(--shadow)',
                  borderColor: 'var(--secondary)'
                }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--border-light)';
                  e.target.style.borderColor = 'var(--secondary)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--surface)';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.transform = 'translateY(0px)';
                }}
                onClick={() => handleSOClick(so)}
              >
                <div className="flex items-center justify-between">
                  {/* Left side - SO info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                         style={{
                           backgroundColor: 'var(--secondary)' + '20',
                           border: `2px solid var(--secondary)`
                         }}>
                      <FileText className="w-6 h-6" style={{color: 'var(--secondary)'}} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" 
                            style={{color: 'var(--text-primary)'}}>
                          {so.soNumber}
                        </h3>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(so.status).bg,
                            color: getStatusColor(so.status).color
                          }}
                        >
                          {so.status}
                        </span>
                      </div>
                      <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                        {so.customerName} | Ref: {so.reference}
                      </p>
                      <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                        {Array.isArray(so?.items) ? so.items.length : (Number(so?.itemCount ?? so?.items ?? 0))} items | Date: {so.soDate}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Amount */}
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
                      ₹{Number(so?.total ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                      Total Amount
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
            
            {/* Add New SO Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: salesOrders.length * 0.1 + 0.2 }}
              className="w-full p-6 rounded-xl border-2 border-dashed transition-all duration-300 group"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent'
              }}
              whileHover={{ 
                scale: 1.01,
                borderColor: 'var(--secondary)'
              }}
              whileTap={{ scale: 0.99 }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--secondary)';
                e.target.style.backgroundColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.backgroundColor = 'transparent';
              }}
              onClick={handleNewSO}
            >
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'white'
                  }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="w-6 h-6" />
                </motion.div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg" style={{color: 'var(--secondary)'}}>
                    Create New Sales Order
                  </h3>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    Add a new sales order to your system
                  </p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesOrderMaster;
