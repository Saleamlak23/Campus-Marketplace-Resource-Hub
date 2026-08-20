import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export interface TutorUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  department: string | null;
}

export interface Tutor {
  id: string;
  subjects: string[];
  hourlyRate: number;
  availability: string | null;
  bio: string | null;
  isVerified: boolean;
  user: TutorUser;
  userId?: string;
  name?: string;
  department?: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  universityId: string;
  studentId: string;
  tutorId: string;
  subject: string;
  scheduledAt: string;
  notes: string | null;
  status: BookingStatus;
  student: { id: string; name: string; email: string; avatarUrl: string | null };
  tutor: { id: string; name: string; email: string; avatarUrl: string | null };
}

export interface CreateBookingPayload {
  tutorId: string;
  subject: string;
  scheduledAt: string;
  notes?: string;
}

export interface UpsertTutorProfilePayload {
  subjects: string[];
  hourlyRate: number;
  availability?: string;
  bio?: string;
}

function normalizeTutor(tutor: Tutor): Tutor {
  const name = tutor.user.name;
  return {
    ...tutor,
    userId: tutor.user.id,
    name,
    department: tutor.user.department ?? '',
    avatar: tutor.user.avatarUrl ?? name.slice(0, 2).toUpperCase(),
  };
}

export async function fetchTutors(subject?: string): Promise<Tutor[]> {
  const qs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const tutors = await apiClient<Tutor[]>(`/api/tutors${qs}`, { token: getAccessToken() });
  return tutors.map(normalizeTutor);
}

export async function upsertTutorProfile(payload: UpsertTutorProfilePayload): Promise<Tutor> {
  const tutor = await apiClient<Tutor>('/api/tutors/me', {
    method: 'PUT',
    body: payload,
    token: getAccessToken(),
  });
  return normalizeTutor(tutor);
}

/** @deprecated Use upsertTutorProfile */
export const createTutorProfile = upsertTutorProfile;

export async function fetchBookings(): Promise<Booking[]> {
  return apiClient<Booking[]>('/api/bookings', { token: getAccessToken() });
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return apiClient<Booking>('/api/bookings', {
    method: 'POST',
    body: payload,
    token: getAccessToken(),
  });
}

export async function updateBooking(id: string, status: BookingStatus): Promise<Booking> {
  return apiClient<Booking>(`/api/bookings/${id}`, {
    method: 'PATCH',
    body: { status },
    token: getAccessToken(),
  });
}
