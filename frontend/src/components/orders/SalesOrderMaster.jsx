import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import SalesOrder from './SalesOrder';

const SalesOrderMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSO, setSelectedSO] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [salesOrders] = useState([
    {
      id: 1,
      soNumber: 'SO0001',
      customerName: 'Dinesh Pathak',
      reference: 'REF-25-0001',
      soDate: '2024-01-15',
      status: 'Draft',
      total: 23610.0,
      items: 3
    },
    {
      id: 2,
      soNumber: 'SO0002',
      customerName: 'Modern Office Solutions',
      reference: 'REF-25-0002',
      soDate: '2024-01-16',
      status: 'Confirmed',
      total: 35200.0,
      items: 5
    },
    {
      id: 3,
      soNumber: 'SO0003',
      customerName: 'Corporate Interiors Ltd',
      reference: 'REF-25-0003',
      soDate: '2024-01-17',
      status: 'Confirmed',
      total: 18750.0,
      items: 2
    },
    {
      id: 4,
      soNumber: 'SO0004',
      customerName: 'Luxury Homes Pvt Ltd',
      reference: 'REF-25-0004',
      soDate: '2024-01-18',
      status: 'Draft',
      total: 12900.0,
      items: 4
    },
    {
      id: 5,
      soNumber: 'SO0005',
      customerName: 'Premium Offices',
      reference: 'REF-25-0005',
      soDate: '2024-01-19',
      status: 'Cancelled',
      total: 28400.0,
      items: 6
    }
  ]);

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
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'var(--warning)';
      case 'Confirmed': return 'var(--success)';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--text-muted)';
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
                key={so.id}
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
                            backgroundColor: getStatusColor(so.status) + '20',
                            color: getStatusColor(so.status)
                          }}
                        >
                          {so.status}
                        </span>
                      </div>
                      <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                        {so.customerName} | Ref: {so.reference}
                      </p>
                      <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                        {so.items} items | Date: {so.soDate}
                      </p>
                    </div>
                  </div>

                  {/* Right side - Amount */}
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{color: 'var(--text-primary)'}}>
                      ₹{so.total.toLocaleString()}
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
