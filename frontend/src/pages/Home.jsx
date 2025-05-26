import React from "react";
import Header from "../component/Header";
import img from "../assets/Lights.png";
import img1 from "../assets/aboutus1.png";
import img2 from "../assets/aboutus2.png";
import icon1 from "../assets/1.png";
import icon2 from "../assets/2.png";
import icon3 from "../assets/3.png";

const Home = () => {
  return (
    <>
      <Header />
      <div className="hero-section">
        <div className="hero-section-container">
          <div className="hero-section-content">
            <div className="hero-section-content-text">
              <h1>Innovation COB Lighting for Every Space</h1>
            </div>
            <div className="hero-section-content-button">
              <button className="btn-view">view products</button>
              <button className="btn-find">find a Store</button>
            </div>
          </div>
          <div className="hero-section-image">
            <img src={img} alt="hero-section-image" />
          </div>
        </div>
        <div classname="about-us">
          <div classname="about-us-heading">
            <h1>About Us</h1>
          </div>
          <div classname="about-us-content">
            <div classname="about-us-content-text">
              {" "}
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
            <div classname="icon1">
              <img src={icon1} alt="icon1" />
            </div>
            <div classname="icon2">
              <img src={icon2} alt="icon2" />
            </div>
            <div classname="icon3">
              <img src={icon3} alt="icon3" />
            </div>
            <div classname="about-us-content-img">
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
          </div>
        </div>
        <div>
          <div classname="top-products">
            <div className=""></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
