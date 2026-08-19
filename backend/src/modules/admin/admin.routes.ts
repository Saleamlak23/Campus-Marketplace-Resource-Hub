import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { isAdmin, isSuperAdmin } from '../../middleware/authorize';
import {
  banUserHandler,
  deleteListingHandler,
  getReportsHandler,
  getUniversitiesHandler,
  getUsersHandler,
  unbanUserHandler,
  updateReportStatusHandler,
} from './admin.controller';

const router = Router();

// All admin routes require authentication and at least UNIVERSITY_ADMIN role
router.use(authenticate, isAdmin);

router.get('/users', getUsersHandler);
router.patch('/users/:userId/ban', banUserHandler);
router.patch('/users/:userId/unban', unbanUserHandler);
router.delete('/listings/:id', deleteListingHandler);
router.get('/reports', getReportsHandler);
router.patch('/reports/:id', updateReportStatusHandler);

// Super admin specific route
router.get('/universities', isSuperAdmin, getUniversitiesHandler);

export default router;
