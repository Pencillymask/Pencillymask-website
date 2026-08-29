import { Artwork, Category } from '../types/database.types';
import mockArtworksData from '../data/mockArtworks.json';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'dhruvi_portfolio_artworks';

let inMemoryArtworks: Artwork[] | null = null;
let inMemoryCategories: Category[] | null = null;

// Initialize local storage cache from generated JSON if empty
function getLocalArtworks(): Artwork[] {
  if (inMemoryArtworks !== null) {
    return inMemoryArtworks;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed: Artwork[] = JSON.parse(cached);
        // Filter out any legacy unsplash demo artworks
        const cleaned = parsed.filter(a =>
          !a.images || !a.images.some(img => img.storagePath?.includes('unsplash.com'))
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        }
        inMemoryArtworks = cleaned;
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed reading artworks from local storage cache', e);
  }
  // Fallback to static generated list
  const fallback = (mockArtworksData as Artwork[]).filter(a =>
    !a.images || !a.images.some(img => img.storagePath?.includes('unsplash.com'))
  );
  inMemoryArtworks = [...fallback];
  return inMemoryArtworks;
}

function saveLocalArtworks(artworks: Artwork[]): void {
  inMemoryArtworks = [...artworks];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(artworks));
      } catch (quotaErr) {
        console.warn('LocalStorage quota warning, trimming heavy data URLs for local cache:', quotaErr);
        // Prune any legacy massive data URLs from older items to save space
        const trimmedArtworks = artworks.map(art => ({
          ...art,
          images: art.images.map(img => ({
            ...img,
            // Keep URL if normal URL, or trim if over 50KB
            storagePath: img.storagePath.length > 80000 ? img.storagePath.slice(0, 500) + '...' : img.storagePath,
          }))
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmedArtworks));
      }
    }
  } catch (e) {
    console.error('Failed saving artworks to local storage cache', e);
  }
}

export interface ArtworkFilterOptions {
  categorySlug?: string;
  status?: 'all' | 'available' | 'sold' | 'reserved' | 'draft' | 'archived';
  minPrice?: number;
  maxPrice?: number;
  medium?: string;
  year?: number;
  searchQuery?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'title';
  page?: number;
  limit?: number;
}

const LOCAL_CATEGORIES_KEY = 'dhruvi_portfolio_categories';

function getLocalCategories(): Category[] {
  if (inMemoryCategories !== null) {
    return inMemoryCategories;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (cached) {
        inMemoryCategories = JSON.parse(cached);
        return inMemoryCategories!;
      }
    }
  } catch (e) { }
  inMemoryCategories = [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'Oil on Canvas', slug: 'oil-on-canvas', description: 'Luminous layers of fine oil paint on heavy Belgian linen canvas.' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Acrylic & Mixed Media', slug: 'acrylic-mixed-media', description: 'Dynamic textured acrylics with gold leaf and archival pigments.' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'Abstract Impressions', slug: 'abstract-impressions', description: 'Emotional color landscapes exploring light, silence, and resonance.' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Botanical & Earth', slug: 'botanical-earth', description: 'Organically textured works inspired by floral movement and natural form.' },
    { id: 'b1000000-0000-0000-0000-000000000001', parentId: 'c1000000-0000-0000-0000-000000000001', name: 'Impasto & 24K Gold Leaf', slug: 'impasto-gold-leaf', description: 'Heavy textured oil paintings with 24K gold leaf.' },
    { id: 'b1000000-0000-0000-0000-000000000002', parentId: 'c1000000-0000-0000-0000-000000000001', name: 'Coastal & Seascapes', slug: 'coastal-seascapes', description: 'Muted indigo and alabaster morning landscapes.' },
    { id: 'b1000000-0000-0000-0000-000000000003', parentId: 'c1000000-0000-0000-0000-000000000002', name: 'Marble Dust Mixed Media', slug: 'marble-dust-mixed-media', description: 'Tactile marble dust texture with bronze metallic pigments.' },
  ];
  return inMemoryCategories;
}

