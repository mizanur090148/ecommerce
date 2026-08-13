import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { useParams, Link } from "react-router-dom";
import useProductDetails from "../../../Hooks/useProductDetails";

import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
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
  const [clicked, setClicked] = useState(false);

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const maxStock = product?.is_stock_managed ? product.stock_quantity : 999;

  const increment = () => {
    setQuantity((q) => {
      if (q >= maxStock) {
        toast.error(`Only ${maxStock} units available in stock.`, { id: "stock-limit" });
        return maxStock;
      }
      return q + 1;
    });
  };
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      if (value > maxStock) {
        toast.error(`Only ${maxStock} units available in stock.`, { id: "stock-limit" });
        setQuantity(maxStock);
      } else {
        setQuantity(value);
      }
    }
  };

  const handleWishClick = () => setClicked(!clicked);

  const handleAddToCart = () => {
    if (!product) return;

    const price = activeVariant?.price || product.sale_price || product.price;
    const imgUrl = activeImage || product.primary_image?.url || product.images?.[0]?.url || "";

    const productDetails = {
      productID: product.id,
      productName: product.name + (selectedColor ? ` (${selectedColor})` : "") + (selectedSize ? ` - ${selectedSize}` : ""),
      productPrice: price,
      frontImg: imgUrl,
      quantity,
    };

    const productInCart = cartItems.find((item) => item.productID === productDetails.productID);

    if (productInCart && productInCart.quantity >= 20) {
      toast.error("Product limit reached", {
        duration: 2000,
        style: { backgroundColor: "#ff4b4b", color: "white" },
      });
    } else {
      dispatch(addToCart(productDetails));
      toast.success(`Added ${quantity} to cart!`, {
        duration: 2000,
        style: { backgroundColor: "#07bc0c", color: "white" },
      });
    }
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

  const galleryImages = product.images?.map((img) => img.url) || [product.primary_image?.url];
  const categoryName = product.categories?.[0]?.name || "Catalog";

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
                    border: activeImage === imgUrl ? "2px solid #000" : "1px solid #eee",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
            <div className="productFullImg">
              <img src={activeImage || galleryImages[0]} alt={product.name} />
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
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <FaStar color="#FEC78A" size={10} />
              <span>({product.reviews_count || 0} customer reviews)</span>
            </div>

            <div className="productPrice">
              <h3>
                ${activeVariant?.price || product.sale_price || product.price}
                {product.sale_price && (
                  <span style={{ textDecoration: "line-through", color: "#aaa", marginLeft: "10px", fontSize: "0.7em" }}>
                    ${product.price}
                  </span>
                )}
              </h3>
            </div>

            {/* Stock Availability Badge */}
            <div className="productStockBadge" style={{ margin: "12px 0" }}>
              {product.stock_status === "out_of_stock" || (product.is_stock_managed && product.stock_quantity <= 0) ? (
                <span style={{ background: "#fed7d7", color: "#9b2c2c", padding: "5px 12px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                  ✕ Sold Out
                </span>
              ) : (
                <span style={{ background: "#c6f6d5", color: "#22543d", padding: "5px 12px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                  ✓ In Stock {product.is_stock_managed ? `(${product.stock_quantity} available)` : ""}
                </span>
              )}
            </div>

            <div className="productDescription">
              <p>{product.short_description || product.description}</p>
            </div>

            {/* Colors Selection */}
            {product.type === "configurable" && (
              <div className="productColor">
                <p>Color: {selectedColor || "Select Color"}</p>
                <div className="colorBox">
                  {["Black", "Red", "Blue"].map((cName) => (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => setSelectedColor(cName)}
                      style={{
                        padding: "6px 14px",
                        marginRight: "8px",
                        borderRadius: "6px",
                        border: selectedColor === cName ? "2px solid #000" : "1px solid #ccc",
                        fontWeight: selectedColor === cName ? "bold" : "normal",
                        cursor: "pointer",
                      }}
                    >
                      {cName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selection */}
            {product.type === "configurable" && (
              <div className="productSize">
                <p>Size: {selectedSize || "Select Size"}</p>
                <div className="sizeBtn">
                  {["S", "M", "L", "XL"].map((sVal) => (
                    <button
                      key={sVal}
                      type="button"
                      onClick={() => setSelectedSize(sVal)}
                      style={{
                        padding: "6px 14px",
                        marginRight: "8px",
                        borderRadius: "6px",
                        border: selectedSize === sVal ? "2px solid #000" : "1px solid #ccc",
                        fontWeight: selectedSize === sVal ? "bold" : "normal",
                        cursor: "pointer",
                      }}
                    >
                      {sVal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Cart */}
            <div className="productCartQuantity">
              <div className="productQuantity">
                <button onClick={decrement}>-</button>
                <input type="text" value={quantity} onChange={handleInputChange} />
                <button onClick={increment}>+</button>
              </div>
              <div className="productCartBtn">
                {product.stock_status === "out_of_stock" || (product.is_stock_managed && product.stock_quantity <= 0) ? (
                  <button disabled style={{ background: "#a0aec0", cursor: "not-allowed" }}>
                    Sold Out
                  </button>
                ) : (
                  <button onClick={handleAddToCart}>Add to Cart</button>
                )}
              </div>
            </div>

            <div className="productWishList">
              <button onClick={handleWishClick}>
                <FiHeart color={clicked ? "red" : "#767676"} />
                <p>{clicked ? "Added to Wishlist" : "Add to Wishlist"}</p>
              </button>
            </div>

            <div className="productMeta">
              <p>SKU: <span>{activeVariant?.sku || product.sku}</span></p>
              <p>Category: <span>{categoryName}</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;


