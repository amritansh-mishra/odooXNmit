import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Building2, Home, Check, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const VendorForm = ({ onBack, onHome, vendor, mode }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    email: vendor?.email || '',
    mobile: vendor?.mobile || '',
    gstNo: vendor?.gstNo || '',
    address: vendor?.address || '',
    city: vendor?.city || '',
    state: vendor?.state || '',
    pincode: vendor?.pincode || '',
    image: vendor?.image || ''
  });

  const [imagePreview, setImagePreview] = useState(vendor?.image || '');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setImagePreview(result);
        handleInputChange('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Vendor form submitted:', formData);
    // Add your form submission logic here
    onBack();
  };

  const handleConfirm = () => {
    console.log('Confirming vendor:', formData);
    // Handle save/update logic here
    onBack();
  };

  const handleModify = () => {
    console.log('Modifying vendor:', formData);
    // Handle modify logic here
  };

  const handleDelete = () => {
    console.log('Deleting vendor:', formData);
    // Handle delete logic here
    onBack();
  };

  const getNavigationButtons = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'confirm', label: 'Confirm', icon: Check, action: handleConfirm },
        { id: 'modify', label: 'Modify', icon: Edit, action: handleModify },
        { id: 'delete', label: 'Delete', icon: Trash2, action: handleDelete },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack }
      ];
    } else if (user?.role === 'accountant') {
      return [
        { id: 'home', label: 'Home', icon: Home, action: onHome },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack }
      ];
    } else {
      return [
        { id: 'home', label: 'Home', icon: Home, action: onHome },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack }
      ];
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
            <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              Vendor Master
            </h1>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              {getNavigationButtons().map((button, index) => {
                const ButtonIcon = button.icon;
                return (
                  <motion.button
                    key={button.id}
                    onClick={button.action}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: button.id === 'confirm' ? 'var(--success)' : 
                                     button.id === 'delete' ? 'var(--error)' : 
                                     'var(--border-light)',
                      color: button.id === 'confirm' || button.id === 'delete' ? 'white' : 'var(--text-primary)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={(e) => {
                      if (button.id === 'confirm') e.target.style.backgroundColor = 'var(--success-dark)';
                      else if (button.id === 'delete') e.target.style.backgroundColor = 'var(--error-dark)';
                      else e.target.style.backgroundColor = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                      if (button.id === 'confirm') e.target.style.backgroundColor = 'var(--success)';
                      else if (button.id === 'delete') e.target.style.backgroundColor = 'var(--error)';
                      else e.target.style.backgroundColor = 'var(--border-light)';
                    }}
                  >
                    {ButtonIcon && <ButtonIcon className="w-4 h-4 mr-2" />}
                    {button.label}
                  </motion.button>
                );
              })}
            </div>
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
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div
                    className="w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--border-light)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Vendor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-12 h-12" style={{color: 'var(--text-muted)'}} />
                    )}
                  </motion.div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 p-2 rounded-full"
                    style={{backgroundColor: 'var(--primary)'}}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Upload className="w-4 h-4 text-white" />
                  </motion.div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter vendor name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter email address"
                  />
                </div>

                {/* Mobile No. */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Mobile No.
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter mobile number"
                  />
                </div>

                {/* GST No. */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    GST No.
                  </label>
                  <input
                    type="text"
                    value={formData.gstNo}
                    onChange={(e) => handleInputChange('gstNo', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter GST number"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0 resize-none"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter complete address"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter city"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter state"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <motion.button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-lg border-2 font-medium transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--error)';
                    e.target.style.color = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.color = 'var(--text-primary)';
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                  style={{backgroundColor: 'var(--primary)'}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                >
                  {mode === 'edit' ? 'Update Vendor' : 'Create Vendor'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VendorForm;
