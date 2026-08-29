# Requirements --- Artist Portfolio & Art Store

## 1. Objective

Build a production-ready artist portfolio and ecommerce platform for
approximately 200 unique original paintings.

The system must combine:

1.  Premium artist portfolio.
2.  Searchable/filterable artwork gallery.
3.  Individual artwork presentation.
4.  Room visualization.
5.  Ecommerce checkout.
6.  Admin content management.
7.  Secure payment processing.
8.  SEO and performance optimization.

## 2. Functional Requirements

### 2.1 Home

The homepage must contain:

-   Full-screen hero artwork.
-   Artist name.
-   Short artistic statement.
-   Explore Collection CTA.
-   Featured artwork section.
-   Collections section.
-   About artist preview.
-   Available artwork preview.
-   Exhibition preview.
-   Journal preview.
-   Optional newsletter.
-   Footer.

### 2.2 Collection

The collection page must support:

-   All artwork.
-   Category filtering.
-   Availability filtering.
-   Price filtering.
-   Size filtering.
-   Medium filtering.
-   Year filtering.
-   Search.
-   Sorting.
-   Pagination/load-more.
-   Responsive artwork grid.

Artwork cards must show:

-   image
-   title
-   medium
-   price where appropriate
-   availability

### 2.3 Artwork Detail

Each artwork must have its own SEO-friendly URL.

Example:

`/artwork/koi-harmony`

The page must support:

-   primary image
-   angled image
-   detail image
-   room image
-   wide-angle image
-   back/frame image
-   fullscreen lightbox
-   zoom
-   keyboard navigation
-   mobile swipe
-   artwork title
-   description
-   medium
-   dimensions
-   year
-   frame information
-   signature information
-   certificate information
-   price
-   availability
-   Buy Now
-   Add to Cart
-   WhatsApp enquiry
-   related artworks

### 2.4 Available Art

Show only artwork that is currently purchasable.

Provide:

-   filters
-   search
-   sorting
-   availability indicator

### 2.5 Sold Art

Sold artwork must:

-   remain visible in the portfolio
-   show SOLD status
-   not be purchasable
-   not be addable to cart
-   not be included in available-art results

### 2.6 About

Include:

-   artist portrait
-   artist biography
-   artistic philosophy
-   creative journey
-   mediums
-   achievements
-   exhibitions
-   optional statistics

### 2.7 Exhibitions

Support:

-   upcoming exhibitions
-   previous exhibitions
-   title
-   description
-   venue
-   city
-   start date
-   end date
-   cover image
-   gallery images
-   published/unpublished state

### 2.8 Journal

Support:

-   article list
-   article detail
-   categories/tags if needed
-   draft/published state
-   cover image
-   SEO metadata

### 2.9 Contact

Support:

-   name
-   email
-   phone
-   subject
-   message

Submissions must be stored securely and visible in admin.

Include WhatsApp and social links.

## 3. Ecommerce Requirements

### 3.1 Cart

Cart must:

-   add available artwork
-   remove artwork
-   show price
-   show subtotal
-   prevent sold artwork from being purchased
-   revalidate availability before checkout

### 3.2 Guest Checkout

Account creation must not be mandatory.

Collect:

-   name
-   email
-   phone
-   address
-   city
-   state
-   postal code
-   country

### 3.3 Payment

Use Razorpay.

Flow:

1.  Client requests checkout.
2.  Server retrieves artwork and price from database.
3.  Server validates availability.
4.  Server reserves unique artwork.
5.  Server creates Razorpay order.
6.  Client opens Razorpay Checkout.
7.  Server verifies payment signature.
8.  Razorpay webhook confirms payment.
9.  Database transaction marks artwork sold.
10. Order confirmation is generated.

Never trust client-supplied price or payment status.

### 3.4 Unique Inventory

Artwork status:

-   draft
-   available
-   reserved
-   sold
-   archived

Reservation must expire automatically after a configurable period if
payment does not complete.

Prevent race conditions where two customers attempt to buy the same
unique artwork.

## 4. Admin Requirements

Admin route:

`/admin`

Admin authentication is mandatory.

Dashboard must show:

-   total artworks
-   available artworks
-   reserved artworks
-   sold artworks
-   total orders
-   revenue
-   pending orders
-   recent enquiries
-   recent orders

### Artwork Management

Admin can:

-   create artwork
-   edit artwork
-   archive artwork
-   delete artwork where safe
-   mark sold
-   mark available
-   reserve/release
-   feature/unfeature
-   change price
-   change category
-   upload images
-   reorder images
-   edit SEO data

### Bulk Import

Support CSV import.

Minimum columns:

-   artwork ID
-   title
-   price
-   medium
-   width
-   height
-   year
-   category
-   status
-   description

Import must validate rows and provide an error report.

### Category Management

Admin can:

-   create
-   edit
-   reorder
-   archive

categories.

### Exhibition Management

Admin can create/update/publish/unpublish exhibitions.

### Journal Management

Admin can:

