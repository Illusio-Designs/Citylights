import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import aboutUsBg from '../assets/about us.webp';
import whyChooseUsBg from '../assets/choose us.webp';
import browselights1 from '../../src/assets/productcard1.webp';
import bulb from '../assets/bulb.webp';
import clock from '../assets/clock.webp';
import phone from '../assets/phone.webp';
import '../styles/pages/Aboutus.css';

const Aboutus = () => {
  return (
    <>
      <Header />
      <div className="aboutus">
      <div className="aboutus-header">
          <img src={aboutUsBg} alt="about us" className="about-us-img" />
          <span className="about-us-title">About Us</span>
        </div>
      <div className="aboutus-container">
        <section className="aboutus-section history-section">
          <div className="aboutus-image">
            <img src={browselights1} alt="about us" />
            <h2>HISTORY</h2>
          </div>
          <div className="aboutus-text">
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
          </div>
        </section>
        <section className="aboutus-section mission-section">
          <div className="aboutus-text">
            <p>At VIVERA, we are driven by a passion to illuminate spaces with elegance, innovation, and quality. Our mission is to offer a wide range of lighting solutions that not only enhance the aesthetics of any space but also reflect the unique personality and taste of our customers. We are committed to delivering the finest lighting products at the most competitive prices, without compromising on quality or design.
            </p>
            <p>Customization lies at the heart of our offerings — whether it’s modern, classic, or fully bespoke chandeliers, we ensure every product meets the specific needs and vision of our clients. From decorative and corporate lighting to luxurious statement pieces, every design is crafted with precision and care.
            </p>
            <p>With our tagline “Feel Luxury Together,” we aim to redefine the lighting experience by making luxury accessible and personalized. Our goal is to build a trusted brand that stands for excellence, reliability, and innovation — not just in India, but across the globe.</p>
            
          </div>
          <div className="aboutus-image">
            <img src={browselights1} alt="about us" />
            <h2>MISSION</h2>
          </div>
        </section>
        <section className="aboutus-section vision-section">
        <div className="aboutus-image">
            <img src={browselights1} alt="about us" />
            <h2>VISION</h2>
          </div>
          <div className="aboutus-text">
            <p>At VIVERA, our vision is to be a global leader in luxury lighting, creating timeless designs that inspire, elevate, and transform every space they illuminate. We aspire to set new benchmarks in innovation, sustainability, and craftsmanship while making luxury lighting an accessible experience for all.</p>
            <p>We envision a future where VIVERA is not just a brand, but a symbol of elegance, trust, and creativity — admired worldwide for redefining how light enhances lifestyle, culture, and living spaces. By continually blending tradition with modernity, and personalization with global design trends, we aim to shape the lighting industry with brilliance that lasts for generations.</p>
            <p>We envision VIVERA as a global name in the lighting industry, known for transforming spaces and enriching lives with light that speaks luxury, style, and sophistication.</p>
          </div>
        </section>
      </div>
      {/* Why Choose Us Section */}
      <section className="why-choose-us-section">
      <div className="why-choose-us-header">
          <img src={whyChooseUsBg} alt="about us" className="why-choose-us-img" />
          <span className="why-choose-us-title">Why Choose Us</span>
        </div>
        <div className="why-choose-us-cards">
          <div className="choose-card">
            <div className="choose-icon">
              <img src={bulb} alt="bulb" />
            </div>
            <h3>Eco-Friendly Products</h3>
            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.</p>
          </div>
          <div className="choose-card">
            <div className="choose-icon">
              <img src={clock} alt="clock" />
            </div>
            <h3>Long-Lasting Lights</h3>
            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.</p>
          </div>
          <div className="choose-card">
            <div className="choose-icon">
              <img src={phone} alt="phone" />
            </div>
            <h3>Great Customer Service</h3>
            <p>There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words.</p>
          </div>
        </div>
        <div className="choose-shop-btn-wrapper">
          <button className="choose-shop-btn">Shop Now</button>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default Aboutus;
