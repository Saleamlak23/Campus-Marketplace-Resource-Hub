import { apiClient } from '../../lib/api-client';
import { getAccessToken } from '../../store/authStore';
import type {
  CreateListingRequest,
  ListingResponse,
  ListingsQuery,
  ListingsResponse,
  UpdateListingRequest,
} from '../../types';

function buildQueryString(query: ListingsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.department) params.set('department', query.department);
  if (query.status) params.set('status', query.status);
  if (query.sellerId) params.set('sellerId', query.sellerId);
  if (query.minPrice !== undefined)
    params.set('minPrice', String(query.minPrice));
  if (query.maxPrice !== undefined)
    params.set('maxPrice', String(query.maxPrice));
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));

  return params.toString();
}

export async function fetchListings(
  query?: ListingsQuery,
): Promise<ListingsResponse> {
  const qs = buildQueryString(query);
  return apiClient<ListingsResponse>(`/api/listings${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    token: getAccessToken(),
  });
}

export async function fetchListing(id: string): Promise<ListingResponse> {
  return apiClient<ListingResponse>(`/api/listings/${id}`, {
    method: 'GET',
    token: getAccessToken(),
  });
}

export async function createListing(
  payload: CreateListingRequest,
): Promise<ListingResponse> {
  return apiClient<ListingResponse>('/api/listings', {
    method: 'POST',
    body: payload,
    token: getAccessToken(),
  });
}

export async function updateListing(
  id: string,
  payload: UpdateListingRequest,
): Promise<ListingResponse> {
  return apiClient<ListingResponse>(`/api/listings/${id}`, {
    method: 'PATCH',
    body: payload,
    token: getAccessToken(),
  });
}

export async function deleteListing(id: string): Promise<void> {
  return apiClient<void>(`/api/listings/${id}`, {
    method: 'DELETE',
    token: getAccessToken(),
  });
}
