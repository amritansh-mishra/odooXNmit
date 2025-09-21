import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import PurchaseOrder from './PurchaseOrder';
import purchaseOrdersService from '../../services/purchaseOrdersService';

const PurchaseOrderMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const loadPurchaseOrders = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Loading purchase orders from API...');
      
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error('❌ No authentication token found in localStorage');
        setError('Please log in to view purchase orders.');
        setLoading(false);
        return;
      }
      
      console.log('🔑 Auth token found, making API request...');
      const data = await purchaseOrdersService.getPurchaseOrders({ limit: 50 });
      console.log('📡 Purchase Orders API Response:', data);
      
      const items = Array.isArray(data.items) ? data.items : [];
      setPurchaseOrders(items);
      
      if (items.length === 0) {
        console.warn('⚠️ No purchase orders found in database');
        setError('No purchase orders found in database.');
      } else {
        console.log('✅ Successfully loaded', items.length, 'purchase orders');
      }
    } catch (e) {
      console.error('❌ Failed to load purchase orders:', e);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Unknown error';
      if (e.message) {
        errorMessage = e.message;
      }
      
      // Handle specific authentication errors
      if (e.message && e.message.includes('Authorization token missing')) {
        errorMessage = 'Please log in to access purchase orders.';
        console.error('🔐 Authentication required - redirecting to login may be needed');
      } else if (e.message && e.message.includes('401')) {
        errorMessage = 'Your session has expired. Please log in again.';
        console.error('🔐 Token expired or invalid');
      } else if (e.message && e.message.includes('403')) {
        errorMessage = 'You do not have permission to view purchase orders.';
        console.error('🔐 Insufficient permissions');
      }
      
      setError(`Unable to fetch purchase orders: ${errorMessage}`);
      
      // Fallback to demo data
      setPurchaseOrders([
        {
          id: 1,
          poNumber: 'PO0001',
          vendorName: 'Azure Interior',
          reference: 'REQ-25-0001',
          poDate: '2024-01-15',
          status: 'Draft',
          total: 17857.5,
          items: 3
        },
        {
          id: 2,
          poNumber: 'PO0002',
          vendorName: 'Modern Furniture Co.',
          reference: 'REQ-25-0002',
          poDate: '2024-01-16',
          status: 'Confirmed',
          total: 25600.0,
          items: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setPurchaseOrders((prev) => [savedItem, ...prev]);
      showToast('Purchase Order created');
    } else {
      setPurchaseOrders((prev) => prev.map((po) => (po.id === savedItem.id ? { ...po, ...savedItem } : po)));
      showToast('Purchase Order updated');
    }
  };

  const handleDeleted = (id) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id));
    showToast('Purchase Order deleted');
  };

  const handlePOClick = (po) => {
    setSelectedPO(po);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewPO = () => {
    setSelectedPO(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedPO(null);
    // Refresh purchase orders list after form submission
    loadPurchaseOrders();
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

  // If showing form, render PurchaseOrder
  if (showForm) {
    return (
      <PurchaseOrder
        onBack={handleBackFromForm}
        onHome={onHome}
        purchaseOrder={selectedPO}
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
                Purchase Orders
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
                  Manage your purchase orders and track their status
                </p>
              </div>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)'}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewPO}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
          </div>

          {/* Purchase Orders List */}
          <div className="p-6 space-y-3">
            {loading ? (
              <div className="text-center">
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center">
                <p style={{color: 'var(--error)'}}>{error}</p>
              </div>
            ) : (
              purchaseOrders.map((po, index) => (
                <motion.button
                  key={po.id}
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
                    borderColor: 'var(--primary)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--border-light)';
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--surface)';
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.transform = 'translateY(0px)';
                  }}
                  onClick={() => handlePOClick(po)}
                >
                  <div className="flex items-center justify-between">
                    {/* Left side - PO info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                           style={{
                             backgroundColor: 'var(--primary)' + '20',
                             border: `2px solid var(--primary)`
                           }}>
                        <ShoppingCart className="w-6 h-6" style={{color: 'var(--primary)'}} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" 
                              style={{color: 'var(--text-primary)'}}>
                            {po.poNumber}
                          </h3>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: getStatusColor(po.status).bg,
                              color: getStatusColor(po.status).color
                            }}
                          >
                            {po.status}
                          </span>
                        </div>
                        <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                          {po.vendorName} | Ref: {po.reference}
                        </p>
                        <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                          {po.items} items | Date: {po.poDate}
                        </p>
                      </div>
                    </div>

                    {/* Right side - Amount */}
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
                        ₹{po.total.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                        Total Amount
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
            
            {/* Add New PO Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: purchaseOrders.length * 0.1 + 0.2 }}
              className="w-full p-6 rounded-xl border-2 border-dashed transition-all duration-300 group"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent'
              }}
              whileHover={{ 
                scale: 1.01,
                borderColor: 'var(--primary)'
              }}
              whileTap={{ scale: 0.99 }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.backgroundColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.backgroundColor = 'transparent';
              }}
              onClick={handleNewPO}
            >
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="w-6 h-6" />
                </motion.div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg" style={{color: 'var(--primary)'}}>
                    Create New Purchase Order
                  </h3>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    Add a new purchase order to your system
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

export default PurchaseOrderMaster;
