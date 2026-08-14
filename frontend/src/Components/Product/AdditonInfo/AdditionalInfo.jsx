import React, { useState } from "react";
import "./AdditionalInfo.css";

import { FaStar } from "react-icons/fa";
import Rating from "@mui/material/Rating";
import authService from "../../../Services/authService";
import productService from "../../../Services/productService";
import toast from "react-hot-toast";

const AdditionalInfo = ({ product, onReviewSubmitted }) => {
  const [activeTab, setActiveTab] = useState("aiTab1");
  const currentUser = authService.getCurrentUser();

  const [ratingVal, setRatingVal] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState(currentUser?.name || "");
  const [reviewerEmail, setReviewerEmail] = useState(currentUser?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!product?.id) {
      setFormError("Product not found.");
      return;
    }

    if (!reviewerName.trim() || !reviewerEmail.trim() || !comment.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail,
        rating: ratingVal,
        comment: comment,
      };

      const res = await productService.submitReview(product.id, payload);
      if (res?.status === "success") {
        toast.success("Review submitted successfully!", {
          duration: 2500,
          style: { backgroundColor: "#07bc0c", color: "white" },
        });
        setComment("");
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      setFormError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewsList = product?.reviews || [];
  const reviewsCount = reviewsList.length;

  return (
    <>
      <div className="productAdditionalInfo">
        <div className="productAdditonalInfoContainer">
          <div className="productAdditionalInfoTabs">
            <div className="aiTabs">
              <p
                onClick={() => handleTabClick("aiTab1")}
                className={activeTab === "aiTab1" ? "aiActive" : ""}
              >
                Description
              </p>
              <p
                onClick={() => handleTabClick("aiTab2")}
                className={activeTab === "aiTab2" ? "aiActive" : ""}
              >
                Additional Information
              </p>
              <p
                onClick={() => handleTabClick("aiTab3")}
                className={activeTab === "aiTab3" ? "aiActive" : ""}
              >
                Reviews ({reviewsCount})
              </p>
            </div>
          </div>

          <div className="productAdditionalInfoContent">
            {/* Tab 1: Description */}
            {activeTab === "aiTab1" && (
              <div className="aiTabDescription">
                <div className="descriptionPara">
                  <h3>{product?.name || "Product Overview"}</h3>
                  <p style={{ lineHeight: "1.7", color: "#555" }}>
                    {product?.description || product?.short_description || "No detailed description available for this product."}
                  </p>
                </div>

                {product?.key_features && (
                  <div className="descriptionPara" style={{ marginTop: "20px" }}>
                    <h3>Key Features</h3>
                    <p style={{ lineHeight: "1.7", color: "#555" }}>{product.key_features}</p>
                  </div>
                )}

                {product?.materials_care && (
                  <div className="descriptionPara" style={{ marginTop: "20px" }}>
                    <h3>Materials & Care</h3>
                    <p style={{ marginTop: "5px", color: "#555" }}>{product.materials_care}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Additional Information */}
            {activeTab === "aiTab2" && (
              <div className="aiTabAdditionalInfo">
                <div className="additionalInfoContainer">
                  <h6>Brand</h6>
                  <p>{product?.brand?.name || "Generic"}</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Category</h6>
                  <p>{product?.categories?.map((c) => c.name).join(", ") || "General"}</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>SKU</h6>
                  <p>{product?.sku || "N/A"}</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Weight</h6>
                  <p>{product?.weight ? `${product.weight} kg` : "Standard"}</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Dimensions</h6>
                  <p>{product?.dimensions || "Standard"}</p>
                </div>
                {product?.storage_spec && (
                  <div className="additionalInfoContainer">
                    <h6>Storage / Spec</h6>
                    <p>{product.storage_spec}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Reviews */}
            {activeTab === "aiTab3" && (
              <div className="aiTabReview">
                <div className="aiTabReviewContainer">
                  <h3>Customer Reviews ({reviewsCount})</h3>

                  <div className="userReviews">
                    {reviewsList.length > 0 ? (
                      reviewsList.map((rev) => (
                        <div
                          key={rev.id}
                          className="userReview"
                          style={{ borderBottom: "1px solid #e4e4e4", paddingBottom: "20px", marginBottom: "20px" }}
                        >
                          <div
                            className="userReviewImg"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "#222",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: "1.1rem",
                            }}
                          >
                            {(rev.reviewer_name || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="userReviewContent" style={{ flex: 1 }}>
                            <div className="userReviewTopContent">
                              <div className="userNameRating">
                                <h6>{rev.reviewer_name}</h6>
                                <div className="userRating" style={{ display: "flex", gap: "2px" }}>
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      color={i < rev.rating ? "#FEC78A" : "#e4e4e4"}
                                      size={12}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="userDate">
                                <p>{new Date(rev.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</p>
                              </div>
                            </div>
                            <div className="userReviewBottomContent" style={{ marginTop: "8px" }}>
                              <p>{rev.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#777", marginBottom: "30px" }}>No reviews yet for this product. Be the first to review!</p>
                    )}
                  </div>

                  {/* Add New Review Form */}
                  <div className="userNewReview">
                    <div className="userNewReviewMessage">
                      <h5>Add a Review for "{product?.name}"</h5>
                      <p>Your email address will not be published. Required fields are marked *</p>
                    </div>

                    <div className="userNewReviewRating" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "15px 0" }}>
                      <label style={{ fontWeight: "600" }}>Your Rating *</label>
                      <Rating
                        name="product-rating"
                        value={ratingVal}
                        size="medium"
                        onChange={(e, val) => setRatingVal(val || 5)}
                      />
                    </div>

                    {formError && (
                      <div style={{ color: "#e53e3e", marginBottom: "15px", fontWeight: "500" }}>
                        {formError}
                      </div>
                    )}

                    <div className="userNewReviewForm">
                      <form onSubmit={handleReviewSubmit}>
                        <textarea
                          cols={30}
                          rows={5}
                          placeholder="Your Review *"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Name *"
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          required
                          className="userNewReviewFormInput"
                        />
                        <input
                          type="email"
                          placeholder="Email address *"
                          value={reviewerEmail}
                          onChange={(e) => setReviewerEmail(e.target.value)}
                          required
                          className="userNewReviewFormInput"
                        />
                        <button type="submit" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdditionalInfo;
