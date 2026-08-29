# Skill --- Artist Portfolio & Art Store Development

## Purpose

This document defines how an AI coding agent should implement and
maintain the Artist Portfolio & Art Store project.

The agent must behave like a senior full-stack engineer, product
designer, security engineer, and QA engineer.

## Core Principle

Build a production-ready application, not a visual prototype.

Do not stop after creating attractive pages.

Every feature must be connected to the real data model, validated,
secured, and tested.

## Technology Rules

Use:

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   React Router
-   Framer Motion
-   TanStack Query
-   React Hook Form
-   Zod
-   Supabase
-   Razorpay
-   Resend or equivalent email provider
-   Vercel

Avoid introducing additional frameworks unless there is a clear
technical reason.

Prefer small, composable components.

## Design Rules

The website should feel like a premium contemporary art gallery.

Prioritize:

1.  Artwork.
2.  Typography.
3.  Whitespace.
4.  Navigation clarity.
5.  Subtle motion.
6.  Conversion.

Do not make the UI visually louder than the paintings.

Do not use excessive gradients, glassmorphism, excessive rounded cards,
or unnecessary animations.

Use animation to support navigation and artwork discovery.

## RedArt Inspiration Rule

Use the RedArt website only as visual/interaction inspiration:

https://redart.wpenginepowered.com/

Do not copy:

-   source code
-   proprietary assets
-   branding
-   copyrighted artwork
-   exact text
-   theme files

Recreate the high-level experience with original implementation and the
artist's own content.

## Architecture Rules

Separate:

-   UI components
-   pages
-   hooks
-   services
-   database access
-   validation schemas
-   types
-   utilities

Do not put database logic directly inside large page components.

Use service functions such as:

-   artworkService
-   orderService
-   paymentService
-   exhibitionService
-   journalService
-   storageService

## TypeScript Rules

Use strict TypeScript.

Avoid:

`any`

unless there is a documented reason.

Create domain types for:

-   Artwork
-   ArtworkImage
-   Category
-   Collection
-   Order
-   OrderItem
-   Payment
-   Customer
-   Exhibition
-   JournalPost
-   Enquiry

## Database Rules

The database is the source of truth.

Never assume:

-   price
-   availability
-   payment status
-   ownership
-   order status

from client state.

Before purchase:

1.  Retrieve artwork from database.
2.  Check status.
3.  Check reservation.
4.  Read server-side price.
5.  Create reservation/order.
6.  Create payment order.

## Unique Artwork Rule

Every original artwork normally has quantity 1.

Never implement a naive:

`if available then purchase`

flow without server-side protection.

Use an atomic database transaction or equivalent mechanism.

Possible state:

``` text
available
reserved
sold
```

Reservation must have an expiry.

## Payment Rules

Never put Razorpay secret keys in frontend code.

Never accept a client-provided amount as authoritative.

Correct flow:

``` text
Browser
  ↓
Server
  ↓
Database validation
  ↓
Razorpay order
  ↓
Browser checkout
  ↓
Server signature verification
  ↓
Webhook
  ↓
Database transaction
```

The webhook should be idempotent.

Repeated webhook delivery must not create duplicate orders or duplicate
fulfillment actions.

## Supabase Rules

Use Supabase Auth for authentication.

Use RLS for authorization.

Never disable RLS merely to make a query work.

If an RLS policy blocks an operation, fix the policy intentionally.

Do not use the service-role key from the browser.

Use server-side privileged operations only where necessary.

## Storage Rules

Store image paths rather than unnecessarily copying image binaries into
database rows.

Use predictable structure:

``` text
artworks/{artwork-id}/primary.webp
artworks/{artwork-id}/angled.webp
artworks/{artwork-id}/detail.webp
artworks/{artwork-id}/room.webp
artworks/{artwork-id}/wide-angle.webp
artworks/{artwork-id}/back.webp
```

Generate optimized variants where possible.

## Image Rules

Every artwork should have:

-   primary image
-   optional angled image
-   optional detail image
-   optional room image
-   optional wide-angle image
-   optional back image

Every image requires meaningful alt text.

Use lazy loading for gallery images.

Use full resolution only when appropriate.

## Admin Rules

Admin functionality must not rely on hiding buttons.

Authorization must be enforced server-side/database-side.

A malicious user must not be able to call an admin operation directly.

Every important admin mutation should be logged.

## Form Rules

Use React Hook Form + Zod.

Validate both:

-   client-side
-   server-side

Never trust client-side validation alone.

Display useful validation errors.

## Error Handling

Do not expose:

-   stack traces
-   SQL errors
-   secret information
-   internal identifiers unnecessarily

Provide user-friendly errors.

Log detailed technical errors securely.

## Loading States

Every asynchronous page/component must have appropriate:

-   loading state
-   empty state
-   error state

Avoid blank screens.

## Gallery Rules

The collection must remain fast with 200+ artworks.

Use:

