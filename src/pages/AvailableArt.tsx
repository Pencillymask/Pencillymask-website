import React, { useState } from 'react';
import { artworkService } from '../services/artworkService';
import { ArtworkGrid } from '../components/artwork/ArtworkGrid';
import { SEO } from '../components/layout/SEO';
import { useArtworksSync } from '../utils/useArtworksSync';

export const AvailableArt: React.FC = () => {
  useArtworksSync();
  const [page, setPage] = useState(1);

  const { artworks, totalPages, currentPage } = artworkService.getArtworks({
    status: 'available',
    page,
    limit: 16,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <SEO
        title="Available Original Paintings for Sale"
        description="Acquire original 1-of-1 contemporary oil paintings, gold leaf artworks, and textured canvases by Dhruvi. Direct from studio with certificate of authenticity."
        keywords="buy original paintings, available fine art, buy art online, original paintings for sale, Dhruvi art studio"
      />
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gallery-available font-bold">
          Ready for Acquisition
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-dark font-normal">
          Available Original Paintings
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed">
          Explore 1-of-1 original contemporary paintings currently available for purchase and studio acquisition. All available works include insured white-glove shipping.
        </p>
      </div>

      <ArtworkGrid
        artworks={artworks}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
