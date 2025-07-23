import React, { useState } from 'react';
import { FullScreenImage } from './FullScreenImage';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    
    // Extract filename from URL or use a default
    const filename = src.substring(src.lastIndexOf('/') + 1) || 'downloaded-image.png';
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group w-fit max-w-full">
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded cursor-pointer"
        onClick={() => setIsFullScreen(true)}
      />
      <button
        onClick={handleDownload}
        className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-label="Download image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      </button>
      {isFullScreen && <FullScreenImage src={src} onClose={() => setIsFullScreen(false)} />}
    </div>
  );
};