-   pagination
-   lazy loading
-   image thumbnails
-   caching
-   optimized queries

Do not fetch unnecessary columns.

Do not load every high-resolution image on page load.

## Artwork Detail Rules

Artwork detail pages should prioritize the image.

Desktop:

``` text
Gallery | Information
```

Mobile:

``` text
Gallery
Information
Purchase
```

Include:

-   title
-   price
-   availability
-   medium
-   dimensions
-   year
-   description
-   room views
-   certificate
-   signature
-   purchase CTA
-   WhatsApp CTA

## Sold Artwork Rules

A sold artwork:

-   remains visible in portfolio
-   shows SOLD
-   cannot be added to cart
-   cannot start checkout
-   cannot create a new reservation

## Admin Bulk Import

CSV imports must:

1.  Validate headers.
2.  Validate every row.
3.  Detect duplicate IDs.
4.  Detect invalid categories.
5.  Detect invalid prices.
6.  Detect invalid dimensions.
7.  Report row-level errors.
8.  Only commit valid data according to the chosen import mode.

Never partially corrupt the database silently.

## SEO Rules

Use unique metadata for each artwork.

Avoid duplicate title/description metadata.

Generate canonical URLs.

Use structured data only when it accurately represents the page.

Do not fabricate reviews, ratings, stock, or artist credentials.

## Accessibility Rules

All interactive elements must be keyboard accessible.

Images require alt text.

Do not use color alone to communicate availability.

Lightbox must support keyboard controls and focus management.

Respect `prefers-reduced-motion`.

## Security Checklist

Before production verify:

-   RLS enabled.
-   Admin policies tested.
-   Storage policies tested.
-   Service role key not exposed.
-   Razorpay secret not exposed.
-   Webhook signature verified.
-   Input validation active.
-   Rich text sanitized.
-   Upload restrictions active.
-   Rate limits active.
-   Admin route protected.
-   Sensitive data not logged.
-   CORS configured appropriately.
-   HTTPS used in production.

## Testing Strategy

Use unit tests for:

-   utilities
-   validation
-   pricing logic
-   status transitions

Use integration tests for:

-   artwork retrieval
-   checkout creation
-   payment verification
-   order transitions
-   admin authorization

Use end-to-end tests for:

-   browsing
-   artwork detail
-   guest checkout
-   admin artwork creation
-   sold artwork behavior

## Development Workflow

Implement in this order:

1.  Inspect repository.
2.  Create architecture.
3.  Install dependencies.
4.  Create design system.
5.  Build layout.
6.  Build public pages.
7.  Build database schema.
8.  Configure RLS.
9.  Configure Storage.
10. Connect real artwork data.
11. Build admin.
12. Build checkout.
13. Integrate Razorpay.
14. Add email.
15. Add SEO.
16. Add analytics.
17. Test.
18. Optimize.
19. Document.
20. Deploy.

Do not build fake UI indefinitely.

After the initial visual implementation, connect real Supabase data.

## Environment Variables

Create `.env.example`.

Never commit `.env`.

Expected categories:

``` text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
```

Only variables that genuinely need to be client-visible may use the
`VITE_` prefix.

Server secrets must remain server-side.

## Git Rules

Use meaningful commits.

Examples:

``` text
feat: add artwork gallery
feat: add supabase artwork schema
feat: add admin artwork management
feat: add razorpay checkout
fix: prevent duplicate artwork reservation
security: tighten artwork storage policies
```

Never commit:

-   secrets
-   customer private data
-   production database dumps
-   unnecessary large original image files

## Documentation Requirements

The repository must contain:

-   README.md
-   CONTEXT.md
-   REQUIREMENTS.md
-   SKILL.md
-   .env.example

README must include:

-   prerequisites
-   installation
-   environment configuration
-   Supabase setup
-   migrations
-   seed data
-   local development
-   admin setup
-   Razorpay setup
-   deployment
-   troubleshooting

## AI Agent Behavior

When implementing this project:

-   Read CONTEXT.md first.
-   Read REQUIREMENTS.md second.
-   Read SKILL.md third.
-   Inspect existing code before modifying it.
-   Do not unnecessarily rewrite working code.
-   Follow the existing architecture once established.
-   Ask only when a decision is genuinely impossible to infer.
-   Otherwise choose a sensible production-ready default and document
    it.
-   Never silently remove required functionality.
-   Never weaken security to bypass an error.
-   Never hard-code business data that belongs in the database.
-   Never fabricate payment success.
-   Never fabricate artwork availability.

## Definition of Done

Before saying implementation is complete, verify every requirement in
REQUIREMENTS.md.

Run:

-   type checking
-   linting
-   unit tests
-   integration tests
-   production build

Then verify:

-   public pages
-   admin pages
-   database policies
-   storage policies
-   checkout
-   payment verification
-   webhook behavior
-   mobile layout
-   SEO
-   performance

Only then declare the project complete.
