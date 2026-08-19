import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createReportHandler, getMyReportsHandler } from './reports.controller';

const router = Router();

router.use(authenticate);

router.post('/', createReportHandler);
router.get('/my-reports', getMyReportsHandler);

export default router;
