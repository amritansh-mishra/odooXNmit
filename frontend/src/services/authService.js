/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiService from './api';

class AuthService {
  /**
   * Login user
   */
  async login(loginId, password) {
    try {
      const response = await apiService.post('/auth/login', {
        loginId,
        password,
      }, { includeAuth: false });

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/signup', userData, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(loginId) {
    try {
      const response = await apiService.post('/auth/forgot-password', { loginId }, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token, password) {
    try {
      const response = await apiService.post('/auth/reset-password', { token, password }, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  /**
   * Get stored auth token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }
}

export default new AuthService();
