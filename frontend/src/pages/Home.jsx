import React, { useState } from "react";
import { toast } from "react-toastify";
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
import Footer from "../component/Footer";
import applicationBg from "../assets/application.png";
import room1 from "../assets/room1.png";
import room2 from "../assets/room2.png";
import "../styles/pages/Home.css";
import { useRef, useLayoutEffect, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { useMotionValue, useTransform, useAnimationFrame, motion } from "framer-motion";
import { publicSliderService } from "../services/publicService";
import { publicProductService } from "../services/publicService";
import { publicCollectionService } from "../services/publicService";
import { getSliderImageUrl, getProductImageUrl, getCollectionImageUrl } from "../utils/imageUtils";



const applicationCategories = [
  { title: "ROOMS", darkTitle: "ROOMS", lightTitle: "ROOMS", image1: room1, image2: room2 },
  { title: "OFFICE", darkTitle: "OFFICE", lightTitle: "OFFICE", image1: room2, image2: room1 },
  { title: "INDUSTRIAL", darkTitle: "INDUSTRIAL", lightTitle: "INDUSTRIAL", image1: room1, image2: room2 },
  { title: "RESTAURANT", darkTitle: "RESTAURANT", lightTitle: "RESTAURANT", image1: room2, image2: room1 }
];

function MarqueeText({ children, velocity = 60, numCopies = 8, direction = "left", className = "" }) {
  const baseX = useMotionValue(0);
  const sequenceRef = useRef(null);
  const sequenceWidth = useElementWidth(sequenceRef);

  function wrap(min, max, v) {
    const range = max - min;
    const mod = (((v - min) % range) + range) % range;
    return mod + min;
  }

  const x = useTransform(baseX, (v) => {
    if (sequenceWidth === 0) return "0px";
    return `${wrap(-sequenceWidth, 0, v)}px`;
  });

  useAnimationFrame((t, delta) => {
    const dir = direction === "left" ? -1 : 1;
    const moveBy = dir * velocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  const renderCopies = (attachRef = false) => (
    <div ref={attachRef ? sequenceRef : null} className="marquee-track">
      {Array.from({ length: Math.max(2, numCopies) }).map((_, i) => (
        <span className={`marquee-copy ${className}`} key={i}>
          {children}
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <motion.div style={{ x }} className="marquee-track">
        {renderCopies(true)}
        {/* Duplicate track for seamless loop */}
        {renderCopies(false)}
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
  // Hero slider index
  const [heroIndex, setHeroIndex] = useState(0);
  // Top products slider index (start of window)
  const [productsIndex, setProductsIndex] = useState(0);
  const [roomSlide, setRoomSlide] = useState(0);
  const [sliders, setSliders] = useState([]);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [slidersLoading, setSlidersLoading] = useState(true);

  useEffect(() => {
    setSlidersLoading(true);
    publicSliderService.getSliders()
      .then((res) => {
        setSliders(res.data);
        setSlidersLoading(false);
        console.log("Fetched sliders:", res.data);
        // Debug removed for production UI
      })
      .catch((err) => {
        console.error("Failed to fetch sliders", err);
        toast.error("Failed to load sliders");
        setSlidersLoading(false);
      });
  }, []);

  useEffect(() => {
    publicProductService.getProducts()
      .then((res) => {
        const data = res.data.data || res.data || [];
        setProducts(data);
      })
      .catch((error) => {
        console.error("Failed to fetch products", error);
        toast.error("Failed to load products");
        setProducts([]);
      });
  }, []);

  useEffect(() => {
    publicCollectionService.getCollections()
      .then((res) => {
        const data = res.data.data || res.data || [];
        // Get only first 5 collections
        setCollections(data.slice(0, 5));
      })
      .catch((error) => {
        console.error("Failed to fetch collections", error);
        toast.error("Failed to load collections");
        setCollections([]);
      });
  }, []);

  // Prepare top products: first 10 unique images, each shown once
  const topProducts = useMemo(() => {
    const maxItems = 10;
    const unique = [];
    const seen = new Set();
    for (const product of products) {
      if (unique.length >= maxItems) break;
      const variation = product.ProductVariations && product.ProductVariations[0];
      const imageUrl = variation && variation.ProductImages && variation.ProductImages[0] && variation.ProductImages[0].image_url;
      if (!imageUrl) continue;
      if (seen.has(imageUrl)) continue;
      seen.add(imageUrl);
      unique.push({ id: product.id, name: product.name, imageUrl });
    }
    return unique;
  }, [products]);

  // Auto-advance the top products slider every 3 seconds by one step
  const visibleCount = 3;
  const totalSlides = Math.max(1, (topProducts.length || 0) - visibleCount + 1);

  useEffect(() => {
    if (totalSlides <= 1) return; // nothing to scroll
    const timer = setInterval(() => {
      setProductsIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  // Auto-advance the application areas slider every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRoomSlide((prev) => (prev + 1) % applicationCategories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Ensure currentDot stays within bounds when data changes
  useEffect(() => {
    if (productsIndex > totalSlides - 1) {
      setProductsIndex(0);
    }
  }, [totalSlides, productsIndex]);

  return (
    <>
      <Header />
      <div className="homepage">
        {/* Hero Section replaced with API-powered slider */}
        {slidersLoading ? (
          <div style={{ minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8', borderRadius: 16, margin: '0 auto 40px auto', maxWidth: 900 }}>
          </div>
        ) : sliders.length > 0 ? (
          <div
            className="homepage-slider-section hero-slider-bg"
            style={{
              backgroundImage: sliders[heroIndex].image
                ? `url(${getSliderImageUrl(sliders[heroIndex].image)})`
                : 'none',
            }}
          >
            {/* Fallback image in case background image fails to load */}
            {sliders[heroIndex].image && (
              <img
                src={getSliderImageUrl(sliders[heroIndex].image)}
                alt={sliders[heroIndex].title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: -1,
                  display: 'none' // Hidden by default, shown only if background fails
                }}
                onError={(e) => {
                  console.error("Failed to load slider image:", sliders[heroIndex].image);
                  e.target.style.display = 'block';
                }}
              />
            )}
            {/* Enhanced overlay with better content layout */}
            <div className="hero-slider-overlay">
              <div className="hero-slider-content">
                <div className="hero-slider-text-content" key={heroIndex}>
                  <h1 className="hero-slider-title">{sliders[heroIndex].title}</h1>
                  {sliders[heroIndex].description && (
                    <p className="hero-slider-desc">{sliders[heroIndex].description}</p>
                  )}
                  {sliders[heroIndex].button_text && (
                    <button className="hero-slider-cta">
                      {sliders[heroIndex].button_text}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Enhanced navigation dots */}
              <div className="hero-slider-dots">
                {sliders.map((_, idx) => (
                  <span
                    key={idx}
                    className={`hero-slider-dot${heroIndex === idx ? ' active' : ''}`}
                    onClick={() => setHeroIndex(idx)}
                  ></span>
                ))}
              </div>
            </div>
            {/* Enhanced navigation arrows */}
            <button
              className="hero-slider-arrow hero-slider-arrow-left"
              onClick={() => setHeroIndex((prev) => (prev - 1 + sliders.length) % sliders.length)}
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              className="hero-slider-arrow hero-slider-arrow-right"
              onClick={() => setHeroIndex((prev) => (prev + 1) % sliders.length)}
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
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
            {topProducts.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No products available</div>
            ) : (
              topProducts
                .slice(productsIndex, productsIndex + visibleCount)
                .concat(topProducts.slice(0, Math.max(0, visibleCount - (topProducts.length - productsIndex))))
                .map((item, idx) => (
                  <div className="top-product-img-col shimmer" key={item.id || `${item.imageUrl}-${idx}`}> 
                    <img
                      src={getProductImageUrl(item.imageUrl)}
                      alt={item.name}
                      className={`top-product-img ${idx === 1 ? "middle-product" : ""}`}
                      style={{ filter: 'grayscale(100%)', transition: 'filter 0.4s ease' }}
                      onLoad={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                      onError={(e) => { e.currentTarget.style.filter = 'none'; if (e.currentTarget.parentElement) e.currentTarget.parentElement.classList.remove('shimmer'); }}
                    />
                  </div>
                ))
            )}
          </div>
          <div className="top-products-dots">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <span
                key={idx}
                className={`dot${productsIndex === idx ? " active" : ""}`}
                onClick={() => setProductsIndex(idx)}
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
            <span className="feature-products-title">Featured Collections</span>
          </div>
          <div className="feature-img-section">
            {collections.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', width: '100%', padding: '40px 0' }}>
                No collections available
              </div>
            ) : (
              <>
                <div className="feature-left-img">
                  {collections[0] && (
                    <img 
                      src={getCollectionImageUrl(collections[0].image)} 
                      alt={collections[0].name} 
                      className="feature-left-top" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {collections[1] && (
                    <img 
                      src={getCollectionImageUrl(collections[1].image)} 
                      alt={collections[1].name} 
                      className="feature-left-bottom" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="feature-center-img">
                  {collections[2] && (
                    <img 
                      src={getCollectionImageUrl(collections[2].image)} 
                      alt={collections[2].name} 
                      className="feature-center-img" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div className="feature-right-img">
                  {collections[3] && (
                    <img 
                      src={getCollectionImageUrl(collections[3].image)} 
                      alt={collections[3].name} 
                      className="feature-right-top" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {collections[4] && (
                    <img 
                      src={getCollectionImageUrl(collections[4].image)} 
                      alt={collections[4].name} 
                      className="feature-right-bottom" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </>
            )}
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
              <div className="dot-line-black"></div>Feel Luxury Together
            </MarqueeText>
          </div>
          <div className="white-line">
            <MarqueeText velocity={60} numCopies={8} direction="right" className="white-line-title">
              <div className="dot-line"></div>Feel Luxury Together
            </MarqueeText>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
