import apiClient from './apiClient';

/**
 * Product Service
 * Centralized API calls for catalog browsing, product details, and filters.
 */
export const productService = {
  /**
   * Fetch paginated products with optional filtering & sorting.
   * @param {Object} params - { category, brand, search, min_price, max_price, sort, page, per_page }
   */
  async getProducts(params = {}) {
    return apiClient.get('/products', { params });
  },

  /**
   * Fetch a single product by slug or ID.
   * @param {string|number} slug
   */
  async getProductBySlug(slug) {
    return apiClient.get(`/products/${slug}`);
  },

  /**
   * Fetch available filter options (categories, brands, colors, sizes).
   */
  async getFilterOptions() {
    return apiClient.get('/products/filters');
  },

  /**
   * Submit a new customer review for a product.
   * @param {string|number} productId
   * @param {Object} reviewData
   */
  async submitReview(productId, reviewData) {
    return apiClient.post(`/products/${productId}/reviews`, reviewData);
  },

  /**
   * Fetch active banners (e.g. hero, collection, deal, popup).
   * @param {string} type
   */
  async getBanners(type = 'hero') {
    return apiClient.get('/banners', { params: { type } });
  },
};

export default productService;
