import React, { useState } from "react";
import Header from "../component/Header";
import Footer from "../component/Footer";
import browselights from "../assets/browse lights.png";
import "../styles/pages/Products.css";
import browselights1 from '../../src/assets/productcard1.png';
import browselights2 from '../../src/assets/productcard2.png';
import { useNavigate } from "react-router-dom";

const products = [
  {
    image: browselights1,
    title: "LED Light",
    desc: "10W, 6-inch",
    application: "Living Room",
    wattage: "10W",
    price: 29.99,
    color: "White"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "12W, 8-inch",
    application: "Bedroom",
    wattage: "12W",
    price: 39.99,
    color: "Warm White"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "15W, 10-inch",
    application: "Kitchen",
    wattage: "15W",
    price: 49.99,
    color: "Cool White"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "8W, 4-inch",
    application: "Bathroom",
    wattage: "8W",
    price: 24.99,
    color: "White"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "18W, 12-inch",
    application: "Office",
    wattage: "18W",
    price: 59.99,
    color: "Warm White"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "20W, 14-inch",
    application: "Hallway",
    wattage: "20W",
    price: 69.99,
    color: "Cool White"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "10W, 6-inch",
    application: "Living Room",
    wattage: "10W"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "12W, 8-inch",
    application: "Bedroom",
    wattage: "12W"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "15W, 10-inch",
    application: "Kitchen",
    wattage: "15W"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "8W, 4-inch",
    application: "Bathroom",
    wattage: "8W"
  },
  {
    image: browselights1,
    title: "LED Light",
    desc: "18W, 12-inch",
    application: "Office",
    wattage: "18W"
  },
  {
    image: browselights2,
    title: "LED Light",
    desc: "20W, 14-inch",
    application: "Hallway",
    wattage: "20W"
  }
];

const applicationOptions = [
  "All",
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Office",
  "Hallway"
];
const wattageOptions = [
  "All",
  "8W",
  "10W",
  "12W",
  "15W",
  "18W",
  "20W"
];

const colorOptions = [
  "All",
  "White",
  "Warm White",
  "Cool White"
];

const priceRanges = [
  "All",
  "Under $30",
  "$30 - $50",
  "$50 - $70",
  "Over $70"
];

const Products = () => {
  const [application, setApplication] = useState("All");
  const [wattage, setWattage] = useState("All");
  const [color, setColor] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [appDropdown, setAppDropdown] = useState(false);
  const [wattDropdown, setWattDropdown] = useState(false);
  const [colorDropdown, setColorDropdown] = useState(false);
  const [priceDropdown, setPriceDropdown] = useState(false);
  const navigate = useNavigate();

  // Only one dropdown open at a time
  const handleAppDropdown = () => {
    setAppDropdown(v => !v);
    setWattDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };
  const handleWattDropdown = () => {
    setWattDropdown(v => !v);
    setAppDropdown(false);
    setColorDropdown(false);
    setPriceDropdown(false);
  };
  const handleColorDropdown = () => {
    setColorDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setPriceDropdown(false);
  };
  const handlePriceDropdown = () => {
    setPriceDropdown(v => !v);
    setAppDropdown(false);
    setWattDropdown(false);
    setColorDropdown(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesApplication = application === "All" || p.application === application;
    const matchesWattage = wattage === "All" || p.wattage === wattage;
    const matchesColor = color === "All" || p.color === color;
    
    let matchesPrice = true;
    if (priceRange !== "All") {
      switch (priceRange) {
        case "Under $30":
          matchesPrice = p.price < 30;
          break;
        case "$30 - $50":
          matchesPrice = p.price >= 30 && p.price <= 50;
          break;
        case "$50 - $70":
          matchesPrice = p.price > 50 && p.price <= 70;
          break;
        case "Over $70":
          matchesPrice = p.price > 70;
          break;
        default:
          matchesPrice = true;
      }
    }

    return matchesApplication && matchesWattage && matchesColor && matchesPrice;
  });

  return (
    <>
      <Header />
      <div className="products">
        <div className="product-container">
          <div className="hero-title">
            <h1>DOWNLIGHTS</h1>
          </div>
        </div>
        <div className="browse-lights">
          <img src={browselights} alt="browse" className="browse-lights-img" />
          <span className="browse-lights-title">Browse Lights</span>
        </div>
        <div className="browse-lights-content">
          <div className="filter-box">
            <div className="filter-title">
              <span className="filter-icon" style={{marginRight: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5H17M5 10H15M8 15H12" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </span>
              Filters
            </div>
            <div className={`filter-section${appDropdown ? ' open' : ''}`} onClick={handleAppDropdown}>
              Application
              <span className={`chevron${appDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${appDropdown ? ' open' : ''}`}> 
              {appDropdown && applicationOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${application === opt ? ' selected' : ''}`}
                  onClick={() => { setApplication(opt); setAppDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${wattDropdown ? ' open' : ''}`} onClick={handleWattDropdown}>
              Wattage
              <span className={`chevron${wattDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${wattDropdown ? ' open' : ''}`}> 
              {wattDropdown && wattageOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${wattage === opt ? ' selected' : ''}`}
                  onClick={() => { setWattage(opt); setWattDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${colorDropdown ? ' open' : ''}`} onClick={handleColorDropdown}>
              Color
              <span className={`chevron${colorDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${colorDropdown ? ' open' : ''}`}> 
              {colorDropdown && colorOptions.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${color === opt ? ' selected' : ''}`}
                  onClick={() => { setColor(opt); setColorDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
            <div className={`filter-section${priceDropdown ? ' open' : ''}`} onClick={handlePriceDropdown}>
              Price Range
              <span className={`chevron${priceDropdown ? ' open' : ''}`} style={{marginLeft: '8px', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
            <div className={`dropdown-menu${priceDropdown ? ' open' : ''}`}> 
              {priceDropdown && priceRanges.map(opt => (
                <div
                  key={opt}
                  className={`dropdown-item${priceRange === opt ? ' selected' : ''}`}
                  onClick={() => { setPriceRange(opt); setPriceDropdown(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <div className="products-grid">
            {filteredProducts.map((product, idx) => (
              <div className="browse-product-box" key={idx}>
                <img src={product.image} alt={product.title} className="browse-product-img" />
                <div className="product-info">
                  <div className="product-details">
                    <div className="product-title">{product.title}</div>
                    <div className="product-desc">{product.desc}</div>
                  </div>
                  <div className="details-btn">
                    <button className="view-details" onClick={() => navigate(`/products/${product.title.toLowerCase().replace(/\s+/g, '-')}`)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Products;
