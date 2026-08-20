import { Router } from 'express';
import { UniversitiesController } from './universities.controller';

const router = Router();
const controller = new UniversitiesController();

// Publicly readable so students can select university / see domain requirements during signup
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getOne.bind(controller));

export default router;