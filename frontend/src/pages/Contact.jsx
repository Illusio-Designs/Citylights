import React from 'react';
import Header from "../component/Header";
import Footer from "../component/Footer";
import contactBg from '../assets/contact us.png';
import "../styles/pages/Contact.css";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Contact = () => {
  return (
    <>
    <Header />
    <div className="contact">
    <div className="contact-heading-section">
          <img src={contactBg} alt="contact bg" className="contact-bg-img" />
          <span className="contact-title">Contact Us</span>
        </div>
      <div className="contact-content">
        <div className="contact-info-card">
          <div className="contact-info-item">
            <span className="contact-icon"><FaMapMarkerAlt /></span>
            <div>
              <div className="contact-info-title">Address</div>
              <div className="contact-info-text">No 20.Six cross street Parris conner, Chennai-600095</div>
            </div>
          </div>
          <div className="contact-info-item">
            <span className="contact-icon"><FaEnvelope /></span>
            <div>
              <div className="contact-info-title">Email</div>
              <div className="contact-info-text">ecotrade@gmail.com</div>
            </div>
          </div>
          <div className="contact-info-item">
            <span className="contact-icon"><FaPhoneAlt /></span>
            <div>
              <div className="contact-info-title">Phone Number</div>
              <div className="contact-info-text">+91 95321 63024</div>
            </div>
          </div>
        </div>
        <form className="contact-form">
          <div className="form-row">
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
          </div>
          <div className="form-row">
            <input type="text" placeholder="Phone" />
            <input type="text" placeholder="Subject" />
          </div>
          <div className="form-row">
            <textarea placeholder="Message" rows="4"></textarea>
          </div>
        </form>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default Contact;
