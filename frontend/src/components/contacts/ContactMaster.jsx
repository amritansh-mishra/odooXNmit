import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, User, Loader2 } from 'lucide-react';
import ContactForm from './ContactForm';
import contactsService from '../../services/contactsService';

const ContactMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewContact = () => {
    setSelectedContact(null);
    setFormMode('new');
    setShowForm(true);
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Optimistic update from form
  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setContacts((prev) => [savedItem, ...prev]);
      showToast('Contact created');
    } else {
      setContacts((prev) => prev.map((c) => (c.id === savedItem.id ? { ...c, ...savedItem } : c)));
      showToast('Contact updated');
    }
  };

  const handleDeleted = (id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contact deleted');
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedContact(null);
    // Refresh contacts list after form submission
    loadContacts();
  };

  // Load contacts from API
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading contacts from API...');
      
      // Explicitly request only Customer type contacts
      const response = await contactsService.getContacts({ 
        limit: 100,
        type: 'Customer', // Only get Customer type contacts
        isActive: undefined // Don't filter by active status
      });
      
      console.log('📡 API Response:', response);
      console.log('📋 Items received:', response.items?.length || 0);
      
      const items = response.items || [];
      setContacts(items);
      
      if (items.length === 0) {
        console.warn('⚠️ No customer contacts returned from API, but no error thrown');
        setError('No customer contacts found in database.');
      } else {
        console.log('✅ Successfully loaded', items.length, 'customer contacts');
      }
    } catch (err) {
      console.error('❌ Failed to load contacts:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      
      setError(`Failed to load contacts: ${err.message || 'Unknown error'}`);
      
      // Fallback to mock data
      setContacts([
        {
          id: 1,
          name: 'Sample Customer 1',
          email: 'customer1@example.com',
          mobile: '+91 9090909090'
        },
        {
          id: 2,
          name: 'Sample Customer 2',
          email: 'customer2@example.com',
          mobile: '+91 8888888888'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  if (showForm) {
    return (
      <ContactForm
        onBack={handleBackFromForm}
        onHome={onHome}
        contact={selectedContact}
        mode={formMode}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
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
                Contact Master
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
              <h2 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>
                List View
              </h2>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)'}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewContact}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 border-b font-semibold text-sm"
               style={{
                 borderColor: 'var(--border)',
                 backgroundColor: 'var(--border-light)',
                 color: 'var(--text-primary)'
               }}>
            <div className="text-center">Image</div>
            <div>Contact Name</div>
            <div>Email</div>
            <div>Phone</div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-4 mb-4">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" style={{color: 'var(--primary)'}} />
              <span style={{color: 'var(--text-primary)'}}>Loading contacts...</span>
            </div>
          ) : (
            <>
              {/* Toast */}
              {toast && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-4 mb-4">
                  <p className="text-yellow-800 text-sm">{toast}</p>
                </div>
              )}
              {/* Contact Rows */}
              <div className="divide-y" style={{borderColor: 'var(--border)'}}>
                {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
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
                onClick={() => handleContactClick(contact)}
              >
                {/* Image Column */}
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
                       style={{backgroundColor: 'var(--border-light)'}}>
                    <User className="w-6 h-6" style={{color: 'var(--text-muted)'}} />
                  </div>
                </div>

                {/* Contact Name Column */}
                <div className="flex items-center">
                  <span className="font-medium" style={{color: 'var(--text-primary)'}}>
                    {contact.name}
                  </span>
                </div>

                {/* Email Column */}
                <div className="flex items-center">
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {contact.email}
                  </span>
                </div>

                {/* Phone Column */}
                <div className="flex items-center">
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {contact.mobile || contact.phone}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Empty rows to match the design */}
            {Array.from({ length: Math.max(0, 5 - contacts.length) }).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (contacts.length + index) * 0.05 }}
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContactMaster;
