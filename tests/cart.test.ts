import { describe, it, expect } from 'vitest';
import { artworkService } from '../src/services/artworkService';

describe('Artwork Service & Unique Inventory Rules', () => {
  it('should query and filter artworks correctly', () => {
    const { artworks, totalCount } = artworkService.getArtworks({ limit: 10 });
    expect(artworks.length).toBeGreaterThanOrEqual(1);
    expect(totalCount).toBeGreaterThanOrEqual(1);
  });

  it('should filter available art specifically', () => {
    const { artworks } = artworkService.getArtworks({ status: 'available' });
    const allAvailable = artworks.every(a => a.status === 'available');
    expect(allAvailable).toBe(true);
  });

  it('should filter sold art specifically', () => {
    const { artworks } = artworkService.getArtworks({ status: 'sold' });
    const allSold = artworks.every(a => a.status === 'sold');
    expect(allSold).toBe(true);
  });
});
