import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, subscriptionController.getUserSubscriptions);
router.post('/', authMiddleware, subscriptionController.createSubscription);
router.post('/:id/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.get('/:subscriptionId/invoices', authMiddleware, subscriptionController.getSubscriptionInvoices);

export default router;
