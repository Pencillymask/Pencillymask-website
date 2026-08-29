import { Artwork, Category } from '../types/database.types';
import mockArtworksData from '../data/mockArtworks.json';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'dhruvi_portfolio_artworks';

// Initialize local storage cache from generated JSON if empty
function getLocalArtworks(): Artwork[] {
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
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed reading artworks from local storage cache', e);
  }
  // Fallback to static generated list
  return (mockArtworksData as Artwork[]).filter(a =>
    !a.images || !a.images.some(img => img.storagePath?.includes('unsplash.com'))
  );
}

function saveLocalArtworks(artworks: Artwork[]): void {
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
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (cached) return JSON.parse(cached);
    }
  } catch (e) { }
  return [
    { id: 'c1000000-0000-0000-0000-000000000001', name: 'Oil on Canvas', slug: 'oil-on-canvas', description: 'Luminous layers of fine oil paint on heavy Belgian linen canvas.' },
    { id: 'c1000000-0000-0000-0000-000000000002', name: 'Acrylic & Mixed Media', slug: 'acrylic-mixed-media', description: 'Dynamic textured acrylics with gold leaf and archival pigments.' },
    { id: 'c1000000-0000-0000-0000-000000000003', name: 'Abstract Impressions', slug: 'abstract-impressions', description: 'Emotional color landscapes exploring light, silence, and resonance.' },
    { id: 'c1000000-0000-0000-0000-000000000004', name: 'Botanical & Earth', slug: 'botanical-earth', description: 'Organically textured works inspired by floral movement and natural form.' },
    { id: 'b1000000-0000-0000-0000-000000000001', parentId: 'c1000000-0000-0000-0000-000000000001', name: 'Impasto & 24K Gold Leaf', slug: 'impasto-gold-leaf', description: 'Heavy textured oil paintings with 24K gold leaf.' },
    { id: 'b1000000-0000-0000-0000-000000000002', parentId: 'c1000000-0000-0000-0000-000000000001', name: 'Coastal & Seascapes', slug: 'coastal-seascapes', description: 'Muted indigo and alabaster morning landscapes.' },
    { id: 'b1000000-0000-0000-0000-000000000003', parentId: 'c1000000-0000-0000-0000-000000000002', name: 'Marble Dust Mixed Media', slug: 'marble-dust-mixed-media', description: 'Tactile marble dust texture with bronze metallic pigments.' },
  ];
}

function saveLocalCategories(categories: Category[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    }
  } catch (e) { }
}

