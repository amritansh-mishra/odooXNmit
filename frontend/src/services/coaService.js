/**
 * Chart of Accounts Service
 * Handles all CoA-related API calls
 */

import apiService from './api';

class CoaService {
  /**
   * Get all accounts with pagination and filters
   */
  async getAccounts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/master/coa?${queryString}` : '/master/coa';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single account by ID
   */
  async getAccount(id) {
    return apiService.get(`/master/coa/${id}`);
  }

  /**
   * Create new account
   */
  async createAccount(accountData) {
    return apiService.post('/master/coa', accountData);
  }

  /**
   * Update existing account
   */
  async updateAccount(id, accountData) {
    return apiService.put(`/master/coa/${id}`, accountData);
  }

  /**
   * Delete account (admin only)
   */
  async deleteAccount(id) {
    return apiService.delete(`/master/coa/${id}`);
  }

  /**
   * Archive account (admin only)
   */
  async archiveAccount(id) {
    return apiService.patch(`/master/coa/${id}/archive`);
  }

  /**
   * Unarchive account (admin only)
   */
  async unarchiveAccount(id) {
    return apiService.patch(`/master/coa/${id}/unarchive`);
  }

  /**
   * Search accounts
   */
  async searchAccounts(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getAccounts(params);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type) {
    return this.getAccounts({ type });
  }
}

export default new CoaService();
