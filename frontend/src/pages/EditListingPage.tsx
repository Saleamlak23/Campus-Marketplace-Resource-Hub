import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import ListingForm from '../components/listings/ListingForm';
import { useListingQuery } from '../features/listings/hooks/useListing';
import { useUpdateListingMutation } from '../features/listings/hooks/useListingMutations';
import { useAuthStore } from '../store/authStore';
import type { CreateListingRequest } from '../types';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useListingQuery(id);
  const updateMutation = useUpdateListingMutation(id ?? '');

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading listing" />
      </div>
    );
  }

  if (isError || !data?.listing) {
    return (
      <Card className="py-12 text-center">
        <h1 className="text-lg font-semibold text-text">Listing not found</h1>
      </Card>
    );
  }

  const listing = data.listing;

  if (listing.sellerId !== user?.id) {
    return (
      <Card className="py-12 text-center">
        <h1 className="text-lg font-semibold text-text">
          You can&apos;t edit this listing
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Only the seller can make changes to a listing.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(`/listings/${listing.id}`)}
        >
          View listing
        </Button>
      </Card>
    );
  }

  async function handleSubmit(payload: CreateListingRequest) {
    const { listing: updated } = await updateMutation.mutateAsync(payload);
    navigate(`/listings/${updated.id}`);
  }

  return (
    <div className="flex justify-center">
      <ListingForm
        mode="edit"
        initialListing={listing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
