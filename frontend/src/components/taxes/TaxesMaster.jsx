import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Calculator } from 'lucide-react';
import TaxesForm from './TaxesForm';
import taxesService from '../../services/taxesService';

const TaxesMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const loadTaxes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await taxesService.getTaxes({ limit: 50 });
      const items = Array.isArray(data.items) ? data.items : [];
      const mapped = items.map((t) => ({
        id: t._id || t.id,
        name: t.name,
        computation: t.type === 'fixed' ? 'Fixed Value' : 'Percentage',
        taxFor: t.applicableOn === 'Purchase' ? 'Purchase' : 'Sales',
        value: t.rate ?? t.value ?? 0,
        type: t.type || (t.computation === 'Fixed Value' ? 'fixed' : 'percentage')
      }));
      setTaxes(mapped);
    } catch (e) {
      console.error(e);
      setError('Unable to fetch taxes from server. Showing demo data.');
      setTaxes([
        { id: 1, name: 'GST 18%', computation: 'Percentage', taxFor: 'Sales', value: 18, type: 'percentage' },
        { id: 2, name: 'GST 12%', computation: 'Percentage', taxFor: 'Purchase', value: 12, type: 'percentage' },
        { id: 3, name: 'CGST 9%', computation: 'Percentage', taxFor: 'Sales', value: 9, type: 'percentage' },
        { id: 4, name: 'SGST 9%', computation: 'Percentage', taxFor: 'Sales', value: 9, type: 'percentage' },
        { id: 5, name: 'Fixed Service Tax', computation: 'Fixed Value', taxFor: 'Purchase', value: 500, type: 'fixed' },
        { id: 6, name: 'GST 5%', computation: 'Percentage', taxFor: 'Sales', value: 5, type: 'percentage' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxes();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setTaxes((prev) => [savedItem, ...prev]);
      showToast('Tax created');
    } else {
      setTaxes((prev) => prev.map((t) => (t.id === savedItem.id ? { ...t, ...savedItem } : t)));
      showToast('Tax updated');
    }
  };

  const handleDeleted = (id) => {
    setTaxes((prev) => prev.filter((t) => t.id !== id));
    showToast('Tax deleted');
  };

  const handleTaxClick = (tax) => {
    setSelectedTax(tax);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewTax = () => {
    setSelectedTax(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedTax(null);
    // Refresh taxes list after form submission
    loadTaxes();
  };

  // If showing form, render TaxesForm
  if (showForm) {
    return (
      <TaxesForm
        onBack={handleBackFromForm}
        onHome={onHome}
        tax={selectedTax}
        mode={formMode}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b"
        style={{ borderColor: 'var(--border)' }}
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
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Taxes Master
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
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                List View
              </h2>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewTax}
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

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b font-semibold text-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}>
            <div>Tax Name</div>
            <div>Tax Computation</div>
            <div>Tax For</div>
            <div>Value</div>
          </div>

          {/* Tax Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {loading ? (
              <div className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading taxes...</div>
            ) : (
              taxes.map((tax, index) => (
                <motion.div
                  key={tax.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-4 gap-4 p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)'
                  }}
                  whileHover={{
                    backgroundColor: 'var(--border-light)',
                    scale: 1.01,
                    boxShadow: '0 4px 12px var(--shadow)'
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleTaxClick(tax)}
                >
                  {/* Tax Name */}
                  <div className="flex items-center">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {tax.name}
                    </span>
                  </div>

                  {/* Tax Computation */}
                  <div className="flex items-center">
                    <span className="text-sm px-2 py-1 rounded-full"
                      style={{
                        color: tax.computation === 'Percentage' ? 'var(--info)' : 'var(--warning)',
                        backgroundColor: tax.computation === 'Percentage' ? 'var(--info)' + '20' : 'var(--warning)' + '20'
                      }}>
                      {tax.computation}
                    </span>
                  </div>

                  {/* Tax For */}
                  <div className="flex items-center">
                    <span className="text-sm px-2 py-1 rounded-full"
                      style={{
                        color: tax.taxFor === 'Sales' ? 'var(--success)' : 'var(--error)',
                        backgroundColor: tax.taxFor === 'Sales' ? 'var(--success)' + '20' : 'var(--error)' + '20'
                      }}>
                      {tax.taxFor}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {tax.type === 'percentage' ? `${tax.value}%` : `₹${tax.value}`}
                    </span>
                  </div>
                </motion.div>
              ))
            )}

            {/* Empty rows to match the design */}
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (taxes.length + index) * 0.05 }}
                className="grid grid-cols-4 gap-4 p-4 border-b"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  minHeight: '60px'
                }}
              >
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TaxesMaster;
