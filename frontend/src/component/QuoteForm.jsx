import React, { useState } from "react";
import { toast } from "react-toastify";
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

    try {
      await publicContactService.submitContact(formData);
      toast.success("Thank you! Your quote request has been submitted successfully. We'll get back to you soon!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Quote Request",
        message: ""
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quote request. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
          <button className="quote-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="quote-form">
          <div className="quote-form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Full Name"
              required
            />
          </div>

          <div className="quote-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>

          <div className="quote-form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
          </div>

          <div className="quote-form-group">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your lighting project, space dimensions, preferred style, budget range, etc."
              rows="4"
              required
            />
          </div>

          <div className="quote-form-actions">
            <button type="button" onClick={onClose} className="quote-cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="quote-submit-btn">
              {loading ? "Submitting..." : "Get Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;