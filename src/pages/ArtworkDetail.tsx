import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  ShoppingBag,
  CheckCircle,
  Award,
  ShieldCheck,
  Share2,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { artworkService } from '../services/artworkService';
import { whatsappService } from '../services/whatsappService';
import { useCart } from '../context/CartContext';
import { ImageLightbox } from '../components/artwork/ImageLightbox';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { SEO } from '../components/layout/SEO';
import { useArtworksSync } from '../utils/useArtworksSync';

export const ArtworkDetail: React.FC = () => {
  useArtworksSync();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  const artwork = slug ? artworkService.getArtworkBySlug(slug) : undefined;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!artwork) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-gallery-dark">Artwork Not Found</h2>
        <p className="text-sm text-gallery-muted">The painting you are looking for may have been archived or moved.</p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gallery-dark text-white rounded text-xs uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Collection
        </Link>
      </div>
    );
  }

  const images = artwork.images && artwork.images.length > 0 ? artwork.images : [
    {
      id: 'default-1',
      storagePath: '/hero-koi.jpg',
      imageType: 'primary' as const,
      altText: artwork.title,
      sortOrder: 1,
    }
  ];

  const currentImage = images[selectedImageIndex] || images[0];
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: artwork.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(artwork.price);

  const isSold = artwork.status === 'sold';
  const isReserved = artwork.status === 'reserved';
  const inCart = isInCart(artwork.id);

  const whatsappUrl = whatsappService.createArtworkInquiryUrl(artwork);
  const relatedArtworks = artworkService.getRelatedArtworks(artwork.id, artwork.categorySlug || 'oil-on-canvas', 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `Original Painting "${artwork.title}" by Dhruvi`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const artworkSchema = artwork ? {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": artwork.title,
    "image": currentImage.storagePath.startsWith('http')
      ? currentImage.storagePath
      : `https://dhruvisportfolio.com${currentImage.storagePath.startsWith('/') ? currentImage.storagePath : `/${currentImage.storagePath}`}`,
    "description": artwork.description || `Original fine art painting titled "${artwork.title}" by artist Dhruvi.`,
    "creator": {
      "@type": "Person",
      "name": "Dhruvi",
      "alternateName": "pencillymask"
    },
    "artMedium": artwork.medium,
    "width": `${artwork.width} in`,
    "height": `${artwork.height} in`,
    "offers": {
      "@type": "Offer",
      "price": artwork.price,
      "priceCurrency": artwork.currency || "INR",
      "availability": artwork.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    }
  } : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 animate-fadeIn">
      <SEO
        title={`${artwork.title} — Original Fine Art`}
        description={artwork.description ? `${artwork.description.slice(0, 155)}...` : `Original 1-of-1 ${artwork.medium} painting (${artwork.width}" x ${artwork.height}") by Dhruvi.`}
        image={currentImage.storagePath}
        type="product"
        keywords={`${artwork.title}, ${artwork.medium}, original painting, Dhruvi art, ${artwork.categoryName || 'fine art'}, 1-of-1 painting`}
        schema={artworkSchema}
      />

      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gallery-muted hover:text-gallery-dark transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Previous
      </button>

      {/* Main 2-Column Desktop / Stacked Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Left Column: Multi-Angle Gallery & Zoom Lightbox Trigger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">

          {/* Featured Large Image Display */}
          <div className="relative min-h-[380px] sm:min-h-[520px] max-h-[700px] w-full bg-gallery-card/40 rounded-xl overflow-hidden border border-gallery-border/70 group shadow-gallery flex items-center justify-center p-4 sm:p-6">
            {/* Ambient backdrop glow for mood/depth */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${currentImage.storagePath})` }}
            />

            <img
              src={currentImage.storagePath}
              alt={currentImage.altText || artwork.title}
              className="relative z-1 max-w-full max-h-[500px] sm:max-h-[640px] w-auto h-auto object-contain rounded-lg shadow-md transition-transform duration-500 group-hover:scale-[1.01] cursor-pointer"
              onClick={() => setShowLightbox(true)}
            />

            {/* Status Badge Overlay */}
            <div className="absolute top-4 left-4 z-10">
              {isSold && <span className="px-3 py-1 bg-gallery-sold text-white text-xs font-bold uppercase tracking-widest rounded shadow">SOLD</span>}
              {isReserved && <span className="px-3 py-1 bg-amber-700 text-white text-xs font-bold uppercase tracking-widest rounded shadow">RESERVED</span>}
              {!isSold && !isReserved && <span className="px-3 py-1 bg-gallery-available text-white text-xs font-bold uppercase tracking-widest rounded shadow">AVAILABLE</span>}
            </div>

            {/* Quick Action Overlay Buttons */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2">
              <button
                onClick={() => setShowLightbox(true)}
                className="px-3.5 py-2 bg-white/90 hover:bg-white text-gallery-dark rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all"
                title="Fullscreen High-Res Lightbox"
              >
                <Sparkles className="w-4 h-4 text-gallery-gold" />
                <span>Fullscreen View</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Gallery Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === idx ? 'border-gallery-gold scale-105 shadow-md' : 'border-gallery-border opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={img.storagePath} alt={img.altText} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-gallery-dark/70 text-white text-[9px] uppercase tracking-tighter text-center py-0.5">
                    {img.imageType}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information, Provenance, & Inquiry Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          <div className="space-y-2 border-b border-gallery-border pb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-gallery-gold font-bold">
              {artwork.categoryName || 'Oil on Canvas'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-gallery-dark font-medium leading-tight">
              {artwork.title}
            </h1>
            <p className="text-sm text-gallery-muted font-serif italic">
              Original artwork created in {artwork.year} by artist Dhruvi
            </p>
          </div>

          {/* Price & Acquisition Callout */}
          <div className="bg-gallery-card/50 p-5 rounded-lg border border-gallery-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-gallery-muted">Original Artwork Price</span>
                <div className="font-serif text-3xl font-semibold text-gallery-dark mt-0.5">
                  {formattedPrice}
                </div>
              </div>
              <span className="text-xs text-gallery-muted">Includes Taxes & Insured Delivery</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs tracking-wider uppercase rounded transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire / Acquire via WhatsApp</span>
              </a>

              {!isSold ? (
                <button
                  onClick={() => addToCart(artwork)}
                  disabled={inCart}
                  className={`w-full py-3.5 px-4 rounded font-medium text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${inCart
                      ? 'bg-gallery-border text-gallery-muted cursor-default'
                      : 'bg-gallery-dark text-white hover:bg-gallery-gold'
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{inCart ? 'Added to Inquiry List' : 'Add to Inquiry List'}</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded text-center font-medium">
                  This original painting is held in a private collection and is no longer purchasable.
                </div>
              )}
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-gallery-dark font-medium border-b border-gallery-border pb-2">
              Artwork Specifications
            </h3>

            <dl className="grid grid-cols-2 gap-y-2 text-xs text-gallery-dark/90">
              <dt className="text-gallery-muted">Medium:</dt>
              <dd className="font-medium">{artwork.medium}</dd>

              <dt className="text-gallery-muted">Dimensions:</dt>
              <dd className="font-medium">{artwork.width}" × {artwork.height}" ({Math.round(artwork.width * 2.54)} × {Math.round(artwork.height * 2.54)} cm)</dd>

              <dt className="text-gallery-muted">Depth / Profile:</dt>
              <dd className="font-medium">{artwork.depth}" Heavy Gallery Profile</dd>

              <dt className="text-gallery-muted">Year Created:</dt>
              <dd className="font-medium">{artwork.year}</dd>

              <dt className="text-gallery-muted">Framing:</dt>
              <dd className="font-medium">{artwork.frameType}</dd>
            </dl>
          </div>

          {/* Authenticity & Shipping Guarantees */}
          <div className="space-y-2.5 pt-4 border-t border-gallery-border text-xs text-gallery-muted">
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-gallery-gold shrink-0" />
              <span>Signed by artist Dhruvi on front and back of canvas.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gallery-gold shrink-0" />
              <span>100% original hand-painted studio creation with archival pigments.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-gallery-gold shrink-0" />
              <span>Crated & shipped with full insurance coverage.</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t border-gallery-border">
            <h3 className="font-serif text-lg text-gallery-dark font-medium">Curator Description</h3>
            <p className="text-xs text-gallery-muted leading-relaxed font-sans">
              {artwork.description}
            </p>
          </div>

          {/* Share Button */}
          <div className="pt-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-xs text-gallery-muted hover:text-gallery-dark transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Artwork'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Artworks */}
      {relatedArtworks.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-gallery-border">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-gallery-dark font-medium">Related Original Paintings</h2>
            <Link to="/collection" className="text-xs text-gallery-gold hover:underline uppercase tracking-wider">
              View Collection
            </Link>
          </div>

          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {relatedArtworks.map(rel => (
              <div key={rel.id} className="break-inside-avoid">
                <ArtworkCard key={rel.id} artwork={rel} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      {showLightbox && (
        <ImageLightbox
          images={images}
          initialIndex={selectedImageIndex}
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
};
