import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as usersService from './users.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await usersService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.body;
    const avatarUrl = req.file ? `/uploads/images/${req.file.filename}` : undefined;
    const user = await usersService.updateProfile(req.user!.userId, { username, avatar: avatarUrl });
    sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { sendError(res, errors.array()[0].msg, 422); return; }

  try {
    await usersService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const addBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount) { sendError(res, 'Amount required', 400); return; }
    const result = await usersService.addBalance(req.user!.userId, parseFloat(amount));
    sendSuccess(res, result, `$${parseFloat(amount).toFixed(2)} added to your balance`);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wishlist = await usersService.getWishlist(req.user!.userId);
    sendSuccess(res, wishlist);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gameId } = req.body;
    if (!gameId) { sendError(res, 'gameId required', 400); return; }
    const result = await usersService.toggleWishlist(req.user!.userId, gameId);
    sendSuccess(res, result, result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
