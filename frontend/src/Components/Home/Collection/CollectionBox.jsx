import React, { useEffect, useState } from "react";
import "./CollectionBox.css";
import { Link } from "react-router-dom";
import productService from "../../../Services/productService";

import col1 from "../../../Assets/Collection/collection1.jpg";
import col2 from "../../../Assets/Collection/collection2.jpg";
import col3 from "../../../Assets/Collection/collection3.jpg";

const defaultImages = [col1, col2, col3, col1];

const CollectionBox = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    productService
      .getFilterOptions()
      .then((res) => {
        if (res?.data?.special_categories && res.data.special_categories.length > 0) {
          setCategories(res.data.special_categories.slice(0, 4));
        } else if (res?.data?.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories.slice(0, 4));
        }
      })
      .catch((err) => console.error("Error loading special categories:", err));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Fallback default categories if API data not loaded
  const displayCategories = categories.length > 0 ? categories : [
    { name: "Women Collection", slug: "women", image: col1 },
    { name: "Men Collection", slug: "men", image: col2 },
    { name: "Kids Collection", slug: "kids", image: col3 },
    { name: "Accessories", slug: "accessories", image: col1 },
  ];

  return (
    <div className="specialCategoriesContainer">
      <div className="specialCategoriesHeader">
        <h2>
          OUR <span>SPECIAL CATEGORIES</span>
        </h2>
      </div>

      <div className="specialCategoriesGrid">
        {displayCategories.map((cat, idx) => {
          const bgImg = cat.image || defaultImages[idx % defaultImages.length];
          const catSlug = cat.slug || cat.name;

          return (
            <Link
              key={cat.id || idx}
              to={`/shop?category=${encodeURIComponent(catSlug)}`}
              onClick={scrollToTop}
              className="specialCategoryCard"
              style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%), url(${bgImg})` }}
            >
              <div className="specialCategoryContent">
                <h3 className="specialCategoryTitle">{cat.name}</h3>
                {cat.products_count !== undefined && cat.products_count > 0 && (
                  <span className="specialCategoryCount">{cat.products_count} Items</span>
                )}
                <div className="specialCategoryLink">
                  <span>Shop Now &rarr;</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionBox;
