import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import browselights1 from "../assets/productcard1.png";
import browselights2 from "../assets/productcard2.png";
import details from "../assets/details.png";
import Header from "../component/Header";
import Footer from "../component/Footer";
import "../styles/pages/Productdetail.css";

// Import the same products array from Products.jsx
const products = [
  {
    image: browselights1,
    title: "LED Light",
    desc: "10W, 6-inch",
    application: "Living Room",
    wattage: "10W",
    price: 29.99,
    color: "White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "80 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "6-inch",
    warranty: "2 Years",
    thumbnails: [browselights1, browselights1, browselights1],
    pdf: "#"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "12W, 8-inch",
    application: "Bedroom",
    wattage: "12W",
    price: 39.99,
    color: "Warm White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "90 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "8-inch",
    warranty: "2 Years",
    thumbnails: [browselights2, browselights2, browselights2],
    pdf: "#"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "15W, 10-inch",
    application: "Kitchen",
    wattage: "15W",
    price: 49.99,
    color: "Cool White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "100 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "10-inch",
    warranty: "2 Years",
    thumbnails: [browselights1, browselights1, browselights1],
    pdf: "#"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "8W, 4-inch",
    application: "Bathroom",
    wattage: "8W",
    price: 24.99,
    color: "White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "70 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "4-inch",
    warranty: "2 Years",
    thumbnails: [browselights2, browselights2, browselights2],
    pdf: "#"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "18W, 12-inch",
    application: "Office",
    wattage: "18W",
    price: 59.99,
    color: "Warm White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "110 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "12-inch",
    warranty: "2 Years",
    thumbnails: [browselights1, browselights1, browselights1],
    pdf: "#"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "20W, 14-inch",
    application: "Hallway",
    wattage: "20W",
    price: 69.99,
    color: "Cool White",
    subtitle: "Round Downlight",
    category: "Indoor Lighting",
    lumen: "120 lm",
    beam: "120°",
    voltage: "220–240V",
    dimensions: "14-inch",
    warranty: "2 Years",
    thumbnails: [browselights2, browselights2, browselights2],
    pdf: "#"
  }
];

const Productdetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  
  // Find product by title only
  const product = products.find(
    p => p.title.toLowerCase().replace(/\s+/g, "-") === name
  );

  if (!product) {
    return (
      <div className="productdetail-notfound">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="productdetail-container">
        <div className="productdetail-heading-section">
          <img src={details} alt="details" className="details-img" />
          <span className="productdetail-title">Product Details</span>
        </div>
        <div className="productdetail-flex">
          {/* Main Image and Thumbnails */}
          <div className="productdetail-mainimg-section">
            <div className="productdetail-mainimg">
              <img src={product.image} alt={product.title} />
            </div>
            <div className="productdetail-thumbnails">
              {product.thumbnails && product.thumbnails.map((thumb, i) => (
                <img key={i} src={thumb} alt="thumb" />
              ))}
            </div>
          </div>
          {/* Details */}
          <div className="productdetail-info">
            <h2>{product.title}</h2>
            <div className="productdetail-subtitle">{product.subtitle}</div>
            <div className="productdetail-category">
              <span>Category :</span> <b>{product.category}</b>
            </div>
            <div className="productdetail-specs">
              <div className="productdetail-specbox">Wattage<br /><b>{product.wattage}</b></div>
              <div className="productdetail-specbox">Lumen Output<br /><b>{product.lumen}</b></div>
              <div className="productdetail-specbox">Beam Angle<br /><b>{product.beam}</b></div>
              <div className="productdetail-specbox">Voltage<br /><b>{product.voltage}</b></div>
              <div className="productdetail-specbox">Dimensions<br /><b>{product.dimensions}</b></div>
              <div className="productdetail-specbox">Warranty<br /><b>{product.warranty}</b></div>
            </div>
            <div className="productdetail-applications">
              <span>Applications :</span> <span className="productdetail-appicon"><span role="img" aria-label="kitchen">🍽️</span> {product.application}</span>
            </div>
            <div className="productdetail-actions">
              <a href={product.pdf} target="_blank" rel="noopener noreferrer" className="productdetail-pdfbtn">⭳ PDF</a>
              <button className="productdetail-contactbtn">Contact for Purchase</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Productdetail;
