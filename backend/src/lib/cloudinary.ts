import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export function isCloudinaryConfigured() {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret,
  );
}

export async function uploadImageData(dataUrl: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: 'campus-marketplace/listings',
    resource_type: 'image',
  });

  return result.secure_url;
}
