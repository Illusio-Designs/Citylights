import React from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const getProductImageUrl = (img) =>
  img && !img.startsWith('http')
    ? `${BASE_URL.replace('/api', '')}/uploads/products/${img}`
    : (img || "/default-product.png");

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  // Get primary image (first image from first variation)
  const allImages = (product.ProductVariations || []).flatMap(variation =>
    (variation.ProductImages || []).map(img => img.image_url)
  );
  const primaryImage = allImages.length > 0 ? allImages[0] : null;

  return (
    <div className="browse-product-box">
      <div className="browse-product-img-gallery">
        {primaryImage ? (
          <img
            src={getProductImageUrl(primaryImage)}
            alt={product.name}
            className="browse-product-img"
            style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
          />
        ) : (
          <img
            src={getProductImageUrl()}
            alt={product.name}
            className="browse-product-img"
            style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
          />
        )}
      </div>
      
      <div className="product-info">
        <div className="product-details">
          <div className="product-title">{product.name}</div>
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