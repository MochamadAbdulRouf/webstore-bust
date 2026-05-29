import { Router } from 'express';
import * as reviewsController from './reviews.controller';
import { authenticate } from '../../middleware/auth.middleware';

// Mounted at /api/games/:gameId/reviews (mergeParams enabled)
const router = Router({ mergeParams: true });

// Public: anyone can read reviews
router.get('/', reviewsController.getReviews);

// Protected: must be logged in to post or delete
router.post('/', authenticate, reviewsController.reviewValidation, reviewsController.createReview);
router.delete('/:id', authenticate, reviewsController.deleteReview);

export default router;
