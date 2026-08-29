import { describe, it, expect, beforeEach } from 'vitest';
import { artworkService } from '../src/services/artworkService';

describe('Category Assignment & Filter Visibility Suite', () => {
  beforeEach(() => {
    // Clean state if needed
  });

  it('should retrieve default studio categories including parent and subcategories', () => {
    const categories = artworkService.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(4);

    const mainCats = categories.filter(c => !c.parentId);
    const subCats = categories.filter(c => Boolean(c.parentId));

    expect(mainCats.some(c => c.slug === 'oil-on-canvas')).toBe(true);
    expect(mainCats.some(c => c.slug === 'acrylic-mixed-media')).toBe(true);
    expect(mainCats.some(c => c.slug === 'abstract-impressions')).toBe(true);
    expect(mainCats.some(c => c.slug === 'botanical-earth')).toBe(true);
    expect(subCats.length).toBeGreaterThanOrEqual(1);
  });

  it('should accurately filter artworks when querying by main category slug', () => {
    const { artworks, totalCount } = artworkService.getArtworks({
      categorySlug: 'oil-on-canvas',
      limit: 50,
    });

    expect(totalCount).toBeGreaterThan(0);
    const allMatch = artworks.every(
      a => (a.categorySlug || '').toLowerCase() === 'oil-on-canvas' ||
           (a.subCategorySlug || '').toLowerCase().includes('gold') ||
           (a.subCategorySlug || '').toLowerCase().includes('coastal')
    );
    expect(allMatch).toBe(true);
  });

  it('should immediately show a newly added painting under its assigned category filter', () => {
    const uniqueTitle = `Test Serenade ${Date.now()}`;
    const newArt = artworkService.saveArtwork({
      title: uniqueTitle,
      price: 110000,
      medium: 'Oil & 24K Gold Leaf on Canvas',
      categorySlug: 'abstract-impressions',
      status: 'available',
    });

    expect(newArt.categorySlug).toBe('abstract-impressions');

    // Query artworks with category filter
    const { artworks } = artworkService.getArtworks({
      categorySlug: 'abstract-impressions',
      limit: 100,
    });

    const found = artworks.find(a => a.title === uniqueTitle);
    expect(found).toBeDefined();
    expect(found?.categorySlug).toBe('abstract-impressions');
  });

  it('should show subcategory paintings when filtering by both parent and subcategory', () => {
    const categories = artworkService.getCategories();
    const parentCat = categories.find(c => c.slug === 'oil-on-canvas');
    const subCat = categories.find(c => c.parentId === parentCat?.id) || categories.find(c => Boolean(c.parentId));

    const subTitle = `Subcategory Artwork ${Date.now()}`;
    const savedArt = artworkService.saveArtwork({
      title: subTitle,
      price: 85000,
      medium: 'Heavy Textured Oil on Linen',
      categoryId: parentCat?.id,
      categorySlug: parentCat?.slug,
      subCategoryId: subCat?.id,
      subCategorySlug: subCat?.slug,
      status: 'available',
    });

    expect(savedArt.subCategorySlug).toBe(subCat?.slug);

    // 1. Filter by parent category -> must include the artwork
    if (parentCat) {
      const parentFilter = artworkService.getArtworks({
        categorySlug: parentCat.slug,
        limit: 100,
      });
      const inParent = parentFilter.artworks.some(a => a.title === subTitle);
      expect(inParent).toBe(true);
    }

    // 2. Filter by subcategory -> must include the artwork
    if (subCat) {
      const subFilter = artworkService.getArtworks({
        categorySlug: subCat.slug,
        limit: 100,
      });
      const inSub = subFilter.artworks.some(a => a.title === subTitle);
      expect(inSub).toBe(true);
    }
  });

  it('should support creating a custom category and finding artworks filtered by it', async () => {
    const customCatName = `Modern Geometry ${Date.now()}`;
    const customCat = await artworkService.saveCategoryAsync({
      name: customCatName,
      description: 'Geometric minimalism in oil and metallics',
    });

    expect(customCat.slug).toBeDefined();

    const customArt = artworkService.saveArtwork({
      title: `Geometric Harmony ${Date.now()}`,
      price: 99000,
      medium: 'Oil on Canvas',
      categoryId: customCat.id,
      categorySlug: customCat.slug,
      categoryName: customCat.name,
      status: 'available',
    });

    const filterResult = artworkService.getArtworks({
      categorySlug: customCat.slug,
      limit: 20,
    });

    expect(filterResult.totalCount).toBeGreaterThanOrEqual(1);
    expect(filterResult.artworks.some(a => a.id === customArt.id)).toBe(true);
  });

  it('should validate standard PostgreSQL UUID strings properly', () => {
    expect(artworkService.isUUID('c1000000-0000-0000-0000-000000000001')).toBe(true);
    expect(artworkService.isUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
    expect(artworkService.isUUID('invalid-uuid-string')).toBe(false);
    expect(artworkService.isUUID('c1782390823902380923')).toBe(false);
    expect(artworkService.isUUID(undefined)).toBe(false);
  });
});
