import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Category } from '../../types/database.types';
import { ArtworkFilterOptions } from '../../services/artworkService';

interface ArtworkFilterProps {
  categories: Category[];
  filters: ArtworkFilterOptions;
  onFilterChange: (newFilters: Partial<ArtworkFilterOptions>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const ArtworkFilter: React.FC<ArtworkFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  return (
    <div className="bg-gallery-card/60 border border-gallery-border p-5 rounded-lg mb-8 space-y-5">
      
      {/* Top Row: Search & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gallery-muted" />
          <input
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
            placeholder="Search title, medium, keyword..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gallery-border rounded-md text-sm text-gallery-dark placeholder-gallery-muted focus:outline-none focus:border-gallery-gold transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gallery-muted hover:text-gallery-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector & Result Count */}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gallery-muted tracking-wider uppercase font-medium">
            Showing <strong className="text-gallery-dark">{totalResults}</strong> paintings
          </span>

          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any, page: 1 })}
            className="bg-white border border-gallery-border rounded-md px-3 py-2 text-sm text-gallery-dark focus:outline-none focus:border-gallery-gold"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title">Title: A - Z</option>
          </select>
        </div>
      </div>

      {/* Row 2: Status Tabs (All, Available, Sold) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gallery-border/50">
        <span className="text-xs uppercase tracking-widest text-gallery-muted font-medium mr-2 flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5" /> Status:
        </span>

        {[
          { label: 'All Artworks', value: 'all' },
          { label: 'Available Original Art', value: 'available' },
          { label: 'Sold Art Provenance', value: 'sold' },
        ].map((tab) => {
          const isActive = (filters.status || 'all') === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onFilterChange({ status: tab.value as any, page: 1 })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all ${
                isActive
                  ? 'bg-gallery-dark text-white shadow-sm'
                  : 'bg-white text-gallery-dark/80 hover:bg-gallery-gold/20 border border-gallery-border'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: Category Pills */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gallery-muted font-medium mr-2">
            Collection:
          </span>

          <button
            onClick={() => onFilterChange({ categorySlug: 'all', page: 1 })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !filters.categorySlug || filters.categorySlug === 'all'
                ? 'bg-gallery-gold text-white shadow-sm'
                : 'bg-white text-gallery-dark border border-gallery-border hover:border-gallery-gold'
            }`}
          >
            All Collections
          </button>

          {categories.filter(c => !c.parentId).map((cat) => {
            const isActive = filters.categorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ categorySlug: cat.slug, page: 1 })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gallery-gold text-white shadow-sm'
                    : 'bg-white text-gallery-dark border border-gallery-border hover:border-gallery-gold'
                }`}
              >
                {cat.name}
              </button>
            );
          })}

          {/* Reset Filters Button */}
          {(filters.searchQuery || (filters.categorySlug && filters.categorySlug !== 'all') || (filters.status && filters.status !== 'all')) && (
            <button
              onClick={onResetFilters}
              className="ml-auto text-xs text-gallery-gold-dark hover:underline font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Optional Subcategories Bar if any exist */}
        {categories.some(c => Boolean(c.parentId)) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 pl-1">
            <span className="text-[11px] uppercase tracking-wider text-gallery-muted/80 font-medium mr-1.5">
              Sub-Themes:
            </span>
            {categories.filter(c => Boolean(c.parentId)).map((sub) => {
              const isActive = filters.categorySlug === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => onFilterChange({ categorySlug: sub.slug, page: 1 })}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-gallery-dark text-white shadow-xs'
                      : 'bg-white/80 text-gallery-dark/80 hover:bg-gallery-gold/20 border border-gallery-border'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
