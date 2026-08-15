import React, { useState, useEffect } from "react";
import "./Filter.css";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import Slider from "@mui/material/Slider";
import productService from "../../../Services/productService";

const Filter = ({ filters = {}, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [dbMinPrice, setDbMinPrice] = useState(0);
  const [dbMaxPrice, setDbMaxPrice] = useState(1000);

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        const res = await productService.getFilterOptions();
        if (res?.status === "success" && res?.data) {
          const { categories: catData, brands: brandData, min_price, max_price } = res.data;
          setCategories(catData || []);
          setBrands(brandData || []);
          const minP = min_price ?? 0;
          const maxP = max_price ?? 1000;
          setDbMinPrice(minP);
          setDbMaxPrice(maxP);

          setPriceRange([
            filters.min_price ? Number(filters.min_price) : minP,
            filters.max_price ? Number(filters.max_price) : maxP,
          ]);
        }
      } catch (err) {
        console.error("Failed to load filter options", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    setPriceRange([
      filters.min_price ? Number(filters.min_price) : dbMinPrice,
      filters.max_price ? Number(filters.max_price) : dbMaxPrice,
    ]);
  }, [filters.min_price, filters.max_price, dbMinPrice, dbMaxPrice]);

  const handleCategoryClick = (catName) => {
    const activeVal = (filters.category || "").toLowerCase();
    const targetName = (catName || "").toLowerCase();
    const isCurrentlyActive = activeVal && (activeVal === targetName || activeVal.includes(targetName) || targetName.includes(activeVal));
    const newCat = isCurrentlyActive ? "" : catName;
    if (onFilterChange) {
      onFilterChange({ category: newCat });
    }
  };

  const handleBrandChange = (brandName) => {
    const newBrand = filters.brand === brandName ? "" : brandName;
    if (onFilterChange) {
      onFilterChange({ brand: newBrand });
    }
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceCommitted = (event, newValue) => {
    if (onFilterChange) {
      onFilterChange({
        min_price: newValue[0],
        max_price: newValue[1],
      });
    }
  };

  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setPriceRange([dbMinPrice, dbMaxPrice]);
    setSelectedColors([]);
    setSelectedSizes([]);
    if (onFilterChange) {
      onFilterChange({
        category: "",
        brand: "",
        min_price: "",
        max_price: "",
        search: "",
      });
    }
  };

  const filteredBrands = brands.filter((b) =>
    (b.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filterColors = [
    "#0B2472",
    "#D6BB4F",
    "#282828",
    "#B0D6E8",
    "#9C7539",
    "#D29B47",
    "#E5AE95",
    "#D76B67",
    "#BABABA",
    "#BFDCC4",
  ];

  const filterSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.brand ||
    filters.min_price ||
    filters.max_price ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0
  );

  return (
    <div>
      <div className="filterSection">
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              width: "100%",
              padding: "8px 14px",
              marginBottom: "15px",
              background: "#e53e3e",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            Clear All Filters ✕
          </button>
        )}

        {/* Categories Section */}
        <div className="filterCategories">
          <Accordion defaultExpanded disableGutters elevation={0}>
            <AccordionSummary
              expandIcon={<IoIosArrowDown size={20} />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{ padding: 0, marginBottom: 2 }}
            >
              <h5 className="filterHeading">Product Categories</h5>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              {categories.length > 0 ? (
                categories.map((category) => {
                  const filterVal = (filters.category || "").toLowerCase();
                  const catName = (category.name || "").toLowerCase();
                  const catSlug = (category.slug || "").toLowerCase();

                  const isActive = Boolean(
                    filterVal &&
                    (filterVal === catName ||
                     filterVal === catSlug ||
                     catName.includes(filterVal) ||
                     filterVal.includes(catName))
                  );

                  return (
                    <p
                      key={category.id || category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      style={{
                        cursor: "pointer",
                        fontWeight: isActive ? "bold" : "normal",
                        color: isActive ? "#3046d9" : "#555",
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        backgroundColor: isActive ? "#edf2ff" : "transparent",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{category.name}</span>
                      {category.products_count !== undefined && (
                        <span style={{ fontSize: "0.85em", color: isActive ? "#3046d9" : "#888" }}>
                          ({category.products_count})
                        </span>
                      )}
                    </p>
                  );
                })
              ) : (
                <p style={{ color: "#888", fontSize: "0.9rem" }}>No categories found</p>
              )}
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Brands Section */}
        <div className="filterBrands">
          <Accordion defaultExpanded disableGutters elevation={0}>
            <AccordionSummary
              expandIcon={<IoIosArrowDown size={20} />}
              aria-controls="panel2-content"
              id="panel2-header"
              sx={{ padding: 0, marginBottom: 2 }}
            >
              <h5 className="filterHeading">Brands</h5>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <div className="searchBar">
                <BiSearch className="searchIcon" size={20} color={"#767676"} />
                <input
                  type="text"
                  placeholder="Search brand"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="brandList" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => {
                    const isChecked = filters.brand === brand.name;
                    return (
                      <div
                        className="brandItem"
                        key={brand.id || brand.name}
                        onClick={() => handleBrandChange(brand.name)}
                        style={{ cursor: "pointer", padding: "3px 0" }}
                      >
                        <input
                          type="checkbox"
                          name="brand"
                          checked={isChecked}
                          onChange={() => {}}
                          className="brandRadio"
                        />
                        <label className="brandLabel" style={{ cursor: "pointer", fontWeight: isChecked ? "600" : "normal" }}>
                          {brand.name}
                        </label>
                        <span className="brandCount">({brand.products_count || 0})</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="notFoundMessage">No brands found</div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Dynamic Price Range Section */}
        <div className="filterPrice">
          <Accordion defaultExpanded disableGutters elevation={0}>
            <AccordionSummary
              expandIcon={<IoIosArrowDown size={20} />}
              aria-controls="panel3-content"
              id="panel3-header"
              sx={{ padding: 0, marginBottom: 2 }}
            >
              <h5 className="filterHeading">Price</h5>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <Slider
                min={dbMinPrice}
                max={dbMaxPrice}
                value={priceRange}
                onChange={handlePriceChange}
                onChangeCommitted={handlePriceCommitted}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => `৳${val}`}
                sx={{
                  color: "black",
                  "& .MuiSlider-thumb": {
                    backgroundColor: "white",
                    border: "2px solid black",
                    width: 18,
                    height: 18,
                  },
                }}
              />

              <div className="filterSliderPrice">
                <div className="priceRange">
                  <p>
                    Min Price: <span>৳{priceRange[0]}</span>
                  </p>
                  <p>
                    Max Price: <span>৳{priceRange[1]}</span>
                  </p>
                </div>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Colors Section */}
        <div className="filterColors">
          <Accordion defaultExpanded disableGutters elevation={0}>
            <AccordionSummary
              expandIcon={<IoIosArrowDown size={20} />}
              aria-controls="panel4-content"
              id="panel4-header"
              sx={{ padding: 0, marginBottom: 2 }}
            >
              <h5 className="filterHeading">Color</h5>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <div className="filterColorBtn">
                {filterColors.map((color, index) => (
                  <button
                    key={index}
                    className={`colorButton ${selectedColors.includes(color) ? "selected" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>

        {/* Sizes Section */}
        <div className="filterSizes">
          <Accordion defaultExpanded disableGutters elevation={0}>
            <AccordionSummary
              expandIcon={<IoIosArrowDown size={20} />}
              aria-controls="panel5-content"
              id="panel5-header"
              sx={{ padding: 0, marginBottom: 2 }}
            >
              <h5 className="filterHeading">Sizes</h5>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <div className="sizeButtons">
                {filterSizes.map((size, index) => (
                  <button
                    key={index}
                    className={`sizeButton ${selectedSizes.includes(size) ? "selected" : ""}`}
                    onClick={() => handleSizeChange(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Filter;
