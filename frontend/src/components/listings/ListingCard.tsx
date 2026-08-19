import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Card from '../common/Card';
import ListingStatusBadge from './ListingStatusBadge';
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  formatPrice,
} from '../../features/listings/constants';
import type { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const thumbnail = listing.images[0];

  return (
    <Link to={`/listings/${listing.id}`} className="block h-full">
      <Card
        padding="none"
        hoverable
        className="flex h-full flex-col overflow-hidden"
      >
        <div className="aspect-[4/3] w-full bg-surface-muted">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="primary">{CATEGORY_LABELS[listing.category]}</Badge>
            <ListingStatusBadge status={listing.status} />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold text-text">
            {listing.title}
          </h3>
          <p className="line-clamp-2 text-xs text-text-muted">
            {listing.description}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-primary-700">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-text-muted">
              {CONDITION_LABELS[listing.condition]}
            </span>
          </div>
          {listing.department && (
            <p className="text-xs text-text-muted">
              {listing.department}
              {listing.courseTag ? ` · ${listing.courseTag}` : ''}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
