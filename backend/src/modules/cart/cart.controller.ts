import { Response } from 'express';
import * as cartService from './cart.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    sendSuccess(res, cart);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { gameId } = req.body;
    if (!gameId) { sendError(res, 'gameId is required', 400); return; }
    const cart = await cartService.addToCart(req.user!.userId, gameId);
    sendSuccess(res, cart, 'Added to cart');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await cartService.removeFromCart(req.user!.userId, req.params.gameId);
    sendSuccess(res, cart, 'Removed from cart');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await cartService.clearCart(req.user!.userId);
    sendSuccess(res, null, 'Cart cleared');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
