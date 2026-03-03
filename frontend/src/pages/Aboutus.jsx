import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import OurClients from '../component/OurClients';
import aboutUsBg from '../assets/about us.webp';
import whyChooseUsBg from '../assets/choose us.webp';
import history from "../assets/History.webp";
import mission from "../assets/Mission.webp";
import vission from "../assets/vision.webp";
import bulb from '../assets/bulb.webp';
import clock from '../assets/clock.webp';
import phone from '../assets/phone.webp';
import founderImage from '../assets/Akash mehta.webp';
import '../styles/pages/Aboutus.css';

const Aboutus = () => {
  return (
    <>
      <Header />
      <div className="aboutus">
        {/* Founder Section */}
        <section className="founder-section">
          <div className="founder-content">
            <div className="founder-image-wrapper">
              <div className="founder-image-placeholder">
                <img src={founderImage} alt="Akash Mehta - Founder" className="founder-image" />
              </div>
              <div className="founder-name-badge">
                <h3>Akash Mehta</h3>
              </div>
            </div>
            <div className="founder-text">
              <h2 className="founder-title">The Mind Behind the Brand</h2>
              <p>VIVERA began in 2021 — not just as a brand, but as a belief. After years in the lighting industry, we observed a gap: quality products existed, but consistent service, customization, and reliability were missing. That's when we decided to create a brand that eliminates these problems. Through continuous research and real experience, VIVERA evolved into a customization-focused lighting partner committed to better quality, thoughtful design, and reliable service.</p>
              <p>The name VIVERA carries deep meaning — inspired by family, strength, and vision. From starting at 300 sq. ft. to completing projects exceeding 10 lakh+ sq. ft., we've grown stronger with every milestone. Our vision is clear: to transform spaces through intelligent, customizable lighting and build VIVERA into one of India's leading lighting brands. Because for us, lighting is not just a product — it is an experience.</p>
              <div className="founder-contact">
                <a href="tel:8128888899" className="founder-phone">
                  <svg className="phone-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                  81288 88899
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="aboutus-header">
          <img src={aboutUsBg} alt="about us" className="about-us-img" />
          <span className="about-us-title">About Us</span>
        </div>

        <div className="aboutus-container">
          <section className="aboutus-section history-section">
            <div className="aboutus-image">
              <img src={history} alt="about us" />
              <h2>HISTORY</h2>
            </div>
            <div className="aboutus-text">
              <p>Born from a deep understanding of architectural design and driven by decades of industry expertise, Vivera Lightings was created with a clear purpose: to design lighting that adapts to spaces, not the other way around. We believe lighting is not just about illumination — it is about intention, emotion, and identity.</p>
              <p>While we offer a complete spectrum of architectural, decorative, and outdoor lighting solutions, customization is at the heart of everything we do. We do not believe in one-size-fits-all products. Every project is unique — and so is every light we create. From beam angles and lumen output to color temperature, finishes, dimensions, control systems, and form factors, each Vivera solution is engineered to align perfectly with the design vision and functional requirements of the space.</p>
              <p>Our strength lies in collaboration. We work closely with architects, interior designers, and project consultants, transforming concepts into precision-engineered lighting solutions. By combining advanced technology, premium materials, and refined aesthetics, we deliver lighting that enhances ambience, elevates architecture, and performs flawlessly.</p>
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
              <img src={mission} alt="about us" />
              <h2>MISSION</h2>
            </div>
          </section>
          <section className="aboutus-section vision-section">
            <div className="aboutus-image">
              <img src={vission} alt="about us" />
              <h2>VISION</h2>
            </div>
            <div className="aboutus-text">
              <p>At VIVERA, our vision is to be a global leader in luxury lighting, creating timeless designs that inspire, elevate, and transform every space they illuminate. We aspire to set new benchmarks in innovation, sustainability, and craftsmanship while making luxury lighting an accessible experience for all.</p>
              <p>We envision a future where VIVERA is not just a brand, but a symbol of elegance, trust, and creativity — admired worldwide for redefining how light enhances lifestyle, culture, and living spaces. By continually blending tradition with modernity, and personalization with global design trends, we aim to shape the lighting industry with brilliance that lasts for generations.</p>
              <p>We envision VIVERA as a global name in the lighting industry, known for transforming spaces and enriching lives with light that speaks luxury, style, and sophistication.</p>
            </div>
          </section>
        </div>
        
        {/* Our Clients Section */}
        <OurClients />
        
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
              <p>Energy-efficient lighting designed to reduce power consumption and support a sustainable future.</p>
            </div>
            <div className="choose-card">
              <div className="choose-icon">
                <img src={clock} alt="clock" />
              </div>
              <h3>Long-Lasting Lights</h3>
              <p>High-quality LED lights built for durability, performance, and long operational life.</p>
            </div>
            <div className="choose-card">
              <div className="choose-icon">
                <img src={phone} alt="phone" />
              </div>
              <h3>Great Customer Service</h3>
              <p>Reliable support and assistance to ensure a smooth experience from purchase to installation.</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Aboutus;
