import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/authenticate';
import { isAdmin } from '../../middleware/authorize';

const router = Router();
const controller = new AdminController();

router.get('/users', authenticate, isAdmin, controller.getUsers.bind(controller));
router.patch('/users/:userId/ban', authenticate, isAdmin, controller.banUser.bind(controller));
router.patch('/users/:userId/unban', authenticate, isAdmin, controller.unbanUser.bind(controller));
router.delete('/listings/:id', authenticate, isAdmin, controller.deleteListing.bind(controller));

export default router;