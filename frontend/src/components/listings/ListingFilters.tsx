import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import {
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
} from '../../features/listings/constants';
import { useListingsFilterStore } from '../../store/listingsFilterStore';
import type { ListingCategory } from '../../types';

export default function ListingFilters() {
  const {
    search,
    category,
    department,
    minPrice,
    maxPrice,
    setSearch,
    setCategory,
    setDepartment,
    setMinPrice,
    setMaxPrice,
    resetFilters,
  } = useListingsFilterStore();

  const hasActiveFilters = Boolean(
    search || category || department || minPrice || maxPrice,
  );

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            label="Search"
            placeholder="Title or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          label="Category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ListingCategory | '')
          }
          options={CATEGORY_OPTIONS}
          placeholder="All categories"
        />
        <Select
          label="Department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          options={DEPARTMENT_OPTIONS}
          placeholder="All departments"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Min price"
            type="number"
            min="0"
            placeholder="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <Input
            label="Max price"
            type="number"
            min="0"
            placeholder="Any"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </div>
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      )}
    </Card>
  );
}
