import React from 'react';
import { motion } from 'framer-motion';

const Reports = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface rounded-xl p-6 mb-6"
        style={{ border: '1px solid var(--border)', boxShadow: '0 4px 12px var(--shadow)' }}
      >
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Reports
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Quick access to key reports. These can be wired to backend APIs.
        </p>
        <ul className="list-disc pl-6 space-y-2" style={{ color: 'var(--text-primary)' }}>
          <li>
            Stock Report: <code className="text-xs">GET /api/reports/stock</code>
          </li>
          <li>
            Profit &amp; Loss: <code className="text-xs">GET /api/reports/profit-and-loss?from=2025-01-01&amp;to=2025-12-31</code>
          </li>
          <li>
            Balance Sheet: <code className="text-xs">GET /api/reports/balance-sheet?month=9&amp;year=2025</code>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Reports;