import apiClient from './apiClient';

/**
 * Order & Checkout Service
 * Centralized API calls for checkout processing and coupon validation.
 */
export const orderService = {
  /**
   * Submit checkout payload to create a new order in backend.
   * @param {Object} orderData
   */
  async submitCheckout(orderData) {
    return apiClient.post('/checkout', orderData);
  },

  /**
   * Validate a coupon code against current subtotal.
   * @param {string} code
   * @param {number} subtotal
   */
  async validateCoupon(code, subtotal) {
    return apiClient.post('/coupons/validate', { code, subtotal });
  },
};

export default orderService;
