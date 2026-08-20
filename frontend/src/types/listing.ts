// Backend uses uppercase enums - keep them as-is from the API
export type ListingCategory = 'TEXTBOOK' | 'PAST_EXAM' | 'EQUIPMENT' | 'OTHER';

export type ListingCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export type ListingStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface ListingSeller {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Listing {
  id: string;
  universityId: string;
  sellerId: string;
  seller?: ListingSeller;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  price: number;
  department: string | null;
  courseTag: string | null;
  status: ListingStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingsQuery {
  search?: string;
  category?: ListingCategory;
  department?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ListingStatus;
  sellerId?: string;
  page?: number;
  pageSize?: number;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingResponse {
  listing: Listing;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  price: number;
  department?: string;
  courseTag?: string;
  images?: string[];
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {
  status?: ListingStatus;
}
