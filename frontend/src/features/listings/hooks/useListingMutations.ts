import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as listingsApi from '../api';
import type {
  CreateListingRequest,
  UpdateListingRequest,
} from '../../../types';

export function useCreateListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateListingRequest) =>
      listingsApi.createListing(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListingMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateListingRequest) =>
      listingsApi.updateListing(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] });
      void queryClient.invalidateQueries({ queryKey: ['listing', id] });
    },
  });
}

export function useDeleteListingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsApi.deleteListing(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
