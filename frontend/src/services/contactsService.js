/**
 * Contacts Service
 * Handles all contact-related API calls
 */

import apiService from './api';

class ContactsService {
  /**
   * Get all contacts with pagination and filters
   */
  async getContacts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/master/contacts?${queryString}` : '/master/contacts';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single contact by ID
   */
  async getContact(id) {
    return apiService.get(`/master/contacts/${id}`);
  }

  /**
   * Create new contact
   */
  async createContact(contactData) {
    return apiService.post('/master/contacts', contactData);
  }

  /**
   * Update existing contact
   */
  async updateContact(id, contactData) {
    return apiService.put(`/master/contacts/${id}`, contactData);
  }

  /**
   * Archive contact (admin only)
   */
  async archiveContact(id) {
    return apiService.patch(`/master/contacts/${id}/archive`);
  }

  /**
   * Unarchive contact (admin only)
   */
  async unarchiveContact(id) {
    return apiService.patch(`/master/contacts/${id}/unarchive`);
  }

  /**
   * Delete contact (admin only)
   */
  async deleteContact(id) {
    return apiService.delete(`/master/contacts/${id}`);
  }

  /**
   * Search contacts
   */
  async searchContacts(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getContacts(params);
  }
}

export default new ContactsService();
