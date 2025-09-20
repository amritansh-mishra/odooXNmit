/**
 * Reports Service
 * Handles all report-related API calls
 */

import apiService from './api';

class ReportsService {
  /**
   * Get stock report
   */
  async getStockReport() {
    return apiService.get('/reports/stock');
  }

  /**
   * Get profit and loss report
   */
  async getProfitAndLossReport(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.period) queryParams.append('period', params.period);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports/pl?${queryString}` : '/reports/pl';
    
    return apiService.get(endpoint);
  }

  /**
   * Get balance sheet report
   */
  async getBalanceSheetReport(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.asOf) queryParams.append('asOf', params.asOf);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reports/balance-sheet?${queryString}` : '/reports/balance-sheet';
    
    return apiService.get(endpoint);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // This would typically be a separate endpoint
    // For now, we'll combine multiple report calls
    try {
      const [stockReport, plReport] = await Promise.all([
        this.getStockReport(),
        this.getProfitAndLossReport()
      ]);

      return {
        stockReport,
        plReport,
        // Add more dashboard-specific data here
      };
    } catch (error) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  }
}

export default new ReportsService();
