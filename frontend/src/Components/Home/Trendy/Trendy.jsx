import React, { useState } from "react";
import "./Trendy.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { Link } from "react-router-dom";
import useProducts from "../../../Hooks/useProducts";
import { FiHeart } from "react-icons/fi";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import ProductRating from "../../Common/ProductRating";

import { toggleWishList, selectWishListItems } from "../../../Features/Wishlist/wishListSlice";
import wishlistService from "../../../Services/wishlistService";
import authService from "../../../Services/authService";

const Trendy = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("tab1");
  const wishlistItems = useSelector(selectWishListItems);

  // Use centralized custom hook
  const { products, loading, error, updateFilters } = useProducts({ per_page: 8 });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "tab1") updateFilters({ sort: "" });
    else if (tab === "tab2") updateFilters({ sort: "latest" });
    else if (tab === "tab3") updateFilters({ sort: "best_seller" });
    else if (tab === "tab4") updateFilters({ sort: "featured" });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleWishlistToggle = async (product) => {
    dispatch(toggleWishList(product));
    const isWishlisted = wishlistItems.some((item) => item.id === product.id);

    if (isWishlisted) {
      toast.success("Removed from Wishlist", { duration: 1500 });
    } else {
      toast.success("Added to Wishlist!", {
        duration: 1500,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }

    if (authService.getCurrentUser()) {
      try {
        await wishlistService.toggleWishlist(product.id);
      } catch (e) {
        console.error("Wishlist sync error", e);
      }
    }
  };

  const cartItems = useSelector((state) => state.cart.items);

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
      toast.error("Product limit reached", {
        duration: 2000,
        style: { backgroundColor: "#ff4b4b", color: "white" },
      });
    } else {
      dispatch(addToCart(productPayload));
      toast.success(`Added to cart!`, {
        duration: 2000,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }
  };

  return (
    <>
      <div className="trendyProducts">
        <h2>
          Our Trendy <span>Products</span>
        </h2>
        <div className="trendyTabs">
          <div className="tabs">
            <p
              onClick={() => handleTabClick("tab1")}
              className={activeTab === "tab1" ? "active" : ""}
            >
              All
            </p>
            <p
              onClick={() => handleTabClick("tab2")}
              className={activeTab === "tab2" ? "active" : ""}
            >
              New Arrivals
            </p>
            <p
              onClick={() => handleTabClick("tab3")}
              className={activeTab === "tab3" ? "active" : ""}
            >
              Best Seller
            </p>
            <p
              onClick={() => handleTabClick("tab4")}
              className={activeTab === "tab4" ? "active" : ""}
            >
              Featured
            </p>
          </div>
          <div className="trendyTabContent">
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                <p style={{ fontWeight: "bold", color: "#666" }}>Loading Trendy Products...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                <p style={{ color: "#e53e3e" }}>{error}</p>
              </div>
            ) : (
              <div className="trendyMainContainer">
                {products.map((product) => {
                  const primaryImg = product.primary_image?.url || product.images?.[0]?.url;
                  const hoverImg = product.images?.[1]?.url || primaryImg;
                  const categoryName = product.categories?.[0]?.name || "Catalog";

                  return (
                    <div className="trendyProductContainer" key={product.id}>
                      <div className="trendyProductImages">
                        <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="trendyProduct_front"
                          />
                          <img
                            src={hoverImg}
                            alt={product.name}
                            className="trendyProduct_back"
                          />
                        </Link>
                        <h4 onClick={() => handleAddToCart(product)}>
                          Add to Cart
                        </h4>
                      </div>
                      <div
                        className="trendyProductImagesCart"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaCartPlus />
                      </div>
                      <div className="trendyProductInfo">
                        <div className="trendyProductCategoryWishlist">
                          <p>{categoryName}</p>
                          {wishlistItems.some((item) => item.id === product.id) ? (
                            <FaHeart
                              onClick={() => handleWishlistToggle(product)}
                              style={{ color: "red", cursor: "pointer" }}
                            />
                          ) : (
                            <FiHeart
                              onClick={() => handleWishlistToggle(product)}
                              style={{ color: "#767676", cursor: "pointer" }}
                            />
                          )}
                        </div>
                        <div className="trendyProductNameInfo">
                          <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                            <h5>{product.name}</h5>
                          </Link>

                          <p>
                            ৳{product.sale_price || product.price}
                            {product.sale_price && (
                              <span style={{ textDecoration: "line-through", color: "#aaa", marginLeft: "6px", fontSize: "0.85em" }}>
                                ৳{product.price}
                              </span>
                            )}
                          </p>
                          <div className="trendyProductRatingReviews" style={{ margin: "4px 0" }}>
                            <ProductRating
                              rating={product.rating_cache || 0}
                              reviewsCount={product.reviews_count || 0}
                              size={10}
                              hideIfZero={true}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Trendy;
