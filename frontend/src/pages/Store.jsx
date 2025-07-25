import React  from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Store.css";
import storebg from "../assets/store locator.png";
import locationIcon from "../assets/locationicon.png";
import phoneIcon from "../assets/callicon.png";
import searchIcon from "../assets/searchicon.png";
import map from '../assets/Interactive Map.png';
import { useNavigate } from "react-router-dom";
import { publicStoreService } from "../services/publicService";
import { useEffect, useState, useRef } from "react";
import Modal from '../component/common/Modal';

const Store = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const mapRef = useRef(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', phone: '', email: '', inquiry: '' });
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingStore, setBookingStore] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await publicStoreService.getStores();
        setStores(res.data.data || res.data); // support both {data:[]} and []
      } catch {
        setError("Failed to load stores");
      }
      setLoading(false);
    };
    fetchStores();
  }, []);

  // Helper to get Google Maps embed URL
  const getMapUrl = (store) => {
    if (!store || !store.map_location_url) return "https://maps.google.com/maps?q=India&t=&z=13&ie=UTF8&iwloc=&output=embed";
    return store.map_location_url.replace("/maps/", "/maps/embed?");
  };

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const getLogoUrl = (logo) => logo && !logo.startsWith('http') ? `${BASE_URL.replace('/api', '')}/uploads/logos/${logo}` : logo;

  return (
    <>
      <Header />
      <div className="store-container">
        <div className="store-heading">
          <img src={storebg} alt="store locator" className="store-image-bg" />
          <h1 className="store-heading-text">Store Locator</h1>
        </div>
        <div className="store-actions-row">
          <div className="store-action search">
            <span className="icon-search">
              <img src={searchIcon} alt="Search" className="icon-img" />
            </span>
            <input type="text" placeholder="Search" className="store-input" />
          </div>
          <div className="store-action location">
            <span className="icon-location">
              <img src={locationIcon} alt="Location" className="icon-img" />
            </span>
            <span>Use My Current Location</span>
          </div>
          <a className="store-action help" href="#">
            <span className="icon-help">
              <img src={phoneIcon} alt="Help" className="icon-img" />
            </span>
            <span>Need Help?</span>
          </a>
        </div>
        <div className="store-main-content">
          <div className="store-cards-column">
            {loading ? (
              <div>Loading stores...</div>
            ) : error ? (
              <div style={{ color: 'red' }}>{error}</div>
            ) : stores.length === 0 ? (
              <div>No stores found.</div>
            ) : (
              stores.map((store, idx) => (
                <div className="store-card" key={store.id || idx}>
                  <div className="store-card-header">
                    {store.logo && (
                      <img src={getLogoUrl(store.logo)} alt="Store Logo" className="store-logo-img" />
                    )}
                    <span className="store-card-title">{store.name}</span>
                    <span className="store-listing-status">
                      <span className="status-dot"></span> {store.status || 'Open Now'}
                    </span>
                  </div>
                  <div className="store-card-info">
                    <div onClick={() => setSelectedStore(store)} style={{cursor:'pointer'}}>
                      <img src={locationIcon} alt="Location" className="icon-img" style={{ marginRight: 6 }} />
                      {store.address}
                    </div>
                    <div>
                      <img src={phoneIcon} alt="Phone" className="icon-img" style={{ marginRight: 6 }} />
                      {store.phone}
                    </div>
                    {store.shop_timings && (
                      <div>
                        <b>Timings:</b> {store.shop_timings}
                      </div>
                    )}
                  </div>
                  <div className="store-card-actions">
                    <button className="store-details-btn" onClick={() => { setSelectedStore(store); navigate(`/store-details/${store.name}`); }}>Store Details</button>
                    <button className="book-appointment-btn" onClick={() => { setBookingStore(store); setShowBookingModal(true); }}>Book Free Appointment</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="store-map-column">
            <iframe
              ref={mapRef}
              title="Google Map"
              src={getMapUrl(selectedStore)}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: 12 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            {selectedStore && (
              <div className="store-map-info-box">
                {selectedStore.logo && <img src={getLogoUrl(selectedStore.logo)} alt="Store Logo" className="store-logo-img" />}
                <h3>{selectedStore.name}</h3>
                <div>{selectedStore.address}</div>
                <div>{selectedStore.phone}</div>
                {selectedStore.shop_timings && <div><b>Timings:</b> {selectedStore.shop_timings}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <Modal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} title={`Book an Appointment${bookingStore ? ' at ' + bookingStore.name : ''}`}>
        <form onSubmit={e => {
          e.preventDefault();
          setBookingSuccess('');
          setTimeout(() => {
            setBookingSuccess('Booking submitted!');
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

export default Store;
