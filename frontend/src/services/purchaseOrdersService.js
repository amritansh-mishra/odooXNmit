import apiService from './api';

class PurchaseOrdersService {
  
  async getPurchaseOrders(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/purchase-orders?${queryString}` : '/purchase-orders';
    
    return apiService.get(endpoint);
  }

  async getPurchaseOrder(id) {
    return apiService.get(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(poData) {
    return apiService.post('/purchase-orders', poData);
  }

  async updatePurchaseOrder(id, poData) {
    return apiService.put(`/purchase-orders/${id}`, poData);
  }

  async confirmPurchaseOrder(id) {
    return apiService.post(`/purchase-orders/${id}/confirm`);
  }

  async cancelPurchaseOrder(id) {
    return apiService.post(`/purchase-orders/${id}/cancel`);
  }

  async draftPurchaseOrder(id) {
    return apiService.post(`/purchase-orders/${id}/draft`);
  }

  async createBillFromPO(id, billData = {}) {
    return apiService.post(`/purchase-orders/${id}/create-bill`, billData);
  }

  async printPurchaseOrder(id) {
    return apiService.get(`/purchase-orders/${id}/print`);
  }

  async getPurchaseOrderTaxDetails(id) {
    return apiService.get(`/purchase-orders/${id}/tax-details`);
  }

  async recalculatePurchaseOrderTaxes(id) {
    return apiService.post(`/purchase-orders/${id}/recalculate-taxes`);
  }

  // Helper methods
  async searchPurchaseOrders(query, status = null) {
    const params = { q: query };
    if (status) params.status = status;
    return this.getPurchaseOrders(params);
  }

  async getPurchaseOrdersWithTaxes(params = {}) {
    return this.getPurchaseOrders({ ...params, includeTaxDetails: true });
  }
}

export default new PurchaseOrdersService();
