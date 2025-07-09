import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from "../assets/browse lights.png";
import "../styles/pages/Products.css";
import { publicProductService } from "../services/publicService";
import ProductCard from "../component/ProductCard";
import { publicCollectionService } from "../services/publicService";

const applicationOptions = [
  "All",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Office",
  "Hallway"
];
const wattageOptions = [
  "All",
  "8W",
  "10W",
  "12W",
  "15W",
  "18W",
  "20W"
];

const colorOptions = [
  "All",
  "White",
  "Warm White",
  "Cool White"
];

const priceRanges = [
  "All",
  "Under $30",
  "$30 - $50",
  "$50 - $70",
  "Over $70"
];

const Products = () => {
  const [application, setApplication] = useState("All");
  const [wattage, setWattage] = useState("All");
  const [color, setColor] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [appDropdown, setAppDropdown] = useState(false);
  const [wattDropdown, setWattDropdown] = useState(false);
  const [colorDropdown, setColorDropdown] = useState(false);
  const [priceDropdown, setPriceDropdown] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);

  React.useEffect(() => {
    setLoading(true);
    publicProductService.getProducts()
      .then((res) => {
        setProducts(res.data.data || res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
    // Fetch collections
    publicCollectionService.getCollections().then((res) => {
      setCollections(res.data);
    });
  }, []);

  // Only one dropdown open at a time
  const handleAppDropdown = () => {
    setAppDropdown(v => !v);
    setWattDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };
  const handleWattDropdown = () => {
    setWattDropdown(v => !v);
    setAppDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };
  const handleColorDropdown = () => {
    setColorDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setPriceDropdown(false);
  };
  const handlePriceDropdown = () => {
    setPriceDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
  };

  const filteredProducts = products.filter(p => {
    const variation = p.ProductVariations && p.ProductVariations[0];
    const matchesApplication = application === "All" || (variation && variation.usecase === application);
    const matchesWattage = wattage === "All" || (variation && variation.wattage === wattage);
    const matchesColor = color === "All" || (variation && variation.color === color);
    let matchesPrice = true;
    if (priceRange !== "All" && variation && variation.price) {
      const price = parseFloat(variation.price);
      switch (priceRange) {
        case "Under $30":
          matchesPrice = price < 30;
          break;
        case "$30 - $50":
          matchesPrice = price >= 30 && price <= 50;
          break;
        case "$50 - $70":
          matchesPrice = price > 50 && price <= 70;
          break;
        case "Over $70":
          matchesPrice = price > 70;
          break;
        default:
          matchesPrice = true;
      }
    }
    return matchesApplication && matchesWattage && matchesColor && matchesPrice;
  });

  const clearAllFilters = () => {
    setApplication("All");
    setWattage("All");
    setColor("All");
    setPriceRange("All");
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  return (
    <>
      <Header />
      <div className="products">
        <div className="product-container">
          <div className="hero-title">
            <h1>DOWNLIGHTS</h1>
          </div>
        </div>
        <div className="browse-lights">
          <img src={browselights} alt="browse" className="browse-lights-img" />
          <span className="browse-lights-title">Browse Lights</span>
        </div>
        <div className="browse-lights-content">
          <div className="filter-box">
            <div className="filter-title">
              <div className="filter-title-left">
                <span className="filter-icon">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5H17M5 10H15M8 15H12" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                Filters
              </div>
              <button 
                className="clear-all-btn"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>
            <div className={`filter-section${appDropdown ? ' open' : ''}`} onClick={handleAppDropdown}>
              Application
              <span className={`chevron${appDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${appDropdown ? ' open' : ''}`}> 
              {appDropdown && applicationOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${application === opt ? ' selected' : ''}`}
                  onClick={() => { setApplication(opt); setAppDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${wattDropdown ? ' open' : ''}`} onClick={handleWattDropdown}>
              Wattage
              <span className={`chevron${wattDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${wattDropdown ? ' open' : ''}`}> 
              {wattDropdown && wattageOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${wattage === opt ? ' selected' : ''}`}
                  onClick={() => { setWattage(opt); setWattDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${colorDropdown ? ' open' : ''}`} onClick={handleColorDropdown}>
              Color
              <span className={`chevron${colorDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${colorDropdown ? ' open' : ''}`}> 
              {colorDropdown && colorOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${color === opt ? ' selected' : ''}`}
                  onClick={() => { setColor(opt); setColorDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${priceDropdown ? ' open' : ''}`} onClick={handlePriceDropdown}>
              Price Range
              <span className={`chevron${priceDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${priceDropdown ? ' open' : ''}`}> 
              {priceDropdown && priceRanges.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${priceRange === opt ? ' selected' : ''}`}
                  onClick={() => { setPriceRange(opt); setPriceDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

          <button className="mobile-filter-trigger" onClick={toggleMobileFilter}>
            <span className="mobile-filter-label">Filters</span>
            <span className="mobile-filter-chevron">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          <div className={`mobile-filter-overlay${isMobileFilterOpen ? ' open' : ''}`} onClick={closeMobileFilter} />
          <div className={`mobile-filter-drawer${isMobileFilterOpen ? ' open' : ''}`}>
            <button className="mobile-filter-close" onClick={closeMobileFilter}>×</button>
            <div className="drawer-title">
              <span>FILTERS</span>
              <button 
                className="clear-all-btn"
                onClick={() => {
                  clearAllFilters();
                  closeMobileFilter();
                }}
              >
                Clear All
              </button>
            </div>
            <div className="mobile-filter-content">
              <div className="mobile-filter-section">
                <div className={`filter-section${appDropdown ? ' open' : ''}`} onClick={handleAppDropdown}>
                  Application
                  <span className={`chevron${appDropdown ? ' open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className={`dropdown-menu${appDropdown ? ' open' : ''}`}>
                  {applicationOptions.map(opt => (
                    <div
                      key={opt}
                      className={`dropdown-item${application === opt ? ' selected' : ''}`}
                      onClick={() => { setApplication(opt); setAppDropdown(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mobile-filter-section">
                <div className={`filter-section${wattDropdown ? ' open' : ''}`} onClick={handleWattDropdown}>
                  Wattage
                  <span className={`chevron${wattDropdown ? ' open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className={`dropdown-menu${wattDropdown ? ' open' : ''}`}>
                  {wattageOptions.map(opt => (
                    <div
                      key={opt}
                      className={`dropdown-item${wattage === opt ? ' selected' : ''}`}
                      onClick={() => { setWattage(opt); setWattDropdown(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mobile-filter-section">
                <div className={`filter-section${colorDropdown ? ' open' : ''}`} onClick={handleColorDropdown}>
                  Color
                  <span className={`chevron${colorDropdown ? ' open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className={`dropdown-menu${colorDropdown ? ' open' : ''}`}>
                  {colorOptions.map(opt => (
                    <div
                      key={opt}
                      className={`dropdown-item${color === opt ? ' selected' : ''}`}
                      onClick={() => { setColor(opt); setColorDropdown(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mobile-filter-section">
                <div className={`filter-section${priceDropdown ? ' open' : ''}`} onClick={handlePriceDropdown}>
                  Price Range
                  <span className={`chevron${priceDropdown ? ' open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className={`dropdown-menu${priceDropdown ? ' open' : ''}`}>
                  {priceRanges.map(opt => (
                    <div
                      key={opt}
                      className={`dropdown-item${priceRange === opt ? ' selected' : ''}`}
                      onClick={() => { setPriceRange(opt); setPriceDropdown(false); }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="products-grid">
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div>No products found.</div>
            ) : (
              filteredProducts.map((product, idx) => {
                const collection = collections.find(
                  (c) => c.id === product.collection_id
                );
                return (
                  <ProductCard
                    product={product}
                    key={product._id || product.id || idx}
                    categoryName={collection ? collection.name : "-"}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
