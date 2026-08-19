import type {
  AuthResponse,
  CreateListingRequest,
  Listing,
  ListingResponse,
  ListingsResponse,
  LoginRequest,
  RegisterRequest,
  RefreshRequest,
  UniversitiesResponse,
  UpdateListingRequest,
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
  {
    id: 'user-student-2',
    universityId: 'uni-insa',
    name: 'Bethel Alemu',
    email: 'bethel@insa.edu.et',
    universityIdNumber: 'INSA/2023/042',
    department: 'Electrical & Computer Engineering',
    year: 4,
    role: 'student',
    avatarUrl: null,
    bio: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    password: 'password123',
  },
  {
    id: 'user-student-aau-1',
    universityId: 'uni-aau',
    name: 'Selam Tesfaye',
    email: 'selam@aau.edu.et',
    universityIdNumber: 'AAU/2024/117',
    department: 'Business Administration',
    year: 2,
    role: 'student',
    avatarUrl: null,
    bio: null,
    createdAt: '2025-01-15T00:00:00.000Z',
    password: 'password123',
  },
];

type MockListingRecord = Omit<Listing, 'seller'>;

let mockListings: MockListingRecord[] = [
  {
    id: 'listing-1',
    universityId: 'uni-insa',
    sellerId: 'user-student-1',
    title: 'Introduction to Algorithms, 3rd Edition',
    description:
      'CLRS textbook, used for one semester of Data Structures & Algorithms. Minor highlighting in chapters 1-6, spine intact, no missing pages.',
    category: 'textbook',
    condition: 'good',
    price: 850,
    department: 'Computer Science',
    courseTag: 'CS301',
    status: 'available',
    images: [],
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'listing-2',
    universityId: 'uni-insa',
    sellerId: 'user-student-2',
    title: 'Digital Logic Design - Past Exam Papers (2022-2024)',
    description:
      'Compiled past exam papers and worked solutions for Digital Logic Design, three academic years. Great for exam prep.',
    category: 'past_exam',
    condition: 'new',
    price: 150,
    department: 'Electrical & Computer Engineering',
    courseTag: 'ECE210',
    status: 'available',
    images: [],
    createdAt: '2026-06-03T14:30:00.000Z',
    updatedAt: '2026-06-03T14:30:00.000Z',
  },
  {
    id: 'listing-3',
    universityId: 'uni-insa',
    sellerId: 'user-student-2',
    title: 'Scientific Calculator - Casio fx-991EX',
    description:
      'Barely used scientific calculator, comes with original case and manual. Perfect for engineering courses.',
    category: 'equipment',
    condition: 'like_new',
    price: 1200,
    department: null,
    courseTag: null,
    status: 'reserved',
    images: [],
    createdAt: '2026-05-20T11:15:00.000Z',
    updatedAt: '2026-06-05T08:00:00.000Z',
  },
  {
    id: 'listing-4',
    universityId: 'uni-insa',
    sellerId: 'user-student-1',
    title: 'Organic Chemistry Lab Manual',
    description:
      'Lab manual with all experiments completed and results filled in as reference. Sold as-is.',
    category: 'textbook',
    condition: 'fair',
    price: 300,
    department: 'Chemical Engineering',
    courseTag: 'CHEM220',
    status: 'sold',
    images: [],
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
  },
  {
    id: 'listing-5',
    universityId: 'uni-aau',
    sellerId: 'user-student-aau-1',
    title: 'Principles of Marketing, 8th Edition',
    description:
      'Clean copy, no writing inside. Used for one term of Principles of Marketing.',
    category: 'textbook',
    condition: 'good',
    price: 600,
    department: 'Business Administration',
    courseTag: 'BUS110',
    status: 'available',
    images: [],
    createdAt: '2026-06-08T16:45:00.000Z',
    updatedAt: '2026-06-08T16:45:00.000Z',
  },
];

