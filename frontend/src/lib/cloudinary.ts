/**
 * Uploads listing images through the backend Cloudinary integration. If that
 * service is unavailable, images are encoded as data URLs for PostgreSQL.
 */
import { apiClient } from './api-client';
import { getAccessToken } from '../store/authStore';

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new CloudinaryUploadError('Image could not be read.'));
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGE_SIZE_MB = 5;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: File): string | undefined {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or WEBP images are supported.';
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Images must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  return undefined;
}

/**
 * Uploads through backend Cloudinary first. If that fails, return a data URL
 * that the backend stores in PostgreSQL.
 */
export async function uploadListingImage(file: File): Promise<string> {
  const dataUrl = await readAsDataUrl(file);

  try {
    const result = await apiClient<{ url: string }>('/api/uploads/listing-image', {
      method: 'POST',
      body: { dataUrl },
      token: getAccessToken(),
    });
    return result.url;
  } catch {
    // PostgreSQL is the durable fallback when the external upload is unavailable.
    return dataUrl;
  }
}
