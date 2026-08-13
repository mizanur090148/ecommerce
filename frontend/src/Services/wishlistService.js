import apiClient from './apiClient';

/**
 * Wishlist Service
 * Handles customer database wishlist API calls & guest sync.
 */
export const wishlistService = {
  /**
   * Get all wishlisted products for logged-in user.
   */
  async getWishlist() {
    return apiClient.get('/wishlist');
  },

  /**
   * Toggle a product in database wishlist.
   * @param {number|string} productId
   */
  async toggleWishlist(productId) {
    return apiClient.post('/wishlist/toggle', { product_id: productId });
  },

  /**
   * Sync guest localStorage product IDs into database wishlist.
   * @param {Array<number|string>} productIds
   */
  async syncWishlist(productIds) {
    return apiClient.post('/wishlist/sync', { product_ids: productIds });
  },
};

export default wishlistService;
