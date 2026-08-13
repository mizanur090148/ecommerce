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
};

export default productService;
