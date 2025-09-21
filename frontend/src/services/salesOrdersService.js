/**
 * Sales Orders Service
 * Handles all sales order-related API calls
 */

import apiService from './api';

class SalesOrdersService {
  /**
   * Get all sales orders with pagination and filters
   */
  async getSalesOrders(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.status) queryParams.append('status', params.status);
    if (params.customer) queryParams.append('customer', params.customer);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/sales-orders?${queryString}` : '/sales-orders';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single sales order by ID
   */
  async getSalesOrder(id) {
    return apiService.get(`/sales-orders/${id}`);
  }

  /**
   * Create new sales order
   */
  async createSalesOrder(soData) {
    return apiService.post('/sales-orders', soData);
  }

  /**
   * Update existing sales order (draft only)
   */
  async updateSalesOrder(id, soData) {
    return apiService.put(`/sales-orders/${id}`, soData);
  }

  /**
   * Confirm sales order (admin only)
   */
  async confirmSalesOrder(id) {
    return apiService.post(`/sales-orders/${id}/confirm`);
  }

  /**
   * Cancel sales order (admin only)
   */
  async cancelSalesOrder(id) {
    return apiService.post(`/sales-orders/${id}/cancel`);
  }

  /**
   * Create customer invoice from sales order (admin only)
   */
  async createInvoiceFromSO(id) {
    return apiService.post(`/sales-orders/${id}/create-invoice`);
  }

  /**
   * Print sales order
   */
  async printSalesOrder(id) {
    return apiService.get(`/sales-orders/${id}/print`);
  }

  /**
   * Search sales orders
   */
  async searchSalesOrders(query, status = null) {
    const params = { q: query };
    if (status) params.status = status;
    return this.getSalesOrders(params);
  }
}

export default new SalesOrdersService();
