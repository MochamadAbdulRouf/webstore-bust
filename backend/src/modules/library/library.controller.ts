import { Response } from 'express';
import * as libraryService from './library.service';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getLibrary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const library = await libraryService.getLibrary(req.user!.userId);
    sendSuccess(res, library);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const downloadGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filePath, fileName } = await libraryService.downloadGame(
      req.user!.userId,
      req.params.gameId
    );
    res.download(filePath, `${fileName}.zip`);
  } catch (err) {
    sendError(res, (err as Error).message, 403);
  }
};

export const checkOwnership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const owned = await libraryService.checkOwnership(req.user!.userId, req.params.gameId);
    sendSuccess(res, { owned });
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
