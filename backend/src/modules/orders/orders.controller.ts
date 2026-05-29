import { Response } from 'express';
import * as ordersService from './orders.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await ordersService.checkout(req.user!.userId);
    sendCreated(res, order, 'Purchase successful! Games added to your library.');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await ordersService.getOrders(req.user!.userId);
    sendSuccess(res, orders);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await ordersService.getOrderById(req.params.id, req.user!.userId);
    sendSuccess(res, order);
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};
