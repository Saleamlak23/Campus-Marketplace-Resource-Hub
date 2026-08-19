import { create } from 'zustand';
import type { ListingCategory } from '../types';

interface ListingsFilterState {
  search: string;
  category: ListingCategory | '';
  department: string;
  minPrice: string;
  maxPrice: string;
  page: number;
  setSearch: (value: string) => void;
  setCategory: (value: ListingCategory | '') => void;
  setDepartment: (value: string) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setPage: (value: number) => void;
  resetFilters: () => void;
}

const initialFilters = {
  search: '',
  category: '' as ListingCategory | '',
  department: '',
  minPrice: '',
  maxPrice: '',
  page: 1,
};

export const useListingsFilterStore = create<ListingsFilterState>()((set) => ({
  ...initialFilters,
  setSearch: (value) => set({ search: value, page: 1 }),
  setCategory: (value) => set({ category: value, page: 1 }),
  setDepartment: (value) => set({ department: value, page: 1 }),
  setMinPrice: (value) => set({ minPrice: value, page: 1 }),
  setMaxPrice: (value) => set({ maxPrice: value, page: 1 }),
  setPage: (value) => set({ page: value }),
  resetFilters: () => set({ ...initialFilters }),
}));
