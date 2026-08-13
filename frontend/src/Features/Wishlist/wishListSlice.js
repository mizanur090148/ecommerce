import { createSlice } from "@reduxjs/toolkit";

const initialWishList = () => {
  try {
    const saved = localStorage.getItem("wishlist_items");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const initialState = {
  items: initialWishList(),
};

const wishListSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishList: (state, action) => {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
      localStorage.setItem("wishlist_items", JSON.stringify(state.items));
    },
    addToWishList: (state, action) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem("wishlist_items", JSON.stringify(state.items));
      }
    },
    removeFromWishList: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
      localStorage.setItem("wishlist_items", JSON.stringify(state.items));
    },
    clearWishList: (state) => {
      state.items = [];
      localStorage.removeItem("wishlist_items");
    },
  },
});

export const { toggleWishList, addToWishList, removeFromWishList, clearWishList } =
  wishListSlice.actions;

export const selectWishListItems = (state) => state.wishlist.items;
export const selectWishListCount = (state) => state.wishlist.items.length;

export default wishListSlice.reducer;
