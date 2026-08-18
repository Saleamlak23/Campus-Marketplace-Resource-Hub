import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createConversationHandler, createMessageHandler, getConversationHandler, getConversationsHandler } from './chat.controller.js';

const router = Router();
router.use(authenticate);
router.get('/conversations', getConversationsHandler);
router.post('/conversations', createConversationHandler);
router.get('/conversations/:id', getConversationHandler);
router.post('/conversations/:id/messages', createMessageHandler);
export default router;
