import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BarChart3 } from 'lucide-react';
import ChartOfAccountsForm from './ChartOfAccountsForm';
import coaService from '../../services/coaService';

const ChartOfAccounts = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const loadAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await coaService.getAccounts({ limit: 50 });
      const items = Array.isArray(data.items) ? data.items : [];
      setAccounts(items);
    } catch (e) {
      console.error(e);
      setError('Unable to fetch accounts from server. Showing demo data.');
      setAccounts([
        {
          id: 1,
          name: 'Bank A/c',
          type: 'Assets'
        },
        {
          id: 2,
          name: 'Purchase Expense A/c',
          type: 'Expense'
        },
        {
          id: 3,
          name: 'Debtors A/c',
          type: 'Assets'
        },
        {
          id: 4,
          name: 'Creditors A/c',
          type: 'Liabilities'
        },
        {
          id: 5,
          name: 'Sales Income A/c',
          type: 'Income'
        },
        {
          id: 6,
          name: 'Cash A/c',
          type: 'Assets'
        },
        {
          id: 7,
          name: 'Other Expense A/c',
          type: 'Expense'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setAccounts((prev) => [savedItem, ...prev]);
      showToast('Account created');
    } else {
      setAccounts((prev) => prev.map((a) => (a.id === savedItem.id ? { ...a, ...savedItem } : a)));
      showToast('Account updated');
    }
  };

  const handleDeleted = (id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Account deleted');
  };

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewAccount = () => {
    setSelectedAccount(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedAccount(null);
    // Refresh accounts list after form submission
    loadAccounts();
  };

  // If showing form, render ChartOfAccountsForm
  if (showForm) {
    return (
      <ChartOfAccountsForm
        onBack={handleBackFromForm}
        onHome={onHome}
        account={selectedAccount}
        mode={formMode}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Assets':
        return { color: 'var(--success)', bg: 'var(--success)' + '20' };
      case 'Expense':
        return { color: 'var(--error)', bg: 'var(--error)' + '20' };
      case 'Liabilities':
        return { color: 'var(--warning)', bg: 'var(--warning)' + '20' };
      case 'Income':
        return { color: 'var(--info)', bg: 'var(--info)' + '20' };
      default:
        return { color: 'var(--text-muted)', bg: 'var(--border-light)' };
    }
  };

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
                Chart of Accounts
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Manage your financial accounts and categories
                </p>
              </div>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)'}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewAccount}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
            {error && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{error}</p>
            )}
          </div>

          {/* Toast Message */}
          {toast && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-6 mb-4">
              <p className="text-yellow-800 text-sm">{toast}</p>
            </div>
          )}

          {/* Account List */}
          <div className="p-6 space-y-3">
            {loading ? (
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading accounts...</div>
            ) : (
              accounts.map((account, index) => {
                const typeStyle = getTypeColor(account.type);
                return (
                  <motion.button
                    key={account.id}
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
                    onClick={() => handleAccountClick(account)}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side - Account info */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                             style={{
                               backgroundColor: typeStyle.bg,
                               border: `2px solid ${typeStyle.color}`
                             }}>
                          <BarChart3 className="w-6 h-6" style={{color: typeStyle.color}} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors" 
                              style={{color: 'var(--text-primary)'}}>
                            {account.name || account.account_name}
                          </h3>
                          <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                            Account ID: {account.id.toString().padStart(3, '0')}
                          </p>
                        </div>
                      </div>

                      {/* Right side - Type badge */}
                      <div className="flex items-center space-x-3">
                        <motion.span 
                          className="px-4 py-2 rounded-full font-medium text-sm"
                          style={{
                            color: typeStyle.color,
                            backgroundColor: typeStyle.bg,
                            border: `1px solid ${typeStyle.color}`
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {account.type}
                        </motion.span>
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: typeStyle.color }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}

            {/* Add New Account Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: accounts.length * 0.1 + 0.2 }}
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
              onClick={handleNewAccount}
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
                    Add New Account
                  </h3>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                    Create a new chart of account
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

export default ChartOfAccounts;
