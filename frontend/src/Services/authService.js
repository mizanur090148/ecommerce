import apiClient from "./apiClient";

const AUTH_TOKEN_KEY = "customer_auth_token";
const AUTH_USER_KEY = "customer_auth_user";

const authService = {
  /**
   * Register a new customer account
   */
  async register(data) {
    const response = await apiClient.post("/auth/register", data);
    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  /**
   * Login customer
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  /**
   * Get currently authenticated user profile from API or localStorage
   */
  async getProfile() {
    try {
      const response = await apiClient.get("/auth/me");
      if (response.user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
        return response.user;
      }
    } catch (e) {
      this.logout();
      return null;
    }
  },

  /**
   * Get cached user from localStorage
   */
  getCurrentUser() {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Logout customer
   */
  async logout() {
    try {
      if (this.isAuthenticated()) {
        await apiClient.post("/auth/logout");
      }
    } catch (e) {
      // Ignore API logout errors and clean local state
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },
};

export default authService;
