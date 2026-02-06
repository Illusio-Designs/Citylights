import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import details from '../assets/details.webp';
import beamAngleImg from '../assets/Beam Angle.webp';
import colorTempImg from '../assets/Color Temperature.webp';
import lumensImg from '../assets/Lumens.webp';
import dimmableImg from '../assets/Dimmable.webp';
import tunableImg from '../assets/Tunable.webp';
import criImg from '../assets/CRI.webp';
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Productdetail.css";
import "../styles/pages/StoreDetails.css";
import { publicProductService } from "../services/publicService";
import { publicCollectionService } from "../services/publicService";
import { publicReviewService } from "../services/publicService";
import Modal from '../component/common/Modal';
import { getProductImageUrl } from "../utils/imageUtils";

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
  const [activeImgIndex, setActiveImgIndex] = React.useState(0);
  const [selectedVariationIndex, setSelectedVariationIndex] = React.useState(0);

  // Reset image index when switching variations
  React.useEffect(() => {
    setActiveImgIndex(0);
  }, [selectedVariationIndex]);

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
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        color: '#666',
        fontSize: '16px'
      }}>
        {/* Loading handled by PublicLoader */}
      </div>
    );
  }
  if (error) {
    return (
      <div className="productdetail-notfound">
        <h2>{error}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Gather variations and active variation data
  const allVariations = product.ProductVariations || [];
  const selectedVariation = allVariations[selectedVariationIndex] || {};
  const variationImages = (selectedVariation.ProductImages || []).map(img => ({
    image_url: img.image_url,
    variationSku: selectedVariation.sku,
  }));
  const activeImageUrl = variationImages[activeImgIndex]?.image_url || variationImages[0]?.image_url;


  // Prepare common spec values from the selected variation attributes if present
  const firstVariation = selectedVariation || {};
  const findAttrValue = (names) => {
    if (!firstVariation.attributes || !Array.isArray(firstVariation.attributes)) return null;
    const list = Array.isArray(names) ? names : [names];
    const target = firstVariation.attributes.find(a => a && a.name && list.map(n => String(n).toLowerCase()).includes(String(a.name).toLowerCase()));
    return target && target.value ? target.value : null;
  };

  // Get attributes that will be shown in the attributes section
  const attributesToShow = firstVariation.attributes || [];
  const attributeNames = attributesToShow.map(attr => attr.name?.toLowerCase() || '');
  
  // Get actual product data for spec boxes - exclude attributes that are already shown in attributes section
  const allSpecs = [
    { label: 'SKU', value: firstVariation.sku || product.sku },
    { label: 'Lumen Output', value: findAttrValue(['lumen', 'lumens', 'lumen output']) },
    { label: 'Beam Angle', value: findAttrValue(['beam', 'beam angle']) },
    { label: 'Voltage', value: findAttrValue(['voltage']) },
    { label: 'Dimensions', value: findAttrValue(['dimensions', 'size']) },
    { label: 'Warranty', value: findAttrValue(['warranty']) },
  ];
  
  // Filter out specs with no data and exclude those that will be shown in attributes
  const specData = allSpecs.filter(spec => {
    const hasValue = spec.value && spec.value !== '-' && String(spec.value).trim() !== '';
    const isInAttributes = attributeNames.includes(spec.label.toLowerCase());
    return hasValue && !isInAttributes;
  });
  const collection = collections.find((c) => c.id === product.collection_id);
  let pdfUrl = null;
  if (product.pdf) pdfUrl = product.pdf;
  else if (allVariations.length > 0 && allVariations[0].pdf) pdfUrl = allVariations[0].pdf;
  else if (allVariations.length > 0 && allVariations[0].ProductDocuments && allVariations[0].ProductDocuments[0] && allVariations[0].ProductDocuments[0].url) pdfUrl = allVariations[0].ProductDocuments[0].url;
  else if (allVariations.length > 0 && allVariations[0].documents && allVariations[0].documents[0] && allVariations[0].documents[0].url) pdfUrl = allVariations[0].documents[0].url;

  // Reviews helpers
  const sanitizedReviews = Array.isArray(reviews)
    ? reviews.filter((r) => r && (r.message || r.rating))
    : [];
  const sortedReviews = sanitizedReviews.slice().sort((a, b) => {
    const da = new Date(a.updated_at || a.created_at || 0).getTime();
    const db = new Date(b.updated_at || b.created_at || 0).getTime();
    return db - da;
  });
  const totalReviews = sortedReviews.length;
  const averageRating = totalReviews === 0
    ? 0
    : (sortedReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews);


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
              <div className="carousel-card-inner">
                <img
                  src={getProductImageUrl(activeImageUrl)}
                  alt={product.name}
                  style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                  onLoad={(e) => { e.currentTarget.style.filter = 'none'; }}
                  onError={(e) => { e.currentTarget.style.filter = 'none'; }}
                />
                <div className="carousel-card-overlay">
                  <div className="carousel-card-info">
                    <div className="carousel-card-shine"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="productdetail-thumbnails">
              {variationImages.map((img, i) => (
                <div
                  key={i}
                  className={`thumbnail-card${i === activeImgIndex ? ' active' : ''}`}
                  onClick={() => setActiveImgIndex(i)}
                >
                  <div className="thumbnail-card-inner">
                    <img
                      src={getProductImageUrl(img.image_url)}
                      alt={`thumb-${i}`}
                      style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                      onLoad={(e) => { e.currentTarget.style.filter = 'none'; }}
                      onError={(e) => { e.currentTarget.style.filter = 'none'; }}
                    />
                    <div className="thumbnail-overlay"></div>
                    <div className="thumbnail-shine"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Details */}
          <div className="productdetail-info">
            <h2>{product.name}</h2>
            {product.description && (
              <div className="productdetail-subtitle">{product.description}</div>
            )}
            <div className="productdetail-category">
              <span>Category :</span> <b>{collection ? collection.name : '-'}</b>
            </div>
            {allVariations.length > 1 && (
              <div className="variation-picker">
                {allVariations.map((v, idx) => (
                  <button
                    key={v.sku || idx}
                    onClick={() => setSelectedVariationIndex(idx)}
                    className={`variation-chip${idx === selectedVariationIndex ? ' active' : ''}`}
                    title={v.sku}
                  >
                    {v.ProductImages && v.ProductImages[0] ? (
                      <img src={getProductImageUrl(v.ProductImages[0].image_url)} alt={v.sku} />
                    ) : (
                      <span className="variation-chip-thumb-placeholder" />
                    )}
                    <span className="variation-chip-label">{v.sku || `Var ${idx + 1}`}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="productdetail-specs">
              {specData.map((spec, idx) => (
                <div className="productdetail-specbox" key={idx}>
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
            
            {/* Selected variation details (non-duplicated info) */}
            <div className="productdetail-variations">
              <h3>Selected Variation: <span className="variation-title-sku">{selectedVariation.sku || '-'}</span></h3>
              <div className="productdetail-variation-box">
                <div><b>Usecase:</b> {selectedVariation.usecase ? selectedVariation.usecase.split(',').map(use => use.trim()).join(', ') : '-'}</div>
                {selectedVariation.attributes && selectedVariation.attributes.length > 0 && (
                  <div><b>Attributes:</b>
                    <ul>
                      {selectedVariation.attributes.map((attr, aidx) => (
                        <li key={aidx}><b>{attr.name}:</b> {attr.value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
        
        {/* Technical Specifications Section */}
        <div className="tech-specs-section">
          <div className="tech-specs-header">
            <h2 className="tech-specs-title">Technical Specifications</h2>
          </div>
          
          <div className="tech-specs-container">
            
            {/* 1. Beam Angles - Left Image, Right Content */}
            <div className="tech-spec-row left-image">
              <div className="spec-image">
                <img src={beamAngleImg} alt="Beam Angles" />
              </div>
              <div className="spec-content">
                <h3>Beam Angles</h3>
                <p>Beam angles determine how light is distributed from the source. Whether you need a focused spotlight or wide ambient lighting, Vivera Lighting offers a range of beam angles.</p>
              </div>
            </div>

            {/* 2. Color Temperature - Right Image, Left Content */}
            <div className="tech-spec-row right-image">
              <div className="spec-content">
                <h3>Color Temperature</h3>
                <p>Color Temperature influences the ambiance and mood of a space. Our lights range from warm to cool tones.</p>
              </div>
              <div className="spec-image">
                <img src={colorTempImg} alt="Color Temperature" />
              </div>
            </div>

            {/* 3. Lumens - Left Image, Right Content */}
            <div className="tech-spec-row left-image">
              <div className="spec-image">
                <img src={lumensImg} alt="Lumens" />
              </div>
              <div className="spec-content">
                <h3>Lumens</h3>
                <p>The lumen rating represents the brightness output of a light source. Our lights are engineered for maximum efficiency.</p>
                <p>The amount of light that falls on a surface is measured in lumens per square metre.</p>
              </div>
            </div>

            {/* 4. Dimmable & Tunable - Right Images, Left Content */}
            <div className="tech-spec-row right-image">
              <div className="spec-content">
                <h3>Dimmable, Tunable</h3>
                <p><strong>Dimmable Options:</strong> Smooth dimming from 100% to 1% without flicker.</p>
                <p><strong>Tunable Options:</strong> Adjust Color temperature dynamically from Warm2700K to Cool5000K with ease.</p>
              </div>
              <div className="spec-image dual-images">
                <div className="dual-image-container">
                  <img src={dimmableImg} alt="Dimmable" />
                  <img src={tunableImg} alt="Tunable" />
                </div>
              </div>
            </div>

            {/* 5. CRI Color Rendering - Left Image, Right Content */}
            <div className="tech-spec-row left-image">
              <div className="spec-image">
                <img src={criImg} alt="CRI Color Rendering Index" />
              </div>
              <div className="spec-content">
                <h3>CRI Color Rendering Index</h3>
                <p>The CRI measures how accurately a light source reveals the colors of objects.</p>
                <p><strong>CRI 80+</strong> - Ideal for general-purpose lighting</p>
                <p><strong>CRI 90+</strong> - Perfect for retail and hospitality applications where vibrant color reproduction is essential.</p>
                <p><strong>CRI 95+</strong> - Designed for high-end applications like art galleries and luxury retail.</p>
              </div>
            </div>

            {/* 6. Operating Mode - Right Icons, Left Content */}
            <div className="tech-spec-row right-image">
              <div className="spec-content">
                <h3>Operating Mode</h3>
                <p>Vivera lighting products are designed for flexible control, compatible with Bluetooth, WiFi, Audio and other smart connectivity options.</p>
                <p>Advanced connectivity for seamless integration with your smart home or commercial lighting system.</p>
              </div>
              <div className="spec-image operating-mode-icons">
                <div className="connectivity-visual">
                  <div className="connect-icons">
                    <div className="connect-item">
                      <div className="wifi-icon"></div>
                      <span>WiFi</span>
                    </div>
                    <div className="connect-item">
                      <div className="bluetooth-icon"></div>
                      <span>Bluetooth</span>
                    </div>
                    <div className="connect-item">
                      <div className="audio-icon"></div>
                      <span>Audio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Product Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Reviews</h2>
          <div className="product-reviews-header">
            <div className="review-rating-summary">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => {
                  const filledStars = Math.floor(averageRating);
                  const hasHalfStar = averageRating % 1 >= 0.5;
                  return (
                    <span key={i} className={`star ${i < filledStars ? 'filled' : i === filledStars && hasHalfStar ? 'half-filled' : 'unfilled'}`}>★</span>
                  );
                })}
              </div>
              <div className="rating-text">
                {totalReviews > 0 ? `${averageRating.toFixed(1)} / 5.0` : '0.0 / 5.0'}
              </div>
              <div className="review-count">({totalReviews})</div>
            </div>
            <button className="add-review-btn" onClick={() => setShowReviewModal(true)}>Add Review</button>
          </div>

          {totalReviews === 0 ? (
            <div className="no-reviews">Be the first to review this product.</div>
          ) : (
            <div className="reviews-container">
              <div className="reviews-list">
                {sortedReviews.map((review, idx) => {
                  const rating = parseInt(review.rating, 10) || 0;
                  const name = review.username || 'Anonymous';
                  return (
                    <div className="review-card" key={review.id || idx}>
                      <div className="review-card-header">
                        <div className="review-avatar">
                          {name ? name[0] : '?'}
                        </div>
                        <div className="review-user-info">
                          <div className="review-name">{name}</div>
                          <div className="review-rating">
                            <div className="review-stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < rating ? 'filled' : 'unfilled'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.message && (
                        <div className="review-text">{review.message}</div>
                      )}
                    </div>
                  );
                })}
                {/* Duplicate reviews for infinite scroll effect */}
                {sortedReviews.length > 3 && sortedReviews.map((review, idx) => {
                  const rating = parseInt(review.rating, 10) || 0;
                  const name = review.username || 'Anonymous';
                  return (
                    <div className="review-card" key={`duplicate-${review.id || idx}`}>
                      <div className="review-card-header">
                        <div className="review-avatar">
                          {name ? name[0] : '?'}
                        </div>
                        <div className="review-user-info">
                          <div className="review-name">{name}</div>
                          <div className="review-rating">
                            <div className="review-stars">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`star ${i < rating ? 'filled' : 'unfilled'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.message && (
                        <div className="review-text">{review.message}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
            const payload = {
              ...reviewForm,
              message: (reviewForm.message && reviewForm.message.trim()) ? reviewForm.message : ' ',
            };
            await publicReviewService.addProductReview(product.id, payload);
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
            placeholder="Your Review (optional)" 
            value={reviewForm.message} 
            onChange={e => setReviewForm(f => ({ ...f, message: e.target.value }))}
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
