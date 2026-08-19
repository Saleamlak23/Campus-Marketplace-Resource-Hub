import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  createReviewHandler,
  getMyReviewsHandler,
  getUserReviewsHandler,
} from './reviews.controller';

const router = Router();

router.get('/user/:userId', getUserReviewsHandler);
router.get('/my-reviews', authenticate, getMyReviewsHandler);
router.post('/', authenticate, createReviewHandler);

export default router;
