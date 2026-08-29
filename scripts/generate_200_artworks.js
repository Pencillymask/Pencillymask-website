// Script to generate 200+ unique original artworks with curated fine art photography
import fs from 'fs';
import path from 'path';

const CATEGORIES = [
  { id: 'c1000000-0000-0000-0000-000000000001', name: 'Oil on Canvas', slug: 'oil-on-canvas' },
  { id: 'c1000000-0000-0000-0000-000000000002', name: 'Acrylic & Mixed Media', slug: 'acrylic-mixed-media' },
  { id: 'c1000000-0000-0000-0000-000000000003', name: 'Abstract Impressions', slug: 'abstract-impressions' },
  { id: 'c1000000-0000-0000-0000-000000000004', name: 'Botanical & Earth', slug: 'botanical-earth' },
];

const MEDIUMS = [
  'Oil & 24K Gold Leaf on Belgian Linen Canvas',
  'Oil on Stretched Heavy Linen Canvas',
  'Textured Impasto Acrylic & Gold Pigment',
  'Mixed Media & Marble Dust on Wood Panel',
  'Raw Earth Pigments & Acrylic on Canvas',
  'Oil & Sand Texture on Gallery Canvas'
];

const ART_IMAGES = [
  '/hero-koi.jpg'
];

const ROOM_MOCKUPS = [ 
  '/hero-koi.jpg'
];

const TITLES_PART_1 = ['Serenade', 'Resonance', 'Echoes', 'Whispers', 'Horizon', 'Symphony', 'Solitude', 'Sanctuary', 'Radiance', 'Lumina', 'Genesis', 'Nocturne', 'Vibrance', 'Silhouettes', 'Celestial', 'Aura'];
const TITLES_PART_2 = ['in Gold', 'of Dawn', 'of Silence', 'of Azure', 'at Dusk', 'in Crimson', 'of Earth', 'and Light', 'of Solitude', 'in Amber', 'of Harmony', 'in Emerald', 'of Eternity', 'in Velvet'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateArtworks(count = 200) {
  const artworks = [];
  for (let i = 1; i <= count; i++) {
    const title = `${getRandomItem(TITLES_PART_1)} ${getRandomItem(TITLES_PART_2)} No. ${i}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = getRandomItem(CATEGORIES);
    const primaryImg = ART_IMAGES[i % ART_IMAGES.length];
    const roomImg = ROOM_MOCKUPS[i % ROOM_MOCKUPS.length];
    
    // Status distribution: ~70% Available, ~25% Sold, ~5% Reserved
    const randStatus = Math.random();
    let status = 'available';
    if (randStatus > 0.95) status = 'reserved';
    else if (randStatus > 0.70) status = 'sold';

    const width = [24, 30, 36, 40, 48, 60][Math.floor(Math.random() * 6)];
    const height = [24, 36, 48, 60, 72][Math.floor(Math.random() * 5)];
    const price = (Math.floor(Math.random() * 300) + 45) * 1000; // INR 45,000 to 3,45,000

    artworks.push({
      id: `a2000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      title,
      slug,
      description: `Original fine art painting titled "${title}". Created with meticulous layering, rich textural impasto, and subtle metallic undertones. Unique 1-of-1 original work signed by artist Dhruvi.`,
      price,
      currency: 'INR',
      medium: getRandomItem(MEDIUMS),
      width,
      height,
      depth: 1.5,
      year: Math.random() > 0.4 ? 2025 : 2024,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      status,
      featured: i <= 8,
      signed: true,
      certificateAvailable: true,
      frameType: i % 2 === 0 ? 'Floating Natural Oak Frame' : 'Unframed Gallery Canvas',
      frameIncluded: i % 2 === 0,
      images: [
        { id: `img-${i}-1`, storagePath: primaryImg, imageType: 'primary', altText: `${title} - Front View`, sortOrder: 1 },
        { id: `img-${i}-2`, storagePath: primaryImg, imageType: 'angled', altText: `${title} - Angled Texture View`, sortOrder: 2 },
        { id: `img-${i}-3`, storagePath: primaryImg, imageType: 'detail', altText: `${title} - Impasto Detail View`, sortOrder: 3 },
        { id: `img-${i}-4`, storagePath: roomImg, imageType: 'room', altText: `${title} - Room Mockup Interior`, sortOrder: 4 }
      ],
      createdAt: new Date(Date.now() - i * 86400000).toISOString()
    });
  }
  return artworks;
}

const artworks = generateArtworks(200);
const outputPath = path.resolve(process.cwd(), 'src/data/mockArtworks.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(artworks, null, 2), 'utf-8');
console.log(`Successfully generated ${artworks.length} artworks at ${outputPath}`);
