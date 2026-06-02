import { Router } from 'express';
import * as planController from '../controllers/planController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, planController.getAllPlans);
router.get('/:id', authMiddleware, planController.getPlanById);
router.post('/', authMiddleware, planController.createPlan);
router.put('/:id', authMiddleware, planController.updatePlan);
router.delete('/:id', authMiddleware, planController.deletePlan);

export default router;
