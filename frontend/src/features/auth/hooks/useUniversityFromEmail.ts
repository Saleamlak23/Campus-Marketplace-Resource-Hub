import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { findMockUniversityByDomain, getMockUniversities } from '../../../lib/mock-handlers';
import { isMockModeEnabled } from '../../../lib/api-client';
import { fetchUniversities } from '../api';
import type { University } from '../../../types';

const EMAIL_DOMAIN_REGEX = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
const AAU_EMAIL_DOMAIN = 'aau.edu.et';
export const AAU_SIGNUP_RESTRICTION_MESSAGE =
  'Signups are currently restricted to Addis Ababa University students (@aau.edu.et).';

function extractEmailDomain(email: string): string | null {
  const match = email.trim().toLowerCase().match(EMAIL_DOMAIN_REGEX);
  return match?.[1] ?? null;
}

function findUniversityByDomain(
  universities: University[],
  domain: string,
): University | undefined {
  const normalized = domain.toLowerCase();
  return universities.find((uni) =>
    uni.allowedEmailDomains.some((allowed) => allowed.toLowerCase() === normalized),
  );
}

export function useUniversityFromEmail(email: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['universities'],
    queryFn: fetchUniversities,
    staleTime: 1000 * 60 * 30,
  });

  const domain = extractEmailDomain(email);

  const detectedUniversity = useMemo(() => {
    if (!domain) {
      return null;
    }

    if (isMockModeEnabled()) {
      return findMockUniversityByDomain(domain) ?? null;
    }

    if (!data?.universities) {
      return null;
    }

    return findUniversityByDomain(data.universities, domain) ?? null;
  }, [data?.universities, domain]);

  const supportedDomains = useMemo(() => {
    if (isMockModeEnabled()) {
      return getMockUniversities().flatMap((uni) => uni.allowedEmailDomains);
    }
    return data?.universities.flatMap((uni) => uni.allowedEmailDomains) ?? [];
  }, [data?.universities]);

  return {
    domain,
    detectedUniversity,
    supportedDomains,
    isLoadingUniversities: isLoading,
    isDomainSupported: domain ? detectedUniversity !== null : null,
  };
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) {
    return 'Email is required.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address.';
  }
  const domain = extractEmailDomain(value);
  if (domain !== AAU_EMAIL_DOMAIN) {
    return AAU_SIGNUP_RESTRICTION_MESSAGE;
  }
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) {
    return 'Password is required.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return undefined;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

function passwordIncludesName(password: string, name: string): boolean {
  const normalizedPassword = password.toLowerCase();
  const nameParts = name.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  return nameParts.some(
    (part) => part.length >= 3 && normalizedPassword.includes(part),
  );
}

export function getPasswordStrength(password: string, name = ''): PasswordStrength {
  if (password.length < 8 || passwordIncludesName(password, name)) {
    return 'weak';
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  if (hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter) {
    return 'strong';
  }

  return /[A-Za-z]/.test(password) && hasNumber ? 'medium' : 'weak';
}

export function validateRegistrationPassword(value: string, name: string): string | undefined {
  if (!value) {
    return 'Password is required.';
  }
  if (getPasswordStrength(value, name) === 'weak') {
    return passwordIncludesName(value, name)
      ? 'Choose a password that does not include your name.'
      : 'Choose a stronger password with at least 8 characters, letters, and numbers.';
  }
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) {
    return 'Full name is required.';
  }
  if (value.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  return undefined;
}
