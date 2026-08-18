import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { scopeByUniversity } from '../../middleware/universityScoping';

const router = Router();
const controller = new UsersController();

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, scopeByUniversity, controller.getMe.bind(controller));

// PATCH /api/users/me - Update current user profile
router.patch('/me', authenticate, scopeByUniversity, controller.updateMe.bind(controller));

export default router;