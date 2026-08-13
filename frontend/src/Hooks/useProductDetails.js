import { useState, useEffect, useCallback } from 'react';
import productService from '../Services/productService';

/**
 * Custom Reusable Hook: useProductDetails
 * Encapsulates single product detail fetching, variant state management, and active image selection.
 *
 * @param {string|number} slugOrId - Product slug or ID
 */
export function useProductDetails(slugOrId) {
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = useCallback(async () => {
    if (!slugOrId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await productService.getProductBySlug(slugOrId);

      if (response?.status === 'success' && response?.data) {
        const prod = response.data;
        setProduct(prod);

        // Set initial active image (primary image or first image)
        const primary = prod.primary_image?.url || prod.images?.[0]?.url || null;
        setActiveImage(primary);
      }
    } catch (err) {
      setError(err.message || 'Product not found');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Update active variant when color or size changes
  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return;

    const matched = product.variants.find((v) => {
      let colorMatch = true;
      let sizeMatch = true;

      if (selectedColor && v.attribute_values) {
        colorMatch = v.attribute_values.some(
          (av) => av.value.toLowerCase() === selectedColor.toLowerCase()
        );
      }

      if (selectedSize && v.attribute_values) {
        sizeMatch = v.attribute_values.some(
          (av) => av.value.toUpperCase() === selectedSize.toUpperCase()
        );
      }

      return colorMatch && sizeMatch;
    });

    setActiveVariant(matched || null);
  }, [product, selectedColor, selectedSize]);

  return {
    product,
    loading,
    error,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    activeVariant,
    activeImage,
    setActiveImage,
    refetch: fetchDetails,
  };
}

export default useProductDetails;
