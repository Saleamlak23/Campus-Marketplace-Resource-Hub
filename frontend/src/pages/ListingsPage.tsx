import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Feedback from '../components/common/Feedback';
import ListingFilters from '../components/listings/ListingFilters';
import ListingGrid from '../components/listings/ListingGrid';
import Pagination from '../components/listings/Pagination';
import { useListingsQuery } from '../features/listings/hooks/useListings';
import { useListingsFilterStore } from '../store/listingsFilterStore';
import { useAuthStore } from '../store/authStore';
import type { ListingCategory, ListingsQuery } from '../types';
import { getApiErrorMessage } from '../lib/api-client';

export default function ListingsPage() {
  const { university } = useAuthStore();
  const { search, category, department, minPrice, maxPrice, page, setPage } =
    useListingsFilterStore();

  const query: ListingsQuery = {
    search: search || undefined,
    category: (category || undefined) as ListingCategory | undefined,
    department: department || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    page,
    pageSize: 12,
  };

  const { data, isLoading, error } = useListingsQuery(query);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="primary" className="mb-3">
            Browse listings
          </Badge>
          <h1 className="text-2xl font-bold text-text">
            Textbooks & past exam papers
          </h1>
          <p className="mt-2 text-text-muted">
            Showing listings from {university?.name ?? 'your university'} only.
          </p>
        </div>
        <Link to="/listings/new">
          <Button>+ New listing</Button>
        </Link>
      </div>

      <ListingFilters />

      {error && <Feedback message={getApiErrorMessage(error, 'Unable to load listings.')} />}

      <ListingGrid listings={data?.listings ?? []} isLoading={isLoading} />

      {data && (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
