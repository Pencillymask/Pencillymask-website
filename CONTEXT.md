# Context --- Artist Portfolio & Art Store

## Project

This project is a premium artist portfolio and ecommerce website for an
independent artist who owns approximately 200 unique original paintings.

The visual direction is inspired by the RedArt photography/artist
portfolio website:

https://redart.wpenginepowered.com/

The goal is to capture the visual language and browsing
experience---large artwork presentation, elegant gallery layouts, subtle
animation, portfolio storytelling, and artwork detail views---without
copying proprietary source code, assets, branding, or content.

## Business Context

The artist owns the original physical paintings and wants to sell them
online.

Every artwork is unique. Normally:

-   One artwork = one physical inventory unit.
-   A sold artwork must not be purchasable again.
-   Sold artwork should remain visible in the portfolio as part of the
    artist's history.
-   Available artwork should be clearly marked.
-   Each artwork can have several images:
    -   primary/front
    -   angled
    -   detail
    -   room mockup
    -   wide-angle room mockup
    -   back/frame view

The site must work both as an artist portfolio and a real online art
store.

## Primary Users

### Public visitor

Can:

-   Browse artwork.
-   Filter/search collections.
-   View individual artwork pages.
-   View artwork in room settings.
-   Read the artist story.
-   View exhibitions.
-   Read journal posts.
-   Contact the artist.
-   Enquire through WhatsApp.
-   Purchase available artwork.
-   Checkout as a guest.

### Artist/Admin

Can:

-   Manage artwork.
-   Upload and reorder images.
-   Manage collections/categories.
-   Mark artwork available, reserved, sold, archived.
-   Manage orders.
-   Manage customers/enquiries.
-   Manage exhibitions.
-   Manage journal posts.
-   Manage site settings.
-   Bulk import artwork through CSV.
-   View dashboard statistics.

## Technical Context

Recommended stack:

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   React Router
-   Framer Motion
-   TanStack Query
-   React Hook Form
-   Zod
-   Supabase PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Supabase Row Level Security
-   Razorpay for Indian payments
-   Resend or equivalent transactional email provider
-   Vercel deployment

## Design Context

The design should feel:

-   premium
-   artistic
-   minimal
-   editorial
-   gallery-like
-   warm
-   modern
-   conversion-oriented

Recommended visual direction:

-   warm off-white background
-   near-black typography
-   restrained bronze/gold accent
-   elegant serif headings
-   clean sans-serif body text
-   large artwork photography
-   generous whitespace
-   subtle transitions
-   minimal UI chrome

The artwork, not the interface, must remain the visual focus.

## Important Product Decision

Do not force customer account creation before checkout.

Preferred flow:

Artwork → Buy Now → Guest Checkout → Payment → Order Confirmation

Optional account creation can be offered afterward.

## Performance Context

There may eventually be 200+ artworks, each with multiple
high-resolution images.

Do not load all original images at once.

Use:

-   thumbnails
-   optimized WebP/AVIF variants
-   lazy loading
-   pagination/cursor pagination
-   CDN-backed storage
-   full-resolution image only when needed

## Security Context

The application will handle:

-   customer information
-   addresses
-   orders
-   payment identifiers
-   admin operations

Therefore:

-   Never expose Supabase service-role keys.
-   Never expose Razorpay secrets.
-   Never trust client-supplied prices.
-   Verify payments server-side.
-   Use payment webhooks.
-   Enable RLS.
-   Protect admin routes.
-   Restrict storage uploads.
-   Validate and sanitize input.
-   Rate-limit sensitive operations.
-   Maintain audit logs for important admin actions.

## Source-of-Truth Principle

The database is the source of truth for:

-   artwork availability
-   artwork price
-   order state
-   payment state
-   inventory state

The frontend must not be trusted to determine these values.
