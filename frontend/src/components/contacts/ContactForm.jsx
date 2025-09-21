import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Check, Edit, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import contactsService from '../../services/contactsService';

const ContactForm = ({ onBack, onHome, contact = null, mode = 'new', onSaved, onDeleted }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    address: contact?.address || '',
    city: contact?.city || '',
    state: contact?.state || '',
    pincode: contact?.pincode || '',
    type: contact?.type || 'Customer'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = async () => {
    console.log('🔄 handleConfirm called with formData:', formData);
    
    try {
      setLoading(true);
      
      // Prepare data for API
      const contactData = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        mobile: formData.phone, // Changed from phone to mobile to match backend
        address_city: formData.city,
        address_state: formData.state
      };

      console.log('📤 Sending to API:', contactData);

      if (mode === 'new') {
        // Create new contact
        const result = await contactsService.createContact(contactData);
        console.log('✅ Contact created successfully:', result);
        if (onSaved) onSaved(result.item || result.contact || result, 'new');
      } else {
        // Update existing contact
        const result = await contactsService.updateContact(contact.id, contactData);
        console.log('✅ Contact updated successfully:', result);
        // Some APIs return the updated entity, others not; fallback to local merge
        const updated = result.item || result.contact || { id: contact.id, ...contactData };
        if (onSaved) onSaved(updated, 'edit');
      }
      
      onBack(); // This will trigger loadContacts() in parent
    } catch (error) {
      console.error('❌ Failed to save contact:', error);
      alert('Failed to save contact: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModify = () => {
    console.log('Modifying contact:', formData);
    // Handle modify logic here
  };

  const handleDelete = () => {
    if (!contact?.id) {
      alert('No contact selected to delete');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this contact? This action cannot be undone.')) return;
    (async () => {
      try {
        setLoading(true);
        await contactsService.deleteContact(contact.id);
        if (onDeleted) onDeleted(contact.id);
        onBack();
      } catch (err) {
        console.error('Failed to delete contact:', err);
        alert('Failed to delete contact: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  };

  const getNavigationButtons = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'new', label: 'New', icon: null, action: () => window.location.reload(), disabled: loading },
        { id: 'confirm', label: loading ? 'Saving…' : 'Confirm', icon: Check, action: handleConfirm, disabled: loading },
        { id: 'modify', label: 'Modify', icon: Edit, action: handleModify, disabled: loading },
        { id: 'delete', label: 'Delete', icon: Trash2, action: handleDelete, disabled: loading },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack, disabled: loading }
      ];
    } else {
      return [
        { id: 'home', label: 'Home', icon: Home, action: onHome, disabled: loading },
        { id: 'back', label: 'Back', icon: ArrowLeft, action: onBack, disabled: loading }
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
              Contact Master
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
                    disabled={button.disabled || loading}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Contact Name
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
                    placeholder="Enter contact name"
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
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    placeholder="unique email"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    placeholder="+91 number"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 bg-transparent transition-colors focus:outline-none focus:ring-0 resize-none"
                    style={{
                      borderColor: 'var(--error)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface)'
                    }}
                    placeholder="Enter address"
                  />
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="City"
                    />
                  </div>
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
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="State"
                    />
                  </div>
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
                        borderColor: 'var(--error)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface)'
                      }}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="lg:col-span-1">
                <motion.div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--error)',
                    backgroundColor: 'var(--surface)'
                  }}
                  whileHover={{
                    borderColor: 'var(--primary)',
                    backgroundColor: 'var(--border-light)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4" style={{color: 'var(--text-muted)'}} />
                  <p className="text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                    Upload Image
                  </p>
                  <p className="text-xs" style={{color: 'var(--text-muted)'}}>
                    Click to browse or drag and drop
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Alert Section */}
          <div className="px-8 pb-8">
            <div className="flex justify-end">
              <span className="text-sm font-medium" style={{color: 'var(--success)'}}>
                Alert Opossum
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactForm;
