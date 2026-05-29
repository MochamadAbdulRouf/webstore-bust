import prisma from '../../config/database';

export const getReviews = async (gameId: string) => {
  const reviews = await prisma.review.findMany({
    where: { gameId },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  return { reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length };
};

export const createReview = async (
  userId: string,
  gameId: string,
  rating: number,
  comment: string
) => {
  // Check ownership
  const owned = await prisma.library.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (!owned) throw new Error('You must own the game to review it');

  // Check existing review
  const existing = await prisma.review.findUnique({
    where: { userId_gameId: { userId, gameId } },
  });
  if (existing) throw new Error('You have already reviewed this game');

  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');

  const review = await prisma.review.create({
    data: { userId, gameId, rating, comment },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  // Update game rating
  const allReviews = await prisma.review.findMany({ where: { gameId }, select: { rating: true } });
  const newAvg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

  await prisma.game.update({
    where: { id: gameId },
    data: { rating: Math.round(newAvg * 10) / 10, reviewCount: allReviews.length },
  });

  return review;
};

export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');
  if (review.userId !== userId) throw new Error('Unauthorized');

  await prisma.review.delete({ where: { id: reviewId } });

  // Update game rating
  const allReviews = await prisma.review.findMany({
    where: { gameId: review.gameId },
    select: { rating: true },
  });
  const newAvg = allReviews.length
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0;

  await prisma.game.update({
    where: { id: review.gameId },
    data: { rating: Math.round(newAvg * 10) / 10, reviewCount: allReviews.length },
  });
};
