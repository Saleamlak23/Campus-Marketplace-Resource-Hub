import Card from '../common/Card';
import Spinner from '../common/Spinner';
import ListingCard from './ListingCard';
import type { Listing } from '../../types';

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ListingGrid({
  listings,
  isLoading,
  emptyTitle = 'No listings found',
  emptyDescription = 'Try adjusting your search or filters.',
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" label="Loading listings" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card className="py-12 text-center">
        <h3 className="text-lg font-semibold text-text">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-text-muted">{emptyDescription}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
