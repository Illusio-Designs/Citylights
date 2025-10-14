import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../component/Header';
import Footer from '../component/Footer';
import "../styles/pages/StoreDetails.css"
import Map from '../assets/Interactive Map.webp'
import { useParams } from 'react-router-dom';
import { publicStoreService, publicReviewService } from '../services/publicService';
import Modal from '../component/common/Modal';
import { getStoreLogoUrl } from '../utils/imageUtils';

const StoreDetails = () => {
  const { name } = useParams();
  const [store, setStore] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentReview] = useState(0);
  const [reviewForm, setReviewForm] = useState({ username: '', email: '', phone_number: '', message: '', rating: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '', inquiry: '' });
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await publicStoreService.getStoreByName(name);
        const storeData = res.data.data || res.data;
        setStore(storeData);
        // Fetch reviews for this store
        if (storeData && storeData.id) {
          const reviewRes = await publicReviewService.getStoreReviews(storeData.id);
          setReviews(reviewRes.data || []);
        } else {
          setReviews([]);
        }
      } catch {
        setStore(null);
        setReviews([]);
      }
    };
    fetchStore();
  }, [name]);

  // Calculate the number of slides (2 reviews per slide)
  const reviewsPerSlide = 2;
  const startIdx = currentReview * reviewsPerSlide;
  const currentReviews = reviews.slice(startIdx, startIdx + reviewsPerSlide);

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
              </div>
            </div>
            <div className="store-status-services-row">
              <div className="store-status-col">
                <div className="store-detail-status">
                  <span className="green-dot"></span>
                  <span className="open-now">{store?.status === 'active' ? 'Open Now' : store?.status}</span>
                </div>
                {store?.shop_timings && (
                  <div className="store-hours-row">
                    <span className="icon-clock"></span>
                    <span className="store-hours">{store.shop_timings}</span>
                  </div>
                )}
              </div>
              <div className="store-services-col">
                <div className="services-label">Description</div>
                <div className="services-desc">{store?.description || '-'}</div>
              </div>
            </div>
            <div className="store-contact-row">
              {store?.phone && (
                <a href={`tel:${store.phone}`} className="action-btn"><span className="icon-phone"></span> {store.phone}</a>
              )}
              {store?.whatsapp_number && (
                <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="action-btn"><span className="icon-whatsapp"></span> {store.whatsapp_number}</a>
              )}
              {store?.email && (
                <a href={`mailto:${store.email}`} className="action-btn"><span className="icon-mail"></span> {store.email}</a>
              )}
            </div>
            <div className="store-btn-row">
              <button className="book-btn" onClick={() => setShowBookingModal(true)}>Book Free Appointment</button>
              {store?.map_location_url ? (
                <a className="action-btn" href={store.map_location_url} target="_blank" rel="noopener noreferrer"><span className="icon-directions"></span> Directions</a>
              ) : null}
            </div>
            <div className="reviews-section">
              <h2 className="reviews-title">Reviews</h2>
              <button className="add-review-btn" onClick={() => setShowReviewModal(true)}>Add Review</button>
              <div className="reviews-slider">
                {currentReviews.map((review, idx) => (
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
    </>
  );
};

export default StoreDetails;