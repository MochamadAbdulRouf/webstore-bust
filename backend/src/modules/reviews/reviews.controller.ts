import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as reviewsService from './reviews.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 chars'),
];

export const getReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await reviewsService.getReviews(req.params.gameId);
    sendSuccess(res, result);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { sendError(res, errors.array()[0].msg, 422); return; }

  try {
    const { rating, comment } = req.body;
    const review = await reviewsService.createReview(
      req.user!.userId,
      req.params.gameId,
      parseInt(rating),
      comment
    );
    sendCreated(res, review, 'Review submitted');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await reviewsService.deleteReview(req.params.id, req.user!.userId);
    sendSuccess(res, null, 'Review deleted');
  } catch (err) {
    sendError(res, (err as Error).message, 403);
  }
};
