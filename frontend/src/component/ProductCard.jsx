import React from "react";
import { useNavigate } from "react-router-dom";
import { getProductImageUrl } from "../utils/imageUtils";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  // Get primary image from the first variation that has images
  const getPrimaryImage = () => {
    if (!product.ProductVariations || product.ProductVariations.length === 0) {
      return null;
    }
    
    // Find the first variation with images
    for (const variation of product.ProductVariations) {
      if (variation.ProductImages && variation.ProductImages.length > 0) {
        // Find the primary image or use the first one
        const primaryImage = variation.ProductImages.find(img => img.is_primary) || variation.ProductImages[0];
        return primaryImage.image_url;
      }
    }
    
    return null;
  };

  const primaryImage = getPrimaryImage();

  // Get wattage from product variations
  const getWattage = () => {
    if (!product.ProductVariations || product.ProductVariations.length === 0) {
      return null;
    }
    
    // Find the first variation with wattage
    for (const variation of product.ProductVariations) {
      if (variation.wattage) {
        return variation.wattage;
      }
    }
    
    return null;
  };

  const wattage = getWattage();

  const handleCardClick = () => {
    navigate(`/products/${product.name}`);
  };

  return (
    <div className="browse-product-box" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="browse-product-img-gallery shimmer">
        <img
          src={getProductImageUrl(primaryImage)}
          alt={product.name}
          className="browse-product-img"
          style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
          onLoad={(e) => {
            e.currentTarget.style.filter = 'none';
            if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer');
          }}
          onError={(e) => {
            e.target.src = "/default-product.webp";
            e.currentTarget.style.filter = 'none';
            if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer');
          }}
        />
      </div>
      
      <div className="product-info">
        <div className="product-details">
          <div className="product-title">{product.name}</div>
          {wattage && (
            <div className="product-wattage">
              {wattage}W
            </div>
          )}
        </div>
        <div className="details-btn">
          <button
            className="view-details eye-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.name}`);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 