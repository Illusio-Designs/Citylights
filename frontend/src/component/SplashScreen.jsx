import React, { useState, useEffect } from 'react';
import './SplashScreen.css';
import viveraLogo from '../assets/Vivera Final Logo white.webp';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // Elegant staggered animation sequence
    const logoTimer = setTimeout(() => setShowLogo(true), 400);
    const taglineTimer = setTimeout(() => setShowTagline(true), 1200);
    const loadingTimer = setTimeout(() => setShowLoading(true), 1800);

    // Smooth progress animation
    const progressTimer = setTimeout(() => {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2.5;
        });
      }, 60);
    }, 1900);

    // Extended timing for luxury feel
    const exitTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 800);
    }, 4000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
      clearTimeout(loadingTimer);
      clearTimeout(progressTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      {/* Elegant background elements */}
      <div className="luxury-bg">
        <div className="bg-pattern"></div>
        <div className="elegant-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>

      <div className="splash-content">
        {/* Logo with elegant frame */}
        <div className={`logo-section ${showLogo ? 'show' : ''}`}>
          <div className="logo-frame">
            <div className="frame-corner tl"></div>
            <div className="frame-corner tr"></div>
            <div className="frame-corner bl"></div>
            <div className="frame-corner br"></div>
          </div>
          <img 
            src={viveraLogo} 
            alt="Vivera Lighting Logo" 
            className="luxury-logo"
          />
        </div>
        
        {/* Sophisticated tagline */}
        <div className={`tagline-section ${showTagline ? 'show' : ''}`}>
          <div className="tagline-ornament top"></div>
          <div className="luxury-tagline">
            <span className="tagline-word word-1">Feel</span>
            <span className="tagline-word word-2">Luxury</span>
            <span className="tagline-word word-3">Together</span>
          </div>
          <div className="tagline-ornament bottom"></div>
        </div>
        
        {/* Premium loading section */}
        <div className={`loading-section ${showLoading ? 'show' : ''}`}>
          <div className="loading-wrapper">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <div className="progress-info">
              <span className="progress-percent">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
