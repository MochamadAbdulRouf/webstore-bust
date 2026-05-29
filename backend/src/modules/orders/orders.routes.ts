import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/checkout', ordersController.checkout);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);

export default router;
