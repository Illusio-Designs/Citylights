import React, { useState } from "react";
import { toast } from "react-toastify";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from "../assets/browse lights.png";
import "../styles/pages/Products.css";
import { publicProductService } from "../services/publicService";
import ProductCard from "../component/ProductCard";
import { publicCollectionService } from "../services/publicService";

const Products = () => {
  const [application, setApplication] = useState("All");
  const [wattage, setWattage] = useState("All");
  const [color, setColor] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [appDropdown, setAppDropdown] = useState(false);
  const [wattDropdown, setWattDropdown] = useState(false);
  const [colorDropdown, setColorDropdown] = useState(false);
  const [priceDropdown, setPriceDropdown] = useState(false);
  const [collectionDropdown, setCollectionDropdown] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  // Add state for selected collection
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Generate filter options from actual product data
  const generateFilterOptions = () => {
    const applications = new Set();
    const wattages = new Set();
    const colors = new Set();
    const prices = [];

    products.forEach(product => {
      if (product.ProductVariations) {
        product.ProductVariations.forEach(variation => {
          // Extract applications from usecase
          if (variation.usecase) {
            applications.add(variation.usecase);
          }

          // Extract wattages from attributes
          if (variation.attributes) {
            variation.attributes.forEach(attr => {
              if (attr.name && attr.name.toLowerCase() === 'watt') {
                // Split multiple values by comma and add each one
                const values = attr.value.split(',').map(v => v.trim()).filter(v => v);
                values.forEach(value => wattages.add(value));
              }
              if (attr.name && attr.name.toLowerCase() === 'color') {
                // Split multiple values by comma and add each one
                const values = attr.value.split(',').map(v => v.trim()).filter(v => v);
                values.forEach(value => colors.add(value));
              }
            });
          }

          // Extract prices
          if (variation.price) {
            prices.push(parseFloat(variation.price));
          }
        });
      }
    });

    // Generate price ranges based on actual data
    const priceRanges = ["All"];
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice < 30) priceRanges.push("Under ₹30");
      if (minPrice < 50 && maxPrice >= 30) priceRanges.push("₹30 - ₹50");
      if (minPrice < 70 && maxPrice >= 50) priceRanges.push("₹50 - ₹70");
      if (maxPrice > 70) priceRanges.push("Over ₹70");
    }

    return {
      applications: ["All", ...Array.from(applications).sort()],
      wattages: ["All", ...Array.from(wattages).sort()],
      colors: ["All", ...Array.from(colors).sort()],
      priceRanges
    };
  };

  const filterOptions = generateFilterOptions();
  
  // Debug: Log filter options
  console.log('Generated filter options:', filterOptions);
  
  // Debug: Log how attributes are being processed
  products.forEach(product => {
    if (product.ProductVariations) {
      product.ProductVariations.forEach(variation => {
        if (variation.attributes) {
          variation.attributes.forEach(attr => {
            if (attr.name && attr.name.toLowerCase() === 'watt') {
              console.log(`Product "${product.name}" - Watt attribute: "${attr.value}" -> Split into:`, attr.value.split(',').map(v => v.trim()).filter(v => v));
            }
            if (attr.name && attr.name.toLowerCase() === 'color') {
              console.log(`Product "${product.name}" - Color attribute: "${attr.value}" -> Split into:`, attr.value.split(',').map(v => v.trim()).filter(v => v));
            }
          });
        }
      });
    }
  });



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
        const errorMessage = "Failed to load products";
        setError(errorMessage);
        toast.error(errorMessage);
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

  // Helper function to check if any variation matches the filter
  const checkVariationFilter = (product, filterType, filterValue) => {
    if (!product.ProductVariations || product.ProductVariations.length === 0) {
      return false;
    }

    return product.ProductVariations.some(variation => {
      switch (filterType) {
        case 'application':
          return variation.usecase && variation.usecase.toLowerCase().includes(filterValue.toLowerCase());
        case 'wattage':
          const wattageValue = getAttributeValue(variation, 'watt');
          if (!wattageValue) return false;
          // Split the attribute value and check if any part matches
          const wattageValues = wattageValue.split(',').map(v => v.trim().toLowerCase());
          return wattageValues.includes(filterValue.toLowerCase());
        case 'color':
          const colorValue = getAttributeValue(variation, 'color');
          if (!colorValue) return false;
          // Split the attribute value and check if any part matches
          const colorValues = colorValue.split(',').map(v => v.trim().toLowerCase());
          return colorValues.includes(filterValue.toLowerCase());
        case 'price':
          if (!variation.price) return false;
          const price = parseFloat(variation.price);
          switch (filterValue) {
            case "Under ₹30":
              return price < 30;
            case "₹30 - ₹50":
              return price >= 30 && price <= 50;
            case "₹50 - ₹70":
              return price > 50 && price <= 70;
            case "Over ₹70":
              return price > 70;
            default:
              return true;
          }
        default:
          return false;
      }
    });
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
    setCollectionDropdown(false);
  };

  const handleCollectionDropdown = () => {
    setCollectionDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };

  const filteredProducts = products.filter(product => {
    // Collection filter
    const matchesCollection = !selectedCollection || 
      product.collection_id === parseInt(selectedCollection);

    // Check if any variation matches the filters
    const matchesApplication = application === "All" || 
      checkVariationFilter(product, 'application', application);

    const matchesWattage = wattage === "All" || 
      checkVariationFilter(product, 'wattage', wattage);

    const matchesColor = color === "All" || 
      checkVariationFilter(product, 'color', color);

    const matchesPrice = priceRange === "All" || 
      checkVariationFilter(product, 'price', priceRange);

    // Debug: Log filtering results for first few products
    if (products.indexOf(product) < 3) {
      console.log(`Product "${product.name}" filtering:`, {
        matchesCollection,
        matchesApplication,
        matchesWattage,
        matchesColor,
        matchesPrice,
        final: matchesCollection && matchesApplication && matchesWattage && matchesColor && matchesPrice
      });
    }

    return matchesCollection && matchesApplication && matchesWattage && matchesColor && matchesPrice;
  });

  const clearAllFilters = () => {
    setApplication("All");
    setWattage("All");
    setColor("All");
    setPriceRange("All");
    setSelectedCollection(null);
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
    setCollectionDropdown(false);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  // Add a dropdown for selecting a collection
  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(collectionId);
    setCollectionDropdown(false);
  };

  // Ensure collection_id is included in the request payload
  const createOrUpdateProduct = async () => {
    if (!selectedCollection) {
      toast.error("Please select a collection.");
      return;
    }

    console.log("Selected collection_id:", selectedCollection); // Log the selected collection_id

    const payload = {
      // ... other product data ...
      collection_id: selectedCollection,
    };

    // Send payload to backend
    try {
      await publicProductService.createOrUpdateProduct(payload);
      toast.success("Product created/updated successfully!");
      // Handle success
    } catch (error) {
      console.error("Error creating/updating product:", error);
      toast.error("Failed to create/update product");
      // Handle error
    }
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
             
             {/* Collection Filter */}
             <div className={`filter-section${collectionDropdown ? ' open' : ''}`} onClick={handleCollectionDropdown}>
               Collection
               <span className={`chevron${collectionDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </span>
             </div>
             <div className={`dropdown-menu${collectionDropdown ? ' open' : ''}`}> 
               {collectionDropdown && (
                 <>
                   <div
                     className={`dropdown-item${!selectedCollection ? ' selected' : ''}`}
                     onClick={() => handleCollectionChange(null)}
                   >
                     All Collections
                   </div>
                   {collections.map((collection) => (
                     <div
                       key={collection.id}
                       className={`dropdown-item${selectedCollection === collection.id ? ' selected' : ''}`}
                       onClick={() => handleCollectionChange(collection.id)}
                     >
                       {collection.name}
                     </div>
                   ))}
                 </>
               )}
             </div>

             {/* Application Filter */}
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

             {/* Wattage Filter */}
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

             {/* Color Filter */}
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

             {/* Price Filter */}
             <div className={`filter-section${priceDropdown ? ' open' : ''}`} onClick={handlePriceDropdown}>
               Price Range
               <span className={`chevron${priceDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                 <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </span>
             </div>
             <div className={`dropdown-menu${priceDropdown ? ' open' : ''}`}> 
               {priceDropdown && filterOptions.priceRanges.map(opt => (
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
               {/* Mobile Collection Filter */}
               <div className="mobile-filter-section">
                 <div className={`filter-section${collectionDropdown ? ' open' : ''}`} onClick={handleCollectionDropdown}>
                   Collection
                   <span className={`chevron${collectionDropdown ? ' open' : ''}`}>
                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                   </span>
                 </div>
                 <div className={`dropdown-menu${collectionDropdown ? ' open' : ''}`}>
                   <div
                     className={`dropdown-item${!selectedCollection ? ' selected' : ''}`}
                     onClick={() => handleCollectionChange(null)}
                   >
                     All Collections
                   </div>
                   {collections.map((collection) => (
                     <div
                       key={collection.id}
                       className={`dropdown-item${selectedCollection === collection.id ? ' selected' : ''}`}
                       onClick={() => handleCollectionChange(collection.id)}
                     >
                       {collection.name}
                     </div>
                   ))}
                 </div>
               </div>

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
                   {filterOptions.priceRanges.map(opt => (
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