import React from "react";
import Header from "../component/Header";
import collection from "../assets/collection.png";
import "../styles/pages/Collection.css";
import Footer from "../component/Footer";
import browselights1 from '../../src/assets/productcard1.png';
import browselights2 from '../../src/assets/productcard2.png';

const cardData = [
  { 
    title: "Indoor Lighting",
    image: browselights1
  },
  { 
    title: "Outdoor Lighting",
    image: browselights2
  },
  { 
    title: "Industrial Lighting",
    image: browselights1
  },
  { 
    title: "Accent Lighting",
    image: browselights2
  },
  { 
    title: "Decorative Lighting",
    image: browselights1
  },
  { 
    title: "Smart Lighting",
    image: browselights2
  },
  { 
    title: "Architectural Lighting",
    image: browselights1
  },
  { 
    title: "Commercial Lighting",
    image: browselights2
  },
];

const Collection = () => {
  return (
    <>
      <Header />
      <div className="collection-container">
        <div className="collection-heading">
          <img src={collection} alt="collection" className="collection-bg-img" />
          <span className="collection-title">Collection</span>
        </div>
        <div className="collection-cards">
          {cardData.map((card, idx) => (
            <div className="collection-card" key={idx}>
              <div className="card-image">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="card-title">{card.title}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Collection;