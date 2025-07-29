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
  "Under ₹30",
  "₹30 - ₹50",
  "₹50 - ₹70",
  "Over ₹70"
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
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsRes = await publicProductService.getProducts();
        const productsData = productsRes.data.data || productsRes.data || [];
        console.log("Fetched products:", productsData);
        setProducts(productsData);

        // Fetch collections
        const collectionsRes = await publicCollectionService.getCollections();
        const collectionsData = collectionsRes.data.data || collectionsRes.data || [];
        console.log("Fetched collections:", collectionsData);
        setCollections(collectionsData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load products");
        setProducts([]);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get attribute value from variation
  const getAttributeValue = (variation, attributeName) => {
    if (!variation.attributes || !Array.isArray(variation.attributes)) {
      return null;
    }
    
    const attribute = variation.attributes.find(
      attr => attr.name && attr.name.toLowerCase() === attributeName.toLowerCase()
    );
    
    return attribute ? attribute.value : null;
  };

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

  const filteredProducts = products.filter(product => {
    // Get the first variation for filtering (you might want to modify this logic)
    const variation = product.ProductVariations && product.ProductVariations[0];
    
    if (!variation) return false;

    // Application filter - check usecase field
    const matchesApplication = application === "All" || 
      (variation.usecase && variation.usecase.toLowerCase().includes(application.toLowerCase()));

    // Wattage filter - check wattage attribute
    const wattageValue = getAttributeValue(variation, "wattage");
    const matchesWattage = wattage === "All" || 
      (wattageValue && wattageValue.toLowerCase().includes(wattage.toLowerCase()));

    // Color filter - check color attribute
    const colorValue = getAttributeValue(variation, "color");
    const matchesColor = color === "All" || 
      (colorValue && colorValue.toLowerCase().includes(color.toLowerCase()));

    // Price filter
    let matchesPrice = true;
    if (priceRange !== "All" && variation.price) {
      const price = parseFloat(variation.price);
      switch (priceRange) {
        case "Under ₹30":
          matchesPrice = price < 30;
          break;
        case "₹30 - ₹50":
          matchesPrice = price >= 30 && price <= 50;
          break;
        case "₹50 - ₹70":
          matchesPrice = price > 50 && price <= 70;
          break;
        case "Over ₹70":
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
            
            {/* Application Filter */}
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

            {/* Wattage Filter */}
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

            {/* Color Filter */}
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

            {/* Price Filter */}
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

          {/* Mobile Filter Button */}
          <button className="mobile-filter-trigger" onClick={toggleMobileFilter}>
            <span className="mobile-filter-label">Filters</span>
            <span className="mobile-filter-chevron">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          {/* Mobile Filter Overlay and Drawer */}
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
              {/* Mobile Application Filter */}
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

              {/* Mobile Wattage Filter */}
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

              {/* Mobile Color Filter */}
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

              {/* Mobile Price Filter */}
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

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                gridColumn: '1 / -1'
              }}>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div style={{ 
                color: 'red', 
                textAlign: 'center', 
                padding: '40px 20px',
                gridColumn: '1 / -1'
              }}>
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                gridColumn: '1 / -1',
                color: '#666'
              }}>
                <p>No products found matching your filters.</p>
                <button 
                  onClick={clearAllFilters}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const collection = collections.find(
                  (c) => c.id === product.collection_id
                );
                return (
                  <ProductCard
                    product={product}
                    key={product.id || product._id}
                    categoryName={collection ? collection.name : "Uncategorized"}
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