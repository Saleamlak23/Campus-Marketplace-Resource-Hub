/**
 * Client-side unsigned upload to Cloudinary for listing images.
 *
 * Requires VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET to be set
 * (see .env.example). Until real Cloudinary credentials are wired up in the
 * Integration Phase, this falls back to a local object URL so the Listings UI
 * remains fully usable against the mock API.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export class CloudinaryUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CloudinaryUploadError';
  }
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

interface CloudinaryUploadResponse {
  secure_url: string;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!res.ok) {
    throw new CloudinaryUploadError('Image upload failed. Please try again.');
  }

  const data = (await res.json()) as CloudinaryUploadResponse;
  return data.secure_url;
}

function readAsObjectUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    resolve(URL.createObjectURL(file));
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
 * Uploads a listing image and returns its hosted URL. Uses Cloudinary when
 * configured, otherwise a local preview URL so development/demo work
 * without real credentials.
 */
export async function uploadListingImage(file: File): Promise<string> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file);
  }
  return readAsObjectUrl(file);
}
