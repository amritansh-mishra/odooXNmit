/**
 * Purchase Orders Service
 * Handles all purchase order-related API calls
 */

import apiService from './api';

class PurchaseOrdersService {
  /**
   * Get all purchase orders with pagination and filters
   */
  async getPurchaseOrders(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.status) queryParams.append('status', params.status);
    if (params.vendor) queryParams.append('vendor', params.vendor);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/purchase-orders?${queryString}` : '/purchase-orders';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single purchase order by ID
   */
  async getPurchaseOrder(id) {
    return apiService.get(`/purchase-orders/${id}`);
  }

  /**
   * Create new purchase order
   */
  async createPurchaseOrder(poData) {
    return apiService.post('/purchase-orders', poData);
  }

  /**
   * Update existing purchase order (draft only)
   */
  async updatePurchaseOrder(id, poData) {
    return apiService.put(`/purchase-orders/${id}`, poData);
  }

  /**
   * Confirm purchase order (admin only)
   */
  async confirmPurchaseOrder(id) {
    return apiService.post(`/purchase-orders/${id}/confirm`);
  }

  /**
   * Cancel purchase order (admin only)
   */
  async cancelPurchaseOrder(id) {
    return apiService.post(`/purchase-orders/${id}/cancel`);
  }

  /**
   * Create vendor bill from purchase order (admin only)
   */
  async createBillFromPO(id) {
    return apiService.post(`/purchase-orders/${id}/create-bill`);
  }

  /**
   * Print purchase order
   */
  async printPurchaseOrder(id) {
    return apiService.get(`/purchase-orders/${id}/print`);
  }

  /**
   * Search purchase orders
   */
  async searchPurchaseOrders(query, status = null) {
    const params = { q: query };
    if (status) params.status = status;
    return this.getPurchaseOrders(params);
  }
}

export default new PurchaseOrdersService();