-   create drafts
-   edit drafts
-   publish
-   unpublish
-   delete/archive posts

### Order Management

Admin can:

-   view orders
-   view customer information required for fulfillment
-   view payment state
-   update order status
-   add courier
-   add tracking number
-   mark shipped
-   mark delivered
-   initiate refund workflow

### Enquiry Management

Statuses:

-   new
-   contacted
-   converted
-   closed

### Audit Log

Record important admin actions such as:

-   price changes
-   artwork status changes
-   artwork deletion/archive
-   order status changes
-   admin login/security events where appropriate

## 5. Database Requirements

Required tables:

-   profiles
-   artworks
-   artwork_images
-   categories
-   collections
-   artwork_categories
-   orders
-   order_items
-   payments
-   customers
-   addresses
-   enquiries
-   exhibitions
-   exhibition_artworks
-   journal_posts
-   newsletter_subscribers
-   site_settings
-   audit_logs

Artwork fields should include:

-   id
-   artist_id
-   title
-   slug
-   description
-   price
-   currency
-   medium
-   width
-   height
-   depth
-   year
-   category_id
-   status
-   featured
-   signed
-   certificate_available
-   frame_type
-   frame_included
-   created_at
-   updated_at

Artwork image fields:

-   id
-   artwork_id
-   storage_path
-   image_type
-   alt_text
-   sort_order
-   created_at

## 6. Security Requirements

### Authentication

Use Supabase Auth.

Roles:

-   admin
-   customer

Do not allow public admin registration.

### Authorization

Enable PostgreSQL RLS on all exposed tables.

Public users may only read published public content.

Customers may only access their own customer/order information.

Admins may manage authorized content.

### Storage

Buckets:

-   artworks
-   artist
-   exhibitions
-   journal
-   certificates

Public optimized artwork images may be publicly readable if desired.

Certificates and private customer/order documents should be private.

Admin-only upload/update/delete policies must be enforced.

### Secrets

Never commit:

-   service role keys
-   payment secrets
-   email provider secrets

Use environment variables.

### Input Validation

Validate:

-   emails
-   phone numbers
-   prices
-   IDs
-   dimensions
-   text length
-   uploaded file type
-   uploaded file size

Use Zod.

### XSS

Sanitize rich text and user-generated content.

### Rate Limiting

Protect:

-   authentication
-   contact forms
-   newsletter
-   checkout creation
-   payment creation
-   admin endpoints

### Payment Security

Payment signatures must be verified server-side.

Use webhooks.

Never mark artwork sold solely from frontend payment callbacks.

## 7. SEO Requirements

Each artwork needs:

-   unique title
-   meta description
-   canonical URL
-   OpenGraph metadata
-   structured data where appropriate
-   optimized image alt text

Generate:

-   sitemap.xml
-   robots.txt

Use semantic HTML.

## 8. Performance Requirements

Implement:

-   image optimization
-   WebP/AVIF
-   responsive images
-   lazy loading
-   pagination/cursor pagination
-   caching
-   optimized database queries
-   code splitting where useful

Avoid loading all artwork images at initial page load.

## 9. Accessibility

Implement:

-   semantic HTML
-   keyboard navigation
-   focus management
-   alt text
-   accessible labels
-   adequate color contrast
-   reduced-motion support
-   accessible lightbox

## 10. Responsive Requirements

Desktop:

-   4-column gallery where appropriate

Tablet:

-   3-column gallery

Mobile:

-   2-column gallery

Artwork detail:

-   desktop two-column layout
-   mobile stacked layout

Navigation must convert to mobile menu.

## 11. Design Requirements

Style:

-   luxury
-   minimal
-   editorial
-   gallery-like
-   warm
-   modern

Use:

-   warm off-white background
-   black/dark typography
-   restrained bronze/gold accent
-   serif headings
-   sans-serif body
-   large imagery
-   generous whitespace

Animations should be subtle.

## 12. Testing Requirements

Add tests for:

-   artwork filtering
-   artwork status
-   cart behavior
-   checkout validation
-   unique inventory protection
-   payment verification
-   admin authorization
-   RLS behavior
-   CSV import validation
-   critical UI components

## 13. Deployment Requirements

Frontend:

-   Vercel

Backend/data:

-   Supabase

Required production configuration:

-   environment variables
-   custom domain
-   database migrations
-   storage policies
-   RLS
-   payment webhooks
-   email configuration
-   sitemap
-   analytics

## 14. Definition of Done

The application is complete only when:

-   all public pages work
-   artwork gallery works with 200+ records
-   artwork details work
-   room images work
-   sold artwork cannot be purchased
-   cart works
-   guest checkout works
-   Razorpay payment flow works
-   webhook works
-   double-selling is prevented
-   admin panel works
-   CSV import works
-   image management works
-   RLS is configured
-   storage policies are configured
-   secrets are protected
-   SEO works
-   mobile UI works
-   accessibility is addressed
-   production deployment works
-   README contains setup and deployment instructions
