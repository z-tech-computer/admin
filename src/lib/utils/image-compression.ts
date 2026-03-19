import imageCompression from "browser-image-compression";

/**
 * Compresses an image file (PNG, JPEG, TIFF, etc.) and converts it to WebP.
 * Uses the browser's native Canvas WebP encoder (which uses cwebp internally).
 */
export async function compressImageToWebp(file: File): Promise<File> {
  const options = {
    maxSizeMB: .1, // Optional: Adjust max size if needed
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
  };

  const compressedBlob = await imageCompression(file, options);
  
  // Create a new File object with a .webp extension
  const originalName = file.name;
  const newName = originalName.replace(/\.[^/.]+$/, ".webp");
  
  return new File([compressedBlob], newName, {
    type: "image/webp",
  });
}


export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
