import { Request, Response, NextFunction } from 'express';
import { isCloudinaryConfigured, uploadImageData } from '../../lib/cloudinary';
import { AppError } from '../../middleware/errorHandler';

export async function uploadListingImageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { dataUrl } = req.body as { dataUrl?: unknown };
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      throw new AppError('A valid image is required.', 400);
    }

    if (!isCloudinaryConfigured()) {
      throw new AppError('Cloudinary is not configured.', 503);
    }

    const url = await uploadImageData(dataUrl);
    return res.status(201).json({ success: true, data: { url } });
  } catch (error) {
    return next(error);
  }
}
