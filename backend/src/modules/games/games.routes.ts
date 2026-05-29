import { Router } from 'express';
import * as gamesController from './games.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import reviewsRouter from '../reviews/reviews.routes';

const router = Router();

router.get('/', optionalAuth, gamesController.getGames);
router.get('/featured', gamesController.getFeaturedGames);
router.get('/categories', gamesController.getCategories);
router.get('/slug/:slug', optionalAuth, gamesController.getGameBySlug);
router.get('/:id', optionalAuth, gamesController.getGameById);

// Reviews sub-router — GET is public, POST/DELETE require auth (handled inside reviews routes)
router.use('/:gameId/reviews', optionalAuth, reviewsRouter);

export default router;
