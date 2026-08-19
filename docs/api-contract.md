# API Contract

Agreed-upon routes and request/response shapes, written before Frontend
and Backend trunks start (see plan.md, Section 7). Update this file the
moment any endpoint shape changes.

## Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/verify-email

## Universities
- GET /api/universities

## Users
- GET /api/users/me
- PATCH /api/users/me

## Listings
All endpoints require `Authorization: Bearer <accessToken>`. Every listings query and
mutation is scoped to the requester's own `university_id` — a listing outside the
caller's university returns 404, and editing/deleting a listing owned by another
seller returns 403.

- **GET /api/listings** — query params: `search`, `category`, `department`, `status`,
  `sellerId`, `minPrice`, `maxPrice`, `page` (default 1), `pageSize` (default 12).
  Response: `{ listings: Listing[], total: number, page: number, pageSize: number }`
- **POST /api/listings** — body: `{ title, description, category, condition, price, department?, courseTag?, images? }`.
  Response: `{ listing: Listing }`. New listings default to `status: "available"` and
  are stamped with the caller's `sellerId`/`universityId`.
- **GET /api/listings/:id** — Response: `{ listing: Listing }`
- **PATCH /api/listings/:id** — body: any subset of the POST fields, plus optional
  `status` (`available` | `reserved` | `sold`). Owner-only. Response: `{ listing: Listing }`
- **DELETE /api/listings/:id** — Owner-only. Response: `204 No Content`

```ts
type ListingCategory = 'textbook' | 'past_exam' | 'equipment' | 'other';
type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
type ListingStatus = 'available' | 'reserved' | 'sold';

interface Listing {
  id: string;
  universityId: string;
  sellerId: string;
  seller?: { id: string; name: string; avatarUrl: string | null };
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  price: number;
  department: string | null;
  courseTag: string | null;
  status: ListingStatus;
  images: string[]; // Cloudinary URLs
  createdAt: string;
  updatedAt: string;
}
```

Images are uploaded client-side directly to Cloudinary (unsigned upload preset);
the frontend sends back an array of resulting URLs in `images`, so the backend
never needs to proxy the upload itself.


## Tutoring / Bookings
- GET /api/tutors
- POST /api/bookings
- PATCH /api/bookings/:id

## Chat
- GET /api/conversations
- WebSocket /socket (see chat.socket.ts)

## Payments
- POST /api/payments/initiate
- POST /api/payments/webhook

## Admin
- DELETE /api/admin/listings/:id
- PATCH /api/admin/users/:id/ban
