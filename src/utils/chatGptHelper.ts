// Helper utility for ChatGPT Conversation Launch & Prompt Generation

export const DEFAULT_CHATGPT_CONVERSATION_URL = 'https://chatgpt.com/c/6a89b423-3c50-83ee-8acf-15d6c145dd73';
export const STORAGE_KEY_CHATGPT_URL = 'dhruvi_portfolio_chatgpt_url';

export interface ArtworkPromptInput {
  title?: string;
  medium?: string;
  width?: number;
  height?: number;
  year?: number;
  price?: number;
  categoryName?: string;
  subCategoryName?: string;
  description?: string;
  images?: { url: string; type: string }[];
}

/**
 * Retrieves the saved ChatGPT Conversation URL from localStorage or returns default
 */
export function getSavedChatGPTUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CHATGPT_URL);
    if (saved && saved.trim().length > 0) {
      return saved.trim();
    }
  } catch (e) {
    // Fallback if localStorage unavailable
  }
  return DEFAULT_CHATGPT_CONVERSATION_URL;
}

/**
 * Saves the ChatGPT Conversation URL to localStorage
 */
export function saveChatGPTUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHATGPT_URL, url.trim());
  } catch (e) {
    console.error('Failed to save ChatGPT URL:', e);
  }
}

/**
 * Determines the best interior room style based on painting dimensions.
 * Different sizes look best in different settings.
 */
function getRoomStyleForDimensions(width: number, height: number): {
  roomType: string;
  wallDescription: string;
  furnitureStyle: string;
  lightingNote: string;
  cameraNote: string;
} {
  const area = width * height;
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1.2;
  const isPortrait = aspectRatio < 0.8;
  const isTall = height >= 60;
  const isWide = width >= 60;

  // Very large paintings (area > 3000 sq inches, e.g. 48x72, 60x60)
  if (area > 3000) {
    return {
      roomType: 'a grand double-height gallery room with soaring ceilings',
      wallDescription: 'smooth matte white plaster walls with museum-grade gallery lighting rail',
      furnitureStyle: 'a minimal mid-century walnut bench centered below, wide-plank European oak floors, a large floor-standing bronze sculpture to one side',
      lightingNote: 'dramatic focused gallery spotlights highlighting the artwork from above, ambient glow reflecting off polished concrete floor',
      cameraNote: 'wide-angle shot from 12 feet back to show the full grandeur and scale of the painting in context',
    };
  }

  // Large paintings (area > 1800 sq inches, e.g. 36x48, 40x50)
  if (area > 1800) {
    if (isLandscape) {
      return {
        roomType: 'an open-plan luxury penthouse living area with floor-to-ceiling windows',
        wallDescription: 'warm ivory lime-washed walls with subtle plaster texture',
        furnitureStyle: 'a low-profile cream bouclé sectional sofa, a polished travertine coffee table, matte brass floor lamp, herringbone parquet floors',
        lightingNote: 'golden-hour afternoon light streaming through sheer linen curtains, warm ambient glow',
        cameraNote: 'shot from 10 feet back at eye level, emphasizing the horizontal sweep of the painting above the sofa',
      };
    }
    if (isPortrait || isTall) {
      return {
        roomType: 'a tall-ceilinged formal reading room with architectural millwork',
        wallDescription: 'deep charcoal matte walls with narrow white crown molding at the ceiling line',
        furnitureStyle: 'a tufted cognac leather wingback chair, a small round marble-topped side table with a linen-bound book, dark walnut built-in bookshelves flanking the wall',
        lightingNote: 'a warm brass picture light mounted above the painting casting soft directed illumination downward, ambient table lamp glow',
        cameraNote: 'shot from 8 feet back, slightly below eye level to emphasize the verticality and commanding presence of the tall painting',
      };
    }
    return {
      roomType: 'an elegant contemporary luxury living room',
      wallDescription: 'warm linen-textured clay walls in a soft putty tone',
      furnitureStyle: 'a sculptural oatmeal-toned sofa, a raw-edge live-edge walnut console, ceramic vase with dried botanicals, woven jute rug',
      lightingNote: 'soft directional daylight from a large window to the left, subtle recessed ceiling spots',
      cameraNote: 'shot from 9 feet back at comfortable eye level, painting centered as the clear focal point',
    };
  }

  // Medium paintings (area > 800 sq inches, e.g. 24x36, 30x30)
  if (area > 800) {
    if (isWide || isLandscape) {
      return {
        roomType: 'a sunlit modern dining room with a curated art-collector aesthetic',
        wallDescription: 'warm off-white plaster walls with a fine sandy texture',
        furnitureStyle: 'a sleek oval oak dining table set for two with linen napkins, ribbed glass pendant light, potted olive tree in a terracotta planter',
        lightingNote: 'bright natural morning light through tall windows, pendant light casting soft shadows on the table',
        cameraNote: 'shot from 8 feet back, the painting at eye level on the wall behind the dining setting',
      };
    }
    return {
      roomType: 'a sophisticated bedroom sitting alcove with designer furnishings',
      wallDescription: 'warm mushroom-toned limewash walls with soft matte finish',
      furnitureStyle: 'a velvet sage-green accent chair, a slim brass-and-marble side table, a cashmere throw draped on the chair, soft wool area rug',
      lightingNote: 'late afternoon golden light from a side window, warm ambient glow from a ceramic table lamp',
      cameraNote: 'shot from 7 feet back, painting at seated eye level, creating an intimate and personal viewing experience',
    };
  }

  // Small paintings (area <= 800 sq inches, e.g. 12x16, 16x20, 18x24)
  if (isLandscape) {
    return {
      roomType: 'an intimate designer entryway niche with curated gallery styling',
      wallDescription: 'warm terracotta-washed plaster walls with organic texture',
      furnitureStyle: 'a narrow floating oak shelf below the painting displaying a single ceramic bowl and a small potted succulent, polished concrete floor',
      lightingNote: 'a focused adjustable brass picture light above the painting, soft ambient glow from a nearby hallway',
      cameraNote: 'shot from 5 feet back, tightly framed to show the painting as a jewel-like focal point in the intimate space',
    };
  }

  return {
    roomType: 'a cozy luxury bathroom vanity wall or private study nook',
    wallDescription: 'pale sage green micro-cement walls with a soft chalky finish',
    furnitureStyle: 'a small floating walnut shelf with a hand-thrown ceramic vessel, a linen hand towel, or a stack of art monographs',
    lightingNote: 'soft diffused overhead light and a single warm wall sconce creating gentle shadows',
    cameraNote: 'shot from 4 feet back, intimate close framing that makes the small painting feel precious and intentional',
  };
}

