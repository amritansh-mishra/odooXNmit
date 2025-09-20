/**
 * Products Service
 * Handles all product-related API calls
 */

import apiService from './api';

class ProductsService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/master/products?${queryString}` : '/master/products';
    
    return apiService.get(endpoint);
  }

  /**
   * Get single product by ID
   */
  async getProduct(id) {
    return apiService.get(`/master/products/${id}`);
  }

  /**
   * Create new product
   */
  async createProduct(productData) {
    return apiService.post('/master/products', productData);
  }

  /**
   * Update existing product
   */
  async updateProduct(id, productData) {
    return apiService.put(`/master/products/${id}`, productData);
  }

  /**
   * Archive product (admin only)
   */
  async archiveProduct(id) {
    return apiService.patch(`/master/products/${id}/archive`);
  }

  /**
   * Unarchive product (admin only)
   */
  async unarchiveProduct(id) {
    return apiService.patch(`/master/products/${id}/unarchive`);
  }

  /**
   * Search products
   */
  async searchProducts(query, type = null) {
    const params = { q: query };
    if (type) params.type = type;
    return this.getProducts(params);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category) {
    return this.getProducts({ q: category });
  }
}

export default new ProductsService();
