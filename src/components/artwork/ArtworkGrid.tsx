import React from 'react';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Artwork } from '../../types/database.types';
import { ArtworkCard } from './ArtworkCard';

interface ArtworkGridProps {
  artworks: Artwork[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const ArtworkGrid: React.FC<ArtworkGridProps> = ({
  artworks,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-gallery-card/50 rounded-lg aspect-[3/4] animate-pulse border border-gallery-border/40" />
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="py-20 text-center bg-gallery-card/30 rounded-lg border border-dashed border-gallery-border my-8">
        <Palette className="w-12 h-12 text-gallery-muted mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-2xl text-gallery-dark mb-2">No Artworks Found</h3>
        <p className="text-sm text-gallery-muted max-w-md mx-auto">
          We couldn't find any paintings matching your selected search or filter criteria. Try adjusting your filters or clearing search terms.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Wallpaper Masonry Gallery Layout */}
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="break-inside-avoid">
            <ArtworkCard
              artwork={artwork}
            />
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded border border-gallery-border bg-white text-gallery-dark hover:border-gallery-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              // Display page numbers intelligently
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-gallery-gold text-white font-semibold shadow-sm'
                        : 'bg-white border border-gallery-border text-gallery-dark hover:border-gallery-gold'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-1 text-gallery-muted">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded border border-gallery-border bg-white text-gallery-dark hover:border-gallery-gold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
