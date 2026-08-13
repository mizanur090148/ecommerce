import apiClient from "./apiClient";

const customerService = {
  /**
   * Fetch customer order history
   */
  async getOrders(page = 1) {
    return await apiClient.get("/customer/orders", { params: { page } });
  },

  /**
   * Fetch customer profile & addresses
   */
  async getProfile() {
    return await apiClient.get("/customer/profile");
  },

  /**
   * Update customer profile info
   */
  async updateProfile(data) {
    return await apiClient.put("/customer/profile", data);
  },

  /**
   * Change customer password
   */
  async updatePassword(data) {
    return await apiClient.put("/customer/password", data);
  },

  /**
   * Save or update customer address
   */
  async saveAddress(data) {
    return await apiClient.post("/customer/addresses", data);
  },
};

export default customerService;
