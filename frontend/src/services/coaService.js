import apiService from './api';

class CoaService {
  
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

  
  async getAccount(id) {
    return apiService.get(`/master/coa/${id}`);
  }


  async createAccount(accountData) {
    return apiService.post('/master/coa', accountData);
  }

 
  async updateAccount(id, accountData) {
    return apiService.put(`/master/coa/${id}`, accountData);
  }

 
  async deleteAccount(id) {
    return apiService.delete(`/master/coa/${id}`);
  }

  
  async archiveAccount(id) {
    return apiService.patch(`/master/coa/${id}/archive`);
  }

  
  async unarchiveAccount(id) {
    return apiService.patch(`/master/coa/${id}/unarchive`);
  }

 
  async searchAccounts(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getAccounts(params);
  }

  async getAccountsByType(type) {
    return this.getAccounts({ type });
  }
}

export default new CoaService();
