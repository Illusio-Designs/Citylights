import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import aboutUsBg from '../assets/about us.png';
import browselights1 from '../../src/assets/productcard1.png';
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
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla varius, enim in dictum dictum, urna erat cursus erat, nec dictum urna erat nec erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.</p>
          </div>
        </section>
        <section className="aboutus-section mission-section">
          <div className="aboutus-text">
            <h2>MISSION</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla varius, enim in dictum dictum, urna erat cursus erat, nec dictum urna erat nec erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.</p>
          </div>
          <div className="aboutus-image"></div>
        </section>
        <section className="aboutus-section vision-section">
          <div className="aboutus-image"></div>
          <div className="aboutus-text">
            <h2>VISION</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla varius, enim in dictum dictum, urna erat cursus erat, nec dictum urna erat nec erat. Etiam euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam nisl nunc eu nunc.</p>
          </div>
        </section>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Aboutus;
