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
            <div className="contact-info-item">
              <span className="contact-icon"><FaPhoneAlt /></span>
              <div>
                <div className="contact-info-title">Phone Number</div>
                <div className="contact-info-text">
                  <a href="tel:+919879873757">+91 9879873757</a>
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
