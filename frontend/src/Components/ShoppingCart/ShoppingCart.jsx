import React, { useState } from "react";
import "./ShoppingCart.css";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  selectCartTotalAmount,
  clearCart,
} from "../../Features/Cart/cartSlice";
import useCheckout from "../../Hooks/useCheckout";
import authService from "../../Services/authService";
import orderService from "../../Services/orderService";

import { MdOutlineClose } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";
import success from "../../Assets/success.png";

const ShoppingCart = () => {
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("cartTab1");
  const [payments, setPayments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Cash on delivery");
  const [sslOrderNum, setSslOrderNum] = useState("");
  const [sslError, setSslError] = useState("");
  const [sslLoading, setSslLoading] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState(null);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const orderNum = params.get("order");

    if (status === "success") {
      dispatch(clearCart());
      setActiveTab("cartTab3");
      setPayments(true);
      if (orderNum) {
        setSslOrderNum(orderNum);
        orderService.getOrderByNumber(orderNum).then((res) => {
          if (res?.status === "success" && res.data) {
            setFetchedOrder(res.data);
          }
        }).catch((err) => console.error(err));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (status === "failed") {
      setActiveTab("cartTab2");
      setSslError("⚠️ Online payment failed. Please try again or choose Cash on Delivery.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (status === "cancelled") {
      setActiveTab("cartTab2");
      setSslError("ℹ️ Payment process was cancelled. You can try again or select Cash on Delivery.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.search, dispatch]);

  const currentUser = authService.getCurrentUser();

  const [billingForm, setBillingForm] = useState({
    firstName: currentUser?.name ? currentUser.name.split(" ")[0] : "",
    lastName: currentUser?.name ? currentUser.name.split(" ").slice(1).join(" ") : "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: "",
    city: "",
    postcode: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (field, value) => {
    setBillingForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!billingForm.firstName.trim()) errors.firstName = "First name is required.";
    if (!billingForm.lastName.trim()) errors.lastName = "Last name is required.";
    if (!billingForm.email.trim()) errors.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(billingForm.email)) errors.email = "Valid email is required.";
    if (!billingForm.phone.trim()) errors.phone = "Phone number is required.";
    if (!billingForm.address.trim()) errors.address = "Street address is required.";
    if (!billingForm.city.trim()) errors.city = "Town / City is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
    submittingOrder,
    orderError,
    createdOrder,
    placeOrder,
  } = useCheckout();

  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };

  const handleTabClick = (tab) => {
    if (tab === "cartTab1" || cartItems.length > 0) {
      setActiveTab(tab);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1 && quantity <= 20) {
      dispatch(updateQuantity({ productID: productId, quantity: quantity }));
    }
  };

  const rawSubtotal = useSelector(selectCartTotalAmount);
  const numSubtotal = Number(rawSubtotal) || 0;

  let numDiscount = 0;
  if (appliedCoupon && numSubtotal > 0) {
    if (appliedCoupon.min_spend && numSubtotal < Number(appliedCoupon.min_spend)) {
      numDiscount = 0;
    } else if (appliedCoupon.type === "percentage") {
      numDiscount = (numSubtotal * Number(appliedCoupon.value)) / 100;
    } else if (appliedCoupon.type === "fixed") {
      numDiscount = Math.min(Number(appliedCoupon.value), numSubtotal);
    } else if (appliedCoupon.type === "free_shipping") {
      numDiscount = Number(appliedCoupon.value) || 0;
    } else {
      numDiscount = Number(appliedCoupon.discount_amount) || 0;
    }
  }

  const numShipping = 0;
  const numVat = 0;
  const numGrandTotal = Math.max(0, numSubtotal - numDiscount + numShipping + numVat);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentDate = new Date();
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const orderNumber = Math.floor(Math.random() * 100000);

  return (
    <>
      <div className="shoppingCartSection">
        <h2>Cart</h2>

        <div className="shoppingCartTabsContainer">
          <div className={`shoppingCartTabs ${activeTab}`}>
            <button
              className={activeTab === "cartTab1" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab1");
                setPayments(false);
              }}
            >
              <div className="tabNumber">1</div>
              <div className="tabText">Shopping Bag</div>
            </button>
            <button
              className={activeTab === "cartTab2" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab2");
                setPayments(false);
              }}
              disabled={cartItems.length === 0}
            >
              <div className="tabNumber">2</div>
              <div className="tabText">Shipping and Checkout</div>
            </button>
            <button
              className={activeTab === "cartTab3" ? "active" : ""}
              onClick={() => handleTabClick("cartTab3")}
              disabled={!payments}
            >
              <div className="tabNumber">3</div>
              <div className="tabText">Confirmation</div>
            </button>
          </div>
        </div>

        <div className="shoppingCartTabContent">
          {/* Tab 1: Shopping Bag */}
          {activeTab === "cartTab1" && (
            <div className="shoppingBagSection">
              <div className="shoppingBagTable">
                <table className="shoppingBagTableMain">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>PRICE</th>
                      <th>QUANTITY</th>
                      <th>SUBTOTAL</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => {
                        const price = Number(item.productPrice) || 0;
                        const qty = Number(item.quantity) || 1;
                        return (
                          <tr key={item.productID}>
                            <td data-label="Product">
                              <div className="shoppingBagTableProduct">
                                <Link to={`/product/${item.productID}`} onClick={scrollToTop} className="shoppingBagTableImg">
                                  <img src={item.frontImg} alt={item.productName} />
                                </Link>
                                <div className="shoppingBagTableProductDetail">
                                  <Link to={`/product/${item.productID}`} onClick={scrollToTop}>
                                    <h4>{item.productName}</h4>
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td data-label="Price">
                              <p>৳ {price.toFixed(2)}</p>
                            </td>
                            <td data-label="Quantity">
                              <div className="shoppingBagTableQuantity">
                                <button onClick={() => handleQuantityChange(item.productID, qty - 1)}>-</button>
                                <input
                                  type="text"
                                  min="1"
                                  max="20"
                                  value={qty}
                                  onChange={(e) => handleQuantityChange(item.productID, parseInt(e.target.value) || 1)}
                                />
                                <button onClick={() => handleQuantityChange(item.productID, qty + 1)}>+</button>
                              </div>
                            </td>
                            <td data-label="Subtotal">
                              <p style={{ textAlign: "center", fontWeight: "500" }}>
                                ৳ {(price * qty).toFixed(2)}
                              </p>
                            </td>
                            <td data-label="">
                              <MdOutlineClose
                                style={{ cursor: "pointer" }}
                                onClick={() => dispatch(removeFromCart(item.productID))}
                              />
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5">
                          <div className="shoppingCartEmpty">
                            <span>Your cart is empty!</span>
                            <Link to="/shop" onClick={scrollToTop}>
                              <button>Shop Now</button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="shoppingBagTotal">
                <h3>Cart Totals</h3>
                <table className="shoppingBagTotalTable">
                  <tbody>
                    <tr>
                      <th>Subtotal</th>
                      <td>৳ {numSubtotal.toFixed(2)}</td>
                    </tr>
                    {numDiscount > 0 && (
                      <tr>
                        <th>Discount ({appliedCoupon?.code})</th>
                        <td style={{ color: "#07bc0c", fontWeight: "bold" }}>-৳ {numDiscount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <th>Shipping</th>
                      <td>৳ {numShipping.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th>VAT</th>
                      <td>৳ {numVat.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th>Total</th>
                      <td style={{ fontWeight: "bold", fontSize: "1.2rem", color: "#3046d9" }}>৳ {numGrandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Coupon Code Section inside Cart Totals */}
                {cartItems.length > 0 && (
                  <div className="cartTotalsCouponSection">
                    <div className="cartTotalsCouponHeader">
                      <span>🎟️ Coupon Code</span>
                    </div>
                    <form className="cartTotalsCouponForm">
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={couponLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          applyCoupon(couponCode, numSubtotal);
                        }}
                      >
                        {couponLoading ? "Applying..." : "Apply"}
                      </button>
                    </form>
                    {couponError && <p className="cartTotalsCouponError">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="cartTotalsCouponSuccess">
                        <span>✓ Coupon <b>{appliedCoupon.code}</b> applied!</span>
                        <button type="button" onClick={removeCoupon}>Remove</button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="cartTotalsCheckoutBtn"
                  onClick={() => {
                    handleTabClick("cartTab2");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Checkout Details */}
          {activeTab === "cartTab2" && (
            <div className="checkoutSection">
              <div className="checkoutDetailsSection">
                <h4>Billing & Shipping Details</h4>
                <div className="checkoutDetailsForm">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="checkoutDetailsFormRow">
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          placeholder="First Name *"
                          value={billingForm.firstName}
                          style={{ borderColor: formErrors.firstName ? "#e53e3e" : "#ccc", width: "100%" }}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                        />
                        {formErrors.firstName && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.firstName}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Last Name *"
                          value={billingForm.lastName}
                          style={{ borderColor: formErrors.lastName ? "#e53e3e" : "#ccc", width: "100%" }}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                        />
                        {formErrors.lastName && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.lastName}</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="email"
                        placeholder="Your Email *"
                        value={billingForm.email}
                        style={{ borderColor: formErrors.email ? "#e53e3e" : "#ccc", width: "100%" }}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                      {formErrors.email && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.email}</span>}
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="text"
                        placeholder="Phone Number *"
                        value={billingForm.phone}
                        style={{ borderColor: formErrors.phone ? "#e53e3e" : "#ccc", width: "100%" }}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                      {formErrors.phone && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.phone}</span>}
                    </div>
                    <div style={{ marginTop: "12px" }}>
                      <input
                        type="text"
                        placeholder="Street Address *"
                        value={billingForm.address}
                        style={{ borderColor: formErrors.address ? "#e53e3e" : "#ccc", width: "100%" }}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                      {formErrors.address && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.address}</span>}
                    </div>
                    <div className="checkoutDetailsFormRow" style={{ marginTop: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Town / City *"
                          value={billingForm.city}
                          style={{ borderColor: formErrors.city ? "#e53e3e" : "#ccc", width: "100%" }}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                        />
                        {formErrors.city && <span style={{ color: "#e53e3e", fontSize: "0.75rem", display: "block", marginTop: "2px" }}>{formErrors.city}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          placeholder="Postcode / ZIP (Optional)"
                          value={billingForm.postcode}
                          onChange={(e) => handleInputChange("postcode", e.target.value)}
                        />
                      </div>
                    </div>
                    <textarea
                      cols={30}
                      rows={4}
                      placeholder="Order Notes (Optional)"
                      style={{ marginTop: "12px" }}
                      value={billingForm.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                  </form>
                </div>
              </div>

              <div className="checkoutPaymentSection">
                <div className="checkoutTotalContainer">
                  <h3>Your Order Summary</h3>
                  <div className="checkoutItems">
                    <table>
                      <thead>
                        <tr>
                          <th>PRODUCTS</th>
                          <th style={{ textAlign: "right" }}>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => {
                          const p = Number(item.productPrice) || 0;
                          const q = Number(item.quantity) || 1;
                          return (
                            <tr key={item.productID}>
                              <td>{item.productName} × {q}</td>
                              <td style={{ textAlign: "right" }}>৳ {(p * q).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="checkoutTotal">
                    <table>
                      <tbody>
                        <tr>
                          <th>Subtotal</th>
                          <td style={{ textAlign: "right" }}>৳ {numSubtotal.toFixed(2)}</td>
                        </tr>
                        {numDiscount > 0 && (
                          <tr>
                            <th>Discount</th>
                            <td style={{ color: "#07bc0c", textAlign: "right" }}>-৳ {numDiscount.toFixed(2)}</td>
                          </tr>
                        )}
                        <tr>
                          <th>Shipping</th>
                          <td style={{ textAlign: "right" }}>৳ {numShipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <th>VAT</th>
                          <td style={{ textAlign: "right" }}>৳ {numVat.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <th>Total</th>
                          <td style={{ fontWeight: "bold", textAlign: "right" }}>৳ {numGrandTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="checkoutPaymentContainer">
                  <label className={`paymentOptionLabel ${selectedPayment === "SSLCommerz (bKash / Nagad / Cards)" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="SSLCommerz (bKash / Nagad / Cards)"
                      checked={selectedPayment === "SSLCommerz (bKash / Nagad / Cards)"}
                      onChange={handlePaymentChange}
                    />
                    <div className="checkoutPaymentMethod">
                      <div className="paymentMethodHeader">
                        <span>SSLCommerz Online Payment</span>
                        <div className="paymentBadgesRow">
                          <span className="pBadge bkash">bKash</span>
                          <span className="pBadge nagad">Nagad</span>
                          <span className="pBadge rocket">Rocket</span>
                          <span className="pBadge card">Cards</span>
                        </div>
                      </div>
                      <p>Pay securely via bKash, Nagad, Rocket, Upay, Visa, Mastercard, AMEX, or City Bank / DBBL Internet Banking.</p>
                    </div>
                  </label>
                  <label className={`paymentOptionLabel ${selectedPayment === "Cash on delivery" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on delivery"
                      checked={selectedPayment === "Cash on delivery"}
                      onChange={handlePaymentChange}
                    />
                    <div className="checkoutPaymentMethod">
                      <span>Cash on Delivery</span>
                      <p>Pay with cash upon physical delivery of your order.</p>
                    </div>
                  </label>
                  {/* <label className={`paymentOptionLabel ${selectedPayment === "Direct Bank Transfer" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Direct Bank Transfer"
                      checked={selectedPayment === "Direct Bank Transfer"}
                      onChange={handlePaymentChange}
                    />
                    <div className="checkoutPaymentMethod">
                      <span>Direct Bank Transfer</span>
                      <p>Transfer funds directly to our corporate bank account.</p>
                    </div>
                  </label> */}
                </div>

                {(orderError || sslError) && (
                  <div style={{ color: "#e53e3e", marginBottom: "15px", fontWeight: "500" }}>
                    {orderError || sslError}
                  </div>
                )}

                <button
                  disabled={submittingOrder || sslLoading}
                  onClick={async (e) => {
                    e.preventDefault();
                    setSslError("");
                    if (!validateForm()) {
                      return;
                    }
                    try {
                      const payload = {
                        customer_email: billingForm.email,
                        customer_phone: billingForm.phone,
                        billing_address: billingForm,
                        shipping_address: billingForm,
                        payment_method: selectedPayment || "Cash on delivery",
                        coupon_code: appliedCoupon?.code || null,
                        order_notes: billingForm.notes || null,
                        items: cartItems.map((item) => ({
                          product_id: item.productID,
                          quantity: item.quantity,
                        })),
                      };

                      if (selectedPayment === "SSLCommerz (bKash / Nagad / Cards)") {
                        setSslLoading(true);
                        try {
                          const res = await orderService.initiateSSLCommerzPayment(payload);
                          if (res.status === "success" && res.gateway_url) {
                            dispatch(clearCart());
                            window.location.href = res.gateway_url;
                            return;
                          } else {
                            setSslError(res.message || "Failed to initiate SSLCommerz gateway.");
                          }
                        } catch (err) {
                          setSslError(err.message || "Could not connect to SSLCommerz payment gateway.");
                        } finally {
                          setSslLoading(false);
                        }
                      } else {
                        await placeOrder(payload);
                        dispatch(clearCart());
                        handleTabClick("cartTab3");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setPayments(true);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  {sslLoading ? "Redirecting to SSLCommerz..." : submittingOrder ? "Processing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Order Complete */}
          {activeTab === "cartTab3" && (
            <div className="orderCompleteSection">
              <div className="orderComplete">
                <div className="orderCompleteMessage">
                  <div className="orderCompleteMessageImg">
                    <img src={success} alt="Success" />
                  </div>
                  <h3>Your Order is Completed!</h3>
                  <p>Thank you! Your order has been placed successfully in our system.</p>
                </div>
                <div className="orderInfo">
                  <div className="orderInfoItem">
                    <p>Order Number</p>
                    <h4>{fetchedOrder?.order_number || sslOrderNum || createdOrder?.order_number || `#ORD-${orderNumber}`}</h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Date</p>
                    <h4>{fetchedOrder?.created_at ? formatDate(new Date(fetchedOrder.created_at)) : formatDate(currentDate)}</h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Grand Total</p>
                    <h4>৳{Number(fetchedOrder?.grand_total || createdOrder?.grand_total || numGrandTotal).toFixed(2)}</h4>
                  </div>
                  <div className="orderInfoItem">
                    <p>Payment Method</p>
                    <h4>{fetchedOrder?.payment_method || createdOrder?.payment_method || selectedPayment}</h4>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "30px" }}>
                  <Link to="/shop" onClick={scrollToTop}>
                    <button style={{ padding: "12px 30px", background: "#000", color: "#fff", border: "none", cursor: "pointer", borderRadius: "4px" }}>
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
