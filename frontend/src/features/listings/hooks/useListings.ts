import { useQuery } from '@tanstack/react-query';
import * as listingsApi from '../api';
import type { ListingsQuery } from '../../../types';

export function listingsQueryKey(query: ListingsQuery) {
  return ['listings', query] as const;
}

export function useListingsQuery(query: ListingsQuery) {
  return useQuery({
    queryKey: listingsQueryKey(query),
    queryFn: () => listingsApi.fetchListings(query),
    placeholderData: (previousData) => previousData,
  });
}

export function useMyListingsQuery(sellerId: string | undefined) {
  return useQuery({
    queryKey: ['listings', 'mine', sellerId],
    queryFn: () => listingsApi.fetchListings({ sellerId, pageSize: 50 }),
    enabled: Boolean(sellerId),
  });
}
