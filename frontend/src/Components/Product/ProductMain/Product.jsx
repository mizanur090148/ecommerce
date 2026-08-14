import React, { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { toggleWishList, selectWishListItems } from "../../../Features/Wishlist/wishListSlice";
import wishlistService from "../../../Services/wishlistService";
import authService from "../../../Services/authService";
import { useParams, Link } from "react-router-dom";
import useProductDetails from "../../../Hooks/useProductDetails";

import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { FaStar, FaHeart, FaSearchPlus, FaTimes, FaPlus, FaMinus, FaRedo } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";
import toast from "react-hot-toast";

import "./Product.css";

const Product = () => {
  const { slug } = useParams();
  const {
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
  } = useProductDetails(slug || "cropped-faux-leather-jacket-1");

  const [quantity, setQuantity] = useState(1);

  // Ultra-Sleek Glass Magnifier State
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Lightbox Modal Zoom State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1.5);

  const closeModal = () => {
    setIsModalOpen(false);
    setZoomScale(1.5);
  };

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector(selectWishListItems);
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleMouseMove = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - bounds.top) / bounds.height) * 100));
    setMousePos({ x, y });
  };

  const handleWishClick = async () => {
    if (!product) return;
    dispatch(toggleWishList(product));
    if (isWishlisted) {
      toast.success("Removed from Wishlist", { duration: 1500 });
    } else {
      toast.success("Added to Wishlist!", {
        duration: 1500,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }

    const token = authService.getToken();
    if (token) {
      try {
        await wishlistService.toggleWishlist(product.id);
      } catch (err) {
        console.error("Wishlist sync error", err);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const currentPrice = activeVariant?.price || product.sale_price || product.price;

    const productPayload = {
      productID: product.id,
      productName: product.name,
      productPrice: currentPrice,
      frontImg: activeImage || product.primary_image?.url || product.images?.[0]?.url || "",
      backImg: product.images?.[1]?.url || activeImage || "",
      color: selectedColor,
      size: selectedSize,
      quantity: quantity,
    };

    const existingCartItem = cartItems.find(
      (item) => item.productID === product.id && item.color === selectedColor && item.size === selectedSize
    );

    const totalQty = (existingCartItem?.quantity || 0) + quantity;

    if (totalQty > 20) {
      toast.error("Cart item limit reached (max 20 per item).", {
        duration: 2500,
        style: { backgroundColor: "#ff4b4b", color: "white" },
      });
    } else {
      dispatch(addToCart(productPayload));
      toast.success(`Added ${quantity} x ${product.name} to cart!`, {
        duration: 2500,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }
  };

  const handleQuantityIncrement = () => {
    setQuantity((prev) => (prev < 20 ? prev + 1 : prev));
  };

  const handleQuantityDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h3>Loading Product Details...</h3>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h3 style={{ color: "#e53e3e" }}>{error || "Product Not Found"}</h3>
        <Link to="/shop" style={{ textDecoration: "underline", marginTop: "10px", display: "inline-block" }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const galleryImages = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : [product.primary_image?.url || ""];
  const categoryName = product.categories?.[0]?.name || "Catalog";
  const currentImg = activeImage || galleryImages[0];
  const currentImgIdx = galleryImages.indexOf(currentImg);

  const handleNextImg = () => {
    const nextIdx = (currentImgIdx + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIdx]);
  };

  const handlePrevImg = () => {
    const prevIdx = (currentImgIdx - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIdx]);
  };

  return (
    <>
      <div className="productSection">
        <div className="productShowCase">
          <div className="productGallery">
            <div className="productThumb">
              {galleryImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  onClick={() => setActiveImage(imgUrl)}
                  alt=""
                  style={{
                    border: currentImg === imgUrl ? "2px solid #000" : "1px solid #eee",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>

            {/* Ultra-Sleek Glass Inner Magnifier Zoom */}
            <div
              className="productFullImg"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsModalOpen(true)}
              title="Click to open Fullscreen Gallery Lightbox"
            >
              <img
                src={currentImg}
                alt={product.name}
                className="mainZoomImage"
                style={{
                  transform: isHovering ? "scale(2.4)" : "scale(1)",
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transition: isHovering ? "transform-origin 0.05s ease-out" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), transform-origin 0.35s ease",
                }}
              />

              <div className="zoomBadge">
                <FaSearchPlus size={12} />
                <span>Hover to Magnify • Click for Fullscreen</span>
              </div>
            </div>
          </div>

          <div className="productDetails">
            <div className="productBreadcrumb">
              <div className="breadcrumbLink">
                <Link to="/">Home</Link>&nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
            </div>

            <div className="productName">
              <h1>{product.name}</h1>
            </div>

            <div className="productRating">
              <FaStar color="#FEC78A" size={12} />
              <FaStar color="#FEC78A" size={12} />
              <FaStar color="#FEC78A" size={12} />
              <FaStar color="#FEC78A" size={12} />
              <FaStar color="#FEC78A" size={12} />
              <p>({product.reviews_count || 0} reviews)</p>
            </div>

            <div className="productPrice">
              <h3>
                ৳{activeVariant?.price || product.sale_price || product.price}
                {product.sale_price && !activeVariant && (
                  <span style={{ textDecoration: "line-through", color: "#888", marginLeft: "10px", fontSize: "0.8em" }}>
                    ৳{product.price}
                  </span>
                )}
              </h3>
            </div>

            <div className="productDescription">
              <p>{product.short_description || product.description || "Premium quality e-commerce product."}</p>
            </div>

            <div className="productSizeColor">
              {/* Dynamic Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="productVariants" style={{ marginBottom: "15px" }}>
                  <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Select Option / Model:</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          if (v.attributes?.color) setSelectedColor(v.attributes.color);
                          if (v.attributes?.size) setSelectedSize(v.attributes.size);
                        }}
                        style={{
                          padding: "8px 14px",
                          border: activeVariant?.id === v.id ? "2px solid #000" : "1px solid #ccc",
                          background: activeVariant?.id === v.id ? "#000" : "#fff",
                          color: activeVariant?.id === v.id ? "#fff" : "#000",
                          borderRadius: "4px",
                          fontWeight: "500",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        {v.name || Object.values(v.attributes || {}).join(" / ")} (৳{v.price})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="productSize">
                  <p>Size: <strong>{selectedSize}</strong></p>
                  <div className="sizeBtn">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        className={selectedSize === s ? "active" : ""}
                        onClick={() => setSelectedSize(s)}
                        style={{
                          background: selectedSize === s ? "#000" : "#fff",
                          color: selectedSize === s ? "#fff" : "#000",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="productColor">
                  <p>Color: <strong>{selectedColor}</strong></p>
                  <div className="colorBtn">
                    {product.colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        style={{
                          backgroundColor: c.toLowerCase(),
                          border: selectedColor === c ? "2px solid #000" : "1px solid #ddd",
                        }}
                        className={selectedColor === c ? "highlighted" : ""}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="productCartQuantity">
              <div className="productQuantity">
                <button type="button" onClick={handleQuantityDecrement}>-</button>
                <input type="text" value={quantity} readOnly />
                <button type="button" onClick={handleQuantityIncrement}>+</button>
              </div>
              <div className="productCartBtn">
                <button type="button" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              </div>
            </div>

            <div className="productWishShare">
              <div className="productWishList">
                <button type="button" onClick={handleWishClick}>
                  {isWishlisted ? <FaHeart color="red" size={18} /> : <FiHeart size={18} />}
                  <p>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</p>
                </button>
              </div>
              <div className="productShare">
                <PiShareNetworkLight size={22} />
                <span>Share</span>
              </div>
            </div>

            <div className="productTags">
              <p>
                SKU: <span>{product.sku || `PRD-${product.id}`}</span>
              </p>
              <p>
                Category: <span>{categoryName}</span>
              </p>
              <p>
                Availability:{" "}
                <span style={{ color: product.stock_quantity > 0 ? "#07bc0c" : "#e53e3e", fontWeight: "600" }}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : "Out of Stock"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Gallery Modal */}
      {isModalOpen && (
        <div className="imageZoomModalOverlay" onClick={closeModal}>
          <div className="imageZoomModalContent" onClick={(e) => e.stopPropagation()}>
            {/* Top Toolbar */}
            <div className="imageZoomToolbar">
              <span className="imageZoomTitle">{product.name} ({currentImgIdx + 1} / {galleryImages.length})</span>
              <div className="imageZoomActions">
                <button type="button" onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 4))} title="Zoom In">
                  <FaPlus size={14} />
                </button>
                <button type="button" onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))} title="Zoom Out">
                  <FaMinus size={14} />
                </button>
                <button type="button" onClick={() => setZoomScale(1)} title="Reset Zoom">
                  <FaRedo size={12} />
                </button>
                <button type="button" className="closeBtn" onClick={closeModal} title="Close (Esc)">
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Gallery Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button type="button" className="lightboxArrow left" onClick={handlePrevImg}>
                  <GoChevronLeft size={30} />
                </button>
                <button type="button" className="lightboxArrow right" onClick={handleNextImg}>
                  <GoChevronRight size={30} />
                </button>
              </>
            )}

            {/* Image Stage */}
            <div className="imageZoomStage">
              <img
                src={currentImg}
                alt={product.name}
                style={{
                  transform: `scale(${zoomScale})`,
                  transition: "transform 0.2s ease-out",
                  maxHeight: "82vh",
                  maxWidth: "85vw",
                  objectFit: "contain",
                  cursor: zoomScale > 1 ? "grab" : "zoom-in",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Product;
