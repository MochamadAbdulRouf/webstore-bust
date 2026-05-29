import { Response } from 'express';
import * as adminService from './admin.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const createGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await adminService.createGame(req.body, req.file);
    sendCreated(res, game, 'Game created successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const updateGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const game = await adminService.updateGame(req.params.id, req.body, req.file);
    sendSuccess(res, game, 'Game updated successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const deleteGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await adminService.deleteGame(req.params.id);
    sendSuccess(res, null, 'Game deleted successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const uploadGameFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { sendError(res, 'No file uploaded', 400); return; }
    const game = await adminService.uploadGameFile(req.params.id, req.file);
    sendSuccess(res, game, 'Game file uploaded successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getSalesData = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await adminService.getSalesData();
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await adminService.getAllUsers();
    sendSuccess(res, users);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getAllGames = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const games = await adminService.getAllGames();
    sendSuccess(res, games);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
