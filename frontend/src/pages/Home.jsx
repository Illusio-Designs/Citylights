import React, { useState } from "react";
import Header from "../component/Header";
import img from "../assets/Lights.png";
import img1 from "../assets/aboutus1.png";
import img2 from "../assets/aboutus2.png";
import icon1 from "../assets/Group 26.png";
import icon2 from "../assets/Group 27.png";
import icon3 from "../assets/Layer_1.png";
import aboutUsBg from "../assets/about us.png";
import topProductsBg from "../assets/top products (1).png";
import featureProductsBg from "../assets/featured.png";
import featureProduct1 from "../assets/featuredproduct1.png";
import featureProduct2 from "../assets/featuredproducts2.png";
import featureProduct3 from "../assets/featuredproducts3.png";
import featureProduct4 from "../assets/featuredproducts4.png";
import featureProduct5 from "../assets/featuredproducts5.png";
import Footer from "../component/Footer";
import applicationBg from "../assets/application.png";
import room1 from "../assets/room1.png";
import room2 from "../assets/room2.png";
import "../styles/pages/Home.css";
import { useRef, useLayoutEffect, useEffect } from "react";
import { useMotionValue, useTransform, useAnimationFrame, motion } from "framer-motion";
import { publicSliderService } from "../services/publicService";
import { publicProductService } from "../services/publicService";

