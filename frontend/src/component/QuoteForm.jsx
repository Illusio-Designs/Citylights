import React, { useState } from "react";
import { publicContactService } from "../services/publicService";
import "../styles/component/QuoteForm.css";

const QuoteForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Quote Request",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

    try {
      await publicContactService.submitContact(formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Quote Request",
        message: ""
      });
      
      // Close form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit quote request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="quote-form-overlay">
      <div className="quote-form-container">
        <div className="quote-form-header">
          <h2>Get Your Quote</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {success ? (
          <div className="success-message">
            <h3>Thank you!</h3>
            <p>Your quote request has been submitted successfully. We'll get back to you soon!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="quote-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Project Details *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your lighting project, space dimensions, preferred style, budget range, etc."
                rows="4"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Submitting..." : "Get Quote"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuoteForm;