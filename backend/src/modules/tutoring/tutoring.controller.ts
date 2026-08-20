import { NextFunction, Request, Response } from 'express';
import * as tutoringService from './tutoring.service';
import { createBookingSchema, tutorProfileSchema, updateBookingSchema } from './tutoring.validation';
import { AppError } from '../../middleware/errorHandler';

function identity(req: Request) {
  if (!req.user) throw new AppError('Authenticated user missing', 401);
  return req.user;
}

function routeId(req: Request) {
  const { id } = req.params;
  if (typeof id !== 'string') throw new AppError('Invalid route identifier', 400);
  return id;
}

export async function getTutorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
    res.json({ success: true, data: await tutoringService.listTutors(user.universityId, subject) });
  } catch (error) { next(error); }
}

export async function upsertTutorProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const data = tutorProfileSchema.parse(req.body);
    res.status(201).json({ success: true, data: await tutoringService.upsertTutorProfile(user.userId, user.universityId, data) });
  } catch (error) { next(error); }
}

export async function createBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const data = createBookingSchema.parse(req.body);
    res.status(201).json({ success: true, data: await tutoringService.createBooking(user.userId, user.universityId, data) });
  } catch (error) { next(error); }
}

export async function getBookingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    res.json({ success: true, data: await tutoringService.listBookings(user.userId, user.universityId) });
  } catch (error) { next(error); }
}

export async function updateBookingHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = identity(req);
    const data = updateBookingSchema.parse(req.body);
    res.json({ success: true, data: await tutoringService.updateBookingStatus(user.userId, user.universityId, routeId(req), data.status) });
  } catch (error) { next(error); }
}
