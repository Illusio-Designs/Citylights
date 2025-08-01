import React from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getProductImageUrl = (img) => {
  if (!img) return "/default-product.png";
  
  if (img.startsWith('http')) {
    return img;
  }
  
  // Remove /api from the base URL for static file serving
  const baseUrl = BASE_URL.replace('/api', '');
  
  // Check if it's a variation image (starts with 'variation_images')
  if (img.startsWith('variation_images')) {
    return `${baseUrl}/uploads/images/${img}`;
  }
  
  // Default to products directory for other images
  return `${baseUrl}/uploads/products/${img}`;
};

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

  return (
    <div className="browse-product-box">
      <div className="browse-product-img-gallery">
        <img
          src={getProductImageUrl(primaryImage)}
          alt={product.name}
          className="browse-product-img"
          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
          onError={(e) => {
            e.target.src = "/default-product.png";
          }}
        />
      </div>
      
      <div className="product-info">
        <div className="product-details">
          <div className="product-title">{product.name}</div>
          {product.ProductVariations && product.ProductVariations.length > 0 && (
            <div className="product-price">
              ₹{product.ProductVariations[0].price || '0.00'}
            </div>
          )}
        </div>
        <div className="details-btn">
          <button
            className="view-details"
            onClick={() => navigate(`/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, '-')}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 