const getProductImageUrl = (img) =>
  img && !img.startsWith('http')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/products/${img}`
    : (img || "/default-product.png");

const applicationCategories = [
  { title: "ROOMS", darkTitle: "ROOMS", lightTitle: "ROOMS", image1: room1, image2: room2 },
  { title: "OFFICE", darkTitle: "OFFICE", lightTitle: "OFFICE", image1: room2, image2: room1 },
  { title: "INDUSTRIAL", darkTitle: "INDUSTRIAL", lightTitle: "INDUSTRIAL", image1: room1, image2: room2 },
  { title: "RESTAURANT", darkTitle: "RESTAURANT", lightTitle: "RESTAURANT", image1: room2, image2: room1 }
];

function MarqueeText({ children, velocity = 60, numCopies = 8, direction = "left", className = "" }) {
  const baseX = useMotionValue(0);
  const copyRef = useRef(null);
  const copyWidth = useElementWidth(copyRef);

  function wrap(min, max, v) {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  useAnimationFrame((t, delta) => {
    let moveBy = (direction === "left" ? -1 : 1) * velocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  const spans = [];
  for (let i = 0; i < numCopies; i++) {
    spans.push(
      <span className={className} key={i} ref={i === 0 ? copyRef : null}>
        {children}
      </span>
    );
  }

  return (
    <div style={{ overflow: "hidden", width: "100%" }}>
      <motion.div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          x,
          alignItems: "center",
        }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) {
        setWidth(ref.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref]);

  return width;
}

const Home = () => {
  const [currentDot, setCurrentDot] = useState(0);
  const [roomSlide, setRoomSlide] = useState(0);
  const [sliders, setSliders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    publicSliderService.getSliders()
      .then((res) => {
        setSliders(res.data);
        console.log("Fetched sliders:", res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch sliders", err);
      });
  }, []);

  useEffect(() => {
    publicProductService.getProducts()
      .then((res) => {
        const data = res.data.data || res.data || [];
        setProducts(data);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <>
      <Header />
      <div className="homepage">
        {/* Hero Section replaced with API-powered slider */}
        {sliders.length > 0 ? (
          <div
            className="homepage-slider-section hero-slider-bg"
            style={{
              backgroundImage: sliders[currentDot].image
                ? `url(${sliders[currentDot].image.startsWith('http')
                    ? sliders[currentDot].image
                    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/uploads/sliders/${sliders[currentDot].image}`})`
                : 'none',
            }}
          >
            <div className="hero-slider-overlay">
              <h1 className="hero-slider-title">{sliders[currentDot].title}</h1>
              {sliders[currentDot].description && <p className="hero-slider-desc">{sliders[currentDot].description}</p>}
              <div className="hero-slider-dots">
                {sliders.map((_, idx) => (
                  <span
                    key={idx}
                    className={`hero-slider-dot${currentDot === idx ? ' active' : ''}`}
                    onClick={() => setCurrentDot(idx)}
                  ></span>
                ))}
              </div>
            </div>
            <button
              className="hero-slider-arrow hero-slider-arrow-left"
              onClick={() => setCurrentDot((prev) => (prev - 1 + sliders.length) % sliders.length)}
              aria-label="Previous slide"
            >
              &#8592;
            </button>
            <button
              className="hero-slider-arrow hero-slider-arrow-right"
              onClick={() => setCurrentDot((prev) => (prev + 1) % sliders.length)}
              aria-label="Next slide"
            >
              &#8594;
            </button>
          </div>
        ) : (
          <div style={{ minHeight: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: 16, margin: '0 auto 40px auto', maxWidth: 900 }}>
            <span style={{ color: '#888' }}>No sliders available</span>
          </div>
        )}
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
            {products.slice(currentDot, currentDot + 3).concat(
              products.slice(0, Math.max(0, 3 - (products.length - currentDot)))
            ).map((product, idx) => {
              const variation = product.ProductVariations && product.ProductVariations[0];
              const imageUrl = variation && variation.ProductImages && variation.ProductImages[0] && variation.ProductImages[0].image_url;
              return (
                <div className="top-product-img-col" key={product.id || idx}>
                  <img
                    src={getProductImageUrl(imageUrl)}
                    alt={product.name}
                    className={`top-product-img ${idx === 1 ? "middle-product" : ""}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="top-products-dots">
            {products.slice(0, 3).map((_, idx) => (
              <span
                key={idx}
                className={`dot${currentDot === idx ? " active" : ""}`}
                onClick={() => setCurrentDot(idx)}
                style={{ cursor: "pointer" }}
              ></span>
            ))}
          </div>
        </div>
        <div className="feature-section">
          <div className="feature-products-heading" >
            <img src={featureProductsBg}
              alt="feature products background"
              className="feature-products-bg"
            />
            <span className="feature-products-title">Featured Products</span>
          </div>
          <div className="feature-img-section">
            <div className="feature-left-img">
              <img src={featureProduct1} alt={img.alt} className="feature-left-top" />
              <img src={featureProduct2} alt={img.alt} className="feature-left-bottom" />
            </div>
            <div className="feature-center-img">
              <img src={featureProduct3} alt={img.alt} className="feature-center-img" />
            </div>
            <div className="feature-right-img">
              <img src={featureProduct4} alt={img.alt} className="feature-right-top" />
              <img src={featureProduct5} alt={img.alt} className="feature-right-bottom" />
            </div>
          </div>
        </div>
        {/* Application Areas Section */}
        <div className="application-section">
          <div className="application-heading-section">
            <img src={applicationBg} alt="application background" className="application-heading-bg" />
            <span className="application-heading-title">Application Areas</span>
          </div>
          {/* CATEGORIES SLIDER START */}
          {(() => {
            return (
              <div style={{ height: '600px', position: 'relative' }}>
                <div className="rooms-dark">
                  <span
                    className={`rooms-dark-title${applicationCategories[roomSlide].darkTitle.length > 6 ? ' long-title' : ''}`}
                  >
                    {applicationCategories[roomSlide].darkTitle}
                  </span>
                </div>
                <div className="rooms-img" >
                  {applicationCategories.map((category, idx) => (
                    <div
                      key={idx}
                      style={{ display: roomSlide === idx ? 'block' : 'none', width: '100%' }}
                    >
                      <img src={category.image2} alt={`${category.title.toLowerCase()}-2`} className="room-img-2" />
                      <img src={category.image1} alt={`${category.title.toLowerCase()}-1`} className="room-img-1" />
                    </div>
                  ))}
                </div>
                <div className="rooms-light">
                  <span
                    className={`rooms-light-title${applicationCategories[roomSlide].lightTitle.length > 6 ? ' long-title' : ''}`}
                  >
                    {applicationCategories[roomSlide].lightTitle}
                  </span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  {applicationCategories.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot${roomSlide === idx ? " active" : ""}`}
                      onClick={() => setRoomSlide(idx)}
                      style={{ cursor: 'pointer', margin: '0 6px', display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: roomSlide === idx ? '#000' : '#ccc' }}
                    ></span>
                  ))}
                </div>
              </div>
            );
          })()}
          {/* CATEGORIES SLIDER END */}
        </div>
        <div className="lines">
          <div className="black-line">
            <MarqueeText velocity={60} numCopies={8} direction="left" className="black-line-title-black">
              <div className="dot-line-black"></div>Elevate your space with our product
            </MarqueeText>
          </div>
          <div className="white-line">
            <MarqueeText velocity={60} numCopies={8} direction="right" className="white-line-title">
              <div className="dot-line"></div>Elevate your space with our product
            </MarqueeText>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
