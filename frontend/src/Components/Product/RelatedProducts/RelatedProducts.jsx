import React from "react";
import "./RelatedProducts.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { toggleWishList, selectWishListItems } from "../../../Features/Wishlist/wishListSlice";
import wishlistService from "../../../Services/wishlistService";
import authService from "../../../Services/authService";
import useProducts from "../../../Hooks/useProducts";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { FiHeart } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const RelatedProducts = () => {
  const dispatch = useDispatch();
  const { slug } = useParams();
  const wishlistItems = useSelector(selectWishListItems);
  const cartItems = useSelector((state) => state.cart.items);

  const { products, loading } = useProducts({ per_page: 8 });

  // Filter out the active product being viewed
  const relatedProducts = products.filter((p) => p.slug !== slug && p.id !== slug);

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
      <div className="relatedProductSection">
        <div className="relatedProducts">
          <h2>
            RELATED <span>PRODUCTS</span>
          </h2>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
            <p>Loading related products...</p>
          </div>
        ) : relatedProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
            <p>No related products found.</p>
          </div>
        ) : (
          <div className="relatedProductSlider">
            <div className="swiper-button image-swiper-button-next">
              <IoIosArrowForward />
            </div>
            <div className="swiper-button image-swiper-button-prev">
              <IoIosArrowBack />
            </div>
            <Swiper
              slidesPerView={4}
              slidesPerGroup={1}
              spaceBetween={30}
              loop={relatedProducts.length > 3}
              navigation={{
                nextEl: ".image-swiper-button-next",
                prevEl: ".image-swiper-button-prev",
              }}
              modules={[Navigation]}
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  slidesPerGroup: 1,
                  spaceBetween: 14,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 1,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 1,
                  spaceBetween: 30,
                },
              }}
            >
              {relatedProducts.map((product) => {
                const primaryImg = product.primary_image?.url || product.images?.[0]?.url || "";
                const hoverImg = product.images?.[1]?.url || primaryImg;
                const categoryName = product.categories?.[0]?.name || "Products";
                const isWishlisted = wishlistItems.some((item) => item.id === product.id);

                return (
                  <SwiperSlide key={product.id}>
                    <div className="rpContainer">
                      <div className="rpImages">
                        <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                          <img
                            src={primaryImg}
                            alt={product.name}
                            className="rpFrontImg"
                          />
                          <img
                            src={hoverImg}
                            className="rpBackImg"
                            alt={product.name}
                          />
                        </Link>
                        <h4 onClick={() => handleAddToCart(product)}>Add to Cart</h4>
                      </div>

                      <div className="relatedProductInfo">
                        <div className="rpCategoryWishlist">
                          <p>{categoryName}</p>
                          {isWishlisted ? (
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
                        <div className="productNameInfo">
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
                          <div className="productRatingReviews">
                            <div className="productRatingStar">
                              <FaStar color="#FEC78A" size={10} />
                              <FaStar color="#FEC78A" size={10} />
                              <FaStar color="#FEC78A" size={10} />
                              <FaStar color="#FEC78A" size={10} />
                              <FaStar color="#FEC78A" size={10} />
                            </div>
                            <span>({product.reviews_count || 0})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>
    </>
  );
};

export default RelatedProducts;
