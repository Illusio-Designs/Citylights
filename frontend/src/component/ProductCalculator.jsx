import React, { useState, useEffect } from 'react';
import { publicProductService } from '../services/publicService';
import ProductCard from './ProductCard';
import '../styles/component/ProductCalculator.css';

const ProductCalculator = () => {
  const [formData, setFormData] = useState({
    roomType: 'All',
    roomSize: 'All',
    lightingType: 'All',
    style: 'All'
  });
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  
  // Dropdown states
  const [roomDropdown, setRoomDropdown] = useState(false);
  const [sizeDropdown, setSizeDropdown] = useState(false);
  const [lightingDropdown, setLightingDropdown] = useState(false);
  const [styleDropdown, setStyleDropdown] = useState(false);

  // Enhanced filter options with descriptions only
  const roomTypes = [
    { value: 'All', label: 'All Rooms', desc: 'Show all lighting options' },
    { value: 'Living Room', label: 'Living Room', desc: 'Comfortable ambient lighting' },
    { value: 'Bedroom', label: 'Bedroom', desc: 'Soft, relaxing illumination' },
    { value: 'Kitchen', label: 'Kitchen', desc: 'Bright task lighting' },
    { value: 'Bathroom', label: 'Bathroom', desc: 'Moisture-resistant fixtures' },
    { value: 'Dining Room', label: 'Dining Room', desc: 'Elegant dining ambiance' },
    { value: 'Office', label: 'Office', desc: 'Focused work lighting' },
    { value: 'Hallway', label: 'Hallway', desc: 'Pathway illumination' },
    { value: 'Outdoor', label: 'Outdoor', desc: 'Weather-resistant options' }
  ];

  const roomSizes = [
    { value: 'All', label: 'Any Size', desc: 'All room dimensions' },
    { value: 'Small', label: 'Small (< 100 sq ft)', desc: 'Compact spaces' },
    { value: 'Medium', label: 'Medium (100-200 sq ft)', desc: 'Standard rooms' },
    { value: 'Large', label: 'Large (200-400 sq ft)', desc: 'Spacious areas' },
    { value: 'Extra Large', label: 'Extra Large (> 400 sq ft)', desc: 'Grand spaces' }
  ];

  const lightingTypes = [
    { value: 'All', label: 'All Types', desc: 'Any lighting purpose' },
    { value: 'Ambient', label: 'Ambient Lighting', desc: 'General room illumination' },
    { value: 'Task', label: 'Task Lighting', desc: 'Focused work areas' },
    { value: 'Accent', label: 'Accent Lighting', desc: 'Decorative highlights' },
    { value: 'Mixed', label: 'Mixed Lighting', desc: 'Combination approach' }
  ];

  const styles = [
    { value: 'All', label: 'Any Style', desc: 'All design aesthetics' },
    { value: 'Modern', label: 'Modern', desc: 'Clean, minimalist design' },
    { value: 'Traditional', label: 'Traditional', desc: 'Classic, timeless appeal' },
    { value: 'Industrial', label: 'Industrial', desc: 'Raw, urban aesthetic' },
    { value: 'Rustic', label: 'Rustic', desc: 'Natural, cozy warmth' },
    { value: 'Contemporary', label: 'Contemporary', desc: 'Current design trends' },
    { value: 'Vintage', label: 'Vintage', desc: 'Retro, nostalgic charm' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRes = await publicProductService.getProducts();
        const productsData = productsRes.data.data || productsRes.data || [];
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleDropdown = (type) => {
    setRoomDropdown(type === 'room' ? !roomDropdown : false);
    setSizeDropdown(type === 'size' ? !sizeDropdown : false);
    setLightingDropdown(type === 'lighting' ? !lightingDropdown : false);
    setStyleDropdown(type === 'style' ? !styleDropdown : false);
  };

  const handleFilterChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Close all dropdowns
    setRoomDropdown(false);
    setSizeDropdown(false);
    setLightingDropdown(false);
    setStyleDropdown(false);
  };

  const getSmartRecommendations = () => {
    let filtered = [...products];
    let scoredProducts = [];

    // Advanced scoring algorithm
    filtered.forEach(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || '').toLowerCase();
      const searchText = `${productName} ${productDesc}`;

      // Room type scoring (weighted heavily)
      if (formData.roomType !== 'All') {
        const roomKeywords = {
          'Living Room': ['living', 'lounge', 'family', 'ceiling', 'chandelier', 'pendant', 'floor lamp'],
          'Bedroom': ['bedroom', 'bedside', 'reading', 'table lamp', 'wall sconce', 'soft'],
          'Kitchen': ['kitchen', 'cabinet', 'island', 'task', 'under cabinet', 'pendant', 'track'],
          'Bathroom': ['bathroom', 'vanity', 'mirror', 'ip44', 'moisture', 'wall', 'ceiling'],
          'Dining Room': ['dining', 'chandelier', 'pendant', 'table', 'elegant', 'crystal'],
          'Office': ['office', 'desk', 'work', 'task', 'reading', 'study', 'focused'],
          'Hallway': ['hallway', 'corridor', 'passage', 'wall', 'ceiling', 'pathway'],
          'Outdoor': ['outdoor', 'garden', 'patio', 'weatherproof', 'ip65', 'exterior']
        };
        
        const keywords = roomKeywords[formData.roomType] || [];
        const matches = keywords.filter(keyword => searchText.includes(keyword)).length;
        score += matches * 15; // High weight for room relevance
      }

      // Lighting type scoring
      if (formData.lightingType !== 'All') {
        const lightingKeywords = {
          'Ambient': ['ambient', 'ceiling', 'general', 'downlight', 'flush', 'recessed'],
          'Task': ['task', 'desk', 'reading', 'work', 'under cabinet', 'spot', 'directional'],
          'Accent': ['accent', 'decorative', 'feature', 'spotlight', 'wall wash', 'uplighting'],
          'Mixed': ['chandelier', 'pendant', 'multi', 'adjustable', 'dimmer', 'versatile']
        };
        
        const keywords = lightingKeywords[formData.lightingType] || [];
        const matches = keywords.filter(keyword => searchText.includes(keyword)).length;
        score += matches * 12;
      }

      // Style scoring
      if (formData.style !== 'All') {
        const styleKeywords = {
          'Modern': ['modern', 'contemporary', 'minimalist', 'sleek', 'clean', 'geometric'],
          'Traditional': ['traditional', 'classic', 'vintage', 'ornate', 'elegant', 'timeless'],
          'Industrial': ['industrial', 'metal', 'steel', 'iron', 'exposed', 'raw', 'urban'],
          'Rustic': ['rustic', 'wood', 'natural', 'farmhouse', 'country', 'warm'],
          'Contemporary': ['contemporary', 'current', 'trendy', 'stylish', 'chic'],
          'Vintage': ['vintage', 'retro', 'antique', 'classic', 'period', 'heritage']
        };
        
        const keywords = styleKeywords[formData.style] || [];
        const matches = keywords.filter(keyword => searchText.includes(keyword)).length;
        score += matches * 10;
      }

      // Room size considerations
      if (formData.roomSize !== 'All') {
        const sizeKeywords = {
          'Small': ['compact', 'mini', 'small', 'space-saving', 'slim'],
          'Medium': ['standard', 'medium', 'regular', 'typical'],
          'Large': ['large', 'grand', 'statement', 'oversized', 'big'],
          'Extra Large': ['extra large', 'massive', 'grand', 'commercial', 'statement']
        };
        
        const keywords = sizeKeywords[formData.roomSize] || [];
        const matches = keywords.filter(keyword => searchText.includes(keyword)).length;
        score += matches * 8;
      }

      // Bonus points for popular/quality indicators
      if (searchText.includes('led')) score += 5;
      if (searchText.includes('energy efficient')) score += 3;
      if (searchText.includes('dimmable')) score += 3;
      if (searchText.includes('smart')) score += 4;

      // Add randomness for variety when scores are similar
      score += Math.random() * 2;

      if (score > 0) {
        scoredProducts.push({ ...product, score });
      }
    });

    // Sort by score and return results
    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts;
  };

  const handleFindProducts = async () => {
    setLoading(true);
    setShowResults(true);

    // Realistic loading time
    await new Promise(resolve => setTimeout(resolve, 1200));

    let results = [];
    
    // Check if any filters are applied
    const hasFilters = formData.roomType !== 'All' || formData.roomSize !== 'All' || 
                      formData.lightingType !== 'All' || formData.style !== 'All';

    if (hasFilters) {
      results = getSmartRecommendations();
    } else {
      // Show curated selection when no filters
      results = products
        .sort(() => 0.5 - Math.random())
        .slice(0, 12)
        .map(product => ({ ...product, score: Math.random() * 10 }));
    }

    setTotalMatches(results.length);
    setFilteredProducts(results.slice(0, 8)); // Show top 8
    setLoading(false);
  };

  const resetCalculator = () => {
    setFormData({
      roomType: 'All',
      roomSize: 'All', 
      lightingType: 'All',
      style: 'All'
    });
    setShowResults(false);
    setFilteredProducts([]);
    setTotalMatches(0);
  };

  const getSelectedFiltersCount = () => {
    return Object.values(formData).filter(value => value !== 'All').length;
  };

  const renderDropdown = (type, options, currentValue, isOpen) => {
    return (
      <div className="calc-filter-group">
        <div 
          className={`calc-filter-section${isOpen ? ' open' : ''}`} 
          onClick={() => handleDropdown(type)}
        >
          <div className="calc-filter-content">
            <span className="calc-filter-label">
              {type === 'room' ? 'Room Type' : 
               type === 'size' ? 'Room Size' : 
               type === 'lighting' ? 'Lighting Type' : 'Style'}
            </span>
            <span className="calc-filter-value">
              {options.find(opt => opt.value === currentValue)?.label || currentValue}
            </span>
          </div>
          <span className={`calc-chevron${isOpen ? ' open' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <div className={`calc-dropdown-menu${isOpen ? ' open' : ''}`}>
          {options.map(option => (
            <div
              key={option.value}
              className={`calc-dropdown-item${currentValue === option.value ? ' selected' : ''}`}
              onClick={() => handleFilterChange(
                type === 'room' ? 'roomType' : 
                type === 'size' ? 'roomSize' : 
                type === 'lighting' ? 'lightingType' : 'style', 
                option.value
              )}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (showResults) {
    return (
      <div className="product-calculator">
        <div className="calc-header">
          <h2>Your Lighting Recommendations</h2>
          <div className="calc-results-summary">
            <p>Found <strong>{totalMatches}</strong> products matching your preferences</p>
            {getSelectedFiltersCount() > 0 && (
              <div className="calc-active-filters">
                <span>Active filters: </span>
                {Object.entries(formData).map(([key, value]) => 
                  value !== 'All' ? (
                    <span key={key} className="calc-filter-tag">
                      {value}
                    </span>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="calc-loading">
            <div className="calc-spinner"></div>
            <div className="calc-loading-text">
              <h3>Analyzing Your Requirements</h3>
              <p>{/* Loading handled by visual spinner */}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="calc-products-grid">
              {filteredProducts.length === 0 ? (
                <div className="calc-no-results">
                  <h3>No Perfect Matches Found</h3>
                  <p>Try adjusting your preferences or browse our full collection</p>
                  <button 
                    className="calc-browse-btn"
                    onClick={() => window.location.href = '/products'}
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            <div className="calc-actions">
              <button className="calc-secondary-btn" onClick={resetCalculator}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                Try Different Options
              </button>
              {totalMatches > 8 && (
                <button 
                  className="calc-primary-btn"
                  onClick={() => window.location.href = '/products'}
                >
                  View All {totalMatches} Results
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="product-calculator">
      <div className="calc-header">
        <h2>Lighting Solution Finder</h2>
        <p>Answer a few questions to discover the perfect lighting for your space</p>
        <div className="calc-progress-indicator">
          <span>{getSelectedFiltersCount()}/4 preferences selected</span>
        </div>
      </div>

      <div className="calc-filters">
        {renderDropdown('room', roomTypes, formData.roomType, roomDropdown)}
        {renderDropdown('size', roomSizes, formData.roomSize, sizeDropdown)}
        {renderDropdown('lighting', lightingTypes, formData.lightingType, lightingDropdown)}
        {renderDropdown('style', styles, formData.style, styleDropdown)}
      </div>

      <div className="calc-actions">
        <button 
          className="calc-find-btn" 
          onClick={handleFindProducts}
          disabled={getSelectedFiltersCount() === 0}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          {getSelectedFiltersCount() === 0 ? 'Select Preferences to Continue' : 'Find Perfect Lighting'}
        </button>
        {getSelectedFiltersCount() > 0 && (
          <button className="calc-clear-btn" onClick={resetCalculator}>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCalculator;