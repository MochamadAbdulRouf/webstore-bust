import { Response } from 'express';
import * as gamesService from './games.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await gamesService.getGames(req.query as Record<string, string>);
    sendSuccess(res, result.games, 'Games fetched', 200, result.meta);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getGameById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await gamesService.getGameById(req.params.id, req.user?.userId);
    sendSuccess(res, game);
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const getGameBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await gamesService.getGameBySlug(req.params.slug, req.user?.userId);
    sendSuccess(res, game);
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const getFeaturedGames = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const games = await gamesService.getFeaturedGames();
    sendSuccess(res, games);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await gamesService.getCategories();
    sendSuccess(res, categories);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
