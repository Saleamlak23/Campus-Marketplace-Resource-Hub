import type {
  ListingCategory,
  ListingCondition,
  ListingStatus,
} from '../../types';

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  TEXTBOOK: 'Textbook',
  PAST_EXAM: 'Past Exam Paper',
  EQUIPMENT: 'Equipment',
  OTHER: 'Other',
};

export const CATEGORY_OPTIONS = (
  Object.entries(CATEGORY_LABELS) as [ListingCategory, string][]
).map(([value, label]) => ({ value, label }));

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
};

export const CONDITION_OPTIONS = (
  Object.entries(CONDITION_LABELS) as [ListingCondition, string][]
).map(([value, label]) => ({ value, label }));

export const STATUS_LABELS: Record<ListingStatus, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  SOLD: 'Sold',
};

export const STATUS_BADGE_VARIANT: Record<
  ListingStatus,
  'success' | 'warning' | 'default'
> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  SOLD: 'default',
};

export const STATUS_OPTIONS = (
  Object.entries(STATUS_LABELS) as [ListingStatus, string][]
).map(([value, label]) => ({ value, label }));

// Kept in sync with the department list in features/auth/components/RegisterForm.tsx
// so listings and profiles use the same set of department names.
export const DEPARTMENT_OPTIONS = [
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Information Systems', label: 'Information Systems' },
  {
    value: 'Electrical & Computer Engineering',
    label: 'Electrical & Computer Engineering',
  },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Public Health', label: 'Public Health' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting & Finance', label: 'Accounting & Finance' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Law', label: 'Law' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Other', label: 'Other' },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(price);
}
