import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Download, ArrowUpRight, ArrowDownRight, Calendar, User } from 'lucide-react';

const RecentTransactions = ({ transactions = [] }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'invoice':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'purchase':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'payment':
        return <ArrowDownRight className="w-4 h-4 text-blue-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesStatus && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="shiv-surface rounded-xl p-6 hover:shadow-lg transition-all duration-300"
      style={{
        border: `1px solid var(--border)`,
        boxShadow: '0 4px 12px var(--shadow)'
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--border-light)' }}
            whileHover={{ scale: 1.05 }}
          >
            <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Recent Transactions
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {filteredTransactions.length} transactions found
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              style={{
                border: `1px solid var(--border)`,
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none z-10" style={{ color: 'var(--text-muted)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all appearance-none"
              style={{
                border: `1px solid var(--border)`,
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer group"
            style={{
              border: `1px solid var(--border)`,
              backgroundColor: selectedTransaction === transaction.id ? 'var(--border-light)' : 'var(--surface)'
            }}
            onClick={() => setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id)}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: transaction.type === 'income' ? 'var(--success)' + '20' : 'var(--error)' + '20'
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" style={{ color: 'var(--error)' }} />
                  )}
                </motion.div>
                <div>
                  <h4 className="font-semibold group-hover:text-blue-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {transaction.description}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {transaction.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <motion.p 
                    className="font-bold text-lg"
                    style={{
                      color: transaction.type === 'income' ? 'var(--success)' : 'var(--error)'
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </motion.p>
                  <motion.span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1"
                    style={{
                      backgroundColor: transaction.status === 'completed' 
                        ? 'var(--success)' + '20'
                        : transaction.status === 'pending'
                        ? 'var(--warning)' + '20'
                        : 'var(--error)' + '20',
                      color: transaction.status === 'completed' 
                        ? 'var(--success)'
                        : transaction.status === 'pending'
                        ? 'var(--warning)'
                        : 'var(--error)'
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {transaction.status}
                  </motion.span>
                </div>
                <div className="flex space-x-2">
                  <motion.button 
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button 
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--success)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedTransaction === transaction.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4"
                style={{ borderTop: `1px solid var(--border)` }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p style={{ color: 'var(--text-muted)' }}>Transaction ID</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{transaction.id}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p style={{ color: 'var(--text-muted)' }}>Method</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{transaction.method}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p style={{ color: 'var(--text-muted)' }}>Reference</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{transaction.reference}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p style={{ color: 'var(--text-muted)' }}>Balance</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>₹{transaction.balance?.toLocaleString()}</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--border-light)' }}>
              <Calendar className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>No transactions found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentTransactions;
