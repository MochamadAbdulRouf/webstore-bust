import { Router } from 'express';
import * as cartController from './cart.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.delete('/', cartController.clearCart);
router.delete('/:gameId', cartController.removeFromCart);

export default router;
