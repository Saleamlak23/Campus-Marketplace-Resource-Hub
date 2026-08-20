import { apiClient, isMockModeEnabled } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';
import type { User } from '../../types';
export type BookingStatus = 'pending' | 'accepted' | 'declined';
export interface Tutor { id: string; name: string; department: string; subjects: string[]; hourlyRate: number; availability: string; bio?: string; avatar: string; universityId: string; userId?: string; }
export interface Booking { id: string; tutorId: string; tutorName: string; subject: string; scheduledAt: string; status: BookingStatus; direction: 'sent' | 'received'; universityId: string; }
export interface CreateBooking { tutorId: string; subject: string; scheduledAt: string; }
export interface CreateTutorProfile { subjects: string[]; hourlyRate: number; availability: string; bio: string; }
const universityId = 'uni-aau';
const tutors: Tutor[] = [
  { id: 't-1', name: 'Mekdes Ayele', department: 'Computer Science', subjects: ['Data Structures', 'Python'], hourlyRate: 120, availability: 'Mon–Thu evenings', avatar: 'MA', universityId },
  { id: 't-2', name: 'Yared Tadesse', department: 'Electrical Engineering', subjects: ['Calculus', 'Circuit Analysis'], hourlyRate: 100, availability: 'Weekends', avatar: 'YT', universityId },
  { id: 't-3', name: 'Sara Bekele', department: 'Software Engineering', subjects: ['Web Development', 'Java'], hourlyRate: 140, availability: 'Tue–Fri afternoons', avatar: 'SB', universityId },
];
let bookings: Booking[] = [{ id: 'b-1', tutorId: 't-2', tutorName: 'Yared Tadesse', subject: 'Calculus', scheduledAt: '2026-08-24T14:00', status: 'pending', direction: 'sent', universityId }];
export async function fetchTutors() { if (isMockModeEnabled()) return tutors.filter((t) => t.universityId === universityId); return apiClient<Tutor[]>('/api/tutors', { token: getAccessToken() }); }
export async function fetchBookings() { if (isMockModeEnabled()) return bookings.filter((b) => b.universityId === universityId); return apiClient<Booking[]>('/api/bookings', { token: getAccessToken() }); }
export async function createBooking(payload: CreateBooking) { if (isMockModeEnabled()) { const tutor = tutors.find((item) => item.id === payload.tutorId); if (!tutor) throw new Error('Tutor not found.'); const booking: Booking = { id: `b-${Date.now()}`, tutorId: tutor.id, tutorName: tutor.name, subject: payload.subject, scheduledAt: payload.scheduledAt, status: 'pending', direction: 'sent', universityId }; bookings = [booking, ...bookings]; return booking; } return apiClient<Booking>('/api/bookings', { method: 'POST', body: payload, token: getAccessToken() }); }
export async function updateBooking(id: string, status: BookingStatus) { if (isMockModeEnabled()) { bookings = bookings.map((booking) => booking.id === id ? { ...booking, status } : booking); return bookings.find((booking) => booking.id === id)!; } return apiClient<Booking>(`/api/bookings/${id}`, { method: 'PATCH', body: { status }, token: getAccessToken() }); }
export async function createTutorProfile(payload: CreateTutorProfile, user: User) { if (isMockModeEnabled()) { const tutor: Tutor = { id: `t-${Date.now()}`, userId: user.id, name: user.name, department: user.department ?? 'AAU Student', subjects: payload.subjects, hourlyRate: payload.hourlyRate, availability: payload.availability, bio: payload.bio, avatar: user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), universityId: user.universityId }; const existingIndex = tutors.findIndex((item) => item.userId === user.id); if (existingIndex >= 0) tutors[existingIndex] = tutor; else tutors.unshift(tutor); return tutor; } return apiClient<Tutor>('/api/tutors', { method: 'POST', body: payload, token: getAccessToken() }); }
