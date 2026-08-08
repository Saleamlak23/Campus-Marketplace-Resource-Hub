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
- GET /api/listings
- POST /api/listings
- GET /api/listings/:id
- PATCH /api/listings/:id
- DELETE /api/listings/:id

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
