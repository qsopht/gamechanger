import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as PlanModel from '../models/SubscriptionPlan';

export async function getAllPlans(req: AuthRequest, res: Response): Promise<void> {
  try {
    const plans = await PlanModel.getAllPlans();
    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
}

export async function getPlanById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const plan = await PlanModel.getPlanById(id);

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
}

export async function createPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, price, billingCycle, description, features, stripePriceId } = req.body;

    if (!name || price === undefined || price === null || !billingCycle) {
      res.status(400).json({ error: 'Name, price, and billingCycle are required' });
      return;
    }

    const plan = await PlanModel.createPlan(
      name,
      price,
      billingCycle,
      description,
      features,
      stripePriceId
    );

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
}

export async function updatePlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await PlanModel.updatePlan(id, updates);
    res.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
}

export async function deletePlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await PlanModel.deletePlan(id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
}
