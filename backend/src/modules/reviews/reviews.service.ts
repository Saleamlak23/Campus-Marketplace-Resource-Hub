import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export async function createOrUpdateReview(data: {
  reviewerId: string;
  targetUserId: string;
  rating: number;
  comment?: string;
}) {
  if (data.reviewerId === data.targetUserId) {
    throw new AppError('You cannot review yourself', 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: data.targetUserId },
    select: { id: true, name: true },
  });

  if (!targetUser) {
    throw new AppError('User to review was not found', 404);
  }

  return prisma.review.upsert({
    where: {
      reviewerId_targetUserId: {
        reviewerId: data.reviewerId,
        targetUserId: data.targetUserId,
      },
    },
    create: {
      reviewerId: data.reviewerId,
      targetUserId: data.targetUserId,
      rating: data.rating,
      comment: data.comment,
    },
    update: {
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}

export async function getUserReviews(targetUserId: string) {
  const [reviews, stats] = await Promise.all([
    prisma.review.findMany({
      where: { targetUserId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.aggregate({
      where: { targetUserId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    reviews,
    averageRating: stats._avg.rating ? Number(stats._avg.rating.toFixed(2)) : 0,
    totalReviews: stats._count.rating || 0,
  };
}

export async function getMyGivenReviews(reviewerId: string) {
  return prisma.review.findMany({
    where: { reviewerId },
    include: {
      targetUser: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
