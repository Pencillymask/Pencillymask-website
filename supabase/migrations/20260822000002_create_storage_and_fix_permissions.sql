-- SUPABASE STORAGE & PERMISSIONS FIX MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard > SQL Editor) to fix:
-- 1. "Bucket not found" error by creating the public 'artworks' storage bucket
-- 2. Storage RLS policies to allow uploads & downloads
-- 3. 401 error on artwork_categories table by adding missing RLS policy

-- ============================================================================
-- 1. CREATE 'artworks' STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'artworks',
    'artworks',
    TRUE,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'];

-- ============================================================================
-- 2. STORAGE RLS POLICIES (Allow Public & Admin Upload / Select / Delete)
-- ============================================================================
DROP POLICY IF EXISTS "Public select artworks bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public insert artworks bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public update artworks bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public delete artworks bucket" ON storage.objects;

-- Allow public viewing of images in 'artworks' bucket
CREATE POLICY "Public select artworks bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'artworks');

-- Allow image uploads to 'artworks' bucket
CREATE POLICY "Public insert artworks bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'artworks');

-- Allow image updates (upsert) to 'artworks' bucket
CREATE POLICY "Public update artworks bucket"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'artworks')
WITH CHECK (bucket_id = 'artworks');

-- Allow image deletions in 'artworks' bucket
CREATE POLICY "Public delete artworks bucket"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'artworks');

-- ============================================================================
-- 3. FIX 401 ON public.artwork_categories TABLE
-- ============================================================================
ALTER TABLE IF EXISTS public.artwork_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all artwork_categories" ON public.artwork_categories;

CREATE POLICY "Allow public all artwork_categories"
ON public.artwork_categories FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Ensure full grants on junction table
GRANT ALL ON TABLE public.artwork_categories TO anon, authenticated, service_role;
