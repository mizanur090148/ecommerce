import { useState } from 'react';
import orderService from '../Services/orderService';

/**
 * Custom Reusable Hook: useCheckout
 * Encapsulates coupon application, order submission, loading states, and API error messaging.
 */
export function useCheckout() {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  const applyCoupon = async (code, subtotal) => {
    if (!code) return;
    try {
      setCouponLoading(true);
      setCouponError(null);
      const res = await orderService.validateCoupon(code, subtotal);
      if (res?.status === 'success') {
        setAppliedCoupon(res.data);
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const placeOrder = async (orderPayload) => {
    try {
      setSubmittingOrder(true);
      setOrderError(null);
      const res = await orderService.submitCheckout(orderPayload);
      if (res?.status === 'success') {
        setCreatedOrder(res.data);
        return res.data;
      }
    } catch (err) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
      throw err;
    } finally {
      setSubmittingOrder(false);
    }
  };

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
    submittingOrder,
    orderError,
    createdOrder,
    placeOrder,
  };
}

export default useCheckout;
