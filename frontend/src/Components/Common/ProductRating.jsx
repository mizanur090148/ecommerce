import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductRating = ({
  rating = 0,
  reviewsCount = 0,
  size = 12,
  showCount = true,
  showScore = false,
  starColor = "#FEC78A",
  emptyColor = "#e4e4e4",
  hideIfZero = false,
}) => {
  const count = Number(reviewsCount) || 0;
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));

  if (hideIfZero && count === 0) {
    return null;
  }

  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating - fullStars >= 0.3 && numericRating - fullStars < 0.8;
  const roundedRating = numericRating - fullStars >= 0.8 ? fullStars + 1 : fullStars;

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars || (i === roundedRating && !hasHalfStar && roundedRating > fullStars)) {
      stars.push(<FaStar key={i} color={starColor} size={size} />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalfAlt key={i} color={starColor} size={size} />);
    } else {
      stars.push(<FaRegStar key={i} color={emptyColor} size={size} />);
    }
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>{stars}</div>
      {showScore && (
        <span style={{ fontSize: `${size + 1}px`, fontWeight: "600", color: "#333", marginLeft: "2px" }}>
          {numericRating.toFixed(1)}
        </span>
      )}
      {showCount && (
        <span style={{ fontSize: `${Math.max(10, size)}px`, color: "#777", marginLeft: "2px" }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default ProductRating;
