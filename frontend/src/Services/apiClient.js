/**
 * Lightweight, Centralized HTTP Client
 * Uses native browser fetch API for zero external dependency overhead,
 * unified error handling, query param formatting, and header management.
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = {
  async request(endpoint, options = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Append query params if provided
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }

    const token = localStorage.getItem('customer_auth_token') || localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(url.toString(), {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'An unexpected API error occurred.',
          errors: data.errors || null,
        };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw {
        status: 500,
        message: error.message || 'Network communication error. Please check your backend connection.',
      };
    }
  },

  get(endpoint, config = {}) {
    return this.request(endpoint, { method: 'GET', ...config });
  },

  post(endpoint, body, config = {}) {
    return this.request(endpoint, { method: 'POST', body, ...config });
  },

  put(endpoint, body, config = {}) {
    return this.request(endpoint, { method: 'PUT', body, ...config });
  },

  delete(endpoint, config = {}) {
    return this.request(endpoint, { method: 'DELETE', ...config });
  },
};

export default apiClient;
