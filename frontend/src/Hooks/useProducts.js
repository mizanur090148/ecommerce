import { useState, useEffect, useCallback } from 'react';
import productService from '../Services/productService';

/**
 * Custom Reusable Hook: useProducts
 * Encapsulates product listing state, API data fetching, filtering, and pagination.
 *
 * @param {Object} initialFilters - Initial filter values { category, brand, search, sort, page }
 */
export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 12,
  });
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    brand: initialFilters.brand || '',
    search: initialFilters.search || '',
    sort: initialFilters.sort || '',
    min_price: initialFilters.min_price || '',
    max_price: initialFilters.max_price || '',
    page: initialFilters.page || 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean empty keys from filters object
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, val]) => val !== '' && val !== null)
      );

      const response = await productService.getProducts(activeFilters);

      if (response?.status === 'success' && response?.data) {
        const paginator = response.data;
        setProducts(paginator.data || []);
        setPagination({
          currentPage: paginator.current_page || 1,
          lastPage: paginator.last_page || 1,
          total: paginator.total || 0,
          perPage: paginator.per_page || 12,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilterValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilterValues,
      page: newFilterValues.page || 1, // Reset to page 1 on filter change unless explicitly set
    }));
  };

  const changePage = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return {
    products,
    pagination,
    filters,
    loading,
    error,
    updateFilters,
    changePage,
    refetch: fetchProducts,
  };
}

export default useProducts;
