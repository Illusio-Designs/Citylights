import React from 'react';
import Header from '../component/Header';
import Footer from '../component/Footer';
import aboutUsBg from '../assets/about us.png';
import whyChooseUsBg from '../assets/choose us.png';
import browselights1 from '../../src/assets/productcard1.png';
import bulb from '../assets/bulb.png';
import clock from '../assets/clock.png';
import phone from '../assets/phone.png';
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
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
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
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
            <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
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
