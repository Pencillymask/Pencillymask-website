# Dhruvi's Artist Portfolio & Fine Art Store

A contemporary artist portfolio and e-commerce platform built for independent artist **Dhruvi**, presenting approximately 200+ unique 1-of-1 original paintings, high-resolution multi-angle galleries, interactive room scale visualizer, artist exhibition archives, studio journal, and direct WhatsApp / Collector inquiry workflows.

---

## 🎨 Visual & Technical Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router v6, Lucide Icons.
- **Form & Validation**: React Hook Form, Zod.
- **Data & Backend**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage).
- **Inquiry & Sales Communication**: Direct WhatsApp deep-linking (pre-populating artwork title, ID, price, dimensions, and custom collector messages) & Guest Collector Inquiry forms.
- **Payment Processing**: Currently **[ON HOLD]** per user specification.
- **Testing**: Vitest & React Testing Library.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites

- **Node.js** v18+ & **npm** v9+ installed.

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Generate 200+ Mock Artworks Dataset

Run the dataset generator to populate `src/data/mockArtworks.json` with 200 unique original paintings, curated fine art photography, dimensions, years, prices, and status variants:

```bash
npm run seed
```

### 4. Run Development Server

Launch the Vite local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Running Tests & Production Build

### Run Unit Tests
```bash
npm run test
```

### Type Checking & Production Build
```bash
npm run build
```

---

## 🗄️ Supabase Setup & Database Migrations

When you are ready to connect a live Supabase project:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_WHATSAPP_NUMBER=919876543210
   VITE_ARTIST_NAME=Dhruvi
   ```

3. Run SQL Migration & Seed in Supabase SQL Editor:
   - Execute [`supabase/migrations/20260822000000_initial_schema.sql`](file:///d:/art%20portfolio/Dhruvi%27s%20Portfolio/supabase/migrations/20260822000000_initial_schema.sql)
   - Execute [`supabase/seed.sql`](file:///d:/art%20portfolio/Dhruvi%27s%20Portfolio/supabase/seed.sql)

---

## 🔑 Admin Portal Access

Access the studio admin management portal at:
```
http://localhost:3000/admin
```

- **Artworks Management**: Create, edit, feature, update price, and change artwork status (Available, Reserved, Sold, Archived).
- **Bulk CSV Import**: Upload CSV spreadsheets with automated Zod validation, row error logs, and batch database execution.
- **Audit Logs**: View studio event history and security logs.

---

## 📋 Features Overview

- **Hero & Storytelling**: Full-screen fine art hero banner, artist statement, and curated highlights.
- **Filterable Gallery**: Multi-filter by category (Oil on Canvas, Acrylic, Abstract, Botanical), availability status (Available, Sold), price range, search query, sorting, and pagination for 200+ artworks.
- **Interactive Room Visualizer**: Scale preview paintings on customizable gallery wall colors (Warm Linen, Classic White, Dark Slate) with ambient spotlight toggles.
- **High-Res Lightbox**: Fullscreen zoom viewer with multi-angle thumbnails (Primary, Angled, Impasto Detail, Room setting).
- **Unique Inventory Rule**: Quantity 1 protection for unique originals. Sold paintings remain visible as part of the artist's historical provenance with a "SOLD" badge and disabled purchase options.
- **Direct WhatsApp Conversion**: 1-click WhatsApp deep-links pre-populating artwork reference ID, title, medium, dimensions, and price.

---

## 📜 License & Copyright

© {new Date().getFullYear()} Dhruvi Studio. All rights reserved.
