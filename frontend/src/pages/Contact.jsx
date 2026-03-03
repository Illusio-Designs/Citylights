import React, { useState } from 'react';
import { publicContactService } from "../services/publicService";
import Header from "../component/Header";
import Footer from "../component/Footer";
import contactBg from '../assets/contact us.webp';
import "../styles/pages/Contact.css";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await publicContactService.submitContact(formData);
      setSuccess("Thank you! Your message has been sent successfully. We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
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
            {/* Phone */}
            <div className="contact-info-item phone-numbers-section">
              <span className="contact-icon"><FaPhoneAlt /></span>
              <div className="contact-info-content">
                <div className="contact-info-title">Phone Numbers</div>
                <div className="contact-phone-cards">
                  <div className="phone-card">
                    <div className="phone-card-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                      </svg>
                    </div>
                    <div className="phone-card-content">
                      <span className="phone-card-label">Customer Care</span>
                      <a href="tel:+919879873757">+91 98798 73757</a>
                    </div>
                  </div>
                  <div className="phone-card">
                    <div className="phone-card-icon sales-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
                      </svg>
                    </div>
                    <div className="phone-card-content">
                      <span className="phone-card-label">Sales Inquiry</span>
                      <a href="tel:+918128888899">+91 81288 88899</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Email */}
            <div className="contact-info-item">
              <span className="contact-icon"><FaEnvelope /></span>
              <div>
                <div className="contact-info-title">Email</div>
                <div className="contact-info-text">
                  <a href="mailto:viveralightings@gmail.com">viveralightings@gmail.com</a><br />
                  <a href="mailto:Akash@viveralighting.com">Akash@viveralighting.com</a>
                </div>
              </div>
            </div>
            {/* Address */}
            <div className="contact-info-item">
              <span className="contact-icon"><FaMapMarkerAlt /></span>
              <div>
                <div className="contact-info-title">Address</div>
                <div className="contact-info-text">Rajkot, Gujarat, India.</div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input 
                type="text" 
                name="name"
                placeholder="Name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <input 
                type="text" 
                name="phone"
                placeholder="Phone" 
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input 
                type="text" 
                name="subject"
                placeholder="Subject" 
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <textarea 
                name="message"
                placeholder="Message" 
                rows="4"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-row">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d65548.28468861307!2d70.7933990493785!3d22.283261846539638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1749289961835!5m2!1sen!2sin" 
            width="600" 
            height="450" 
            style={{border: 0}} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
