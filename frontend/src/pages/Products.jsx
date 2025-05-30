import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import plights from "../assets/Plights.png";
import "../styles/pages/Products.css";

const Products = () => {
  return (
    <>
      <Header />
      <div className="products">
        <div className="product-container">
          <div className="plights">
            <img src={plights} alt="lights" />
            <img src={plights} alt="lights" />
            <img src={plights} alt="lights" />
            <img src={plights} alt="lights" />
          </div>
          <div className="hero-title">
            <h1>DOWNLIGHTS</h1>
          </div>
        </div>
        <div className="browse lights">
          <div className="browse-lights-title">
            <h1>BROWSE LIGHTS</h1>
          </div>
          <div className="browse-lights-content">
            <div classsname="filters"></div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
