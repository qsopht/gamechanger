import { Router } from 'express';
import * as observerController from '../controllers/observerController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/simulate', authMiddleware, observerController.simulateEvent);
router.get('/events', authMiddleware, observerController.getEvents);
router.delete('/events', authMiddleware, observerController.clearAllEvents);

export default router;
