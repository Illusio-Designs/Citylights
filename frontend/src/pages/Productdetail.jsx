import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import details from "../assets/details.png";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Productdetail.css";
import "../styles/pages/StoreDetails.css";
import { publicProductService } from "../services/publicService";
import { publicCollectionService } from "../services/publicService";
import { publicReviewService } from "../services/publicService";
import Modal from '../component/common/Modal';

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

const Productdetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [collections, setCollections] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [reviewForm, setReviewForm] = React.useState({ username: '', email: '', phone_number: '', message: '', rating: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');
  const [showReviewModal, setShowReviewModal] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    publicProductService.getProductByName(name)
      .then((res) => {
        const found = res.data.data || res.data;
        if (found) {
          setProduct(found);
          publicReviewService.getProductReviews(found.id).then((reviewRes) => {
            setReviews(reviewRes.data || []);
          });
        } else {
          setError("Product Not Found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
    // Fetch collections
    publicCollectionService.getCollections().then((res) => {
      setCollections(res.data);
    });
  }, [name]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <div className="productdetail-notfound">
        <h2>{error}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Gather all images and attributes for all variations
  const allVariations = product.ProductVariations || [];
  const allImages = allVariations.flatMap(variation =>
    (variation.ProductImages || []).map(img => ({
      image_url: img.image_url,
      variationSku: variation.sku,
    }))
  );
  const collection = collections.find((c) => c.id === product.collection_id);
  let pdfUrl = null;
  if (product.pdf) pdfUrl = product.pdf;
  else if (allVariations.length > 0 && allVariations[0].pdf) pdfUrl = allVariations[0].pdf;
  else if (allVariations.length > 0 && allVariations[0].ProductDocuments && allVariations[0].ProductDocuments[0] && allVariations[0].ProductDocuments[0].url) pdfUrl = allVariations[0].ProductDocuments[0].url;
  else if (allVariations.length > 0 && allVariations[0].documents && allVariations[0].documents[0] && allVariations[0].documents[0].url) pdfUrl = allVariations[0].documents[0].url;

  return (
    <>
      <Header />
      <div className="productdetail-container">
        <div className="productdetail-heading-section">
          <img src={details} alt="details" className="details-img" />
          <span className="productdetail-title">Product Details</span>
        </div>
        <div className="productdetail-flex">
          {/* Main Image and Thumbnails (all variations) */}
          <div className="productdetail-mainimg-section">
            <div className="productdetail-mainimg">
              <img src={getProductImageUrl(allImages[0]?.image_url)} alt={product.name} />
            </div>
            <div className="productdetail-thumbnails">
              {allImages.map((img, i) => (
                <img key={i} src={getProductImageUrl(img.image_url)} alt={`thumb-${i}`} />
              ))}
            </div>
          </div>
          {/* Details */}
          <div className="productdetail-info">
            <h2>{product.name}</h2>
            <div className="productdetail-subtitle">{product.slug}</div>
            <div className="productdetail-category">
              <span>Category :</span> <b>{collection ? collection.name : '-'}</b>
            </div>
            <div className="productdetail-applications">
              <span>Description :</span> <span className="productdetail-appicon">{product.description}</span>
            </div>
            {/* Show all variations with their attributes and images */}
            <div className="productdetail-variations">
              <h3>Variations</h3>
              {allVariations.length === 0 ? (
                <div>No variations available.</div>
              ) : (
                allVariations.map((variation, idx) => (
                  <div key={idx} className="productdetail-variation-box">
                    <div><b>SKU:</b> {variation.sku || '-'}</div>
                    <div><b>Price:</b> {variation.price ? `₹${parseFloat(variation.price).toLocaleString('en-IN')}` : '-'}</div>
                    <div><b>Usecase:</b> {variation.usecase || '-'}</div>
                    {/* Attributes */}
                    {variation.attributes && variation.attributes.length > 0 && (
                      <div><b>Attributes:</b>
                        <ul>
                          {variation.attributes.map((attr, aidx) => (
                            <li key={aidx}><b>{attr.name}:</b> {attr.value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Images */}
                    {variation.ProductImages && variation.ProductImages.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        {variation.ProductImages.map((img, i) => (
                          <img
                            key={i}
                            src={getProductImageUrl(img.image_url)}
                            alt={`variation-img-${i}`}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="productdetail-actions">
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="productdetail-pdfbtn">
                  <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}>
                      <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="4" y="15" width="12" height="2" rx="1" fill="#222"/>
                    </svg>
                    PDF
                  </span>
                </a>
              )}
              <button className="productdetail-contactbtn">Contact for Purchase</button>
            </div>

          </div>
        </div>
        
        {/* Product Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Reviews</h2>
          <button className="add-review-btn" onClick={() => setShowReviewModal(true)}>Add Review</button>
          <div className="reviews-slider">
            {reviews.map((review, idx) => (
              <div className="review-card" key={idx}>
                <div className="review-avatar">{review.username ? review.username[0] : '?'}</div>
                <div className="review-content">
                  <div className="review-name">{review.username || 'Anonymous'}</div>
                  {review.rating && (
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < review.rating ? 'filled' : 'unfilled'}`}>★</span>
                      ))}
                    </div>
                  )}
                  <div className="review-text">{review.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Add a Review">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setSubmitError('');
          setSubmitSuccess('');
          try {
            await publicReviewService.addProductReview(product.id, reviewForm);
            toast.success('Review submitted successfully! It will be visible after admin approval.');
            setReviewForm({ username: '', email: '', phone_number: '', message: '', rating: '' });
            const reviewRes = await publicReviewService.getProductReviews(product.id);
            setReviews(reviewRes.data || []);
            setTimeout(() => {
              setShowReviewModal(false);
            }, 1200);
          } catch {
            const errorMessage = 'Failed to submit review.';
            setSubmitError(errorMessage);
            toast.error(errorMessage);
          }
          setSubmitting(false);
        }} className="review-form">
          <input 
            type="text" 
            placeholder="Your Name" 
            value={reviewForm.username} 
            onChange={e => setReviewForm(f => ({ ...f, username: e.target.value }))} 
            required 
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            value={reviewForm.email} 
            onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))} 
            required 
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={reviewForm.phone_number} 
            onChange={e => setReviewForm(f => ({ ...f, phone_number: e.target.value }))} 
            required 
          />
          <select 
            value={reviewForm.rating} 
            onChange={e => setReviewForm(f => ({ ...f, rating: e.target.value }))}
            style={{ padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Select Rating (Optional)</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
          <textarea 
            placeholder="Your Review" 
            value={reviewForm.message} 
            onChange={e => setReviewForm(f => ({ ...f, message: e.target.value }))} 
            required 
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {submitError && <div style={{ color: 'red' }}>{submitError}</div>}
          {submitSuccess && <div style={{ color: 'green' }}>{submitSuccess}</div>}
        </form>
      </Modal>
    </>
  );
};

export default Productdetail;
