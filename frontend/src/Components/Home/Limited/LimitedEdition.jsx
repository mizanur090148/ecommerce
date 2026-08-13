import React, { useState } from "react";
import "./LimitedEdition.css";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import useProducts from "../../../Hooks/useProducts";

import { FiHeart } from "react-icons/fi";
import { FaStar, FaCartPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";

const LimitedEdition = () => {
  const dispatch = useDispatch();
  const [wishList, setWishList] = useState({});

  // Fetch featured limited edition products from API
  const { products, loading } = useProducts({ per_page: 8, sort: "best_seller" });

  const handleWishlistClick = (productID) => {
    setWishList((prevWishlist) => ({
      ...prevWishlist,
      [productID]: !prevWishlist[productID],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      <div className="limitedProductSection">
        <h2>
          Limited <span>Edition</span>
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontWeight: "bold", color: "#666" }}>Loading Limited Edition Products...</p>
          </div>
        ) : (
          <div className="limitedProductSlider">
            <Swiper
              slidesPerView={4}
              spaceBetween={20}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              navigation={{
                nextEl: ".image-swiper-button-next",
                prevEl: ".image-swiper-button-prev",
              }}
              modules={[Navigation, Autoplay]}
              breakpoints={{
                320: { slidesPerView: 1, spaceBetween: 10 },
                640: { slidesPerView: 2, spaceBetween: 15 },
                1024: { slidesPerView: 4, spaceBetween: 20 },
              }}
              className="mySwiper"
            >
              {products.map((product) => {
                const primaryImg = product.primary_image?.url || product.images?.[0]?.url;
                const categoryName = product.categories?.[0]?.name || "Limited Edition";

                return (
                  <SwiperSlide key={product.id}>
                    <div className="lpContainer">
                      <div className="lpImageContainer">
                        <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                          <img src={primaryImg} alt={product.name} className="lpImage" />
                        </Link>
                        <h4 onClick={() => handleAddToCart(product)}>Add to Cart</h4>
                      </div>

                      <div
                        className="lpProductImagesCart"
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaCartPlus />
                      </div>

                      <div className="limitedProductInfo">
                        <div className="lpCategoryWishlist">
                          <p>{categoryName}</p>
                          <FiHeart
                            onClick={() => handleWishlistClick(product.id)}
                            style={{
                              color: wishList[product.id] ? "red" : "#767676",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                        <div className="productNameInfo">
                          <Link to={`/product/${product.slug}`} onClick={scrollToTop}>
                            <h5>{product.name}</h5>
                          </Link>
                          <p style={{ fontWeight: "bold", marginTop: "4px" }}>
                            ৳{product.sale_price || product.price}
                            {product.sale_price && (
                              <span style={{ textDecoration: "line-through", color: "#aaa", marginLeft: "6px", fontSize: "0.85em", fontWeight: "normal" }}>
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

            <div className="swiper-button image-swiper-button-prev">
              <IoIosArrowBack size={20} />
            </div>
            <div className="swiper-button image-swiper-button-next">
              <IoIosArrowForward size={20} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LimitedEdition;
