import React from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const getProductImageUrl = (img) =>
  img && !img.startsWith('http')
    ? `${BASE_URL.replace('/api', '')}/uploads/products/${img}`
    : (img || "/default-product.png");

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // Get first variation and first image
  const variation = product.ProductVariations && product.ProductVariations[0];
  const imageUrl = variation && variation.ProductImages && variation.ProductImages[0] && variation.ProductImages[0].image_url;

  return (
    <div className="browse-product-box">
      <img
        src={getProductImageUrl(imageUrl)}
        alt={product.name}
        className="browse-product-img"
      />
      <div className="product-info">
        <div className="product-details">
          <div className="product-title">{product.name}</div>
          <div className="product-desc">{product.slug}</div>
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