import { Router } from 'express';
import * as libraryController from './library.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', libraryController.getLibrary);
router.get('/:gameId/check', libraryController.checkOwnership);
router.get('/:gameId/download', libraryController.downloadGame);

export default router;
