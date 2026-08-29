import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { ArtworkImage } from '../../types/database.types';

interface ImageLightboxProps {
  images: ArtworkImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  if (!isOpen || images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-fadeIn select-none">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-white/80 z-10">
        <span className="text-xs uppercase tracking-widest font-mono">
          {currentIndex + 1} / {images.length} — {currentImage.imageType} view
        </span>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Toggle High Resolution Zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            title="Close Lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
        {images.length > 1 && (
          <button
            onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentImage.storagePath}
          alt={currentImage.altText || 'Artwork View'}
          className={`max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {images.length > 1 && (
          <button
            onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex items-center justify-center space-x-3 py-2 overflow-x-auto z-10">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                currentIndex === idx ? 'border-gallery-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.storagePath} alt={img.altText} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
