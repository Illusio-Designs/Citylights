import React, { useState } from "react";
import { toast } from "react-toastify";
import Header from "../component/Header";
import ProductCalculator from "../component/ProductCalculator";
import FAQ from "../component/FAQ";
import img1 from '../assets/About-1.jpg';
import img2 from '../assets/About-2.jpg';
import icon1 from '../assets/Group 26.webp';
import icon2 from '../assets/Group 27.webp';
import icon3 from '../assets/Layer_1.webp';
import aboutUsBg from '../assets/about us.webp';
import topProductsBg from '../assets/top products (1).webp';
import featureProductsBg from '../assets/featured.webp';
import Footer from "../component/Footer";
import applicationBg from '../assets/application.webp';
import room1 from '../assets/room1.webp';
import room2 from '../assets/room2.webp';
import office1 from '../assets/office1.webp';
import office2 from '../assets/office2.webp';
import industrial1 from '../assets/industrial1.webp';
import industrial2 from '../assets/industrial2.webp';
import restaurant1 from '../assets/restaurant1.webp';
import restaurant2 from '../assets/restaurant2.webp';
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
  { title: "OFFICE", darkTitle: "OFFICE", lightTitle: "OFFICE", image1: office1, image2: office2 },
  { title: "INDUSTRIAL", darkTitle: "INDUSTRIAL", lightTitle: "INDUSTRIAL", image1: industrial1, image2: industrial2 },
  { title: "RESTAURANT", darkTitle: "RESTAURANT", lightTitle: "RESTAURANT", image1: restaurant1, image2: restaurant2 }
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
  
  // Touch/swipe support for carousel
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

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

  // Auto-advance the top products slider infinitely every 3 seconds
  const visibleCount = 3;

  useEffect(() => {
    if (topProducts.length === 0 || isCarouselHovered) return; // no products to show or paused
    const timer = setInterval(() => {
      setProductsIndex((prev) => (prev + 1) % topProducts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [topProducts.length, isCarouselHovered]);

  // Auto-advance the hero slider every 5 seconds
  useEffect(() => {
    if (sliders.length <= 1) return; // nothing to auto-advance
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders.length]);

  // Auto-advance the application areas slider every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRoomSlide((prev) => (prev + 1) % applicationCategories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Ensure currentDot stays within bounds when data changes
  useEffect(() => {
    if (productsIndex >= topProducts.length) {
      setProductsIndex(0);
    }
  }, [topProducts.length, productsIndex]);

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setProductsIndex((prev) => (prev + 1) % topProducts.length);
    }
    if (isRightSwipe) {
      setProductsIndex((prev) => (prev - 1 + topProducts.length) % topProducts.length);
    }

    // Reset values
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <>
      <Header />
      <div className="homepage">
        {/* Hero Section replaced with API-powered slider */}
        {slidersLoading ? (
          <div style={{ 
            minHeight: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: '#f8f8f8', 
            borderRadius: 16, 
            margin: '0 auto 40px auto', 
            maxWidth: 900,
            color: '#666',
            fontSize: '16px'
          }}>
            {/* Loading handled by PublicLoader */}
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
                At Vivera Lightings, we believe lighting is not just about illumination — it is about intention, emotion, and identity. Every space has a story, and our role is to bring that story to life through light. Born from a deep understanding of architectural design and driven by decades of industry expertise, Vivera was created with a clear purpose: to design lighting that adapts to spaces, not the other way around.
              </p>
              <p>
                We are not a retail brand. We are a project-driven, customization-led lighting partner. Because at Vivera, light is not chosen from a shelf — it is designed, refined, and perfected for the space it belongs to.
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
        
        {/* Product Calculator Section */}
        <div className="calculator-section">
          <ProductCalculator />
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
          <div 
            className="top-products-carousel-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {topProducts.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', width: '100%' }}>No products available</div>
            ) : (
              <>
                <div className="top-products-carousel">
                  {topProducts.map((item, idx) => {
                    const position = (idx - productsIndex + topProducts.length) % topProducts.length;
                    let className = 'carousel-card';
                    let style = {};
                    
                    if (position === 0) {
                      className += ' carousel-card-center';
                    } else if (position === 1 || position === topProducts.length - 1) {
                      className += position === 1 ? ' carousel-card-right' : ' carousel-card-left';
                    } else {
                      className += ' carousel-card-hidden';
                    }
                    
                    return (
                      <div 
                        className={className} 
                        key={`${item.id}-${idx}`}
                        onClick={() => {
                          if (position === 1) setProductsIndex(idx);
                          if (position === topProducts.length - 1) setProductsIndex(idx);
                        }}
                      >
                        <div className="carousel-card-inner">
                          <img
                            src={getProductImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="carousel-card-img"
                            loading="lazy"
                          />
                          <div className="carousel-card-overlay">
                            <div className="carousel-card-info">
                              <h3 className="carousel-card-title">{item.name}</h3>
                              <div className="carousel-card-shine"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button 
                  className="carousel-nav carousel-nav-prev"
                  onClick={() => setProductsIndex((prev) => (prev - 1 + topProducts.length) % topProducts.length)}
                  aria-label="Previous product"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button 
                  className="carousel-nav carousel-nav-next"
                  onClick={() => setProductsIndex((prev) => (prev + 1) % topProducts.length)}
                  aria-label="Next product"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
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
              <div style={{ height: 'auto', position: 'relative' }}>
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
                <div className="dot-section">
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

         {/* FAQ Section */}
        <div className="faq-section">
          <FAQ />
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
