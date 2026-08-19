import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { chapaWebhookHandler, initiatePaymentHandler } from './payments.controller';

const router = Router();
router.post('/initiate', authenticate, initiatePaymentHandler);
router.post('/webhook', chapaWebhookHandler);
export default router;