export const artworkService = {
  // Get Categories & Subcategories
  getCategories(): Category[] {
    return getLocalCategories();
  },

  // Save Category / Subcategory
  async saveCategoryAsync(categoryData: Partial<Category>): Promise<Category> {
    const categories = getLocalCategories();
    const slug = categoryData.slug || categoryData.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingIdx = categories.findIndex(c => c.id === categoryData.id || c.slug === slug);
    const isUUID = categoryData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryData.id);
    const id = isUUID ? categoryData.id! : 'c' + Date.now().toString(16).padStart(31, '0').slice(0, 31);

    const fullCat: Category = {
      id,
      name: categoryData.name!,
      slug,
      description: categoryData.description || '',
      parentId: categoryData.parentId || null,
    };

    if (existingIdx >= 0) {
      categories[existingIdx] = fullCat;
    } else {
      categories.push(fullCat);
    }
    saveLocalCategories(categories);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').upsert({
          id: fullCat.id,
          parent_id: fullCat.parentId || null,
          name: fullCat.name,
          slug: fullCat.slug,
          description: fullCat.description,
        });
      } catch (err) {
        console.error('Supabase Category Upsert Error:', err);
      }
    }
    return fullCat;
  },

  async deleteCategoryAsync(id: string): Promise<void> {
    let categories = getLocalCategories();
    categories = categories.filter(c => c.id !== id && c.parentId !== id);
    saveLocalCategories(categories);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase Category Delete Error:', err);
      }
    }
  },

  // Get Artworks with Filters and Pagination
  getArtworks(options: ArtworkFilterOptions = {}) {
    let artworks = getLocalArtworks();

    // Filter by Category
    if (options.categorySlug && options.categorySlug !== 'all') {
      artworks = artworks.filter(a => a.categorySlug === options.categorySlug);
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
        a.medium.toLowerCase().includes(q)
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
    return artworks
      .filter(a => a.id !== currentId && a.categorySlug === categorySlug)
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
    const existingIndex = artworks.findIndex(a => a.id === newArtworkData.id);

    const isUUID = newArtworkData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newArtworkData.id);
    const artworkId = isUUID ? newArtworkData.id! : 'a' + Date.now().toString(16).padStart(31, '0').slice(0, 31);

    // Compute unique base slug
    const rawSlug = (newArtworkData.slug || newArtworkData.title || 'painting')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'painting';

    let slug = rawSlug;
    let counter = 1;
    while (artworks.some(a => a.slug === slug && a.id !== artworkId)) {
      counter++;
      slug = `${rawSlug}-${counter}`;
    }

    const fullArtwork: Artwork = {
      id: artworkId,
      title: newArtworkData.title!,
      slug,
      description: newArtworkData.description || '',
      price: newArtworkData.price || 0,
      currency: 'INR',
      medium: newArtworkData.medium || 'Oil on Canvas',
      width: newArtworkData.width || 36,
      height: newArtworkData.height || 48,
      depth: newArtworkData.depth || 1.5,
      year: newArtworkData.year || new Date().getFullYear(),
      categoryId: newArtworkData.categoryId || 'c1000000-0000-0000-0000-000000000001',
      categoryName: newArtworkData.categoryName || 'Oil on Canvas',
      categorySlug: newArtworkData.categorySlug || 'oil-on-canvas',
      subCategoryId: newArtworkData.subCategoryId || null,
      subCategoryName: newArtworkData.subCategoryName || undefined,
      subCategorySlug: newArtworkData.subCategorySlug || undefined,
      status: newArtworkData.status || 'available',
      featured: newArtworkData.featured || false,
      signed: true,
      certificateAvailable: true,
      frameType: newArtworkData.frameType || 'Unframed Gallery Paper',
      frameIncluded: newArtworkData.frameIncluded || false,
      images: newArtworkData.images || [
        {
          id: `img-${Date.now()}`,
          storagePath: '/hero-koi.jpg',
          imageType: 'primary',
          altText: newArtworkData.title || 'Artwork Front View',
          sortOrder: 1,
        }
      ],
      createdAt: newArtworkData.createdAt || new Date().toISOString(),
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

  // Supabase Async Upsert helper
  async syncArtworkToSupabase(artwork: Artwork) {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      let activeSlug = artwork.slug;

      const buildUpsertPayload = (slugValue: string) => ({
        id: artwork.id,
        title: artwork.title,
        slug: slugValue,
        description: artwork.description,
        price: artwork.price,
        currency: artwork.currency,
        medium: artwork.medium,
        width: artwork.width,
        height: artwork.height,
        depth: artwork.depth,
        year: artwork.year,
        category_id: artwork.categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artwork.categoryId) ? artwork.categoryId : null,
        sub_category_id: artwork.subCategoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artwork.subCategoryId) ? artwork.subCategoryId : null,
        status: artwork.status,
        featured: artwork.featured,
        signed: artwork.signed,
        certificate_available: artwork.certificateAvailable,
        frame_type: artwork.frameType,
        frame_included: artwork.frameIncluded,
        created_at: artwork.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      let { error: artworkError } = await supabase
        .from('artworks')
        .upsert(buildUpsertPayload(activeSlug));

      // Handle duplicate slug unique constraint violation automatically
      if (artworkError && artworkError.message.includes('artworks_slug_key')) {
        console.warn('Slug collision on Supabase, appending timestamp suffix and retrying...');
        activeSlug = `${artwork.slug}-${Date.now().toString(36).slice(-4)}`;
        const retryRes = await supabase
          .from('artworks')
          .upsert(buildUpsertPayload(activeSlug));
        artworkError = retryRes.error;
      }

      if (artworkError) {
        console.error('Error inserting artwork to Supabase:', artworkError.message);
        return;
      }

      // Populate artwork_categories junction table safely
      try {
        if (artwork.categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artwork.categoryId)) {
          await supabase.from('artwork_categories').upsert({
            artwork_id: artwork.id,
            category_id: artwork.categoryId,
          });
        }
        if (artwork.subCategoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(artwork.subCategoryId)) {
          await supabase.from('artwork_categories').upsert({
            artwork_id: artwork.id,
            category_id: artwork.subCategoryId,
          });
        }
      } catch (junctionErr) {
        console.warn('artwork_categories junction sync notice (check RLS policy if needed):', junctionErr);
      }

      if (artwork.images && artwork.images.length > 0) {
        // Delete existing images for this artwork to prevent duplicates upon update
        await supabase.from('artwork_images').delete().eq('artwork_id', artwork.id);

        for (let idx = 0; idx < artwork.images.length; idx++) {
          const img = artwork.images[idx];
          const isUUID = img.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(img.id);

          // Deterministic UUID for images based on artwork ID and image index
          const imgUUID = isUUID
            ? img.id
            : `f0000000-0000-0000-0000-${artwork.id.slice(-10)}${String(idx + 1).padStart(2, '0')}`;

          await supabase.from('artwork_images').upsert({
            id: imgUUID,
            artwork_id: artwork.id,
            storage_path: img.storagePath,
            image_type: img.imageType || 'primary',
            alt_text: img.altText || artwork.title,
            sort_order: img.sortOrder || (idx + 1),
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Unexpected Supabase insertion exception:', err);
    }
  },

  // Async Save Artwork method for explicit await
  async saveArtworkAsync(newArtworkData: Partial<Artwork>): Promise<Artwork> {
    const artwork = this.saveArtwork(newArtworkData);
    if (isSupabaseConfigured && supabase) {
      await this.syncArtworkToSupabase(artwork);
    }
    return artwork;
  },

  // Admin: Update Status (e.g. mark sold / available)
  updateArtworkStatus(id: string, status: Artwork['status']) {
    const artworks = getLocalArtworks();
    const artwork = artworks.find(a => a.id === id);
    if (artwork) {
      artwork.status = status;
      artwork.updatedAt = new Date().toISOString();
      saveLocalArtworks(artworks);

      if (isSupabaseConfigured && supabase) {
        supabase
          .from('artworks')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating artwork status in Supabase:', error.message);
          });
      }
    }
    return artwork;
  },

  // Admin: Delete Artwork
  deleteArtwork(id: string) {
    let artworks = getLocalArtworks();
    artworks = artworks.filter(a => a.id !== id);
    saveLocalArtworks(artworks);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from('artworks')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting artwork from Supabase:', error.message);
        });
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
