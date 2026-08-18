import { createSlice } from "@reduxjs/toolkit";

/**
 * Helper to load saved cart items from browser localStorage on app startup.
 */
const loadSavedCartItems = () => {
  try {
    const saved = localStorage.getItem("cart_items");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Helper to save active cart items array to localStorage.
 */
const saveCartItems = (items) => {
  try {
    localStorage.setItem("cart_items", JSON.stringify(items));
  } catch (e) {
    console.error("Could not save cart to localStorage", e);
  }
};

/**
 * Helper to load saved coupon from browser localStorage on app startup.
 */
const loadSavedCoupon = () => {
  try {
    const saved = localStorage.getItem("applied_coupon");
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Helper to save applied coupon to localStorage.
 */
const saveAppliedCoupon = (coupon) => {
  try {
    if (coupon) {
      localStorage.setItem("applied_coupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("applied_coupon");
    }
  } catch (e) {
    console.error("Could not save coupon to localStorage", e);
  }
};

const initialItems = loadSavedCartItems();
const initialCoupon = loadSavedCoupon();

const initialState = {
  items: initialItems,
  appliedCoupon: initialCoupon,
  totalAmount: initialItems.reduce(
    (sum, item) => sum + (Number(item.productPrice) || 0) * (Number(item.quantity) || 1),
    0
  ),
};

const MAX_QUANTITY = 20;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const price = Number(product.productPrice) || 0;
      const qty = Number(product.quantity) || 1;
      const cartKey = product.cartKey || `${product.productID}_${product.variantID || `${product.color || ''}_${product.size || ''}`}`;

      const existingItem = state.items.find(
        (item) => item.cartKey === cartKey || (
          String(item.productID) === String(product.productID) &&
          (product.variantID ? String(item.variantID) === String(product.variantID) : (item.color === product.color && item.size === product.size))
        )
      );

      if (existingItem) {
        existingItem.quantity += qty;
        state.totalAmount += price * qty;
      } else {
        state.items.push({ ...product, cartKey, productPrice: price, quantity: qty });
        state.totalAmount += price * qty;
      }
      saveCartItems(state.items);
    },
    updateQuantity(state, action) {
      const { productID, cartKey, quantity } = action.payload;
      const itemToUpdate = state.items.find(
        (item) => (cartKey && item.cartKey === cartKey) || String(item.productID) === String(productID)
      );
      if (itemToUpdate) {
        const price = Number(itemToUpdate.productPrice) || 0;
        const newQty = Math.max(1, Number(quantity) || 1);
        const difference = newQty - itemToUpdate.quantity;

        itemToUpdate.quantity = newQty;
        state.totalAmount += difference * price;
      }
      saveCartItems(state.items);
    },
    removeFromCart(state, action) {
      const target = action.payload;
      const itemToRemove = state.items.find(
        (item) => (item.cartKey && item.cartKey === target) || String(item.productID) === String(target)
      );
      if (itemToRemove) {
        const price = Number(itemToRemove.productPrice) || 0;
        state.totalAmount -= price * itemToRemove.quantity;
        state.items = state.items.filter(
          (item) => (item.cartKey ? item.cartKey !== target : String(item.productID) !== String(target))
        );
      }
      saveCartItems(state.items);
    },
    setAppliedCoupon(state, action) {
      state.appliedCoupon = action.payload;
      saveAppliedCoupon(action.payload);
    },
    removeAppliedCoupon(state) {
      state.appliedCoupon = null;
      saveAppliedCoupon(null);
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
      state.appliedCoupon = null;
      saveCartItems([]);
      saveAppliedCoupon(null);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setAppliedCoupon,
  removeAppliedCoupon,
  clearCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectAppliedCoupon = (state) => state.cart.appliedCoupon;

export const selectCartTotalAmount = (state) => {
  if (!state.cart.items || state.cart.items.length === 0) return 0;
  return state.cart.items.reduce((sum, item) => {
    const p = Number(item.productPrice) || 0;
    const q = Number(item.quantity) || 1;
    return sum + p * q;
  }, 0);
};

export default cartSlice.reducer;
