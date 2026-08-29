import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Artwork } from '../../types/database.types';

interface ArtworkCardProps {
  artwork: Artwork;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryImage =
    artwork.images?.find(img => img.imageType === 'primary')?.storagePath ||
    artwork.images?.[0]?.storagePath ||
    '/hero-koi.jpg';

  const isSold = artwork.status === 'sold';
  const isReserved = artwork.status === 'reserved';

  return (
    <div className="group relative w-full overflow-hidden rounded-lg sm:rounded-xl bg-gallery-card/30 border border-gallery-border/40 hover:border-gallery-gold/60 shadow-xs hover:shadow-gallery-xl transition-all duration-500">
      <Link
        to={`/artwork/${artwork.slug}`}
        className="block relative w-full overflow-hidden cursor-pointer"
      >
        {/* Skeleton Loader placeholder */}
        {!imageLoaded && (
          <div className="w-full aspect-[4/5] bg-gallery-border/20 animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-gallery-muted tracking-widest uppercase">Loading Art...</span>
          </div>
        )}

        <img
          src={primaryImage}
          alt={artwork.title}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          className={`w-full h-auto object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Status Badge (Discreet subtle pill) */}
        {(isSold || isReserved) && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] rounded-xs backdrop-blur-md shadow-xs ${
                isSold
                  ? 'bg-black/75 text-stone-300 border border-white/10'
                  : 'bg-amber-950/75 text-amber-200 border border-amber-500/20'
              }`}
            >
              {isSold ? 'Sold' : 'Reserved'}
            </span>
          </div>
        )}

        {/* Wallpaper-style Subtle Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5">

          {/* Bottom title & info fade-in on hover */}
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-base sm:text-lg text-white font-medium italic">
                {artwork.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-gallery-gold shrink-0" />
            </div>
            {artwork.medium && (
              <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5 font-light">
                {artwork.medium}
              </p>
            )}
            {artwork.width && artwork.height && (
              <p className="text-[10px] text-white/60 tracking-wider mt-0.5">
                {artwork.width}" × {artwork.height}" • {artwork.year}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
