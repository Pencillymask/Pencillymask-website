import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { artworkService, ArtworkFilterOptions } from '../services/artworkService';
import { ArtworkFilter } from '../components/artwork/ArtworkFilter';
import { ArtworkGrid } from '../components/artwork/ArtworkGrid';
import { SEO } from '../components/layout/SEO';

export const Collection: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'all';
  const initialStatus = (searchParams.get('status') as any) || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState<ArtworkFilterOptions>({
    categorySlug: initialCategory,
    status: initialStatus,
    searchQuery: initialSearch,
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });

  const categories = artworkService.getCategories();
  const { artworks, totalCount, totalPages, currentPage } = artworkService.getArtworks(filters);

  // Sync state with URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.categorySlug && filters.categorySlug !== 'all') params.category = filters.categorySlug;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.searchQuery) params.search = filters.searchQuery;
    setSearchParams(params, { replace: true });
  }, [filters.categorySlug, filters.status, filters.searchQuery, setSearchParams]);

  const handleFilterChange = (newFilters: Partial<ArtworkFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      categorySlug: 'all',
      status: 'all',
      searchQuery: '',
      sortBy: 'newest',
      page: 1,
      limit: 12,
    });
  };

  const categoryName = filters.categorySlug && filters.categorySlug !== 'all'
    ? categories.find(c => c.slug === filters.categorySlug)?.name
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      <SEO
        title={categoryName ? `${categoryName} Paintings Collection` : "Original Artwork Collection"}
        description="Explore Dhruvi's complete collection of original paintings, textured oils, and gold leaf artwork. Filter by theme, medium, and availability."
        keywords="original painting collection, textured fine art, gold leaf canvases, Dhruvi art gallery, contemporary paintings"
      />
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] text-gallery-gold font-bold">
          Gallery Archive
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-dark font-normal">
          Artwork Collection
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed">
          Browse artist Dhruvi's portfolio of original oil paintings, acrylic mixed media, and gold leaf canvases. Each painting is a unique 1-of-1 original artwork.
        </p>
      </div>

      {/* Filter Component */}
      <ArtworkFilter
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={totalCount}
      />

      {/* Artwork Grid with Pagination */}
      <ArtworkGrid
        artworks={artworks}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => handleFilterChange({ page })}
      />
    </div>
  );
};
