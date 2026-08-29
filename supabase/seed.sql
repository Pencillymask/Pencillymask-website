-- Seed Data for Dhruvi's Artist Portfolio & Art Store

-- Insert Categories
INSERT INTO public.categories (id, name, slug, description, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Oil on Canvas', 'oil-on-canvas', 'Luminous layers of fine oil paint on heavy Belgian linen canvas.', 1),
('c1000000-0000-0000-0000-000000000002', 'Acrylic & Mixed Media', 'acrylic-mixed-media', 'Dynamic textured acrylics with gold leaf and archival pigments.', 2),
('c1000000-0000-0000-0000-000000000003', 'Abstract Impressions', 'abstract-impressions', 'Emotional color landscapes exploring light, silence, and resonance.', 3),
('c1000000-0000-0000-0000-000000000004', 'Botanical & Earth', 'botanical-earth', 'Organically textured works inspired by floral movement and natural form.', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert Sample Artworks
INSERT INTO public.artworks (id, title, slug, description, price, currency, medium, width, height, depth, year, category_id, status, featured, signed, certificate_available, frame_type, frame_included) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'Whispers of Gold & Earth',
    'whispers-of-gold-and-earth',
    'An expansive oil painting layered with 24k gold leaf accents and raw umber texture. Inspired by autumn silence.',
    145000,
    'INR',
    'Oil & 24K Gold Leaf on Linen Canvas',
    48,
    60,
    1.5,
    2025,
    'c1000000-0000-0000-0000-000000000001',
    'available',
    true,
    true,
    true,
    'Floating Natural Oak Frame',
    true
),
(
    'a1000000-0000-0000-0000-000000000002',
    'Solitude at Dawn',
    'solitude-at-dawn',
    'A tranquil study of morning mist over coastal cliffs with soft indigo and alabaster tones.',
    98000,
    'INR',
    'Oil on Heavy Linen Canvas',
    36,
    48,
    1.5,
    2025,
    'c1000000-0000-0000-0000-000000000001',
    'available',
    true,
    true,
    true,
    'Unframed Stretched Canvas',
    false
),
(
    'a1000000-0000-0000-0000-000000000003',
    'Crimson Nocturne',
    'crimson-nocturne',
    'Bold textured impasto acrylics with warm bronze highlights creating deep visual resonance.',
    120000,
    'INR',
    'Acrylic & Marble Dust on Canvas',
    40,
    40,
    2.0,
    2024,
    'c1000000-0000-0000-0000-000000000002',
    'sold',
    true,
    true,
    true,
    'Black Satin Floater Frame',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Populate artwork_categories junction table
INSERT INTO public.artwork_categories (artwork_id, category_id) VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001'),
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002')
ON CONFLICT (artwork_id, category_id) DO NOTHING;

-- Insert Exhibitions
INSERT INTO public.exhibitions (id, title, slug, description, venue, city, start_date, end_date, cover_image, published) VALUES
(
    'e1000000-0000-0000-0000-000000000001',
    'Lumina: Reflections in Texture & Gold',
    'lumina-reflections-in-texture',
    'Solo exhibition exploring organic form, natural pigments, and light interplay.',
    'Jahangir Art Gallery',
    'Mumbai',
    '2026-11-10',
    '2026-11-20',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Insert Journal Posts (Using valid hex character f instead of non-hex j)
INSERT INTO public.journal_posts (id, title, slug, content, excerpt, cover_image, published) VALUES
(
    'f1000000-0000-0000-0000-000000000001',
    'Inside the Studio: The Alchemy of Gold Leaf',
    'inside-the-studio-the-alchemy-of-gold-leaf',
    'Working with 24K gold leaf requires patience, stillness, and breath control. In this journal entry, I share the delicate process of applying gold accents to oil impasto canvas...',
    'Exploring the delicate techniques behind integrating 24K gold leaf with heavy oil paint texture.',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
    true
)
ON CONFLICT (slug) DO NOTHING;
