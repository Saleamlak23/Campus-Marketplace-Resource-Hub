import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { createBookingHandler, getBookingsHandler, getTutorsHandler, updateBookingHandler, upsertTutorProfileHandler } from './tutoring.controller';

const router = Router();
router.use(authenticate);
router.get('/tutors', getTutorsHandler);
router.put('/tutors/me', upsertTutorProfileHandler);
router.get('/bookings', getBookingsHandler);
router.post('/bookings', createBookingHandler);
router.patch('/bookings/:id', updateBookingHandler);
export default router;
