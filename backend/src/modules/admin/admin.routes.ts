import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { isAdmin } from '../../middleware/authorize';
import { deleteListingHandler } from './admin.controller';

const router = Router();

router.delete('/listings/:id', authenticate, isAdmin, deleteListingHandler);

export default router;
