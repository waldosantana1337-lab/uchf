/**
 * Optimizes an Unsplash image URL using their built-in CDN parameters.
 * @param url The original Unsplash URL
 * @param width The target width in pixels
 * @param quality Image quality (1-100)
 * @returns An optimized URL
 */
export const getOptimizedUnsplashUrl = (url: string, width: number = 800, quality: number = 80): string => {
  if (!url || !url.includes('unsplash.com')) return url;
  
  // Remove existing optimization parameters to avoid conflicts
  const baseUrl = url.split('?')[0];
  
  // auto=format: serves WebP/AVIF if supported by browser
  // q: compression quality
  // w: specific width to avoid sending oversized original files
  // fit=crop: ensures aspect ratio consistency
  return `${baseUrl}?auto=format&fit=crop&q=${quality}&w=${width}`;
};

/**
 * Generates a srcset string for Unsplash images for responsive delivery.
 */
export const getUnsplashSrcSet = (url: string): string => {
  if (!url || !url.includes('unsplash.com')) return '';
  
  const widths = [400, 800, 1200, 1600];
  return widths
    .map(w => `${getOptimizedUnsplashUrl(url, w)} ${w}w`)
    .join(', ');
};

/**
 * Resizes and compresses an image File or DataURL to ensure safe payload size for AI vision models.
 */
export const resizeImageFile = (file: File, maxDimension: number = 1600, quality: number = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return reject(new Error("Empty image result"));
      }
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};
