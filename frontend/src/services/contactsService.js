import apiService from './api';

class ContactsService {

  async getContacts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);  //append(key, value) (page,2)
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();  // toString- create the key-value pair into query string format
    const endpoint = queryString ? `/master/contacts?${queryString}` : '/master/contacts';
    
    return apiService.get(endpoint);
  }

  
  async getContact(id) {
    return apiService.get(`/master/contacts/${id}`);
  }

  async createContact(contactData) {
    return apiService.post('/master/contacts', contactData);
  }

  async updateContact(id, contactData) {
    return apiService.put(`/master/contacts/${id}`, contactData);
  }

  async archiveContact(id) {
    return apiService.patch(`/master/contacts/${id}/archive`);
  }

  async unarchiveContact(id) {
    return apiService.patch(`/master/contacts/${id}/unarchive`);
  }

  async deleteContact(id) {
    return apiService.delete(`/master/contacts/${id}`);
  }

  async searchContacts(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getContacts(params);
  }
}

export default new ContactsService();