function saveLocalCategories(categories: Category[]): void {
  inMemoryCategories = [...categories];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    }
  } catch (e) { }
}

function isUUID(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateFallbackUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const artworkService = {
  isUUID(str?: string | null): boolean {
    return isUUID(str);
  },

  // Get Categories & Subcategories
  getCategories(): Category[] {
    return getLocalCategories();
  },

  // Save Category / Subcategory - lets PostgreSQL generate the UUID if new
  async saveCategoryAsync(categoryData: Partial<Category>): Promise<Category> {
    const categories = getLocalCategories();
    const slug = categoryData.slug || categoryData.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const existingIdx = categories.findIndex(c => (categoryData.id && c.id === categoryData.id) || c.slug === slug);
    const hasValidId = Boolean(categoryData.id && isUUID(categoryData.id));

    let finalId = hasValidId 
      ? categoryData.id! 
      : (existingIdx >= 0 && isUUID(categories[existingIdx].id) ? categories[existingIdx].id : generateFallbackUUID());

    let fullCat: Category = {
      id: finalId,
      name: categoryData.name!,
      slug,
      description: categoryData.description || '',
      parentId: categoryData.parentId && isUUID(categoryData.parentId) ? categoryData.parentId : null,
      sortOrder: categoryData.sortOrder || (existingIdx >= 0 ? categories[existingIdx].sortOrder : categories.length + 1),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        if (hasValidId) {
          // Update existing category with known UUID
          const { data, error } = await supabase
            .from('categories')
            .upsert({
              id: fullCat.id,
              parent_id: fullCat.parentId || null,
              name: fullCat.name,
              slug: fullCat.slug,
              description: fullCat.description,
              sort_order: fullCat.sortOrder || 0,
            }, { onConflict: 'id' })
            .select()
            .single();

          if (!error && data) {
            fullCat.id = data.id;
          } else if (error) {
            console.error('Supabase Category Update Error:', error.message);
          }
        } else {
          // Let PostgreSQL generate the UUID id with default uuid_generate_v4()
          const { data, error } = await supabase
            .from('categories')
            .insert({
              parent_id: fullCat.parentId || null,
              name: fullCat.name,
              slug: fullCat.slug,
              description: fullCat.description,
              sort_order: fullCat.sortOrder || 0,
            })
            .select()
            .single();

          if (!error && data) {
            fullCat.id = data.id;
          } else if (error) {
            console.warn('Supabase Category Insert notice (checking by slug):', error.message);
            // If conflict by slug, try fetching existing row ID
            const { data: existingRow } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', fullCat.slug)
              .single();
            if (existingRow) {
              fullCat.id = existingRow.id;
            }
          }
        }
      } catch (err) {
        console.error('Supabase Category Upsert Exception:', err);
      }
    }

    if (existingIdx >= 0) {
      categories[existingIdx] = fullCat;
    } else {
      categories.push(fullCat);
    }
    saveLocalCategories(categories);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { categories } }));
    }
    return fullCat;
  },

  async deleteCategoryAsync(id: string): Promise<void> {
    let categories = getLocalCategories();
    categories = categories.filter(c => c.id !== id && c.parentId !== id);
    saveLocalCategories(categories);

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase Category Delete Error:', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { categories } }));
    }
  },

  // Fetch Live Artworks & Categories directly from Supabase
  async fetchLiveArtworksAsync(): Promise<{ artworks: Artwork[]; categories: Category[] }> {
    if (!isSupabaseConfigured || !supabase) {
      return { artworks: getLocalArtworks(), categories: getLocalCategories() };
    }

    try {
      // 1. Fetch Categories from Supabase
      const { data: catData, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      let categories: Category[] = getLocalCategories();
      if (!catErr && catData && catData.length > 0) {
        const dbCatMap = new Map<string, Category>();
        catData.forEach((c: any) => {
          dbCatMap.set(c.id, {
            id: c.id,
            parentId: c.parent_id || null,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            sortOrder: c.sort_order || 0,
          });
        });

        // Merge DB categories with default local categories to ensure none are lost
        const mergedCategories: Category[] = [];
        dbCatMap.forEach(cat => mergedCategories.push(cat));
        categories.forEach(localCat => {
          if (!mergedCategories.some(c => c.id === localCat.id || c.slug === localCat.slug)) {
            mergedCategories.push(localCat);
          }
        });
        categories = mergedCategories;
        saveLocalCategories(categories);
      }

      const catMap = new Map<string, Category>();
      const slugMap = new Map<string, Category>();
      categories.forEach(c => {
        catMap.set(c.id, c);
        slugMap.set(c.slug, c);
      });

      // 2. Fetch Artworks with Images from Supabase
      const { data: artData, error: artErr } = await supabase
        .from('artworks')
        .select(`
          *,
          images:artwork_images(*)
        `)
        .order('created_at', { ascending: false });

      if (artErr) {
        console.warn('Supabase fetch artworks notice:', artErr.message);
        return { artworks: getLocalArtworks(), categories };
      }

      if (artData && artData.length > 0) {
        const localList = getLocalArtworks();
        const liveArtworks: Artwork[] = artData.map((row: any) => {
          let catObj = row.category_id ? catMap.get(row.category_id) : undefined;
          let subCatObj = row.sub_category_id ? catMap.get(row.sub_category_id) : undefined;

          // If not linked by ID, search by local cache match or slug
          const existingLocal = localList.find(a => a.id === row.id || a.slug === row.slug);
          if (!catObj && existingLocal) {
            catObj = catMap.get(existingLocal.categoryId) || slugMap.get(existingLocal.categorySlug || '');
          }
          if (!subCatObj && existingLocal && existingLocal.subCategoryId) {
            subCatObj = catMap.get(existingLocal.subCategoryId) || (existingLocal.subCategorySlug ? slugMap.get(existingLocal.subCategorySlug) : undefined);
          }

          const fallbackCat = categories[0] || { id: 'c1000000-0000-0000-0000-000000000001', name: 'Oil on Canvas', slug: 'oil-on-canvas' };
          const resolvedCat = catObj || fallbackCat;

          const images = (row.images || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => ({
              id: img.id,
              artworkId: img.artwork_id,
              storagePath: img.storage_path || '/hero-koi.jpg',
              imageType: img.image_type || 'primary',
              altText: img.alt_text || row.title,
              sortOrder: img.sort_order || 1,
              createdAt: img.created_at,
            }));

          return {
            id: row.id,
            artistId: row.artist_id,
            title: row.title,
            slug: row.slug,
            description: row.description || '',
            price: Number(row.price) || 0,
            currency: row.currency || 'INR',
            medium: row.medium || 'Oil on Canvas',
            width: Number(row.width) || 36,
            height: Number(row.height) || 48,
            depth: Number(row.depth) || 1.5,
            year: Number(row.year) || new Date().getFullYear(),
            categoryId: row.category_id || resolvedCat.id,
            categoryName: resolvedCat.name,
            categorySlug: resolvedCat.slug,
            subCategoryId: row.sub_category_id || subCatObj?.id || null,
            subCategoryName: subCatObj?.name,
            subCategorySlug: subCatObj?.slug,
            status: row.status || 'available',
            reservationExpiresAt: row.reservation_expires_at,
            featured: Boolean(row.featured),
            signed: Boolean(row.signed ?? true),
            certificateAvailable: Boolean(row.certificate_available ?? true),
            frameType: row.frame_type || 'Unframed Gallery Canvas',
            frameIncluded: Boolean(row.frame_included),
            viewsCount: Number(row.views_count) || 0,
            images: images.length > 0 ? images : [
              {
                id: `def-${row.id}`,
                storagePath: '/hero-koi.jpg',
                imageType: 'primary' as const,
                altText: row.title,
                sortOrder: 1,
              }
            ],
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        });

        saveLocalArtworks(liveArtworks);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { count: liveArtworks.length } }));
        }
        return { artworks: liveArtworks, categories };
      }

      // If Supabase table exists but is empty, seed mock items automatically
      const local = getLocalArtworks();
      if (local && local.length > 0) {
        Promise.all(local.map(a => this.syncArtworkToSupabase(a))).catch(e => console.warn('Auto-seed error:', e));
      }

      return { artworks: local, categories };
    } catch (err) {
      console.error('Supabase live fetch error:', err);
      return { artworks: getLocalArtworks(), categories: getLocalCategories() };
    }
  },

  // Get Artworks with Filters and Pagination
  getArtworks(options: ArtworkFilterOptions = {}) {
    let artworks = getLocalArtworks();

    // Filter by Category or Subcategory
    if (options.categorySlug && options.categorySlug !== 'all') {
      const targetSlug = options.categorySlug.toLowerCase().trim();
      const allCats = getLocalCategories();
      const matchedCat = allCats.find(c => c.slug.toLowerCase() === targetSlug);
      
      // If this is a parent category, also match its subcategory IDs and slugs
      const childCategoryIds = matchedCat
        ? allCats.filter(c => c.parentId === matchedCat.id).map(c => c.id)
        : [];
      const childCategorySlugs = matchedCat
        ? allCats.filter(c => c.parentId === matchedCat.id).map(c => c.slug.toLowerCase())
        : [];

      artworks = artworks.filter(a => {
        const artCatSlug = (a.categorySlug || '').toLowerCase().trim();
        const artSubCatSlug = (a.subCategorySlug || '').toLowerCase().trim();
        const artCatId = a.categoryId;
        const artSubCatId = a.subCategoryId;

        return (
          artCatSlug === targetSlug ||
          artSubCatSlug === targetSlug ||
          childCategorySlugs.includes(artCatSlug) ||
          childCategorySlugs.includes(artSubCatSlug) ||
          (matchedCat && (
            artCatId === matchedCat.id ||
            artSubCatId === matchedCat.id ||
            childCategoryIds.includes(artCatId) ||
            (artSubCatId && childCategoryIds.includes(artSubCatId))
          ))
        );
      });
    }

    // Filter by Availability Status
    if (options.status && options.status !== 'all') {
      artworks = artworks.filter(a => a.status === options.status);
    }

    // Filter by Price Range
    if (options.minPrice !== undefined) {
      artworks = artworks.filter(a => a.price >= options.minPrice!);
    }
    if (options.maxPrice !== undefined) {
      artworks = artworks.filter(a => a.price <= options.maxPrice!);
    }

    // Filter by Medium
    if (options.medium && options.medium !== 'all') {
      artworks = artworks.filter(a => a.medium.toLowerCase().includes(options.medium!.toLowerCase()));
    }

    // Filter by Year
    if (options.year) {
      artworks = artworks.filter(a => a.year === options.year);
    }

    // Search Filter
    if (options.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      artworks = artworks.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q) ||
        (a.categoryName && a.categoryName.toLowerCase().includes(q)) ||
        (a.subCategoryName && a.subCategoryName.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortBy = options.sortBy || 'newest';
    artworks.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
    });

    const page = options.page || 1;
    const limit = options.limit || 12;
    const totalCount = artworks.length;
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedItems = artworks.slice((page - 1) * limit, page * limit);

    return {
      artworks: paginatedItems,
      totalCount,
      totalPages,
      currentPage: page,
    };
  },

  // Featured Artworks for Homepage
  getFeaturedArtworks(limit = 6): Artwork[] {
    const artworks = getLocalArtworks();
    return artworks.filter(a => a.featured).slice(0, limit);
  },

  // Get Artwork by Slug
  getArtworkBySlug(slug: string): Artwork | undefined {
    const artworks = getLocalArtworks();
    return artworks.find(a => a.slug === slug);
  },

  // Get Related Artworks
  getRelatedArtworks(currentId: string, categorySlug: string, limit = 3): Artwork[] {
    const artworks = getLocalArtworks();
    const targetSlug = (categorySlug || '').toLowerCase();
    return artworks
      .filter(a => a.id !== currentId && (
        (a.categorySlug || '').toLowerCase() === targetSlug ||
        (a.subCategorySlug || '').toLowerCase() === targetSlug
      ))
      .slice(0, limit);
  },

  // Available Artwork count & summary stats for Admin
  getDashboardStats() {
    const artworks = getLocalArtworks();
    const total = artworks.length;
    const available = artworks.filter(a => a.status === 'available').length;
    const reserved = artworks.filter(a => a.status === 'reserved').length;
    const sold = artworks.filter(a => a.status === 'sold').length;
    const totalRevenue = artworks
      .filter(a => a.status === 'sold')
      .reduce((sum, a) => sum + a.price, 0);

    return {
      totalArtworks: total,
      availableArtworks: available,
      reservedArtworks: reserved,
      soldArtworks: sold,
      totalOrders: sold + 4,
      totalRevenue,
      pendingEnquiries: 3,
    };
  },

  // Admin: Save / Create Artwork (Synchronous + Async Supabase sync)
  saveArtwork(newArtworkData: Partial<Artwork>): Artwork {
    const artworks = getLocalArtworks();
    const allCategories = getLocalCategories();
    const isEditing = Boolean(newArtworkData.id);
    const existingIndex = isEditing ? artworks.findIndex(a => a.id === newArtworkData.id) : -1;
    const existingArt = existingIndex >= 0 ? artworks[existingIndex] : null;

    // Use existing ID if valid UUID, otherwise generate fallback for local cache
    const artworkId = (newArtworkData.id && isUUID(newArtworkData.id))
      ? newArtworkData.id
      : (existingArt && isUUID(existingArt.id) ? existingArt.id : generateFallbackUUID());

    // Compute or preserve unique slug
    let slug = existingArt?.slug;
    if (!slug || (newArtworkData.title && newArtworkData.title !== existingArt?.title)) {
      const rawSlug = (newArtworkData.slug || newArtworkData.title || 'painting')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'painting';

      slug = rawSlug;
      let counter = 1;
      while (artworks.some(a => a.slug === slug && a.id !== artworkId)) {
        counter++;
        slug = `${rawSlug}-${counter}`;
      }
    }

    // Resolve Category metadata accurately
    let catObj = newArtworkData.categoryId ? allCategories.find(c => c.id === newArtworkData.categoryId) : undefined;
    if (!catObj && newArtworkData.categorySlug) {
      catObj = allCategories.find(c => c.slug.toLowerCase() === newArtworkData.categorySlug!.toLowerCase());
    }
    if (!catObj && existingArt) {
      catObj = allCategories.find(c => c.id === existingArt.categoryId || c.slug === existingArt.categorySlug);
    }
    const defaultCat = allCategories[0] || { id: 'c1000000-0000-0000-0000-000000000001', name: 'Oil on Canvas', slug: 'oil-on-canvas' };
    const finalCat = catObj || defaultCat;

    // Resolve Subcategory metadata
    let subCatObj = newArtworkData.subCategoryId ? allCategories.find(c => c.id === newArtworkData.subCategoryId) : undefined;
    if (!subCatObj && newArtworkData.subCategorySlug) {
      subCatObj = allCategories.find(c => c.slug.toLowerCase() === newArtworkData.subCategorySlug!.toLowerCase());
    }

    const fullArtwork: Artwork = {
      id: artworkId,
      title: newArtworkData.title || existingArt?.title || 'Untitled Artwork',
      slug,
      description: newArtworkData.description !== undefined ? newArtworkData.description : (existingArt?.description || ''),
      price: newArtworkData.price !== undefined ? Number(newArtworkData.price) : (existingArt?.price || 0),
      currency: 'INR',
      medium: newArtworkData.medium || existingArt?.medium || 'Oil on Canvas',
      width: newArtworkData.width !== undefined ? Number(newArtworkData.width) : (existingArt?.width || 36),
      height: newArtworkData.height !== undefined ? Number(newArtworkData.height) : (existingArt?.height || 48),
      depth: newArtworkData.depth !== undefined ? Number(newArtworkData.depth) : (existingArt?.depth || 1.5),
      year: newArtworkData.year !== undefined ? Number(newArtworkData.year) : (existingArt?.year || new Date().getFullYear()),
      categoryId: finalCat.id,
      categoryName: finalCat.name,
      categorySlug: finalCat.slug,
      subCategoryId: subCatObj ? subCatObj.id : (newArtworkData.subCategoryId || null),
      subCategoryName: subCatObj?.name,
      subCategorySlug: subCatObj?.slug,
      status: newArtworkData.status || existingArt?.status || 'available',
      featured: newArtworkData.featured !== undefined ? Boolean(newArtworkData.featured) : (existingArt?.featured || false),
      signed: true,
      certificateAvailable: true,
      frameType: newArtworkData.frameType || existingArt?.frameType || 'Unframed Gallery Paper',
      frameIncluded: newArtworkData.frameIncluded !== undefined ? Boolean(newArtworkData.frameIncluded) : (existingArt?.frameIncluded || false),
      images: newArtworkData.images && newArtworkData.images.length > 0 ? newArtworkData.images : (existingArt?.images || [
        {
          id: generateFallbackUUID(),
          storagePath: '/hero-koi.jpg',
          imageType: 'primary',
          altText: newArtworkData.title || 'Artwork Front View',
          sortOrder: 1,
        }
      ]),
      createdAt: existingArt?.createdAt || newArtworkData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      artworks[existingIndex] = fullArtwork;
    } else {
      artworks.unshift(fullArtwork);
    }

    saveLocalArtworks(artworks);
    return fullArtwork;
  },

  // Supabase Async Upsert helper - lets PostgreSQL generate the UUID if new
  async syncArtworkToSupabase(artwork: Artwork): Promise<Artwork> {
    if (!isSupabaseConfigured || !supabase) return artwork;

    try {
      const allCats = getLocalCategories();

      // 1. Ensure category and subcategory exist in Supabase first to prevent FK constraint failures
      if (artwork.categoryId && isUUID(artwork.categoryId)) {
        const cat = allCats.find(c => c.id === artwork.categoryId);
        if (cat) {
          await supabase.from('categories').upsert({
            id: cat.id,
            parent_id: cat.parentId && isUUID(cat.parentId) ? cat.parentId : null,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            sort_order: cat.sortOrder || 0,
          }, { onConflict: 'id' });
        }
      }

      if (artwork.subCategoryId && isUUID(artwork.subCategoryId)) {
        const subCat = allCats.find(c => c.id === artwork.subCategoryId);
        if (subCat) {
          await supabase.from('categories').upsert({
            id: subCat.id,
            parent_id: subCat.parentId && isUUID(subCat.parentId) ? subCat.parentId : null,
            name: subCat.name,
            slug: subCat.slug,
            description: subCat.description || '',
            sort_order: subCat.sortOrder || 0,
          }, { onConflict: 'id' });
        }
      }

      const hasValidUUID = isUUID(artwork.id);
      let dbArtworkId = artwork.id;

      const basePayload = {
        title: artwork.title,
        slug: artwork.slug,
        description: artwork.description,
        price: artwork.price,
        currency: artwork.currency || 'INR',
        medium: artwork.medium,
        width: artwork.width,
        height: artwork.height,
        depth: artwork.depth || 1.5,
        year: artwork.year,
        category_id: artwork.categoryId && isUUID(artwork.categoryId) ? artwork.categoryId : null,
        sub_category_id: artwork.subCategoryId && isUUID(artwork.subCategoryId) ? artwork.subCategoryId : null,
        status: artwork.status || 'available',
        featured: Boolean(artwork.featured),
        signed: Boolean(artwork.signed ?? true),
        certificate_available: Boolean(artwork.certificateAvailable ?? true),
        frame_type: artwork.frameType || 'Unframed Gallery Canvas',
        frame_included: Boolean(artwork.frameIncluded),
        created_at: artwork.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (hasValidUUID) {
        // Update existing with known UUID
        const { data, error: artworkError } = await supabase
          .from('artworks')
          .upsert({ id: artwork.id, ...basePayload }, { onConflict: 'id' })
          .select()
          .single();

        if (artworkError) {
          console.error('Error updating artwork in Supabase:', artworkError.message);
        } else if (data) {
          dbArtworkId = data.id;
        }
      } else {
        // Let PostgreSQL generate the UUID with DEFAULT uuid_generate_v4()
        const { data, error: artworkError } = await supabase
          .from('artworks')
          .insert(basePayload)
          .select()
          .single();

        if (artworkError) {
          console.error('Error inserting artwork in Supabase:', artworkError.message);
        } else if (data) {
          dbArtworkId = data.id;
        }
      }

      // Update local artwork with Postgres-assigned UUID
      if (dbArtworkId !== artwork.id) {
        artwork.id = dbArtworkId;
        const localArts = getLocalArtworks();
        const idx = localArts.findIndex(a => a.slug === artwork.slug || a.id === artwork.id);
        if (idx >= 0) {
          localArts[idx].id = dbArtworkId;
          saveLocalArtworks(localArts);
        }
      }

      // 2. Populate artwork_categories junction table
      try {
        if (artwork.categoryId && isUUID(artwork.categoryId)) {
          await supabase.from('artwork_categories').upsert({
            artwork_id: dbArtworkId,
            category_id: artwork.categoryId,
          }, { onConflict: 'artwork_id,category_id' });
        }
      } catch (junctionErr) {
        console.warn('artwork_categories sync notice:', junctionErr);
      }

      // 3. Sync artwork images
      if (artwork.images && artwork.images.length > 0) {
        await supabase.from('artwork_images').delete().eq('artwork_id', dbArtworkId);

        for (let idx = 0; idx < artwork.images.length; idx++) {
          const img = artwork.images[idx];
          // Let PostgreSQL generate ID or use existing UUID
          const imgPayload: any = {
            artwork_id: dbArtworkId,
            storage_path: img.storagePath,
            image_type: img.imageType || 'primary',
            alt_text: img.altText || artwork.title,
            sort_order: img.sortOrder || (idx + 1),
            created_at: new Date().toISOString(),
          };
          if (img.id && isUUID(img.id)) {
            imgPayload.id = img.id;
          }

          await supabase.from('artwork_images').insert(imgPayload);
        }
      }
    } catch (err) {
      console.error('Unexpected Supabase upsert exception:', err);
    }
    return artwork;
  },

  // Async Save Artwork method for explicit await
  async saveArtworkAsync(newArtworkData: Partial<Artwork>): Promise<Artwork> {
    const artwork = this.saveArtwork(newArtworkData);
    let synced = artwork;
    if (isSupabaseConfigured && supabase) {
      synced = await this.syncArtworkToSupabase(artwork);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { artwork: synced } }));
    }
    return synced;
  },

  // Admin: Update Status (e.g. mark sold / available)
  updateArtworkStatus(id: string, status: Artwork['status']) {
    const artworks = getLocalArtworks();
    const artwork = artworks.find(a => a.id === id);
    if (artwork) {
      artwork.status = status;
      artwork.updatedAt = new Date().toISOString();
      saveLocalArtworks(artworks);

      if (isSupabaseConfigured && supabase && isUUID(id)) {
        supabase
          .from('artworks')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating artwork status in Supabase:', error.message);
          });
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { id, status } }));
      }
    }
    return artwork;
  },

  // Admin: Delete Artwork
  deleteArtwork(id: string) {
    let artworks = getLocalArtworks();
    artworks = artworks.filter(a => a.id !== id);
    saveLocalArtworks(artworks);

    if (isSupabaseConfigured && supabase && isUUID(id)) {
      supabase
        .from('artworks')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting artwork from Supabase:', error.message);
        });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dhruvi_artworks_updated', { detail: { id } }));
    }
  },

  // Supabase Enquiry Submission Integration
  async submitEnquiryAsync(enquiry: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    artworkId?: string;
    channel?: 'contact_form' | 'whatsapp' | 'direct_inquiry';
  }) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('enquiries').insert({
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone || null,
          subject: enquiry.subject || 'General Inquiry',
          message: enquiry.message,
          artwork_id: enquiry.artworkId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(enquiry.artworkId) ? enquiry.artworkId : null,
          channel: enquiry.channel || 'contact_form',
          status: 'new',
        });
        if (error) console.error('Supabase Enquiry Error:', error.message);
      } catch (err) {
        console.error('Unexpected Supabase enquiry error:', err);
      }
    }
  },

  // Supabase Newsletter Subscription Integration
  async subscribeNewsletterAsync(email: string, source: string = 'footer'): Promise<{ success: boolean; message?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Save to local cache as backup
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('dhruvi_portfolio_subscribers');
        const list: string[] = cached ? JSON.parse(cached) : [];
        if (!list.includes(trimmedEmail)) {
          list.push(trimmedEmail);
          localStorage.setItem('dhruvi_portfolio_subscribers', JSON.stringify(list));
        }
      }
    } catch (e) {
      console.warn('LocalStorage subscriber save error:', e);
    }

    // Save to Supabase newsletter_subscribers table
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: trimmedEmail,
            source: source,
          });

        if (error) {
          // If unique constraint violation (already subscribed), return friendly message
          if (error.code === '23505') {
            return { success: true, message: 'You are already subscribed to the collector list!' };
          }
          console.error('Supabase Subscriber Insert Error:', error.message);
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Thank you for subscribing to private collector drops!' };
      } catch (err: any) {
        console.error('Unexpected Supabase subscriber error:', err);
        return { success: false, message: err?.message || 'Failed to subscribe' };
      }
    }

    return { success: true, message: 'Thank you for subscribing to private collector drops!' };
  },

  // Get Newsletter Subscribers (Admin / Export)
  async getSubscribersAsync(): Promise<{ email: string; createdAt?: string; source?: string }[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(row => ({
            email: row.email,
            source: row.source,
            createdAt: row.created_at,
          }));
        }
      } catch (e) {
        console.error('Error fetching subscribers from Supabase:', e);
      }
    }
    // Fallback from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('dhruvi_portfolio_subscribers');
        if (cached) {
          const list: string[] = JSON.parse(cached);
          return list.map(email => ({ email, source: 'local_cache' }));
        }
      }
    } catch (e) {}
    return [];
  },

  // Supabase Order & Customer Submission Integration
  async submitOrderAsync(orderData: {
    fullName: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    items: Artwork[];
    totalAmount: number;
    notes?: string;
  }) {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // 1. Insert Customer
      const { data: customer, error: customerErr } = await supabase
        .from('customers')
        .insert({
          full_name: orderData.fullName,
          email: orderData.email,
          phone: orderData.phone,
        })
        .select()
        .single();

      if (customerErr) throw customerErr;

      // 2. Insert Address
      const { data: address, error: addressErr } = await supabase
        .from('addresses')
        .insert({
          customer_id: customer.id,
          street_address: orderData.streetAddress,
          city: orderData.city,
          state: orderData.state,
          postal_code: orderData.postalCode,
          country: orderData.country || 'India',
        })
        .select()
        .single();

      if (addressErr) throw addressErr;

      // 3. Insert Order
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer.id,
          address_id: address.id,
          total_amount: orderData.totalAmount,
          currency: 'INR',
          status: 'pending',
          payment_status: 'unpaid',
          notes: orderData.notes || null,
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 4. Insert Order Items
      for (const item of orderData.items) {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)) {
          await supabase.from('order_items').insert({
            order_id: order.id,
            artwork_id: item.id,
            price_at_purchase: item.price,
          });
        }
      }
    } catch (err) {
      console.error('Supabase Order Creation Error:', err);
    }
  }
};
