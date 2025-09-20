import React from 'react';
import { motion } from 'framer-motion';

const Transactions = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface rounded-xl p-6"
        style={{ border: '1px solid var(--border)', boxShadow: '0 4px 12px var(--shadow)' }}
      >
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Transactions
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          This is a placeholder page. We can list Sales Orders, Purchase Orders, Invoices, and Vendor Bills here with tabs and filters.
        </p>
      </motion.div>
    </div>
  );
};

export default Transactions;