function createTokens(userId: string): {
  accessToken: string;
  refreshToken: string;
} {
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

function matchRoute(
  method: string,
  path: string,
  pattern: string,
  expectedMethod: string,
): boolean {
  return method === expectedMethod && path === pattern;
}

/** Splits a request path like `/api/listings?search=x` into pathname + query params. */
function parseRequestPath(path: string): {
  pathname: string;
  searchParams: URLSearchParams;
} {
  const [pathname, queryString = ''] = path.split('?');
  return { pathname, searchParams: new URLSearchParams(queryString) };
}

/** Matches `/api/listings/:id`-style dynamic segments and returns the captured id, if any. */
function matchDynamicRoute(
  method: string,
  pathname: string,
  prefix: string,
  expectedMethod: string,
): string | null {
  if (method !== expectedMethod) {
    return null;
  }
  if (!pathname.startsWith(prefix)) {
    return null;
  }
  const remainder = pathname.slice(prefix.length);
  if (!remainder || remainder.includes('/')) {
    return null;
  }
  return remainder;
}

function getAuthenticatedUser(headers: HeadersInit | undefined): User | null {
  const userId = getUserIdFromAuthHeader(headers);
  if (!userId) {
    return null;
  }
  return mockUsers.find((u) => u.id === userId) ?? null;
}

function toListingSeller(user: User): Listing['seller'] {
  return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
}

function attachSeller(listing: MockListingRecord): Listing {
  const sellerUser = mockUsers.find((u) => u.id === listing.sellerId);
  return sellerUser
    ? { ...listing, seller: toListingSeller(sellerUser) }
    : listing;
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
      (u) =>
        u.email.toLowerCase() === body.email.toLowerCase() &&
        u.password === body.password,
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
      throw mockError(
        400,
        'Email domain is not associated with a registered university.',
      );
    }
    const existing = mockUsers.find(
      (u) => u.email.toLowerCase() === body.email.toLowerCase(),
    );
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

  const { pathname, searchParams } = parseRequestPath(path);

  if (matchRoute(method, pathname, '/api/listings', 'GET')) {
    const currentUser = getAuthenticatedUser(options.headers);
    if (!currentUser) {
      throw mockError(401, 'Unauthorized.');
    }

    const search = searchParams.get('search')?.trim().toLowerCase();
    const category = searchParams.get('category');
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const sellerId = searchParams.get('sellerId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const pageSize = Math.max(
      1,
      Number(searchParams.get('pageSize') ?? '12') || 12,
    );

    // Every listings query is scoped to the requester's own university.
    let results = mockListings.filter(
      (l) => l.universityId === currentUser.universityId,
    );

    if (search) {
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.description.toLowerCase().includes(search),
      );
    }
    if (category) {
      results = results.filter((l) => l.category === category);
    }
    if (department) {
      results = results.filter((l) => l.department === department);
    }
    if (status) {
      results = results.filter((l) => l.status === status);
    }
    if (sellerId) {
      results = results.filter((l) => l.sellerId === sellerId);
    }
    if (minPrice) {
      results = results.filter((l) => l.price >= Number(minPrice));
    }
    if (maxPrice) {
      results = results.filter((l) => l.price <= Number(maxPrice));
    }

    results = [...results].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = results.length;
    const start = (page - 1) * pageSize;
    const pageItems = results.slice(start, start + pageSize).map(attachSeller);

    return { listings: pageItems, total, page, pageSize } as T;
  }

  if (matchRoute(method, pathname, '/api/listings', 'POST')) {
    const currentUser = getAuthenticatedUser(options.headers);
    if (!currentUser) {
      throw mockError(401, 'Unauthorized.');
    }
    const body = parseJsonBody<CreateListingRequest>(options.body);
    if (
      !body?.title?.trim() ||
      !body.description?.trim() ||
      !body.category ||
      !body.condition
    ) {
      throw mockError(
        400,
        'Title, description, category, and condition are required.',
      );
    }
    if (
      typeof body.price !== 'number' ||
      Number.isNaN(body.price) ||
      body.price < 0
    ) {
      throw mockError(400, 'Price must be a non-negative number.');
    }
    const now = new Date().toISOString();
    const newListing: MockListingRecord = {
      id: `listing-${Date.now()}`,
      universityId: currentUser.universityId,
      sellerId: currentUser.id,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      condition: body.condition,
      price: body.price,
      department: body.department?.trim() || null,
      courseTag: body.courseTag?.trim() || null,
      status: 'available',
      images: body.images ?? [],
      createdAt: now,
      updatedAt: now,
    };
    mockListings.push(newListing);
    return { listing: attachSeller(newListing) } as T;
  }

  const singleListingGetId = matchDynamicRoute(
    method,
    pathname,
    '/api/listings/',
    'GET',
  );
  if (singleListingGetId) {
    const currentUser = getAuthenticatedUser(options.headers);
    if (!currentUser) {
      throw mockError(401, 'Unauthorized.');
    }
    const listing = mockListings.find((l) => l.id === singleListingGetId);
    if (!listing || listing.universityId !== currentUser.universityId) {
      throw mockError(404, 'Listing not found.');
    }
    return { listing: attachSeller(listing) } as T;
  }

  const singleListingPatchId = matchDynamicRoute(
    method,
    pathname,
    '/api/listings/',
    'PATCH',
  );
  if (singleListingPatchId) {
    const currentUser = getAuthenticatedUser(options.headers);
    if (!currentUser) {
      throw mockError(401, 'Unauthorized.');
    }
    const index = mockListings.findIndex((l) => l.id === singleListingPatchId);
    if (
      index === -1 ||
      mockListings[index].universityId !== currentUser.universityId
    ) {
      throw mockError(404, 'Listing not found.');
    }
    if (mockListings[index].sellerId !== currentUser.id) {
      throw mockError(403, 'You can only edit your own listings.');
    }
    const body = parseJsonBody<UpdateListingRequest>(options.body);
    if (
      body?.price !== undefined &&
      (Number.isNaN(body.price) || body.price < 0)
    ) {
      throw mockError(400, 'Price must be a non-negative number.');
    }
    const existing = mockListings[index];
    const updated: MockListingRecord = {
      ...existing,
      ...body,
      title: body?.title?.trim() ?? existing.title,
      description: body?.description?.trim() ?? existing.description,
      department:
        body?.department !== undefined
          ? body.department?.trim() || null
          : existing.department,
      courseTag:
        body?.courseTag !== undefined
          ? body.courseTag?.trim() || null
          : existing.courseTag,
      updatedAt: new Date().toISOString(),
    };
    mockListings[index] = updated;
    return { listing: attachSeller(updated) } as T;
  }

  const singleListingDeleteId = matchDynamicRoute(
    method,
    pathname,
    '/api/listings/',
    'DELETE',
  );
  if (singleListingDeleteId) {
    const currentUser = getAuthenticatedUser(options.headers);
    if (!currentUser) {
      throw mockError(401, 'Unauthorized.');
    }
    const index = mockListings.findIndex((l) => l.id === singleListingDeleteId);
    if (
      index === -1 ||
      mockListings[index].universityId !== currentUser.universityId
    ) {
      throw mockError(404, 'Listing not found.');
    }
    if (mockListings[index].sellerId !== currentUser.id) {
      throw mockError(403, 'You can only delete your own listings.');
    }
    mockListings = mockListings.filter((l) => l.id !== singleListingDeleteId);
    return undefined as T;
  }

  throw mockError(404, `No mock handler for ${method} ${path}`);
}

export function getMockUniversities() {
  return MOCK_UNIVERSITIES;
}

export function findMockUniversityByDomain(domain: string) {
  const normalized = domain.toLowerCase();
  return MOCK_UNIVERSITIES.find((uni) =>
    uni.allowedEmailDomains.some(
      (allowed) => allowed.toLowerCase() === normalized,
    ),
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

function getUserIdFromAuthHeader(
  headers: HeadersInit | undefined,
): string | null {
  if (!headers) {
    return null;
  }
  const authHeader =
    headers instanceof Headers
      ? headers.get('Authorization')
      : Array.isArray(headers)
        ? headers.find(([key]) => key.toLowerCase() === 'authorization')?.[1]
        : (headers.Authorization ?? headers.authorization);

  if (!authHeader?.startsWith('Bearer mock-access-')) {
    return null;
  }
  return authHeader.replace('Bearer mock-access-', '');
}

export type {
  AuthResponse,
  UserProfileResponse,
  UniversitiesResponse,
  ListingResponse,
  ListingsResponse,
};
