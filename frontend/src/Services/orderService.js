import apiClient from './apiClient';

/**
 * Order & Checkout Service
 * Centralized API calls for checkout processing, SSLCommerz payment, and coupon validation.
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
   * Initiate SSLCommerz Online Payment (bKash, Nagad, Rocket, Cards)
   * @param {Object} orderData
   */
  async initiateSSLCommerzPayment(orderData) {
    return apiClient.post('/payment/sslcommerz/initiate', orderData);
  },

  /**
   * Fetch order details by order number for confirmation receipts.
   * @param {string} orderNumber
   */
  async getOrderByNumber(orderNumber) {
    return apiClient.get(`/orders/by-number/${orderNumber}`);
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
