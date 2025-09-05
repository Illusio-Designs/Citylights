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
  const formatDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString(); } catch { return ''; }
  };

  // Function to generate PDF with product details and images
  const generateProductPDF = async () => {
    try {
      // Show loading state
      toast.info('Generating PDF...');
      
      // Get images for the selected variation only
      const imageUrls = variationImages.map(img => getProductImageUrl(img.image_url));
      
      // Create HTML content for PDF that matches the page design
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${product.name} - Product Details</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'DM Sans', sans-serif; 
              background: #fff; 
              color: #191919;
              line-height: 1.6;
            }
            
            .pdf-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            
            .pdf-header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #f0f0f0;
              padding-bottom: 30px;
            }
            
            .pdf-title {
              font-family: 'Playfair Display', serif;
              font-size: 36px;
              font-weight: 400;
              color: #191919;
              margin-bottom: 10px;
            }
            
            .pdf-subtitle {
              font-size: 18px;
              color: #444;
              margin-bottom: 15px;
            }
            
            .pdf-category {
              font-size: 18px;
              color: #000;
            }
            
            .pdf-content {
              display: flex;
              gap: 40px;
              margin-bottom: 40px;
            }
            
            .pdf-image-section {
              flex: 0 0 300px;
            }
            
            .pdf-main-image {
              width: 100%;
              height: 300px;
              object-fit: cover;
              border-radius: 32px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.09);
              margin-bottom: 20px;
            }
            
            .pdf-thumbnails {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
            }
            
            .pdf-thumbnail {
              width: 60px;
              height: 60px;
              border-radius: 12px;
              object-fit: cover;
              border: 1.5px solid #eee;
            }
            
            .pdf-info-section {
              flex: 1;
            }
            
            .pdf-specs {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px 18px;
              margin-bottom: 30px;
            }
            
            .pdf-spec-box {
              border: 1px solid #ddd;
              border-radius: 12px;
              padding: 12px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: white;
            }
            
            .pdf-spec-label {
              color: #666;
              font-size: 14px;
              font-weight: 500;
            }
            
            .pdf-spec-value {
              font-weight: 600;
              font-size: 14px;
              color: #191919;
            }
            
            .pdf-applications {
              font-size: 17px;
              margin-bottom: 15px;
            }
            
            .pdf-material {
              font-size: 17px;
              margin-bottom: 30px;
            }
            
            .pdf-app-value,
            .pdf-material-value {
              font-weight: 500;
              color: #191919;
              margin-left: 6px;
            }
            
            .pdf-variations {
              margin: 30px 0;
            }
            
            .pdf-variation-box {
              border: 1px solid #eee;
              border-radius: 12px;
              padding: 15px;
              margin: 10px 0;
              background: #fafafa;
            }
            
            .pdf-variation-title {
              font-weight: 600;
              margin-bottom: 10px;
              color: #191919;
            }
            
            .pdf-images-section {
              margin: 40px 0;
              page-break-inside: avoid;
            }
            
            .pdf-images-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            
            .pdf-image-item {
              text-align: center;
            }
            
            .pdf-image-item img {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 16px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            }
            
            .pdf-footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            
            @media print {
              body { margin: 0; }
              .pdf-container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <div class="pdf-header">
              <div class="pdf-title">${product.name}</div>
              ${firstVariation.description ? `<div class="pdf-subtitle">${firstVariation.description}</div>` : ''}
              <div class="pdf-category">Category: ${collection ? collection.name : 'N/A'}</div>
            </div>
            
            <div class="pdf-content">
              <div class="pdf-image-section">
                <img src="${getProductImageUrl(activeImageUrl)}" alt="${product.name}" class="pdf-main-image" />
                <div class="pdf-thumbnails">
                  ${imageUrls.slice(0, 6).map((url, index) => `
                    <img src="${url}" alt="Thumbnail ${index + 1}" class="pdf-thumbnail" />
                  `).join('')}
                </div>
              </div>
              
              <div class="pdf-info-section">
                <div class="pdf-specs">
                  ${specData.map(spec => `
                    <div class="pdf-spec-box">
                      <span class="pdf-spec-label">${spec.label}</span>
                      <span class="pdf-spec-value">${spec.value}</span>
                    </div>
                  `).join('')}
                </div>
                
                <div class="pdf-applications">
                  <span>Applications:</span>
                  <span class="pdf-app-value">${firstVariation.usecase || 'N/A'}</span>
                </div>
                
                ${firstVariation.attributes && firstVariation.attributes.length > 0 ? `
                  <div class="pdf-variation-box">
                    <div style="font-weight:600; margin-bottom:6px;">Attributes</div>
                    <ul style="margin-top:5px; padding-left:20px;">
                      ${firstVariation.attributes.map(attr => `<li><strong>${attr.name}:</strong> ${attr.value}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
            
            ${allVariations.length > 1 ? `
              <div class="pdf-variations">
                <h3 style="font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 20px;">Other Variations</h3>
                ${allVariations
                  .filter(v => v.sku !== firstVariation.sku)
                  .map(variation => `
                    <div class="pdf-variation-box">
                      <div class="pdf-variation-title">${variation.sku || 'Variation'}</div>
                      <div><strong>SKU:</strong> ${variation.sku || 'N/A'}</div>
                    </div>
                  `).join('')}
              </div>
            ` : ''}
            
            <div class="pdf-footer">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Create a hidden iframe for PDF generation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Write content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Clean up iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 1000);
      
      toast.success('PDF download started! Select "Save as PDF" in the print dialog.');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

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
            <div className="productdetail-mainimg shimmer">
              <img
                src={getProductImageUrl(activeImageUrl)}
                alt={product.name}
                style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                onLoad={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                onError={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
              />
            </div>
            <div className="productdetail-thumbnails">
              {variationImages.map((img, i) => (
                <img
                  key={i}
                  src={getProductImageUrl(img.image_url)}
                  alt={`thumb-${i}`}
                  className={i === activeImgIndex ? 'active' : ''}
                  style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease', cursor: 'pointer' }}
                  onClick={() => setActiveImgIndex(i)}
                  onLoad={(e) => { e.currentTarget.style.filter = 'none'; }}
                  onError={(e) => { e.currentTarget.style.filter = 'none'; }}
                />
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
                <div><b>Usecase:</b> {selectedVariation.usecase || '-'}</div>
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
            
            
         



            <div className="productdetail-actions">
              <button 
                className="productdetail-pdfbtn" 
                onClick={() => {
                  if (pdfUrl) {
                    // If there's an existing PDF, download it
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = `${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`;
                    link.target = '_blank';
                    link.click();
                  } else {
                    // Generate and download a new PDF with product details and images
                    generateProductPDF();
                  }
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}>
                    <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="4" y="15" width="12" height="2" rx="1" fill="#222"/>
                  </svg>
                  {pdfUrl ? 'Download PDF' : 'Download PDF'}
                </span>
              </button>
              <button className="productdetail-contactbtn">Contact for Purchase</button>
            </div>

          </div>
        </div>
        
        {/* Product Reviews Section */}
        <div className="reviews-section" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <h2 className="reviews-title" style={{ margin: 0 }}>Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {totalReviews > 0 ? `${averageRating.toFixed(1)} / 5.0` : 'No ratings yet'}
              </div>
              <div className="review-stars" aria-label={`Average rating ${averageRating.toFixed(1)} out of 5`} style={{ fontSize: 14 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`star ${i < Math.round(averageRating) ? 'filled' : 'unfilled'}`}>★</span>
                ))}
              </div>
              <div style={{ color: '#666', fontSize: 13 }}>({totalReviews})</div>
            </div>
            <button className="add-review-btn" onClick={() => setShowReviewModal(true)} style={{ marginLeft: 'auto' }}>Add Review</button>
          </div>

          {totalReviews === 0 ? (
            <div style={{ marginTop: 12, color: '#666' }}>Be the first to review this product.</div>
          ) : (
            <div className="reviews-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginTop: 16 }}>
              {sortedReviews.map((review, idx) => {
                const rating = parseInt(review.rating, 10) || 0;
                const dateLabel = formatDate(review.updated_at || review.created_at);
                const name = review.username || 'Anonymous';
                return (
                  <div className="review-card" key={review.id || idx} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div className="review-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {name ? name[0] : '?'}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="review-name" style={{ fontWeight: 600 }}>{name}</div>
                        {dateLabel && <div style={{ color: '#888', fontSize: 12 }}>{dateLabel}</div>}
                      </div>
                    </div>
                    <div className="review-stars" style={{ marginBottom: 6 }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < rating ? 'filled' : 'unfilled'}`}>★</span>
                      ))}
                    </div>
                    {review.message && (
                      <div className="review-text" style={{ color: '#222', lineHeight: 1.5 }}>{review.message}</div>
                    )}
                  </div>
                );
              })}
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
