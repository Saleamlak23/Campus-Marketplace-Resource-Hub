import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { uploadListingImageHandler } from './uploads.controller';

const router = Router();

router.use(authenticate);
router.post('/listing-image', uploadListingImageHandler);

export default router;
