import apiService from './api';

// class that organize everyything related to authentication

class AuthService {
  
  async login(loginId, password) {
    try {
      const response = await apiService.post('/auth/login', {
        loginId,
        password,
      }, { includeAuth: false }); //user doesn't have token yet

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await apiService.post('/auth/signup', userData, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }


  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me'); //usually requires tokens.
      return response.user;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user profile');
    }
  }

  
  async forgotPassword(loginId) {
    try {
      const response = await apiService.post('/auth/forgot-password', { loginId }, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await apiService.post('/auth/reset-password', { token, password }, { includeAuth: false });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
 // check's if token is in there or not in local storage
  isAuthenticated() {
    return !!this.getAuthToken();  //!! convert's value to true or false. if true (authenticated)
  }

  //retrievs's token
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }
}

export default new AuthService();
