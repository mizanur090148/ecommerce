import React, { useEffect } from "react";
import "./WishlistDrawer.css";
import { useSelector, useDispatch } from "react-redux";
import {
  selectWishListItems,
  removeFromWishList,
  clearWishList,
} from "../../Features/Wishlist/wishListSlice";
import { addToCart } from "../../Features/Cart/cartSlice";
import wishlistService from "../../Services/wishlistService";
import authService from "../../Services/authService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { FiHeart, FiTrash2 } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

const WishlistDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishListItems);
  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleRemove = async (product) => {
    dispatch(removeFromWishList(product));
    toast.success("Removed from Wishlist", { duration: 1500 });

    if (authService.getCurrentUser()) {
      try {
        await wishlistService.toggleWishlist(product.id);
      } catch (e) {
        console.error("Wishlist removal error", e);
      }
    }
  };

  const handleClearAll = async () => {
    if (wishlistItems.length === 0) return;
    dispatch(clearWishList());
    toast.success("Wishlist cleared!", { duration: 1500 });
  };

  const handleAddToCart = (product) => {
    const productPayload = {
      productID: product.id,
      productName: product.name,
      productPrice: product.sale_price || product.price,
      frontImg: product.primary_image?.url || product.images?.[0]?.url || "",
      backImg: product.images?.[1]?.url || product.primary_image?.url || "",
    };

    const productInCart = cartItems.find((item) => item.productID === product.id);

    if (productInCart && productInCart.quantity >= 20) {
      toast.error("Product limit reached in cart", { duration: 2000 });
    } else {
      dispatch(addToCart(productPayload));
      toast.success("Added to cart!", {
        duration: 2000,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }
  };

  return (
    <div
      className={`wishlistDrawerOverlay ${isOpen ? "open" : ""}`}
      onClick={onClose}
    >
      <div
        className="wishlistDrawerContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wishlistDrawerHeader">
          <div className="wishlistDrawerTitle">
            <FiHeart size={20} color="#e53e3e" />
            <h3>My Wishlist</h3>
            <span className="wishlistBadgeCount">{wishlistItems.length}</span>
          </div>
          <button className="wishlistDrawerCloseBtn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="wishlistDrawerBody">
          {wishlistItems.length === 0 ? (
            <div className="wishlistEmptyState">
              <FiHeart size={48} color="#cbd5e0" />
              <p>Your wishlist is currently empty.</p>
              <Link
                to="/shop"
                onClick={onClose}
                style={{
                  color: "#2b6cb0",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                Explore Products →
              </Link>
            </div>
          ) : (
            <div className="wishlistItemsList">
              {wishlistItems.map((product) => {
                const primaryImg =
                  product.primary_image?.url ||
                  product.images?.[0]?.url ||
                  product.frontImg ||
                  "";
                const price = product.sale_price || product.price || product.productPrice;

                return (
                  <div key={product.id || product.productID} className="wishlistItemCard">
                    <img
                      src={primaryImg}
                      alt={product.name || product.productName}
                      className="wishlistItemImg"
                    />
                    <div className="wishlistItemDetails">
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        className="wishlistItemName"
                        onClick={onClose}
                      >
                        {product.name || product.productName}
                      </Link>
                      <span className="wishlistItemPrice">৳{price}</span>
                      <button
                        className="wishlistAddToCartBtn"
                        onClick={() => handleAddToCart(product)}
                      >
                        + Add to Cart
                      </button>
                    </div>
                    <button
                      className="wishlistRemoveBtn"
                      title="Remove from wishlist"
                      onClick={() => handleRemove(product)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="wishlistDrawerFooter">
            <button className="wishlistClearAllBtn" onClick={handleClearAll}>
              Clear Wishlist ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistDrawer;
