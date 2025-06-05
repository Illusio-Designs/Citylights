import React from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from "../assets/browse lights.png";
import "../styles/pages/Products.css";
import browselights1 from '../../src/assets/topproduct1.png';
import browselights2 from '../../src/assets/topproduct2.png';


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
          <div className="browse-lights-content">
        <div className="filter-box"></div>
        <div className="browse-product-box">
          <img src={browselights1} alt="browselights1" 
          className="browselights1-img"/>
          <div className="product-info">
            <div className="product-details">
            <div className="product-title">LED Light</div>
            <div className="product-desc">10W, 6-inch</div>
            </div>
          <div className="details-btn">
            <button className="view-details">View Details</button>
          </div>

          </div>
        </div>
     
          </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
