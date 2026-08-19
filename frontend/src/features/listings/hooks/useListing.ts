import { useQuery } from '@tanstack/react-query';
import * as listingsApi from '../api';

export function useListingQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.fetchListing(id as string),
    enabled: Boolean(id),
  });
}
