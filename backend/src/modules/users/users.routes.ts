import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { scopeByUniversity } from '../../middleware/universityScoping';

const router = Router();
const controller = new UsersController();

router.get('/me', authenticate, scopeByUniversity, controller.getMe.bind(controller));
router.patch('/me', authenticate, scopeByUniversity, controller.updateMe.bind(controller));

export default router;