import React, { useState } from "react";
import Header from "../component/Header";
import img from "../assets/Lights.png";
import img1 from "../assets/aboutus1.png";
import img2 from "../assets/aboutus2.png";
import icon1 from "../assets/Group 26.png";
import icon2 from "../assets/Group 27.png";
import icon3 from "../assets/Layer_1.png";
import aboutUsBg from "../assets/about us.png";
import topproduct1 from "../assets/topproduct1.png";
import topproduct2 from "../assets/topproduct2.png";
import topproduct3 from "../assets/topproducts3.png";
import topProductsBg from "../assets/top products (1).png";
import Footer from "../component/Footer";
import "../styles/pages/Home.css";

const productImages = [
  { src: topproduct1, alt: "product 1" },
  { src: topproduct2, alt: "product 2" },
  { src: topproduct3, alt: "product 3" },
];

const Home = () => {
  const [currentDot, setCurrentDot] = useState(0);

  // Rotate the images based on the current dot
  const visibleImages = [
    ...productImages.slice(currentDot),
    ...productImages.slice(0, currentDot),
  ];

  return (
    <>
      <Header />
      <div className="homepage">
        <div className="hero-section-container">
          <div className="hero-section-content">
            <div className="hero-section-content-text">
              <h1>
                Innovative COB <br /> Lighting for Every Space
              </h1>
            </div>
            <div className="hero-section-content-button">
              <div class="button-group">
                <button class="btn-view">
                  View Products
                  <span class="arrow">→</span>
                </button>
                <button class="btn-find">
                  Find a Store
                  <span class="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero-section-image">
            <img src={img} alt="hero-section-image" />
          </div>
        </div>
        <div className="about-us-section">
          <div className="about-us-heading-perfect">
            <img
              src={aboutUsBg}
              alt="about us background"
              className="about-us-bg-img"
            />
            <span className="about-us-main-title with-underline">About Us</span>
          </div>
          <div className="about-us-content-row">
            <div className="about-us-content-text">
              <p>
                It is a long established fact that a reader will be distracted
                by the readable content of a page when looking at its layout.
                The point of using Lorem Ipsum is that it has a more-or-less
                normal distribution of letters, as opposed to using 'Content
                here, content here', making it look like readable English. Many
                desktop publishing packages and web page editors now use Lorem
                Ipsum as their default model text, and a search for 'lorem
                ipsum' will uncover many web sites still in their infancy.
                Various versions have evolved over the years,
              </p>
            </div>

            <div className="about-us-image-stack">
              <div className="about-images">
                <img
                  src={img1}
                  alt="about-us-image"
                  className="about-us-image-1"
                />
                <img
                  src={img2}
                  alt="about-us-image"
                  className="about-us-image-2"
                />
              </div>
              <div className="image-icons">
                <img src={icon1} alt="icon1" className="about-us-icon-1" />
                <img src={icon2} alt="icon2" className="about-us-icon-2" />
                <img src={icon3} alt="icon3" className="about-us-icon-3" />
              </div>
            </div>
          </div>
        </div>
        <div className="top-products-section">
          <div className="top-products-heading">
            <img
              src={topProductsBg}
              alt="top products background"
              className="top-products-bg"
            />
            <span className="top-products-title">Top Products</span>
          </div>
          <div className="top-products-row">
            {visibleImages.map((img, idx) => (
              <div className="top-product-img-col" key={idx}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`top-product-img ${
                    idx === 1 ? "middle-product" : ""
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="top-products-dots">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={`dot${currentDot === idx ? " active" : ""}`}
                onClick={() => setCurrentDot(idx)}
                style={{ cursor: "pointer" }}
              ></span>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
