import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { adminProductService } from '../../services/adminService';
import { getProductImageUrl } from '../../utils/imageUtils';

const ProductImageManager = ({ isOpen, onClose, productId, productName }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({});

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }
  }, [isOpen, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminProductService.getProducts();
      const foundProduct = response.data.find(p => p.id === productId);
      setProduct(foundProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (variationId, files) => {
    if (!files || files.length === 0) return;

    setUploadingImages(prev => ({ ...prev, [variationId]: true }));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('product_image', file);
        formData.append('variation_id', variationId);
        formData.append('is_primary', i === 0 ? 'true' : 'false');

        await adminProductService.uploadProductImage(formData);
      }

      toast.success(`Uploaded ${files.length} image(s) successfully`);
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(prev => ({ ...prev, [variationId]: false }));
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await adminProductService.deleteProductImage(imageId);
      toast.success('Image deleted successfully');
      fetchProduct(); // Refresh product data
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Product Image Manager">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading product details...
        </div>
      </Modal>
    );
  }

  if (!product) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Product Image Manager">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Product not found
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Images - ${productName}`} size="large">
      <div className="image-manager-container">
        <div className="product-info">
          <h3>{product.name}</h3>
          <p>Manage images for each product variation</p>
        </div>

        <div className="variations-list">
          {product.ProductVariations?.map((variation) => (
            <div key={variation.id} className="variation-section">
              <div className="variation-header">
                <h4>Variation: {variation.sku}</h4>
                <div className="variation-details">
                  <span>Price: ₹{variation.price || 'N/A'}</span>
                  {variation.usecase && (
                    <span>Use Case: {variation.usecase}</span>
                  )}
                </div>
              </div>

              <div className="images-section">
                <div className="current-images">
                  <h5>Current Images ({variation.ProductImages?.length || 0})</h5>
                  <div className="images-grid">
                    {variation.ProductImages?.map((image) => (
                      <div key={image.id} className="image-item">
                        <img
                          src={getProductImageUrl(image.image_url)}
                          alt={`${variation.sku} image`}
                          className="product-image"
                        />
                        {image.is_primary && (
                          <span className="primary-badge">Primary</span>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteImage(image.id)}
                          title="Delete image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="upload-section">
                  <h5>Add New Images</h5>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(variation.id, e.target.files)}
                    disabled={uploadingImages[variation.id]}
                    className="file-input"
                  />
                  {uploadingImages[variation.id] && (
                    <div className="uploading-indicator">
                      Uploading images...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!product.ProductVariations || product.ProductVariations.length === 0) && (
          <div className="no-variations">
            <p>No variations found for this product.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .image-manager-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .product-info {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .product-info h3 {
          margin: 0 0 8px 0;
          color: #333;
        }

        .product-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .variation-section {
          margin-bottom: 40px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .variation-header {
          margin-bottom: 20px;
        }

        .variation-header h4 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 18px;
        }

        .variation-details {
          display: flex;
          gap: 20px;
          font-size: 14px;
          color: #666;
        }

        .images-section {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          align-items: start;
        }

        .current-images h5,
        .upload-section h5 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 15px;
        }

        .image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #ddd;
          background: white;
        }

        .product-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .primary-badge {
          position: absolute;
          top: 5px;
          left: 5px;
          background: #4caf50;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .delete-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: rgba(255, 0, 0, 1);
        }

        .upload-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .file-input {
          width: 100%;
          padding: 10px;
          border: 2px dashed #ddd;
          border-radius: 6px;
          background: #f9f9f9;
          cursor: pointer;
        }

        .file-input:hover {
          border-color: #999;
          background: #f5f5f5;
        }

        .uploading-indicator {
          margin-top: 10px;
          color: #666;
          font-size: 14px;
          text-align: center;
        }

        .no-variations {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        @media (max-width: 768px) {
          .images-section {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .images-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
          }

          .product-image {
            height: 100px;
          }
        }
      `}</style>
    </Modal>
  );
};

export default ProductImageManager;