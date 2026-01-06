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
    <div className="product-card-wrapper" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="carousel-card carousel-card-center">
        <div className="carousel-card-inner">
          <img
            src={getProductImageUrl(primaryImage)}
            alt={product.name}
            className="carousel-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/default-product.webp";
            }}
          />
          <div className="carousel-card-overlay">
            <div className="carousel-card-info">
              <h3 className="carousel-card-title">{product.name}</h3>
              {wattage && (
                <div className="product-wattage" style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '16px', 
                  marginTop: '8px',
                  fontFamily: '"DM Sans", sans-serif'
                }}>
                  {wattage}W
                </div>
              )}
              <div className="carousel-card-shine"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 