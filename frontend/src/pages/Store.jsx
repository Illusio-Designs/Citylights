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
import { useEffect, useState } from "react";

const Store = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await publicStoreService.getStores();
        setStores(res.data.data || res.data); // support both {data:[]} and []
      } catch (err) {
        setError("Failed to load stores");
      }
      setLoading(false);
    };
    fetchStores();
  }, []);

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
                    <span className="store-card-title">{store.name}</span>
                    <span className="store-listing-status">
                      <span className="status-dot"></span> {store.status || 'Open Now'}
                    </span>
                  </div>
                  <div className="store-card-info">
                    <div>
                      <img src={locationIcon} alt="Location" className="icon-img" style={{ marginRight: 6 }} />
                      {store.address}
                    </div>
                    <div>
                      <img src={phoneIcon} alt="Phone" className="icon-img" style={{ marginRight: 6 }} />
                      {store.phone}
                    </div>
                  </div>
                  <div className="store-card-actions">
                    <button className="store-details-btn" onClick={() => navigate(`/store-details/${store.id}`)}>Store Details</button>
                    <button className="book-appointment-btn">Book Free Appointment</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="store-map-column">
            <img src={map} alt="Map" className="store-map-img" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Store;
