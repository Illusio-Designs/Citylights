import React, { useEffect, useState } from 'react';
import './PublicLoader.css';

const PublicLoader = ({ className, style }) => {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar from 0 to 100%
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3; // Increase by 3% every interval
      });
    }, 50); // Update every 50ms for smooth animation

    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`vivera-public-loader ${className || ''}`} 
      style={style}
    >
      <div className="public-loader-content">
        <div className="public-loader-logo">
          <img 
            src="/vivera icon jpj.jpg" 
            alt="Vivera Lighting" 
            className="public-loader-icon"
          />
        </div>
        <div className="public-loader-text">
          <h2 className="public-loader-brand">Vivera Lighting</h2>
        </div>
        <div className="public-loader-progress">
          <div className="public-progress-bar">
            <div 
              className="public-progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="public-progress-text">{progress}%</div>
        </div>
      </div>
    </div>
  );
};

export default PublicLoader;