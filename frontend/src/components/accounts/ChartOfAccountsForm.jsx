import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Archive, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import coaService from '../../services/coaService';

const ChartOfAccountsForm = ({ onBack, onHome, account = null, mode = 'new', onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: account?.name || account?.account_name || '',
    type: account?.type || ''
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const accountData = {
        accountName: formData.name,
        type: formData.type,
        description: `${formData.type} account: ${formData.name}`
      };

      if (mode === 'new') {
        const result = await coaService.createAccount(accountData);
        if (onSaved) onSaved(result.item || result.account || result, 'new');
      } else {
        const result = await coaService.updateAccount(account.id, accountData);
        const updated = result.item || result.account || { id: account.id, ...accountData };
        if (onSaved) onSaved(updated, 'edit');
      }
      onBack();
    } catch (err) {
      console.error('Failed to save account:', err);
      alert('Failed to save account: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account?.id) {
      alert('No account selected to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await coaService.deleteAccount(account.id);
      if (onDeleted) onDeleted(account.id);
      onBack();
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('Failed to delete account: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchived = async () => {
    if (!account?.id) {
      alert('No account selected to archive');
      return;
    }
    try {
      setLoading(true);
      await coaService.archiveAccount(account.id);
      alert('Account archived successfully');
      onBack();
    } catch (err) {
      console.error('Failed to archive account:', err);
      alert('Failed to archive account: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getNavigationButtons = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'confirm', label: loading ? 'Saving…' : 'Confirm', icon: Check, action: handleConfirm, disabled: loading },
        { id: 'delete', label: 'Delete', icon: Trash2, action: handleDelete, disabled: loading },
        { id: 'archived', label: 'Archive', icon: Archive, action: handleArchived, disabled: loading },
        { id: 'home', label: 'Home', icon: Home, action: onHome, disabled: loading },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack, disabled: loading }
      ];
    } else {
      return [
        { id: 'home', label: 'Home', icon: Home, action: onHome, disabled: loading },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack, disabled: loading }
      ];
    }
  };

  const typeOptions = [
    { value: 'Assets', label: 'Assets' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Liabilities', label: 'Liabilities' },
    { value: 'Income', label: 'Income' }
  ];

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
            <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              Chart of Accounts
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {/* Navigation Buttons */}
          <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
            <div className="flex flex-wrap gap-3">
              {getNavigationButtons().map((button) => {
                const ButtonIcon = button.icon;
                return (
                  <motion.button
                    key={button.id}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--border-light)',
                      color: 'var(--text-primary)',
                      border: `1px solid var(--border)`
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: 'var(--border)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={button.action}
                    disabled={button.disabled}
                  >
                    {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                    {button.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="max-w-2xl space-y-6">
              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                  style={{
                    borderColor: 'var(--error)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                  placeholder="Enter account name"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--surface)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  placeholder="Enter the type"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default ChartOfAccountsForm;
