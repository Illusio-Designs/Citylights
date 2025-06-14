import React, { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loader = ({ className, style }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div 
      className={className} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        zIndex: 9999,
        ...style
      }}
    >
      <DotLottieReact
        src="https://lottie.host/ca77c210-3ec7-4224-9e3d-f23e84b61323/XaXFVY6mCz.lottie"
        loop
        autoplay
        style={{ width: '700px', height: '500px' }}
      />
    </div>
  );
};

export default Loader;
