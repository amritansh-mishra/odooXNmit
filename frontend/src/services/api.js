const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // fetches Token, it is needed to access protected API endpoints.
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

 
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json', // default body json.
    };

    if (includeAuth) {
      const token = this.getAuthToken(); // reads and saves token
      if (token) {
        headers.Authorization = `Bearer ${token}`; //if token exists adds another header
      }
    }

    return headers;
  }

 // handles error 
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); //converts response to json and returns it
      throw new ApiError(
        errorData.message || `HTTP Error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  // 
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.message || 'Network Error',
        0,
        { originalError: error }
      );
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiError };
