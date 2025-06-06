import React from 'react';
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Contact.css";

const Contact = () => {
  return (
    <>
    <Header />
    <div className="contact-container">
      <div className="contact-header">
        <span className="contact-watermark">contact us</span>
        <h1>Contact Us</h1>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default Contact;
