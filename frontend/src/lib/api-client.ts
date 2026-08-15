import { handleMockRequest } from './mock-handlers';
import type { ApiErrorBody } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

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
    return (await res.json()) as ApiErrorBody;
  } catch {
    return undefined;
  }
}

export function isMockModeEnabled(): boolean {
  return USE_MOCK;
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

  if (USE_MOCK) {
    try {
      return await handleMockRequest<T>(path, requestInit);
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        const status = (error as { status: number }).status;
        throw new ApiError(status, error.message);
      }
      throw error;
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, requestInit);

  if (!res.ok) {
    const errorBody = await parseErrorBody(res);
    throw new ApiError(
      res.status,
      errorBody?.message ?? `API error: ${res.status}`,
      errorBody,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

/** @deprecated Use apiClient instead */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return apiClient<T>(path, options);
}
