-- ALTER TABLE MIGRATION QUERY FOR EXISTING SUPABASE DATABASE
-- Run this in your Supabase SQL Editor if you already created tables earlier

-- 1. Add parent_id column to categories table for subcategory hierarchy
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- 2. Add sub_category_id column to artworks table
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS sub_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_artworks_status ON public.artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON public.artworks(category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_sub_category ON public.artworks(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_artworks_slug ON public.artworks(slug);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork ON public.artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);

-- 4. Ensure Data API grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Update RLS policies to allow publishable key Data API access
DROP POLICY IF EXISTS "Public read available artworks" ON public.artworks;
DROP POLICY IF EXISTS "Admin full access artworks" ON public.artworks;
DROP POLICY IF EXISTS "Public read artwork images" ON public.artwork_images;
DROP POLICY IF EXISTS "Admin full access artwork_images" ON public.artwork_images;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin full access categories" ON public.categories;
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
DROP POLICY IF EXISTS "Public read exhibitions" ON public.exhibitions;
DROP POLICY IF EXISTS "Public read journal posts" ON public.journal_posts;
DROP POLICY IF EXISTS "Public create enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin full access enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;

CREATE POLICY "Allow public all artworks" ON public.artworks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all artwork_images" ON public.artwork_images FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all categories" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all collections" ON public.collections FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all order_items" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all addresses" ON public.addresses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all enquiries" ON public.enquiries FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all exhibitions" ON public.exhibitions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all journal_posts" ON public.journal_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
