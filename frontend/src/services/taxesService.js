/**
 * Taxes Service
 * Handles all tax-related API calls
 */

import apiService from './api';

class TaxesService {
  /**
   * Get all taxes with pagination and filters
   */
  async getTaxes(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/master/taxes?${queryString}` : '/master/taxes';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single tax by ID
   */
  async getTax(id) {
    return apiService.get(`/master/taxes/${id}`);
  }

  /**
   * Create new tax
   */
  async createTax(taxData) {
    return apiService.post('/master/taxes', taxData);
  }

  /**
   * Update existing tax
   */
  async updateTax(id, taxData) {
    return apiService.put(`/master/taxes/${id}`, taxData);
  }

  /**
   * Delete tax (admin only)
   */
  async deleteTax(id) {
    return apiService.delete(`/master/taxes/${id}`);
  }

  /**
   * Archive tax (admin only)
   */
  async archiveTax(id) {
    return apiService.patch(`/master/taxes/${id}/archive`);
  }

  /**
   * Unarchive tax (admin only)
   */
  async unarchiveTax(id) {
    return apiService.patch(`/master/taxes/${id}/unarchive`);
  }

  /**
   * Search taxes
   */
  async searchTaxes(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getTaxes(params);
  }
}

export default new TaxesService();
