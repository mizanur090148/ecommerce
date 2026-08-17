import React, { useState } from "react";
import "./ShopDetails.css";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";

import Filter from "../Filters/Filter";
import { Link, useSearchParams } from "react-router-dom";
import useProducts from "../../../Hooks/useProducts";
import { FiHeart } from "react-icons/fi";
import { FaHeart, FaCartPlus, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import ProductRating from "../../Common/ProductRating";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

import { toggleWishList, selectWishListItems } from "../../../Features/Wishlist/wishListSlice";
import wishlistService from "../../../Services/wishlistService";
import authService from "../../../Services/authService";

const ShopDetails = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishListItems);
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search");
  const urlCategoryQuery = searchParams.get("category");
  const urlBrandQuery = searchParams.get("brand");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Centralized Reusable React Hook with initial URL filter values
  const { products, pagination, filters, loading, error, updateFilters, changePage } = useProducts({
    per_page: 12,
    category: urlCategoryQuery || '',
    brand: urlBrandQuery || '',
    search: urlSearchQuery || '',
  });

  React.useEffect(() => {
    const newFilters = {};
    if (urlSearchQuery !== null) newFilters.search = urlSearchQuery;
    if (urlCategoryQuery !== null) newFilters.category = urlCategoryQuery;
    if (urlBrandQuery !== null) newFilters.brand = urlBrandQuery;
    if (Object.keys(newFilters).length > 0) {
      updateFilters(newFilters);
    }
  }, [urlSearchQuery, urlCategoryQuery, urlBrandQuery]);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSortChange = (e) => {
    const sortVal = e.target.value;
    updateFilters({ sort: sortVal });
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

    const productInCart = cartItems.find(
      (item) => item.productID === product.id
    );

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
      <div className="shopDetails">
        <div className="shopDetailMain">
          <div className="shopDetails__left">
            <Filter filters={filters} onFilterChange={updateFilters} />
          </div>
          <div className="shopDetails__right">
            <div className="shopDetailsSorting">
              <div className="shopDetailsBreadcrumbLink">
                <Link to="/" onClick={scrollToTop}>
                  Home
                </Link>
                &nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
              <div className="filterLeft" onClick={toggleDrawer}>
                <IoFilterSharp />
                <p>Filter</p>
              </div>
              <div className="shopDetailsSort">
                <select name="sort" id="sort" onChange={handleSortChange}>
                  <option value="">Default Sorting</option>
                  <option value="best_seller">Best Selling</option>
                  <option value="price_low_high">Price, Low to high</option>
                  <option value="price_high_low">Price, high to low</option>
                </select>
                <div className="filterRight" onClick={toggleDrawer}>
                  <div className="filterSeprator"></div>
                  <IoFilterSharp />
                  <p>Filter</p>
                </div>
              </div>
            </div>

            <div className="shopDetailsProducts">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                  <p style={{ fontWeight: "bold", color: "#666" }}>Loading Products...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                  <p style={{ color: "#e53e3e" }}>{error}</p>
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", width: "100%" }}>
                  <p>No products found matching your criteria.</p>
                </div>
              ) : (
                <div className="shopDetailsProductsContainer">
                  {products.map((product) => {
                    const primaryImg = product.primary_image?.url || product.images?.[0]?.url;
                    const hoverImg = product.images?.[1]?.url || primaryImg;
                    const categoryName = product.categories?.[0]?.name || "Catalog";

                    return (
                      <div key={product.id} className="sdProductContainer">
                        <div className="sdProductImages">
                          <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                            <img
                              src={primaryImg}
                              alt={product.name}
                              className="sdProduct_front"
                            />
                            <img
                              src={hoverImg}
                              alt={product.name}
                              className="sdProduct_back"
                            />
                          </Link>
                          <h4 onClick={() => handleAddToCart(product)}>
                            Add to Cart
                          </h4>
                        </div>
                        <div
                          className="sdProductImagesCart"
                          onClick={() => handleAddToCart(product)}
                        >
                          <FaCartPlus />
                        </div>
                        <div className="sdProductInfo">
                          <div className="sdProductCategoryWishlist">
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
                          <div className="sdProductNameInfo">
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
                            <div className="sdProductRatingReviews" style={{ margin: "4px 0" }}>
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

            {/* Pagination Controls */}
            {pagination.lastPage > 1 && (
              <div className="shopDetailsPagination">
                <div className="sdPaginationPrev">
                  <p
                    style={{ cursor: pagination.currentPage > 1 ? "pointer" : "not-allowed", opacity: pagination.currentPage > 1 ? 1 : 0.4 }}
                    onClick={() => {
                      if (pagination.currentPage > 1) {
                        changePage(pagination.currentPage - 1);
                        scrollToTop();
                      }
                    }}
                  >
                    <FaAngleLeft />
                    Prev
                  </p>
                </div>
                <div className="sdPaginationNumber">
                  <div className="paginationNum">
                    {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((pageNum) => (
                      <p
                        key={pageNum}
                        style={{
                          fontWeight: pagination.currentPage === pageNum ? "bold" : "normal",
                          color: pagination.currentPage === pageNum ? "#000" : "#666",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          changePage(pageNum);
                          scrollToTop();
                        }}
                      >
                        {pageNum}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="sdPaginationNext">
                  <p
                    style={{ cursor: pagination.currentPage < pagination.lastPage ? "pointer" : "not-allowed", opacity: pagination.currentPage < pagination.lastPage ? 1 : 0.4 }}
                    onClick={() => {
                      if (pagination.currentPage < pagination.lastPage) {
                        changePage(pagination.currentPage + 1);
                        scrollToTop();
                      }
                    }}
                  >
                    Next
                    <FaAngleRight />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div className={`filterDrawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawerHeader">
          <p>Filter By</p>
          <IoClose onClick={closeDrawer} className="closeButton" size={26} />
        </div>
        <div className="drawerContent">
          <Filter filters={filters} onFilterChange={updateFilters} />
        </div>
      </div>
    </>
  );
};

export default ShopDetails;

