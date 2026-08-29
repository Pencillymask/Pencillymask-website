-- Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'footer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance & Sorting Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON public.newsletter_subscribers(created_at DESC);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.newsletter_subscribers TO anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public subscribers to insert
DROP POLICY IF EXISTS "Allow public insert newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow public insert newsletter_subscribers" ON public.newsletter_subscribers
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow reading subscribers for authenticated/admin users
DROP POLICY IF EXISTS "Allow read newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Allow read newsletter_subscribers" ON public.newsletter_subscribers
    FOR SELECT TO anon, authenticated
    USING (true);
