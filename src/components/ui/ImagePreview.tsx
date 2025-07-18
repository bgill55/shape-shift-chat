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
    <div className="space-y-2">
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded cursor-pointer" 
        onClick={() => setIsFullScreen(true)}
      />
      <button 
        onClick={handleDownload}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
      >
        Download
      </button>
      {isFullScreen && <FullScreenImage src={src} onClose={() => setIsFullScreen(false)} />}
    </div>
  );
};
