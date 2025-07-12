import React from 'react';

interface FullScreenImageProps {
  src: string;
  onClose: () => void;
}

export const FullScreenImage: React.FC<FullScreenImageProps> = ({ src, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img src={src} alt="Full screen preview" className="w-full h-full object-contain" />
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
