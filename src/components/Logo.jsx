import React from 'react';

const Logo = ({ size = 24, className = '' }) => {
  return (
    <img
      src="/Gemini_Generated_Image_mtu7qwmtu7qwmtu7.svg"
      alt="Logo FaciilTech"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ 
        objectFit: 'contain',
        filter: 'sepia(100%) saturate(400%) hue-rotate(-10deg)'
      }}
    />
  );
};

export default Logo;
