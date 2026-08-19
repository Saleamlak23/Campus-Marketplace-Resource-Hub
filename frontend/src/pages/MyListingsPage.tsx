import { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import ListingStatusBadge from '../components/listings/ListingStatusBadge';
import { useMyListingsQuery } from '../features/listings/hooks/useListings';
import { useDeleteListingMutation } from '../features/listings/hooks/useListingMutations';
import { CATEGORY_LABELS, formatPrice } from '../features/listings/constants';
import { useAuthStore } from '../store/authStore';

export default function MyListingsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyListingsQuery(user?.id);
  const deleteMutation = useDeleteListingMutation();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const listings = data?.listings ?? [];

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    await deleteMutation.mutateAsync(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-3">
            Seller dashboard
          </Badge>
          <h1 className="text-2xl font-bold text-text">My listings</h1>
          <p className="mt-2 text-text-muted">
            Manage the items you&apos;ve listed for sale.
          </p>
        </div>
        <Link to="/listings/new">
          <Button>+ New listing</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" label="Loading your listings" />
        </div>
      ) : listings.length === 0 ? (
        <Card className="py-12 text-center">
          <h2 className="text-lg font-semibold text-text">
            You haven&apos;t listed anything yet
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Sell a textbook, past exam paper, or piece of equipment to your
            campus.
          </p>
          <Link to="/listings/new" className="mt-4 inline-block">
            <Button>Create your first listing</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id} padding="sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/listings/${listing.id}`}
                        className="font-semibold text-text hover:text-primary-700"
                      >
                        {listing.title}
                      </Link>
                      <ListingStatusBadge status={listing.status} />
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {CATEGORY_LABELS[listing.category]} ·{' '}
                      {formatPrice(listing.price)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/listings/${listing.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingDeleteId(listing.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Delete listing"
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">This can&apos;t be undone.</p>
      </Modal>
    </div>
  );
}
