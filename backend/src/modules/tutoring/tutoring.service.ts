import { BookingStatus, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ensureConversation } from '../chat/chat.service';

const tutorSelect = {
  id: true,
  subjects: true,
  hourlyRate: true,
  availability: true,
  bio: true,
  isVerified: true,
  user: { select: { id: true, name: true, email: true, avatarUrl: true, department: true } },
} satisfies Prisma.TutorProfileSelect;

const bookingInclude = {
  student: { select: { id: true, name: true, email: true, avatarUrl: true } },
  tutor: { select: { id: true, name: true, email: true, avatarUrl: true } },
} satisfies Prisma.BookingInclude;

export async function listTutors(universityId: string, subject?: string) {
  return prisma.tutorProfile.findMany({
    where: { universityId, ...(subject ? { subjects: { has: subject } } : {}) },
    select: tutorSelect,
    orderBy: { createdAt: 'desc' },
  });
}

export async function upsertTutorProfile(userId: string, universityId: string, data: {
  subjects: string[]; hourlyRate: number; availability?: string; bio?: string;
}) {
  return prisma.tutorProfile.upsert({
    where: { userId },
    create: { ...data, userId, universityId },
    update: data,
    select: tutorSelect,
  });
}

export async function createBooking(studentId: string, universityId: string, data: {
  tutorId: string; subject: string; scheduledAt: Date; notes?: string;
}) {
  if (studentId === data.tutorId) throw new AppError('You cannot book yourself', 400);
  const tutor = await prisma.tutorProfile.findFirst({
    where: { userId: data.tutorId, universityId },
    select: { userId: true },
  });
  if (!tutor) throw new AppError('Tutor not found at your university', 404);

  return prisma.booking.create({
    data: { ...data, studentId, universityId },
    include: bookingInclude,
  });
}

export async function listBookings(userId: string, universityId: string) {
  return prisma.booking.findMany({
    where: { universityId, OR: [{ studentId: userId }, { tutorId: userId }] },
    include: bookingInclude,
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function updateBookingStatus(userId: string, universityId: string, bookingId: string, status: BookingStatus) {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, universityId } });
  if (!booking) throw new AppError('Booking not found', 404);

  const isTutor = booking.tutorId === userId;
  const isStudent = booking.studentId === userId;
  if (!isTutor && !isStudent) throw new AppError('You are not a participant in this booking', 403);
  if ((status === 'ACCEPTED' || status === 'DECLINED' || status === 'COMPLETED') && !isTutor) {
    throw new AppError('Only the tutor can set this booking status', 403);
  }
  if (status === 'CANCELLED' && !isStudent) throw new AppError('Only the student can cancel this booking', 403);
  if (booking.status !== 'PENDING' && status !== 'COMPLETED') {
    throw new AppError('Only pending bookings can be changed', 409);
  }
  if (status === 'COMPLETED' && booking.status !== 'ACCEPTED') {
    throw new AppError('Only accepted bookings can be completed', 409);
  }
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: bookingInclude,
  });

  if (status === 'ACCEPTED') {
    await ensureConversation(booking.tutorId, universityId, booking.studentId);
  }

  return updatedBooking;
}
