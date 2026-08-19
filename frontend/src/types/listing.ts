export type ListingCategory = 'textbook' | 'past_exam' | 'equipment' | 'other';

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export type ListingStatus = 'available' | 'reserved' | 'sold';

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
