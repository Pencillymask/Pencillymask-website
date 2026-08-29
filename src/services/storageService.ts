import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  type: string;
  source: 'supabase' | 'local_base64';
  error?: string;
}

/**
 * Compresses an image file client-side using HTMLCanvas to keep file size ultra-compact (~50KB-120KB)
 * and prevent browser LocalStorage QuotaExceededError.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1400,
  maxHeight: number = 1400,
  quality: number = 0.82
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    // If SVG, return as-is
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({ blob: file, dataUrl });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Calculate proportional dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to basic file reader if canvas context unavailable
        const reader = new FileReader();
        reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const targetFormat = 'image/jpeg';
      const dataUrl = canvas.toDataURL(targetFormat, quality);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve({ blob: file, dataUrl });
          }
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback
      const reader = new FileReader();
      reader.onload = () => resolve({ blob: file, dataUrl: reader.result as string });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image file to Supabase Storage bucket 'artworks',
 * or gracefully falls back to a compressed base64 Data URL if Supabase is unconfigured / offline / bucket missing.
 */
export async function uploadImageFile(
  file: File,
  bucketName: string = 'artworks'
): Promise<UploadResult> {
  // Validate that the file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error(`File "${file.name}" is not a valid image format.`);
  }

  // 1. Always compress image first to keep payload lightweight (< 150KB)
  let compressedBlob: Blob = file;
  let compressedDataUrl: string = '';
  try {
    const res = await compressImage(file, 1400, 1400, 0.82);
    compressedBlob = res.blob;
    compressedDataUrl = res.dataUrl;
  } catch (compErr) {
    console.warn('Image compression fallback:', compErr);
  }

  // 2. Attempt Supabase Storage Upload if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
      const filePath = `uploads/${Date.now()}_${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, compressedBlob, {
          contentType: compressedBlob.type || 'image/jpeg',
          cacheControl: '31536000',
          upsert: true,
        });

      if (!error && data) {
        // Retrieve public URL
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          return {
            url: publicUrlData.publicUrl,
            fileName: file.name,
            fileSize: compressedBlob.size,
            type: compressedBlob.type,
            source: 'supabase',
          };
        }
      } else {
        console.warn(
          `Supabase storage bucket "${bucketName}" not found or inaccessible (${error?.message}). Using compressed local Data URL fallback.`
        );
      }
    } catch (err) {
      console.warn('Exception during Supabase storage upload, using Data URL fallback:', err);
    }
  }

  // 3. Fallback to lightweight compressed Base64 Data URL
  return {
    url: compressedDataUrl || (await compressImage(file, 1000, 1000, 0.75)).dataUrl,
    fileName: file.name,
    fileSize: compressedBlob.size,
    type: compressedBlob.type,
    source: 'local_base64',
  };
}

/**
 * Uploads multiple image files concurrently
 */
export async function uploadMultipleImageFiles(
  files: FileList | File[],
  bucketName: string = 'artworks',
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const fileArray = Array.from(files);
  const results: UploadResult[] = [];
  let completed = 0;

  for (const file of fileArray) {
    try {
      const res = await uploadImageFile(file, bucketName);
      results.push(res);
    } catch (err: any) {
      console.error(`Failed uploading file ${file.name}:`, err);
      try {
        const { dataUrl, blob } = await compressImage(file, 1000, 1000, 0.75);
        results.push({
          url: dataUrl,
          fileName: file.name,
          fileSize: blob.size,
          type: blob.type,
          source: 'local_base64',
        });
      } catch (innerErr) {
        // Skip
      }
    }
    completed++;
    if (onProgress) {
      onProgress(completed, fileArray.length);
    }
  }

  return results;
}
