import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from '../assets/browse lights.webp';
import "../styles/pages/Products.css";
import { publicProductService } from "../services/publicService";
import ProductCard from "../component/ProductCard";
import FAQ from "../component/FAQ"

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState("All");
  const [wattage, setWattage] = useState("All");
  const [color, setColor] = useState("All");
  const [appDropdown, setAppDropdown] = useState(false);
  const [wattDropdown, setWattDropdown] = useState(false);
  const [colorDropdown, setColorDropdown] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  // Dynamic filter states
  const [dynamicFilters, setDynamicFilters] = useState({});
  const [dynamicDropdowns, setDynamicDropdowns] = useState({});
  const [isFiltersInitialized, setIsFiltersInitialized] = useState(false);

  // Generate filter options from actual product data
  const generateFilterOptions = () => {
    const applications = new Set();
    const wattages = new Set();
    const colors = new Set();
    const dynamicAttributeFilters = {};

    products.forEach(product => {
      if (product.ProductVariations) {
        product.ProductVariations.forEach(variation => {
          // Extract applications from usecase
          if (variation.usecase) {
            // Split comma-separated values and add each one individually
            variation.usecase.split(',').forEach(use => {
              const trimmedUse = use.trim();
              if (trimmedUse) {
                applications.add(trimmedUse);
              }
            });
          }

          // Extract all attributes dynamically
          if (variation.attributes) {
            variation.attributes.forEach(attr => {
              if (attr.name && attr.value) {
                const attrName = attr.name.toLowerCase();
                
                // Handle special cases for existing filters
                if (attrName === 'watt' || attrName === 'wattage') {
                  const values = attr.value.split(',').map(v => v.trim()).filter(v => v);
                  values.forEach(value => wattages.add(value));
                } else if (attrName === 'color') {
                  const values = attr.value.split(',').map(v => v.trim()).filter(v => v);
                  values.forEach(value => colors.add(value));
                } else {
                  // Create dynamic filter for other attributes
                  if (!dynamicAttributeFilters[attr.name]) {
                    dynamicAttributeFilters[attr.name] = new Set();
                  }
                  const values = attr.value.split(',').map(v => v.trim()).filter(v => v);
                  values.forEach(value => dynamicAttributeFilters[attr.name].add(value));
                }
              }
            });
          }
        });
      }
    });

    // Convert dynamic attribute filters to arrays
    const dynamicFilters = {};
    Object.keys(dynamicAttributeFilters).forEach(attrName => {
      dynamicFilters[attrName] = ["All", ...Array.from(dynamicAttributeFilters[attrName]).sort()];
    });

    return {
      applications: ["All", ...Array.from(applications).sort()],
      wattages: ["All", ...Array.from(wattages).sort()],
      colors: ["All", ...Array.from(colors).sort()],
      dynamic: dynamicFilters
    };
  };

  const filterOptions = generateFilterOptions();
  
  // Debug: Log filter options
  console.log('Generated filter options:', filterOptions);
  console.log('Wattage options:', filterOptions.wattages);
  
  // Initialize dynamic filters when products are loaded
  useEffect(() => {
    if (products.length > 0 && !isFiltersInitialized) {
      const initialDynamicFilters = {};
      Object.keys(filterOptions.dynamic).forEach(attrName => {
        initialDynamicFilters[attrName] = "All";
      });
      setDynamicFilters(initialDynamicFilters);
      setIsFiltersInitialized(true);
    }
  }, [products, filterOptions.dynamic, isFiltersInitialized]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsRes = await publicProductService.getProducts();
        const productsData = productsRes.data.data || productsRes.data || [];
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage = "Failed to load products";
        setError(errorMessage);
        toast.error(errorMessage);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle URL parameters for collection filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const collectionParam = urlParams.get('collection');
    
    if (collectionParam) {
      setSelectedCollection(collectionParam);
    }
  }, [location.search]);

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

  // Helper function to check if any variation matches the filter
  const checkVariationFilter = (product, filterType, filterValue) => {
    if (!product.ProductVariations || product.ProductVariations.length === 0) {
      return false;
    }

    return product.ProductVariations.some(variation => {
      switch (filterType) {
        case 'application':
          if (!variation.usecase) return false;
          // Check if any of the comma-separated use cases match the filter
          return variation.usecase.split(',').some(use => 
            use.trim().toLowerCase().includes(filterValue.toLowerCase())
          );
        case 'wattage':
          const wattageValue = getAttributeValue(variation, 'watt') || getAttributeValue(variation, 'wattage');
          console.log('Wattage filtering - Product:', product.name, 'Variation:', variation.sku, 'WattageValue:', wattageValue, 'FilterValue:', filterValue);
          if (!wattageValue) return false;
          const wattageValues = wattageValue.split(',').map(v => v.trim().toLowerCase());
          const matches = wattageValues.includes(filterValue.toLowerCase());
          console.log('Wattage values:', wattageValues, 'Matches:', matches);
          return matches;
        case 'color':
          const colorValue = getAttributeValue(variation, 'color');
          if (!colorValue) return false;
          const colorValues = colorValue.split(',').map(v => v.trim().toLowerCase());
          return colorValues.includes(filterValue.toLowerCase());
        default:
          return false;
      }
    });
  };

  // Helper function to check dynamic attribute filters
  const checkDynamicFilter = (product, attributeName, filterValue) => {
    if (!product.ProductVariations || product.ProductVariations.length === 0) {
      return false;
    }

    return product.ProductVariations.some(variation => {
      const attributeValue = getAttributeValue(variation, attributeName);
      if (!attributeValue) return false;
      
      const values = attributeValue.split(',').map(v => v.trim().toLowerCase());
      return values.includes(filterValue.toLowerCase());
    });
  };

  // Dropdown handlers
  const handleAppDropdown = () => {
    setAppDropdown(v => !v);
    setWattDropdown(false);
    setColorDropdown(false);
    setDynamicDropdowns({});
  };

  const handleWattDropdown = () => {
    setWattDropdown(v => !v);
    setAppDropdown(false);
    setColorDropdown(false);
    setDynamicDropdowns({});
  };

  const handleColorDropdown = () => {
    setColorDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setDynamicDropdowns({});
  };

  const handleDynamicDropdown = (attributeName) => {
    setDynamicDropdowns(prev => ({
      ...prev,
      [attributeName]: !prev[attributeName]
    }));
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
    Object.keys(dynamicDropdowns).forEach(key => {
      if (key !== attributeName) {
        setDynamicDropdowns(prev => ({ ...prev, [key]: false }));
      }
    });
  };

  const handleDynamicFilterChange = (attributeName, value) => {
    setDynamicFilters(prev => ({
      ...prev,
      [attributeName]: value
    }));
    setDynamicDropdowns(prev => ({
      ...prev,
      [attributeName]: false
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesCollection = !selectedCollection || 
      (product.Collection && product.Collection.name === selectedCollection);

    const matchesApplication = application === "All" || 
      checkVariationFilter(product, 'application', application);

    const matchesWattage = wattage === "All" || 
      checkVariationFilter(product, 'wattage', wattage);

    const matchesColor = color === "All" || 
      checkVariationFilter(product, 'color', color);

    const matchesDynamicFilters = Object.keys(dynamicFilters).every(attrName => {
      const filterValue = dynamicFilters[attrName];
      return filterValue === "All" || checkDynamicFilter(product, attrName, filterValue);
    });

    return matchesCollection && matchesApplication && matchesWattage && matchesColor && matchesDynamicFilters;
  });

  const clearAllFilters = () => {
    setApplication("All");
    setWattage("All");
    setColor("All");
    setSelectedCollection(null);
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
    
    const resetDynamicFilters = {};
    Object.keys(filterOptions.dynamic).forEach(attrName => {
      resetDynamicFilters[attrName] = "All";
    });
    setDynamicFilters(resetDynamicFilters);
    setDynamicDropdowns({});
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
             
             {/* All Filters - No Categories */}
             {/* Application Filter */}
             {filterOptions.applications.length > 1 && (
               <div>
                 <div className={`filter-section${appDropdown ? ' open' : ''}`} onClick={handleAppDropdown}>
                   Application
                   <span className={`chevron${appDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </span>
                 </div>
                 <div className={`dropdown-menu${appDropdown ? ' open' : ''}`}> 
                   {appDropdown && filterOptions.applications.map(opt => (
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
             )}

             {/* Wattage Filter */}
             {filterOptions.wattages.length > 1 && (
               <div>
                 <div className={`filter-section${wattDropdown ? ' open' : ''}`} onClick={handleWattDropdown}>
                   Wattage
                   <span className={`chevron${wattDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </span>
                 </div>
                 <div className={`dropdown-menu${wattDropdown ? ' open' : ''}`}> 
                   {wattDropdown && filterOptions.wattages.map(opt => (
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
             )}

             {/* Color Filter */}
             {filterOptions.colors.length > 1 && (
               <div>
                 <div className={`filter-section${colorDropdown ? ' open' : ''}`} onClick={handleColorDropdown}>
                   Color
                   <span className={`chevron${colorDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </span>
                 </div>
                 <div className={`dropdown-menu${colorDropdown ? ' open' : ''}`}> 
                   {colorDropdown && filterOptions.colors.map(opt => (
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
             )}

             {/* Dynamic Attribute Filters */}
             {Object.keys(filterOptions.dynamic).map(attrName => (
               <div key={attrName}>
                 <div className={`filter-section${dynamicDropdowns[attrName] ? ' open' : ''}`} onClick={() => handleDynamicDropdown(attrName)}>
                   {attrName}
                   <span className={`chevron${dynamicDropdowns[attrName] ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </span>
                 </div>
                 <div className={`dropdown-menu${dynamicDropdowns[attrName] ? ' open' : ''}`}> 
                   {dynamicDropdowns[attrName] && filterOptions.dynamic[attrName].map(opt => (
                     <div
                       key={opt}
                       className={`dropdown-item${dynamicFilters[attrName] === opt ? ' selected' : ''}`}
                       onClick={() => handleDynamicFilterChange(attrName, opt)}
                     >
                       {opt}
                     </div>
                   ))}
                 </div>
               </div>
             ))}

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
               {filterOptions.applications.length > 1 && (
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
                     {filterOptions.applications.map(opt => (
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
               )}

               {/* Mobile Wattage Filter */}
               {filterOptions.wattages.length > 1 && (
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
                     {filterOptions.wattages.map(opt => (
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
               )}

               {/* Mobile Color Filter */}
               {filterOptions.colors.length > 1 && (
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
                     {filterOptions.colors.map(opt => (
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
               )}

               {/* Mobile Dynamic Attribute Filters */}
               {Object.keys(filterOptions.dynamic).map(attrName => (
                 <div key={attrName} className="mobile-filter-section">
                   <div className={`filter-section${dynamicDropdowns[attrName] ? ' open' : ''}`} onClick={() => handleDynamicDropdown(attrName)}>
                     {attrName}
                     <span className={`chevron${dynamicDropdowns[attrName] ? ' open' : ''}`}>
                       <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                     </span>
                   </div>
                   <div className={`dropdown-menu${dynamicDropdowns[attrName] ? ' open' : ''}`}>
                     {filterOptions.dynamic[attrName].map(opt => (
                       <div
                         key={opt}
                         className={`dropdown-item${dynamicFilters[attrName] === opt ? ' selected' : ''}`}
                         onClick={() => handleDynamicFilterChange(attrName, opt)}
                       >
                         {opt}
                       </div>
                     ))}
                   </div>
                 </div>
               ))}

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
                filteredProducts.map((product) => (
                  <ProductCard
                    product={product}
                    key={product.id || product._id}
                  />
                ))
              )}
            </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="faq-section">
        <FAQ />
      </div>
      
      <Footer />
    </>
  );
};

export default Products;
