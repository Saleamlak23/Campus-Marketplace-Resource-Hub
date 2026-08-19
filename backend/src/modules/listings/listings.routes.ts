import { Router } from 'express';
import {
  createListingHandler,
  getListingsHandler,
  getListingByIdHandler,
  updateListingHandler,
  deleteListingHandler,
} from './listings.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Apply auth middleware so req.user is populated on all endpoints
router.use(authenticate);

// API Contract Routes for /api/listings
router.get('/', getListingsHandler);
router.post('/', createListingHandler);
router.get('/:id', getListingByIdHandler);
router.patch('/:id', updateListingHandler);
router.delete('/:id', deleteListingHandler);

export default router;