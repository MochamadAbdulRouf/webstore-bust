import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from './auth.service';
import { sendSuccess, sendError, sendCreated } from '../../utils/response';
import { AuthRequest } from '../../middleware/auth.middleware';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-20 chars (letters, numbers, underscores)'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, errors.array()[0].msg, 422);
    return;
  }

  try {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);
    sendCreated(res, result, 'Account created successfully');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, errors.array()[0].msg, 422);
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }
    const result = await authService.refreshTokens(refreshToken);
    sendSuccess(res, result, 'Tokens refreshed');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};
