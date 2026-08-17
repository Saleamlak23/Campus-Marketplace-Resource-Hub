import { Router } from 'express';
import {
  createListingHandler,
  getListingsHandler,
  getListingByIdHandler,
  updateListingHandler,
  deleteListingHandler,
} from './listings.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

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