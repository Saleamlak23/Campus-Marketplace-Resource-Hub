import { useNavigate } from 'react-router-dom';
import ListingForm from '../components/listings/ListingForm';
import { useCreateListingMutation } from '../features/listings/hooks/useListingMutations';
import type { CreateListingRequest } from '../types';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const createMutation = useCreateListingMutation();

  async function handleSubmit(payload: CreateListingRequest) {
    const { listing } = await createMutation.mutateAsync(payload);
    navigate(`/listings/${listing.id}`);
  }

  return (
    <div className="flex justify-center">
      <ListingForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
