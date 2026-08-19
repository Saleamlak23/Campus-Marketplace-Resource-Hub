import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import {
  chapaWebhookHandler,
  initiatePaymentHandler,
  getMyTransactionsHandler,
  getTransactionByIdHandler,
} from './payments.controller';

const router = Router();

router.post('/initiate', authenticate, initiatePaymentHandler);
router.post('/webhook', chapaWebhookHandler);
router.get('/history', authenticate, getMyTransactionsHandler);
router.get('/:id', authenticate, getTransactionByIdHandler);

export default router;
