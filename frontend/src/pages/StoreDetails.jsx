import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../component/Header';
import Footer from '../component/Footer';
import "../styles/pages/StoreDetails.css"
import Map from '../assets/Interactive Map.webp'
import { useParams } from 'react-router-dom';
import { publicStoreService, publicReviewService } from '../services/publicService';
import Modal from '../component/common/Modal';
import { getStoreLogoUrl, getStoreImageUrl } from '../utils/imageUtils';

const StoreDetails = () => {
  const { name } = useParams();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ username: '', email: '', phone_number: '', message: '', rating: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '', inquiry: '' });
  const [helpForm, setHelpForm] = useState({ name: '', phone: '', query: '' });
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await publicStoreService.getStoreByName(name);
        const storeData = res.data.data || res.data;
        console.log('Store data:', storeData);
        console.log('Store images (raw):', storeData?.images);
        
        // Parse images if they're stored as JSON string
        let images = storeData?.images;
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            console.error('Error parsing images JSON:', e);
            images = [];
          }
        }
        if (!Array.isArray(images)) {
          images = [];
        }
        
        console.log('Store images (parsed):', images);
        
        // Update store data with parsed images
        const updatedStoreData = { ...storeData, images };
        setStore(updatedStoreData);
        
        // Fetch reviews for this store
        if (storeData && storeData.id) {
          const reviewRes = await publicReviewService.getStoreReviews(storeData.id);
          setReviews(reviewRes.data || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching store:', error);
        setStore(null);
        setReviews([]);
      }
    };
    fetchStore();
  }, [name]);


  // Helper to get Google Maps embed URL
  const getMapUrl = (store) => {
    if (!store || !store.map_location_url) return "https://maps.google.com/maps?q=India&t=&z=13&ie=UTF8&iwloc=&output=embed";
    return store.map_location_url.replace("/maps/", "/maps/embed?");
  };



  return (
    <>
      <Header />
      <div className="store-details-container">
        <div className="map-and-detail">
          <div className="store-content">
            <div className="store-header-section">
              {store && store.logo && (
                <div className="store-logo-box shimmer">
                  <img
                    src={getStoreLogoUrl(store.logo)}
                    alt="Store Logo"
                    className="store-logo-img"
                    style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                    onLoad={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                    onError={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                  />
                </div>
              )}
              <div className="store-main-info">
                <h1 className='store-title'>{store?.name}</h1>
                <div className="store-address-row">
                  <span className="icon-location"></span>
                  <span className='store-address'>{store?.address}</span>
                </div>
                <div className="store-status-row">
                  <div className="store-detail-status">
                    <span className="green-dot"></span>
                    <span className="open-now">Open Now</span>
                  </div>
                  {store?.shop_timings && (
                    <div className="store-hours-row">
                      <span className="icon-clock"></span>
                      <span className="store-hours">{store.shop_timings}</span>
                    </div>
                  )}
                </div>
                <div className="store-services-section">
                  <div className="services-label">Services</div>
                  <div className="services-desc">{store?.description || 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.'}</div>
                </div>
              </div>
            </div>
            <div className="store-btn-row">
              <button className="book-btn" onClick={() => setShowBookingModal(true)}>Book Free Appointment</button>
              <a href={store?.map_location_url || '#'} target="_blank" rel="noopener noreferrer" className="action-btn">
                <span className="icon-directions"></span> Directions
              </a>
              {store?.phone && (
                <a href={`tel:${store.phone}`} className="action-btn">
                  <span className="icon-phone"></span> Call
                </a>
              )}
              <button className="action-btn" onClick={() => setShowHelpModal(true)}>
                <span className="icon-help">?</span> Need help?
              </button>
            </div>
            {store?.images && Array.isArray(store.images) && store.images.length > 0 && (
              <div className="store-gallery-section">
                <h2 className="gallery-title">Store Gallery ({store.images.length} images)</h2>
                <div className="store-gallery-grid">
                  {store.images.map((image, index) => {
                    const imageUrl = getStoreImageUrl(image);
                    console.log(`Image ${index + 1}:`, image, '→', imageUrl);
                    return (
                      <div key={index} className="gallery-item shimmer">
                        <img
                          src={imageUrl}
                          alt={`Store ${index + 1}`}
                          className="gallery-image"
                          style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                          onLoad={(e) => { 
                            console.log('Image loaded:', imageUrl);
                            e.currentTarget.style.filter = 'none'; 
                            if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); 
                          }}
                          onError={(e) => { 
                            console.error('Image failed to load:', imageUrl);
                            e.currentTarget.style.filter = 'none'; 
                            if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); 
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="reviews-section">
              <h2 className="reviews-title">Reviews</h2>
              <div className="product-reviews-header">
                <div className="review-rating-summary">
                  <div className="review-stars">
                    {[...Array(5)].map((_, i) => {
                      const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / reviews.length : 0;
                      const filledStars = Math.floor(averageRating);
                      const hasHalfStar = averageRating % 1 >= 0.5;
                      return (
                        <span key={i} className={`star ${i < filledStars ? 'filled' : i === filledStars && hasHalfStar ? 'half-filled' : 'unfilled'}`}>★</span>
                      );
                    })}
                  </div>
                  <div className="rating-text">
                    {reviews.length > 0 ? `${(reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / reviews.length).toFixed(1)} / 5.0` : '0.0 / 5.0'}
                  </div>
                  <div className="review-count">({reviews.length})</div>
                </div>
                <button className="add-review-btn" onClick={() => setShowReviewModal(true)}>Add Review</button>
              </div>
              {reviews.length === 0 ? (
                <div className="no-reviews">Be the first to review this store.</div>
              ) : (
                <div className="reviews-container">
                  <div className="reviews-list">
                    {reviews.map((review, idx) => {
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
                    {reviews.length > 3 && reviews.map((review, idx) => {
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
              <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Add a Review">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setSubmitError('');
                  setSubmitSuccess('');
                  try {
                                         await publicReviewService.addStoreReview(store?.id, reviewForm);
                     toast.success('Review submitted successfully! It will be visible after admin approval.');
                                         setReviewForm({ username: '', email: '', phone_number: '', message: '', rating: '' });
                    const reviewRes = await publicReviewService.getStoreReviews(store?.id);
                    setReviews(reviewRes.data || []);
                    setTimeout(() => {
                      setShowReviewModal(false);
                    }, 1200);
                  } catch (error) {
                    const errorMessage = 'Failed to submit review.';
                    setSubmitError(errorMessage);
                    toast.error(errorMessage);
                  }
                  setSubmitting(false);
                }} className="review-form">
                                     <input type="text" placeholder="Your Name" value={reviewForm.username} onChange={e => setReviewForm(f => ({ ...f, username: e.target.value }))} required />
                   <input type="email" placeholder="Your Email" value={reviewForm.email} onChange={e => setReviewForm(f => ({ ...f, email: e.target.value }))} required />
                   <input type="text" placeholder="Phone Number" value={reviewForm.phone_number} onChange={e => setReviewForm(f => ({ ...f, phone_number: e.target.value }))} required />
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
                   <textarea placeholder="Your Review" value={reviewForm.message} onChange={e => setReviewForm(f => ({ ...f, message: e.target.value }))} required />
                  <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                  {submitError && <div style={{ color: 'red' }}>{submitError}</div>}
                  {submitSuccess && <div style={{ color: 'green' }}>{submitSuccess}</div>}
                </form>
              </Modal>
            </div>
          </div>
          <div className="map-modern-box">
            <div className="map-modern-wrapper">
              <iframe
                title="Google Map"
                src={getMapUrl(store)}
                width="100%"
                height="400"
                className="modern-map-iframe"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
              {store && (
                <div className="modern-map-info-overlay">
                  {store.logo && (
                    <div className="modern-map-logo shimmer" style={{ display: 'inline-block' }}>
                    <img
                      src={getStoreLogoUrl(store.logo)}
                      alt="Store Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                        onLoad={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                        onError={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                      />
                    </div>
                  )}
                  <div className="modern-map-info-content">
                    <h3>{store.name}</h3>
                    <div className="modern-map-info-row"><span className="icon-location"></span> {store.address}</div>
                    {store.shop_timings && <div className="modern-map-info-row"><span className="icon-clock"></span> {store.shop_timings}</div>}
                    {store.phone && <div className="modern-map-info-row"><span className="icon-phone"></span> {store.phone}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Other Stores Nearby section remains below, visually improved in CSS */}
      </div>
      <Footer />
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title="Book an Appointment">
        <form onSubmit={e => {
          e.preventDefault();
          setBookingSuccess('');
          // Simulate booking submit (replace with real API if needed)
          setTimeout(() => {
            toast.success('Booking submitted successfully!');
            setShowBookingModal(false);
            setBookingForm({ name: '', phone: '', email: '', inquiry: '' });
          }, 1000);
        }} className="booking-form">
          <input type="text" placeholder="Your Name" value={bookingForm.name} onChange={e => setBookingForm(f => ({ ...f, name: e.target.value }))} required />
          <input type="email" placeholder="Your Email" value={bookingForm.email} onChange={e => setBookingForm(f => ({ ...f, email: e.target.value }))} required />
          <input type="text" placeholder="Phone Number" value={bookingForm.phone} onChange={e => setBookingForm(f => ({ ...f, phone: e.target.value }))} required />
          <textarea placeholder="Inquiry / Message" value={bookingForm.inquiry} onChange={e => setBookingForm(f => ({ ...f, inquiry: e.target.value }))} required />
          <button type="submit">Submit</button>
          {bookingSuccess && <div style={{ color: 'green' }}>{bookingSuccess}</div>}
        </form>
      </Modal>

      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="Need Help?">
        <form onSubmit={async (e) => {
          e.preventDefault();
          setSubmitting(true);
          setSubmitError('');
          setSubmitSuccess('');
          try {
            // Simulate help submit (replace with real API if needed)
            setTimeout(() => {
              toast.success('Your query has been submitted successfully! We will get back to you soon.');
              setHelpForm({ name: '', phone: '', query: '' });
              setShowHelpModal(false);
            }, 1000);
          } catch (error) {
            const errorMessage = 'Failed to submit your query.';
            setSubmitError(errorMessage);
            toast.error(errorMessage);
          }
          setSubmitting(false);
        }} className="help-form">
          <input type="text" placeholder="Your Name" value={helpForm.name} onChange={e => setHelpForm(f => ({ ...f, name: e.target.value }))} required />
          <input type="text" placeholder="Phone Number" value={helpForm.phone} onChange={e => setHelpForm(f => ({ ...f, phone: e.target.value }))} required />
          <textarea placeholder="Your Query" value={helpForm.query} onChange={e => setHelpForm(f => ({ ...f, query: e.target.value }))} required />
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Query'}</button>
          {submitError && <div style={{ color: 'red' }}>{submitError}</div>}
          {submitSuccess && <div style={{ color: 'green' }}>{submitSuccess}</div>}
        </form>
      </Modal>
    </>
  );
};

export default StoreDetails;