import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import reportsService from '../services/reportsService';

const Reports = () => {
  const [reports, setReports] = useState({
    stock: null,
    profitLoss: null,
    balanceSheet: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stockReport, plReport, balanceSheet] = await Promise.all([
        reportsService.getStockReport(),
        reportsService.getProfitAndLossReport(),
        reportsService.getBalanceSheetReport()
      ]);

      setReports({
        stock: stockReport,
        profitLoss: plReport,
        balanceSheet: balanceSheet
      });
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" style={{color: 'var(--primary)'}} />
          <span style={{color: 'var(--text-primary)'}}>Loading reports...</span>
        </div>
      </div>
    );
  }

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
          Real-time reports from your backend API.
        </p>

        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stock Report */}
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Stock Report
            </h3>
            {reports.stock ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>Items in stock: {reports.stock.totalItems || 'N/A'}</p>
                <p>Total value: ₹{reports.stock.totalValue || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No data available
              </p>
            )}
          </div>

          {/* Profit & Loss Report */}
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Profit & Loss
            </h3>
            {reports.profitLoss ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>Revenue: ₹{reports.profitLoss.revenue || 'N/A'}</p>
                <p>Expenses: ₹{reports.profitLoss.expenses || 'N/A'}</p>
                <p>Net Profit: ₹{reports.profitLoss.netProfit || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No data available
              </p>
            )}
          </div>

          {/* Balance Sheet Report */}
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Balance Sheet
            </h3>
            {reports.balanceSheet ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>Total Assets: ₹{reports.balanceSheet.totalAssets || 'N/A'}</p>
                <p>Total Liabilities: ₹{reports.balanceSheet.totalLiabilities || 'N/A'}</p>
                <p>Equity: ₹{reports.balanceSheet.equity || 'N/A'}</p>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No data available
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            API Endpoints Used:
          </h4>
          <ul className="list-disc pl-6 space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li><code>GET /api/reports/stock</code></li>
            <li><code>GET /api/reports/pl</code></li>
            <li><code>GET /api/reports/balance-sheet</code></li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;