import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import orderService from '../Services/orderService';
import {
  selectAppliedCoupon,
  setAppliedCoupon as setReduxAppliedCoupon,
  removeAppliedCoupon as removeReduxAppliedCoupon,
} from '../Features/Cart/cartSlice';

/**
 * Custom Reusable Hook: useCheckout
 * Encapsulates coupon application, order submission, loading states, and API error messaging.
 */
export function useCheckout() {
  const dispatch = useDispatch();
  const appliedCoupon = useSelector(selectAppliedCoupon);

  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    if (appliedCoupon?.code) {
      setCouponCode(appliedCoupon.code);
    }
  }, [appliedCoupon]);

  const applyCoupon = async (code, subtotal) => {
    if (!code) return;
    try {
      setCouponLoading(true);
      setCouponError(null);
      const res = await orderService.validateCoupon(code, subtotal);
      if (res?.status === 'success') {
        dispatch(setReduxAppliedCoupon(res.data));
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      dispatch(removeReduxAppliedCoupon());
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    dispatch(removeReduxAppliedCoupon());
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
