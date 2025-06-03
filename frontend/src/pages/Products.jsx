import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from "../assets/browse lights.png";
import "../styles/pages/Products.css";

const Products = () => {
  return (
    <>
      <Header />
      <div className="products">
        <div className="product-container">
          <div className="hero-title">
            <h1>DOWNLIGHTS</h1>
          </div>
        </div>
        <div className="browse-lights" >
            <img src={browselights}
              alt="browse"
              className="browse-lights-img"
            />
            <span className="browse-lights-title">Browse Lights</span>
          </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
