import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { createReviewSchema } from './reviews.validation';
import * as reviewsService from './reviews.service';

export async function createReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const parsed = createReviewSchema.parse(req.body);

    const review = await reviewsService.createOrUpdateReview({
      reviewerId: req.user.userId,
      targetUserId: parsed.targetUserId,
      rating: parsed.rating,
      comment: parsed.comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

export async function getUserReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId || typeof userId !== 'string') {
      throw new AppError('Invalid user ID', 400);
    }

    const data = await reviewsService.getUserReviews(userId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getMyReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError('Not authenticated', 401);
    const reviews = await reviewsService.getMyGivenReviews(req.user.userId);
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
}
