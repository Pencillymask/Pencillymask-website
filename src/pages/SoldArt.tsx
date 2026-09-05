import React, { useState } from 'react';
import { artworkService } from '../services/artworkService';
import { ArtworkGrid } from '../components/artwork/ArtworkGrid';
import { SEO } from '../components/layout/SEO';
import { useArtworksSync } from '../utils/useArtworksSync';

export const SoldArt: React.FC = () => {
  useArtworksSync();
  const [page, setPage] = useState(1);

  const { artworks, totalPages, currentPage } = artworkService.getArtworks({
    status: 'sold',
    page,
    limit: 16,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <SEO
        title="Sold Artworks & Private Collections"
        description="Browse the permanent provenance archive of sold 1-of-1 original paintings created by Dhruvi and held in private collections worldwide."
        keywords="sold paintings archive, art provenance, private collection art, Dhruvi portfolio"
      />
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gallery-sold font-bold">
          Artist Provenance Archive
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-dark font-normal">
          Sold Works & Private Collections
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed">
          An archive of original paintings held in private collections globally. Sold works remain permanently documented in Dhruvi's portfolio as proof of artistic provenance.
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
