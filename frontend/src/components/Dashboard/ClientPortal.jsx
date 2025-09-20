import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CreditCard, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ClientPortal = ({ user }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock client-specific data
  const clientInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      amount: 125000,
      status: 'paid',
      description: 'Website Development Services',
      items: [
        { name: 'Frontend Development', quantity: 1, rate: 75000, amount: 75000 },
        { name: 'Backend Integration', quantity: 1, rate: 50000, amount: 50000 }
      ]
    },
    {
      id: 'INV-2024-002',
      date: '2024-01-20',
      dueDate: '2024-02-20',
      amount: 85000,
      status: 'pending',
      description: 'Consulting Services',
      items: [
        { name: 'Business Consultation', quantity: 10, rate: 8500, amount: 85000 }
      ]
    },
    {
      id: 'INV-2024-003',
      date: '2024-01-25',
      dueDate: '2024-01-30',
      amount: 45000,
      status: 'overdue',
      description: 'Software License',
      items: [
        { name: 'Annual Software License', quantity: 1, rate: 45000, amount: 45000 }
      ]
    }
  ];

  const clientPayments = [
    {
      id: 'PAY-001',
      invoiceId: 'INV-2024-001',
      date: '2024-02-10',
      amount: 125000,
      method: 'Bank Transfer',
      status: 'completed',
      reference: 'TXN123456789'
    },
    {
      id: 'PAY-002',
      invoiceId: 'INV-2024-002',
      date: '2024-02-15',
      amount: 42500,
      method: 'Credit Card',
      status: 'completed',
      reference: 'CC987654321'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredInvoices = clientInvoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = clientInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = clientInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shiv-surface rounded-xl p-6 hover:shadow-md transition-shadow"
          style={{
            border: `1px solid var(--border)`,
            boxShadow: '0 2px 8px var(--shadow)'
          }}
        >
          <div className="flex items-center">
            <div 
              className="p-3 rounded-lg"
              style={{backgroundColor: 'var(--border-light)'}}
            >
              <FileText className="w-6 h-6" style={{color: 'var(--primary)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                Total Invoices
              </p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                {clientInvoices.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="shiv-surface rounded-xl p-6 hover:shadow-md transition-shadow"
          style={{
            border: `1px solid var(--border)`,
            boxShadow: '0 2px 8px var(--shadow)'
          }}
        >
          <div className="flex items-center">
            <div 
              className="p-3 rounded-lg"
              style={{backgroundColor: 'var(--border-light)'}}
            >
              <DollarSign className="w-6 h-6" style={{color: 'var(--success)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                Total Paid
              </p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="shiv-surface rounded-xl p-6 hover:shadow-md transition-shadow"
          style={{
            border: `1px solid var(--border)`,
            boxShadow: '0 2px 8px var(--shadow)'
          }}
        >
          <div className="flex items-center">
            <div 
              className="p-3 rounded-lg"
              style={{backgroundColor: 'var(--border-light)'}}
            >
              <AlertCircle className="w-6 h-6" style={{color: 'var(--error)'}} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                Outstanding
              </p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="shiv-surface rounded-xl mb-6"
        style={{
          border: `1px solid var(--border)`,
          boxShadow: '0 2px 8px var(--shadow)'
        }}
      >
        <div className="border-b" style={{borderColor: 'var(--border)'}}>
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'invoices'
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              style={{
                color: activeTab === 'invoices' ? 'var(--primary)' : 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'invoices') {
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'invoices') {
                  e.target.style.color = 'var(--text-muted)';
                }
              }}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Invoices
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
              style={{
                color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-muted)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'payments') {
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'payments') {
                  e.target.style.color = 'var(--text-muted)';
                }
              }}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment History
            </button>
          </nav>
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {filteredInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg p-4 hover:shadow-md transition-shadow"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
                        {invoice.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 transition-colors"
                        style={{color: 'var(--text-muted)'}}
                        onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 transition-colors"
                        style={{color: 'var(--text-muted)'}}
                        onMouseEnter={(e) => e.target.style.color = 'var(--success)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Description</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>{invoice.description}</p>
                    </div>
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Amount</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>₹{invoice.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Due Date</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="p-6">
            <div className="space-y-4">
              {clientPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg p-4"
                  style={{
                    border: `1px solid var(--border)`,
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
                        {payment.id}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{color: 'var(--success)'}}>
                      ₹{payment.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Invoice</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>{payment.invoiceId}</p>
                    </div>
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Date</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Method</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>{payment.method}</p>
                    </div>
                    <div>
                      <p style={{color: 'var(--text-muted)'}}>Reference</p>
                      <p className="font-medium" style={{color: 'var(--text-primary)'}}>{payment.reference}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ClientPortal;
