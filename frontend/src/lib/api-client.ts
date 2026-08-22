import type { ApiErrorBody } from '../types';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return 'Unable to connect to the server.';
  return fallback;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
  skipAuth?: boolean;
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.token && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  return headers;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }
  return JSON.stringify(body);
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody | undefined> {
  try {
    const json = (await res.json()) as ApiErrorBody & { error?: string; success?: boolean };
    const message = json.message ?? json.error ?? `API error: ${res.status}`;
    return { message, errors: json.errors };
  } catch {
    return undefined;
  }
}

/**
 * Unwrap the standard API envelope `{ success: true, data: T }`.
 * If the response is already the raw shape (no `data` key), return as-is.
 */
function unwrapEnvelope<T>(json: unknown): T {
  if (
    json !== null &&
    typeof json === 'object' &&
    'success' in json &&
    (json as Record<string, unknown>).success === true &&
    'data' in json
  ) {
    return (json as Record<string, unknown>).data as T;
  }
  return json as T;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, ...fetchOptions } = options;
  const headers = buildHeaders(options);
  const requestInit: RequestInit = {
    ...fetchOptions,
    headers,
    body: serializeBody(body),
  };

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, requestInit);
  } catch {
    throw new ApiError(0, 'Unable to connect to the server.');
  }

  if (!res.ok) {
    const errorBody = await parseErrorBody(res);
    if (res.status === 401 && options.token && !options.skipAuth) {
      useAuthStore.getState().clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    throw new ApiError(
      res.status,
      errorBody?.message ?? `API error: ${res.status}`,
      errorBody,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();
  return unwrapEnvelope<T>(json);
}

/** @deprecated Use apiClient instead */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return apiClient<T>(path, options);
}

/** Returns true when NOT using mock API (i.e., talking to live backend) */
export function isMockModeEnabled(): boolean {
  return false;
}
