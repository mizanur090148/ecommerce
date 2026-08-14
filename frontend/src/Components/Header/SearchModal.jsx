import React, { useState, useEffect, useRef } from "react";
import "./SearchModal.css";
import { FiSearch } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import productService from "../../Services/productService";

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setSearchTerm("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced Search Query Effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await productService.getProducts({
          search: searchTerm.trim(),
          per_page: 6,
        });

        if (response?.status === "success" && response?.data) {
          const productList = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
          setResults(productList);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="searchModalOverlay" onClick={onClose}>
      <div className="searchModalContainer" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSearchSubmit} className="searchModalHeader">
          <div className="searchModalInputWrapper">
            <FiSearch size={22} color="#718096" />
            <input
              ref={inputRef}
              type="text"
              className="searchModalInput"
              placeholder="Search products by name, category, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="button" className="searchModalCloseBtn" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </form>

        <div className="searchModalBody">
          {loading && (
            <div className="searchStatusMessage">
              <p>Searching catalog for "{searchTerm}"...</p>
            </div>
          )}

          {!loading && hasSearched && results.length === 0 && (
            <div className="searchStatusMessage">
              <p>No products found matching "{searchTerm}"</p>
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="searchStatusMessage">
              <p>Type at least 1 character to search products instantly</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="searchResultsList">
              {results.map((product) => {
                const primaryImg =
                  product.primary_image?.url || product.images?.[0]?.url || "";
                const categoryName = product.categories?.[0]?.name || "Product";

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className="searchResultItem"
                    onClick={onClose}
                  >
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="searchResultImg"
                    />
                    <div className="searchResultInfo">
                      <span className="searchResultCategory">{categoryName}</span>
                      <h5 className="searchResultTitle">{product.name}</h5>
                      <span className="searchResultPrice">
                        ৳{product.sale_price || product.price}
                        {product.sale_price && (
                          <span className="searchResultOldPrice">৳{product.price}</span>
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="searchModalFooter">
            <button type="button" className="searchViewAllBtn" onClick={handleSearchSubmit}>
              View all results for "{searchTerm}" →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
