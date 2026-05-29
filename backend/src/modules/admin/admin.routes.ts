import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { uploadImage, uploadGameFile } from '../../config/multer';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/sales', adminController.getSalesData);
router.get('/users', adminController.getAllUsers);
router.get('/games', adminController.getAllGames);
router.post('/games', uploadImage.single('image'), adminController.createGame);
router.put('/games/:id', uploadImage.single('image'), adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);
router.post('/games/:id/upload', uploadGameFile.single('file'), adminController.uploadGameFile);

export default router;
