import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import ListingStatusBadge from '../components/listings/ListingStatusBadge';
import { createConversation } from '../features/chat/api';
import { useListingQuery } from '../features/listings/hooks/useListing';
import {
  useDeleteListingMutation,
  useUpdateListingMutation,
} from '../features/listings/hooks/useListingMutations';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  STATUS_OPTIONS,
  formatPrice,
} from '../features/listings/constants';
import { useAuthStore } from '../store/authStore';
import type { ListingStatus } from '../types';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, isError } = useListingQuery(id);
  const updateMutation = useUpdateListingMutation(id ?? '');
  const deleteMutation = useDeleteListingMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

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
        <p className="mt-2 text-sm text-text-muted">
          This listing may have been removed or isn&apos;t available to your
          university.
        </p>
        <Link to="/listings" className="mt-4 inline-block">
          <Button variant="outline">Back to listings</Button>
        </Link>
      </Card>
    );
  }

  const listing = data.listing;
  const isOwner = user?.id === listing.sellerId;

  async function handleStatusChange(status: ListingStatus) {
    await updateMutation.mutateAsync({ status });
  }

  async function handleDelete() {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate('/dashboard/listings');
  }

  async function handleMessageSeller() {
    setIsStartingChat(true);
    try {
      const conversation = await createConversation(listing.sellerId);
      navigate(`/chat/${conversation.id}`);
    } finally {
      setIsStartingChat(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/listings"
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to listings
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface-muted">
            {listing.images[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted">
                No image
              </div>
            )}
          </div>
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1).map((url) => (
                <div
                  key={url}
                  className="aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={url}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{CATEGORY_LABELS[listing.category]}</Badge>
            <ListingStatusBadge status={listing.status} />
          </div>

          <h1 className="text-2xl font-bold text-text">{listing.title}</h1>
          <p className="text-3xl font-bold text-primary-700">
            {formatPrice(listing.price)}
          </p>

          <Card padding="sm">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-text-muted">Condition</dt>
                <dd className="font-medium text-text">
                  {CONDITION_LABELS[listing.condition]}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Department</dt>
                <dd className="font-medium text-text">
                  {listing.department ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Course tag</dt>
                <dd className="font-medium text-text">
                  {listing.courseTag ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-text-muted">Seller</dt>
                <dd className="font-medium text-text">
                  {listing.seller?.name ?? '—'}
                </dd>
              </div>
            </dl>
          </Card>

          <div>
            <h2 className="text-sm font-semibold text-text">Description</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-text-muted">
              {listing.description}
            </p>
          </div>

          {isOwner ? (
            <div className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-medium text-text">
                Manage this listing
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      listing.status === option.value ? 'primary' : 'outline'
                    }
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      handleStatusChange(option.value as ListingStatus)
                    }
                  >
                    Mark {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Link to={`/listings/${listing.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit listing
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete listing
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              disabled={listing.status !== 'AVAILABLE'}
              isLoading={isStartingChat}
              onClick={handleMessageSeller}
            >
              {listing.status === 'AVAILABLE'
                ? 'Message seller'
                : 'Not available'}
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete listing"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete &quot;{listing.title}&quot;? This
          can&apos;t be undone.
        </p>
      </Modal>
    </div>
  );
}