/**
 * Picks a complementary interior color palette based on the artwork medium and category.
 */
function getColorPaletteNote(medium?: string, categoryName?: string): string {
  const m = (medium || '').toLowerCase();
  const c = (categoryName || '').toLowerCase();

  if (m.includes('gold') || m.includes('metallic') || m.includes('bronze')) {
    return 'Coordinate the interior palette with warm golds, antique brass, and cream tones to harmonize with the metallic elements in the artwork.';
  }
  if (m.includes('acrylic') && (c.includes('abstract') || c.includes('mixed'))) {
    return 'Use a restrained neutral interior palette (soft grays, warm whites, natural wood) so the vivid colors of the abstract painting pop as the dominant visual element.';
  }
  if (c.includes('botanical') || c.includes('earth') || c.includes('floral')) {
    return 'Incorporate earthy tones — terracotta, olive, warm sand, raw linen — in the surrounding decor to create an organic harmony with the botanical subject.';
  }
  if (c.includes('coastal') || c.includes('sea') || c.includes('ocean')) {
    return 'Use a cool coastal palette — soft driftwood grays, muted indigo, sandy beige, white linen — to complement the marine tones in the painting.';
  }
  if (m.includes('oil') && m.includes('canvas')) {
    return 'Use a classic gallery palette — warm ivory walls, rich wood tones, muted earth accents — to give the oil painting a timeless, museum-quality presentation.';
  }

  return 'Use a sophisticated neutral palette that complements rather than competes with the artwork\'s color story.';
}

/**
 * Formats a clean, structured prompt with artwork details, exact source image link,
 * and luxury interior visualization instructions.
 * Dynamically adapts room style, background, and aspect ratio based on painting size.
 */
