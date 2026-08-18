import { Router } from 'express';
import { UniversitiesController } from './universities.controller';
import { authenticate } from '../../middleware/authenticate';
import { isSuperAdmin } from '../../middleware/authorize';

const router = Router();
const controller = new UniversitiesController();

router.get('/', authenticate, isSuperAdmin, controller.getAll.bind(controller));
router.get('/:id', authenticate, isSuperAdmin, controller.getOne.bind(controller));

export default router;