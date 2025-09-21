import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Edit, Trash2, Archive } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import productsService from '../../services/productsService';

const ProductForm = ({ onBack, onHome, product = null, mode = 'new', onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    type: product?.type || 'Goods',
    category: product?.category || '',
    hsnCode: product?.hsnCode || product?.hsn_code || '',
    salesPrice: product?.salesPrice || product?.sales_price || '',
    salesTax: product?.salesTax || product?.sales_tax || '5',
    purchasePrice: product?.purchasePrice || product?.purchase_price || '',
    purchaseTax: product?.purchaseTax || product?.purchase_tax || '5'
  });

  const [showHsnLookup, setShowHsnLookup] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const productData = {
        name: formData.name,
        type: formData.type,
        category: formData.category,
        hsnCode: formData.hsnCode,
        salesPrice: parseFloat(formData.salesPrice) || 0,
        salesTax: parseFloat(formData.salesTax) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        purchaseTax: parseFloat(formData.purchaseTax) || 0
      };

      if (mode === 'new') {
        const result = await productsService.createProduct(productData);
        if (onSaved) onSaved(result.item || result.product || result, 'new');
      } else {
        const result = await productsService.updateProduct(product.id, productData);
        const updated = result.item || result.product || { id: product.id, ...productData };
        if (onSaved) onSaved(updated, 'edit');
      }
      onBack();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id) {
      alert('No product selected to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await productsService.deleteProduct(product.id);
      if (onDeleted) onDeleted(product.id);
      onBack();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchived = async () => {
    if (!product?.id) {
      alert('No product selected to archive');
      return;
    }
    try {
      setLoading(true);
      await productsService.archiveProduct(product.id);
      alert('Product archived successfully');
      onBack();
    } catch (err) {
      console.error('Failed to archive product:', err);
      alert('Failed to archive product: ' + (err.message || 'Unknown error'));
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

  const hsnCodes = [
    { code: '940370', description: 'ARTICLES AND EQUIPMENT FOR GYMNASTICS OR ATHLETICS, OR FOR OTHER SPORTS (INCLUDING TABLE-TENNIS) OR OUTDOOR GAMES, NOT SPECIFIED OR INCLUDED ELSEWHERE IN THIS CHAPTER; SWIMMING POOLS AND PADDLING POOLS' },
    { code: '940360', description: 'Other wooden furniture' },
    { code: '998314', description: 'Interior design services' },
    { code: '940170', description: 'Seats (other than those of heading 9402), whether or not convertible into beds, and parts thereof' }
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
              Product Master
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Product Name
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
                    placeholder="Enter product name"
                  />
                </div>

                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Product Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="productType"
                        value="Goods"
                        checked={formData.type === 'Goods'}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--info)'}}
                      />
                      <span style={{color: 'var(--info)'}}>Goods</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="productType"
                        value="Service"
                        checked={formData.type === 'Service'}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="mr-2"
                        style={{accentColor: 'var(--info)'}}
                      />
                      <span style={{color: 'var(--info)'}}>Service</span>
                    </label>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    placeholder="Selection"
                  />
                </div>

                {/* HSN/SAC Code */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    HSN/SAC Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                      style={{
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="Integer"
                      onFocus={() => setShowHsnLookup(true)}
                    />
                    
                    {/* HSN/SAC Code Lookup */}
                    {showHsnLookup && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-2 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--surface)'
                        }}
                      >
                        <div className="p-4">
                          <h4 className="font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                            HSN/SAC Code - Fetch from api
                          </h4>
                          {hsnCodes.map((hsn) => (
                            <div
                              key={hsn.code}
                              className="p-3 cursor-pointer hover:bg-gray-50 rounded-lg mb-2"
                              style={{backgroundColor: 'var(--border-light)'}}
                              onClick={() => {
                                handleInputChange('hsnCode', hsn.code);
                                setShowHsnLookup(false);
                              }}
                            >
                              <div className="font-mono font-bold" style={{color: 'var(--text-primary)'}}>
                                {hsn.code}
                              </div>
                              <div className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                                {hsn.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm mt-2" style={{color: 'var(--text-primary)'}}>
                    HSN/SAC Code - Fetch from api
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Sales Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Sales Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.salesPrice}
                      onChange={(e) => handleInputChange('salesPrice', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                      style={{
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="22.20"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                          style={{color: 'var(--text-muted)'}}>
                      Rs
                    </span>
                  </div>
                </div>

                {/* Sales Tax */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Sales Tax
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.salesTax}
                      onChange={(e) => handleInputChange('salesTax', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                      style={{
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                          style={{color: 'var(--text-muted)'}}>
                      %
                    </span>
                  </div>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Purchase Price
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                      style={{
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="15.00"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                          style={{color: 'var(--text-muted)'}}>
                      Rs
                    </span>
                  </div>
                </div>

                {/* Purchase Tax */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Purchase Tax
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.purchaseTax}
                      onChange={(e) => handleInputChange('purchaseTax', e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                      style={{
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="5"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                          style={{color: 'var(--text-muted)'}}>
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Click outside to close HSN lookup */}
      {showHsnLookup && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowHsnLookup(false)}
        />
      )}
    </div>
  );
};

export default ProductForm;
