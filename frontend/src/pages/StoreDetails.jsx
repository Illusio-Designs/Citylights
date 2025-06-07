import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import "../styles/pages/StoreDetails.css"
import whatsappIcon from '../assets/whatsappicon.png';
import directionIcon from '../assets/direction.png';
import callIcon from '../assets/callicon.png';

const reviews = [
  {
    name: 'Name',
    rating: 3,
    text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum',
    initial: 'N',
  },
  {
    name: 'Name',
    rating: 3,
    text: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum',
    initial: 'N',
  },
];

const StoreDetails = () => {
  const [currentReview, setCurrentReview] = useState(0);

  // Calculate the number of slides (2 reviews per slide)
  const reviewsPerSlide = 2;
  const numSlides = Math.ceil(reviews.length / reviewsPerSlide);

  // Get the reviews for the current slide
  const startIdx = currentReview * reviewsPerSlide;
  const currentReviews = reviews.slice(startIdx, startIdx + reviewsPerSlide);

  return (
    <>
      <Header />
      <div className="store-details-container">
        <div className='store-content'>
          <h1 className='store-title'>New Store</h1>
          <p className='store-address'>No 20.Six cross street Parris conner, Chennai-600095</p>
          <div className="store-status-services-block">
            <div className="store-status-services-row">
              <div className="store-card-status">
                <span className="status-dot"></span>
                <span className="open-now-label">Open Now</span>
              </div>
              <div className="services-label">Services</div>
            </div>
            <div className="store-status-services-row">
              <div className="store-hours">10:00 AM - 10:00 PM</div>
              <div className="services-desc">Contrary to popular belief, Lorem Ipsum</div>
            </div>
          </div>
          <div className="store-actions-row">
            <button className="book-btn">Book Free Appointment</button>
            <a className="action-btn"><img src={directionIcon} alt="Directions" className="action-icon" /> Directions</a>
            <a className="action-btn"><img src={callIcon} alt="Call" className="action-icon" /> Call</a>
            <a className="action-btn"><img src={whatsappIcon} alt="Need help?" className="action-icon" /> Need help?</a>
          </div>

          <div className="reviews-section">
            <h2 className="reviews-title">Reviews</h2>
            <div className="reviews-slider">
              {currentReviews.map((review, idx) => (
                <div className="review-card" key={idx}>
                  <div className="review-avatar">{review.initial}</div>
                  <div className="review-content">
                    <div className="review-name">{review.name}</div>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < review.rating ? 'filled' : 'unfilled'}`}>★</span>
                      ))}
                    </div>
                    <div className="review-text">{review.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="slider-dots">
              {Array.from({ length: numSlides }).map((_, idx) => (
                <span
                  key={idx}
                  className={`slider-dot${currentReview === idx ? ' active' : ''}`}
                  onClick={() => setCurrentReview(idx)}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoreDetails;