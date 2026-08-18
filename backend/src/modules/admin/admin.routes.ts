import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { isAdmin, isSuperAdmin } from '../../middleware/authorize';

const router = Router();
const controller = new AdminController();

// User management
router.get('/users', authenticate, isAdmin, controller.getUsers.bind(controller));
router.patch('/users/:userId/ban', authenticate, isAdmin, controller.banUser.bind(controller));
router.patch('/users/:userId/unban', authenticate, isAdmin, controller.unbanUser.bind(controller));

// Listing management
router.delete('/listings/:id', authenticate, isAdmin, controller.deleteListing.bind(controller));

// University management (super admin only)
router.get('/universities', authenticate, isSuperAdmin, controller.getUniversitiesStats.bind(controller));
router.post('/universities', authenticate, isSuperAdmin, controller.createUniversity.bind(controller));
router.patch('/universities/:id', authenticate, isSuperAdmin, controller.updateUniversity.bind(controller));

export default router;