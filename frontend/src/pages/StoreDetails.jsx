import React, { useState } from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import "../styles/pages/StoreDetails.css"
import whatsappIcon from '../assets/whatsappicon.png';
import directionIcon from '../assets/direction.png';
import callIcon from '../assets/callicon.png';
import  Map from '../assets/Interactive Map.png'

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
        <div className='map-and-detail'>
        <div className='store-content'>
          <h1 className='store-title'>New Store</h1>
          <p className='store-address'>No 20.Six cross street Parris conner, Chennai-600095</p>
          <div className="store-status-services-row">
            <div className="store-status-col">
              <div className="store-detail-status">
                <span className="green-dot"></span>
                <span className="open-now">Open Now</span>
              </div>
              <div className="store-hours">10:00 AM - 10:00 PM</div>
            </div>
            <div className="store-services-col">
              <div className="services-label">Services</div>
              <div className="services-desc">Contrary to popular belief, Lorem Ipsum</div>
            </div>
          </div>
          <div className="store-btn-row">
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
          </div>
        </div>
        <div className='map'>
          <img src={Map} 
          alt='map'
          className='map-img'/>
        </div>
        </div>
        {/* Other Stores Nearby Section */}
        <div className="other-stores-section">
          <h2 className="other-stores-title">Other Stores Nearby</h2>
          <div className="other-stores-row">
            {[1,2,3,4].map((_, idx) => (
              <div className="other-store-card" key={idx}>
                <div className="other-store-name">New Store</div>
                <div className="other-store-address">
                  No 20.Six cross street Parris conner,<br />Chennai-600095
                </div>
                <div className="other-store-actions">
                  <span className="other-store-action">
                    <img src={callIcon} alt="Call" className="other-store-icon" /> Call
                  </span>
                  <span className="other-store-action">
                    <img src={directionIcon} alt="Directions" className="other-store-icon" /> <span className="other-store-distance">5.5 KM</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoreDetails;