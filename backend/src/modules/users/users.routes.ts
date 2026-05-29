import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadImage } from '../../config/multer';

const router = Router();

router.use(authenticate);
router.get('/profile', usersController.getProfile);
router.put('/profile', uploadImage.single('avatar'), usersController.updateProfile);
router.put('/password', usersController.changePasswordValidation, usersController.changePassword);
router.post('/balance', usersController.addBalance);
router.get('/wishlist', usersController.getWishlist);
router.post('/wishlist', usersController.toggleWishlist);

export default router;
