import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Archive, ChevronDown, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import taxesService from '../../services/taxesService';

const TaxesForm = ({ onBack, onHome, tax = null, mode = 'new', onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: tax?.name || '',
    computation: tax?.computation || 'Percentage',
    taxFor: tax?.taxFor || 'Sales',
    value: tax?.value || ''
  });

  const [showComputationDropdown, setShowComputationDropdown] = useState(false);
  const [showTaxForDropdown, setShowTaxForDropdown] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const taxData = {
        name: formData.name,
        method: formData.computation === 'Percentage' ? 'percentage' : 'fixed',
        value: parseFloat(formData.value) || 0,
        applicableOn: formData.taxFor
      };

      if (mode === 'new') {
        const result = await taxesService.createTax(taxData);
        if (onSaved) onSaved(result.item || result.tax || result, 'new');
      } else {
        const result = await taxesService.updateTax(tax.id, taxData);
        const updated = result.item || result.tax || { id: tax.id, ...taxData };
        if (onSaved) onSaved(updated, 'edit');
      }
      onBack();
    } catch (err) {
      console.error('Failed to save tax:', err);
      alert('Failed to save tax: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tax?.id) {
      alert('No tax selected to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this tax? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await taxesService.deleteTax(tax.id);
      if (onDeleted) onDeleted(tax.id);
      onBack();
    } catch (err) {
      console.error('Failed to delete tax:', err);
      alert('Failed to delete tax: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchived = async () => {
    if (!tax?.id) {
      alert('No tax selected to archive');
      return;
    }
    try {
      setLoading(true);
      await taxesService.archiveTax(tax.id);
      alert('Tax archived successfully');
      onBack();
    } catch (err) {
      console.error('Failed to archive tax:', err);
      alert('Failed to archive tax: ' + (err.message || 'Unknown error'));
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

  const computationOptions = [
    { value: 'Percentage', label: '% or Fixed Value' },
    { value: 'Fixed Value', label: 'Fixed Value' }
  ];

  const taxForOptions = [
    { value: 'Sales', label: 'Selection ( Purchase / Sales )' },
    { value: 'Purchase', label: 'Purchase' }
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
              Taxes Master
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
              {/* Tax Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Tax Name
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
                  placeholder="5% GST S"
                />
              </div>

              {/* Tax Computation */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Tax Computation
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowComputationDropdown(!showComputationDropdown)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0 flex items-center justify-between"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    <span>{formData.computation === 'Percentage' ? '% or Fixed Value' : formData.computation}</span>
                    <div className="flex items-center">
                      <span className="text-sm mr-2" style={{color: 'var(--text-muted)'}}>
                        (% / Fixed )
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  
                  {showComputationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 border-2 rounded-lg shadow-lg z-50"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--surface)'
                      }}
                    >
                      {computationOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          style={{
                            color: 'var(--text-primary)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          onClick={() => {
                            handleInputChange('computation', option.value);
                            setShowComputationDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Tax For */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Tax For
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTaxForDropdown(!showTaxForDropdown)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0 flex items-center justify-between"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    <span>{formData.taxFor === 'Sales' ? 'Selection ( Purchase / Sales )' : formData.taxFor}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showTaxForDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 border-2 rounded-lg shadow-lg z-50"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--surface)'
                      }}
                    >
                      {taxForOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                          style={{
                            color: 'var(--text-primary)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          onClick={() => {
                            handleInputChange('taxFor', option.value);
                            setShowTaxForDropdown(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                  Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    className="w-full px-4 py-3 pr-20 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    placeholder="say 5% or 5.00"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                        style={{color: 'var(--text-muted)'}}>
                    (% / Fixed )
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showComputationDropdown || showTaxForDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowComputationDropdown(false);
            setShowTaxForDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default TaxesForm;