export function formatArtworkPrompt(data: ArtworkPromptInput): string {
  const width = data.width || 36;
  const height = data.height || 48;

  // Get dynamic room style based on actual painting dimensions (applied ONLY to Images 5 & 6)
  const room = getRoomStyleForDimensions(width, height);
  const colorNote = getColorPaletteNote(data.medium, data.categoryName);

  // Extract primary artwork image URL
  const primaryImgUrl = data.images && data.images.length > 0 ? data.images[0].url : '';
  
  let imageRefHeader = '';
  if (primaryImgUrl) {
    imageRefHeader = `Artwork Image URL: ${primaryImgUrl}\n`;
  }

  const extraImages = data.images && data.images.length > 1 
    ? `\nAdditional Image Views:\n` + data.images.slice(1).map((img, i) => `${i + 2}. [${img.type.toUpperCase()}] ${img.url}`).join('\n')
    : '';

  // Determine output aspect ratio guidance based on painting orientation
  const aspectRatio = width / height;
  let outputSizeNote: string;
  if (aspectRatio > 1.4) {
    outputSizeNote = 'Generate images in landscape orientation (e.g. 16:9 or 3:2 ratio) to naturally frame wide proportions.';
  } else if (aspectRatio < 0.7) {
    outputSizeNote = 'Generate images in portrait orientation (e.g. 2:3 or 9:16 ratio) to frame tall proportions.';
  } else {
    outputSizeNote = 'Generate images in 4:3 or near-square ratio to frame standard painting proportions.';
  }

  return `/artworkimage

${imageRefHeader}Create professional photorealistic artwork photography and interior visualizations using the uploaded artwork as the exact source artwork.

PRESERVE THE ARTWORK EXACTLY IN ALL IMAGES:
- Do not repaint or reinterpret it.
- Do not change colors, composition, subjects, or proportions (${width} × ${height} inches).
- Do not alter the signature or invent/remove artwork details.
${data.title ? `Artwork Title: ${data.title}\n` : ''}${data.medium ? `Medium: ${data.medium}\n` : ''}${extraImages}

CRITICAL FORMATTING REQUIREMENT:
Do NOT generate a single image grid, collage, or multi-panel compilation. Generate each of the 6 images below as a SEPARATE, individual standalone photo one after another.

--- PAINTING FOCUS VIEWS (IMAGES 1 TO 4 — Clean Studio Wall Background) ---

1. FRONT VIEW: A clean, straight-on studio photo of the painting mounted flat on a plain neutral gallery wall. The painting fills most of the frame as the sole visual focal point.

2. ANGLED VIEW (LEFT): A studio photograph shot from a 30–45° angle from the left side. Show the canvas edge depth, subtle shadow behind the frame, and natural light reflecting across the impasto texture.

3. ANGLED VIEW (RIGHT): A studio photograph shot from a 30–45° angle from the right side. Emphasize the right canvas border, metallic or gold leaf highlights, and surface relief.

4. CLOSE-UP (DETAIL): A macro close-up shot focusing tightly on a section of the artwork surface. Show the rich brushwork, impasto texture, gold leaf, and fine physical details under soft gallery spotlights.

--- DYNAMIC INTERIOR VISUALIZATIONS (IMAGES 5 & 6 — Luxury Interior Environment) ---

DYNAMIC ROOM ENVIRONMENT (Only applicable to Images 5 & 6):
- Room Setting: ${room.roomType}
- Wall: ${room.wallDescription}
- Furniture & Decor: ${room.furnitureStyle}
- Lighting: ${room.lightingNote}
- Color Palette: ${colorNote}
- Proportions: Render painting at physically accurate ${width} × ${height} inch scale relative to room furniture.
- Aspect Ratio: ${outputSizeNote}

5. ON WALL (IN ROOM): A luxury interior visualization with the painting naturally mounted on the wall above room furniture (such as a sofa or console table) in the customized dynamic room environment described above.

6. WIDE ANGLE VIEW (HOW IT LOOKS IN THE ROOM): An architectural wide-angle interior photograph from 10–12 feet back capturing the complete living space corner-to-corner, showing how the painting anchors and elevates the entire room.

IMPORTANT: Output each of the 6 requested images as a separate, full-resolution individual photo file. Do not merge them into one picture.`.trim();
}

/**
 * Loads an image from URL or relative path directly as a clean PNG Blob
 * using fetch + createImageBitmap for maximum browser reliability.
 */
export async function loadImageAsPngBlob(imageUrl: string): Promise<Blob | null> {
  if (!imageUrl) return null;

  const absoluteUrl = imageUrl.startsWith('http')
    ? imageUrl
    : `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

  try {
    // 1. Fetch raw image blob directly
    const res = await fetch(absoluteUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const rawBlob = await res.blob();

    if (rawBlob.type === 'image/png') {
      return rawBlob;
    }

    // Convert JPEG/WebP blob to PNG blob using createImageBitmap
    const imageBitmap = await createImageBitmap(rawBlob);
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(imageBitmap, 0, 0);

    return await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  } catch (err) {
    console.warn('Fetch blob conversion failed, trying Image fallback:', err);
  }

  // Fallback if fetch fails
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = absoluteUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    return await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  } catch (e) {
    console.error('All image blob conversion attempts failed:', e);
    return null;
  }
}

/**
 * Copies the artwork image file directly to the system clipboard as an image/png ClipboardItem.
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;
  const pngBlob = await loadImageAsPngBlob(imageUrl);
  if (!pngBlob) {
    console.warn('Could not retrieve PNG blob for clipboard');
    return false;
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn('navigator.clipboard.write image failed:', err);
    return false;
  }
}

/**
 * Launches the ChatGPT Conversation tab.
 * Copies the actual artwork image file to clipboard, copies prompt text, and opens ChatGPT.
 */
export async function launchChatGPTConversation(
  promptText: string,
  imageUrl?: string,
  targetUrl?: string
): Promise<{ success: boolean; imageCopied: boolean; textCopied: boolean; urlOpened: string }> {
  const baseUrl = (targetUrl || getSavedChatGPTUrl()).trim();

  // Step 1: Copy actual image file blob to system clipboard
  let imageCopied = false;
  if (imageUrl) {
    imageCopied = await copyImageToClipboard(imageUrl);
  }

  // Step 2: Copy prompt text to clipboard if image write didn't occur or as backup
  let textCopied = false;
  try {
    await navigator.clipboard.writeText(promptText);
    textCopied = true;
  } catch (err) {
    console.warn('Text clipboard copy failed:', err);
  }

  // Step 3: Open ChatGPT URL
  window.open(baseUrl, '_blank', 'noopener,noreferrer');

  return { success: true, imageCopied, textCopied, urlOpened: baseUrl };
}
