import React from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const getProductImageUrl = (img) =>
  img && !img.startsWith('http')
    ? `${BASE_URL.replace('/api', '')}/uploads/products/${img}`
    : (img || "/default-product.png");

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // Gather all images from all variations
  const allImages = (product.ProductVariations || []).flatMap(variation =>
    (variation.ProductImages || []).map(img => ({
      image_url: img.image_url,
      variationSku: variation.sku,
    }))
  );

  return (
    <div className="browse-product-box">
      <div className="browse-product-img-gallery">
        {allImages.length > 0 ? (
          allImages.map((img, idx) => (
            <img
              key={idx}
              src={getProductImageUrl(img.image_url)}
              alt={product.name + (img.variationSku ? ` (${img.variationSku})` : '')}
              className="browse-product-img"
              style={{ marginRight: 4, width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
            />
          ))
        ) : (
          <img
            src={getProductImageUrl()}
            alt={product.name}
            className="browse-product-img"
          />
        )}
      </div>
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