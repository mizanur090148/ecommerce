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

import ProductRating from "../../Common/ProductRating";

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

    const availableQty = activeVariant
      ? (activeVariant.stock_quantity ?? 0)
      : (product.stock_quantity ?? 0);

    if (availableQty <= 0) {
      toast.error("Selected option is currently out of stock.", {
        duration: 2500,
        style: { backgroundColor: "#ff4b4b", color: "white" },
      });
      return;
    }

    const currentPrice = activeVariant?.price || product.sale_price || product.price;

    const productPayload = {
      productID: product.id,
      productName: product.name,
      productPrice: currentPrice,
      frontImg: activeImage || product.primary_image?.url || product.images?.[0]?.url || "",
      backImg: product.images?.[1]?.url || activeImage || "",
      color: selectedColor,
      size: selectedSize,
      variantID: activeVariant?.id || null,
      quantity: quantity,
    };

    const existingCartItem = cartItems.find(
      (item) =>
        String(item.productID) === String(product.id) &&
        (activeVariant
          ? String(item.variantID) === String(activeVariant.id)
          : item.color === selectedColor && item.size === selectedSize)
    );

    const totalQty = Number(existingCartItem?.quantity || 0) + Number(quantity);

    if (totalQty > availableQty) {
      toast.error(`Cannot add more than available stock (${availableQty} units available).`, {
        duration: 2500,
        style: { backgroundColor: "#ff4b4b", color: "white" },
      });
      return;
    }

    dispatch(addToCart(productPayload));
    toast.success(`Added ${quantity} x ${product.name} to cart!`, {
      duration: 2500,
      style: { backgroundColor: "#07bc0c", color: "white" },
    });
  };

  const handleQuantityIncrement = () => {
    setQuantity((prev) => (prev < 20 ? prev + 1 : prev));
  };

  const handleQuantityDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // 1. Extract unique Colors available across product variants or colors array
  const availableColors = React.useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      const colorSet = new Set();
      product.variants.forEach((v) => {
        if (v.attribute_values && v.attribute_values.length > 0) {
          v.attribute_values.forEach((av) => {
            const val = av.value;
            const isColor = av.attribute?.code === 'color' || ['black','red','grey','gray','blue','yellow','white','green','pink'].includes(val.toLowerCase());
            if (isColor) colorSet.add(val);
          });
        }
      });
      if (colorSet.size > 0) return Array.from(colorSet);
    }
    return product.colors || [];
  }, [product]);

  // Auto-select first color by default if none selected or invalid
  useEffect(() => {
    if (availableColors.length > 0 && (!selectedColor || !availableColors.map((c) => c.toLowerCase()).includes(selectedColor.toLowerCase()))) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor, setSelectedColor]);

  // 2. Extract available sizes ONLY for the currently selectedColor
  const availableSizesForColor = React.useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0 && selectedColor) {
      const sizeSet = new Set();
      product.variants.forEach((v) => {
        const hasSelectedColor = v.attribute_values?.some(
          (av) => av.value.toLowerCase() === selectedColor.toLowerCase()
        );
        if (hasSelectedColor && v.attribute_values) {
          v.attribute_values.forEach((av) => {
            const val = av.value;
            const isSize = av.attribute?.code === 'size' || ['xs','s','m','l','xl','xxl'].includes(val.toLowerCase());
            if (isSize) sizeSet.add(val);
          });
        }
      });
      if (sizeSet.size > 0) return Array.from(sizeSet);
    }
    return product.sizes || [];
  }, [product, selectedColor]);

  // Auto-select first available size for current color if none selected or invalid
  useEffect(() => {
    if (availableSizesForColor.length > 0 && (!selectedSize || !availableSizesForColor.map((s) => s.toLowerCase()).includes(selectedSize.toLowerCase()))) {
      setSelectedSize(availableSizesForColor[0]);
    }
  }, [availableSizesForColor, selectedSize, setSelectedSize]);

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

            <div className="productRating" style={{ display: "flex", alignItems: "center", gap: "6px", margin: "10px 0" }}>
              <ProductRating
                rating={product.rating_cache || 0}
                reviewsCount={product.reviews_count || 0}
                size={14}
                showScore={true}
              />
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
              {/* Color Selector Buttons */}
              {availableColors.length > 0 && (
                <div className="productColor" style={{ marginBottom: "20px" }}>
                  <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "10px" }}>
                    Color: <strong style={{ color: "#3046d9", textTransform: "capitalize" }}>{selectedColor}</strong>
                  </p>
                  <div className="colorBtn" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {availableColors.map((c) => {
                      const isSelected = selectedColor?.toLowerCase() === c.toLowerCase();
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: isSelected ? "2px solid #3046d9" : "1px solid #ddd",
                            backgroundColor: isSelected ? "#edf2ff" : "#ffffff",
                            color: isSelected ? "#3046d9" : "#333333",
                            fontWeight: isSelected ? "700" : "500",
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              backgroundColor: c.toLowerCase(),
                              border: "1px solid rgba(0,0,0,0.2)",
                              display: "inline-block",
                            }}
                          />
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Size Buttons (Filtered by Currently Selected Color) */}
              {availableSizesForColor.length > 0 && (
                <div className="productSize" style={{ marginBottom: "20px" }}>
                  <p style={{ fontWeight: "600", fontSize: "14px", marginBottom: "10px" }}>
                    Size: <strong style={{ color: "#3046d9" }}>{selectedSize}</strong>
                  </p>
                  <div className="sizeBtn" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {availableSizesForColor.map((s) => {
                      const isSelected = selectedSize?.toLowerCase() === s.toLowerCase();
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: isSelected ? "2px solid #000" : "1px solid #ddd",
                            backgroundColor: isSelected ? "#000000" : "#ffffff",
                            color: isSelected ? "#ffffff" : "#333333",
                            fontWeight: isSelected ? "700" : "500",
                            fontSize: "13px",
                            cursor: "pointer",
                            minWidth: "44px",
                            textAlign: "center",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
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
                <button
                  type="button"
                  disabled={activeVariant ? (activeVariant.stock_quantity ?? 0) <= 0 : (product.stock_quantity ?? 0) <= 0}
                  onClick={handleAddToCart}
                  style={{
                    opacity: (activeVariant ? (activeVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0)) <= 0 ? 0.5 : 1,
                    cursor: (activeVariant ? (activeVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0)) <= 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {(activeVariant ? (activeVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0)) <= 0 ? "Out of Stock" : "Add to Cart"}
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
                SKU: <span>{activeVariant?.sku || product.sku || `PRD-${product.id}`}</span>
              </p>
              <p>
                Category: <span>{categoryName}</span>
              </p>
              <p>
                Availability:{" "}
                <span
                  style={{
                    color: (activeVariant ? (activeVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0)) > 0 ? "#07bc0c" : "#e53e3e",
                    fontWeight: "600",
                  }}
                >
                  {(activeVariant ? (activeVariant.stock_quantity ?? 0) : (product.stock_quantity ?? 0)) > 0
                    ? `In Stock (${activeVariant ? activeVariant.stock_quantity : product.stock_quantity} available)`
                    : "Out of Stock"}
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
