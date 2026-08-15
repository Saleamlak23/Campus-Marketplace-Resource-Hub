import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  UniversitiesResponse,
  User,
  UserProfileResponse,
  VerifyEmailRequest,
} from '../types';

const MOCK_UNIVERSITIES = [
  {
    id: 'uni-insa',
    name: 'Institute of Science and Technology (INSA)',
    allowedEmailDomains: ['insa.edu.et', 'student.insa.edu.et'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'uni-aau',
    name: 'Addis Ababa University',
    allowedEmailDomains: ['aau.edu.et', 'student.aau.edu.et'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'uni-demo',
    name: 'Demo University',
    allowedEmailDomains: ['university.edu', 'student.university.edu'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

interface MockUserRecord extends User {
  password: string;
}

const mockUsers: MockUserRecord[] = [
  {
    id: 'user-student-1',
    universityId: 'uni-insa',
    name: 'Demo Student',
    email: 'student@insa.edu.et',
    universityIdNumber: 'INSA/2024/001',
    department: 'Computer Science',
    year: 3,
    role: 'student',
    avatarUrl: null,
    bio: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    password: 'password123',
  },
  {
    id: 'user-admin-1',
    universityId: 'uni-insa',
    name: 'Demo Admin',
    email: 'admin@insa.edu.et',
    universityIdNumber: null,
    department: 'Administration',
    year: null,
    role: 'university_admin',
    avatarUrl: null,
    bio: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    password: 'password123',
  },
];

function createTokens(userId: string): { accessToken: string; refreshToken: string } {
  return {
    accessToken: `mock-access-${userId}`,
    refreshToken: `mock-refresh-${userId}`,
  };
}

function attachUniversity(user: User): User {
  const university = MOCK_UNIVERSITIES.find((u) => u.id === user.universityId);
  return university ? { ...user, university } : user;
}

function stripPassword(user: MockUserRecord): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return attachUniversity(safeUser);
}

function parseJsonBody<T>(body: BodyInit | null | undefined): T | null {
  if (!body || typeof body !== 'string') {
    return null;
  }
  return JSON.parse(body) as T;
}

function matchRoute(method: string, path: string, pattern: string, expectedMethod: string): boolean {
  return method === expectedMethod && path === pattern;
}

function findUniversityByEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return null;
  }
  return MOCK_UNIVERSITIES.find((uni) =>
    uni.allowedEmailDomains.some((allowed) => allowed.toLowerCase() === domain),
  );
}

export async function handleMockRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  await delay(350);

  if (matchRoute(method, path, '/api/universities', 'GET')) {
    return { universities: MOCK_UNIVERSITIES } as T;
  }

  if (matchRoute(method, path, '/api/auth/login', 'POST')) {
    const body = parseJsonBody<LoginRequest>(options.body);
    if (!body?.email || !body.password) {
      throw mockError(400, 'Email and password are required.');
    }
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === body.email.toLowerCase() && u.password === body.password,
    );
    if (!user) {
      throw mockError(401, 'Invalid email or password.');
    }
    const tokens = createTokens(user.id);
    return { ...tokens, user: stripPassword(user) } as T;
  }

  if (matchRoute(method, path, '/api/auth/register', 'POST')) {
    const body = parseJsonBody<RegisterRequest>(options.body);
    if (!body?.name || !body.email || !body.password) {
      throw mockError(400, 'Name, email, and password are required.');
    }
    const university = findUniversityByEmail(body.email);
    if (!university) {
      throw mockError(400, 'Email domain is not associated with a registered university.');
    }
    const existing = mockUsers.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      throw mockError(409, 'An account with this email already exists.');
    }
    const newUser: MockUserRecord = {
      id: `user-${Date.now()}`,
      universityId: university.id,
      name: body.name,
      email: body.email.toLowerCase(),
      universityIdNumber: body.universityIdNumber ?? null,
      department: body.department ?? null,
      year: body.year ?? null,
      role: 'student',
      avatarUrl: null,
      bio: null,
      createdAt: new Date().toISOString(),
      password: body.password,
    };
    mockUsers.push(newUser);
    const tokens = createTokens(newUser.id);
    return { ...tokens, user: stripPassword(newUser) } as T;
  }

  if (matchRoute(method, path, '/api/auth/refresh', 'POST')) {
    const body = parseJsonBody<RefreshRequest>(options.body);
    if (!body?.refreshToken?.startsWith('mock-refresh-')) {
      throw mockError(401, 'Invalid refresh token.');
    }
    const userId = body.refreshToken.replace('mock-refresh-', '');
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw mockError(401, 'Invalid refresh token.');
    }
    const tokens = createTokens(user.id);
    return { ...tokens, user: stripPassword(user) } as T;
  }

  if (matchRoute(method, path, '/api/auth/verify-email', 'POST')) {
    const body = parseJsonBody<VerifyEmailRequest>(options.body);
    if (!body?.token) {
      throw mockError(400, 'Verification token is required.');
    }
    return { message: 'Email verified successfully.' } as T;
  }

  if (matchRoute(method, path, '/api/users/me', 'GET')) {
    const userId = getUserIdFromAuthHeader(options.headers);
    const user = mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw mockError(401, 'Unauthorized.');
    }
    return { user: stripPassword(user) } as T;
  }

  throw mockError(404, `No mock handler for ${method} ${path}`);
}

export function getMockUniversities() {
  return MOCK_UNIVERSITIES;
}

export function findMockUniversityByDomain(domain: string) {
  const normalized = domain.toLowerCase();
  return MOCK_UNIVERSITIES.find((uni) =>
    uni.allowedEmailDomains.some((allowed) => allowed.toLowerCase() === normalized),
  );
}

class MockApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'MockApiError';
    this.status = status;
  }
}

function mockError(status: number, message: string): MockApiError {
  return new MockApiError(status, message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getUserIdFromAuthHeader(headers: HeadersInit | undefined): string | null {
  if (!headers) {
    return null;
  }
  const authHeader =
    headers instanceof Headers
      ? headers.get('Authorization')
      : Array.isArray(headers)
        ? headers.find(([key]) => key.toLowerCase() === 'authorization')?.[1]
        : headers.Authorization ?? headers.authorization;

  if (!authHeader?.startsWith('Bearer mock-access-')) {
    return null;
  }
  return authHeader.replace('Bearer mock-access-', '');
}

export type { AuthResponse, UserProfileResponse, UniversitiesResponse };
