# Campus Marketplace & Resource Hub

## 1. Overview

A web platform for university students to buy and sell textbooks, find tutors, and share past exam papers — designed to support multiple universities rather than a single campus. Each university operates as its own community within the platform: students only see and interact with listings, tutors, and chats from their own university, while the platform itself can scale to onboard new universities over time. Built by a 5-member team as a full-stack portfolio project, with one pilot university onboarded first for real user feedback.

**Target users:** University students across one or more onboarded universities (buyers, sellers, tutors, admins)

**Core value:** Solves a real, everyday campus problem — expensive textbooks, scattered tutoring, hard-to-find past papers — with a platform students will actually use, and a design that isn't locked to a single school.

---

## 2. Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- TanStack Query (React Query) — server state/caching
- Zustand — local/UI state
- React Router
- Socket.io-client (chat)

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT authentication + role-based access control (RBAC)
- Socket.io (real-time chat)

### Payments
- Chapa API

### File Storage
- Cloudinary (item/textbook photos, exam paper uploads)

### Infra / Deployment
- Frontend: Vercel
- Backend: Railway or Render
- DB: Railway/Render managed PostgreSQL
- Shared Postman collection for API testing

### Dev Tools
- GitHub (repo, PRs, issues, project board)
- ESLint + Prettier
- GitHub Actions (CI: lint + build on PR)

---

## 3. Core Modules & Features

### 3.1 Auth & User Profiles
- AAU-only signup with university email verification — accounts must use an `@aau.edu.et` email address
- Stored role: `student` (default on signup) or `admin` (manually assigned, never via public signup)
- Profile: name, department, year, avatar, bio, ratings, university (auto-assigned from email domain)
- JWT access + refresh tokens

**Multi-university scoping:** The platform supports multiple universities from day one. Each university is a row in a `universities` table with an allowed email domain (or list of domains) used to verify signup and auto-assign a user to that university. Nearly every user-facing query — listings, tutor search, chat — is scoped by `university_id`, so students only ever see peers, listings, and tutors from their own university. This keeps the marketplace feeling local and trustworthy while letting the team demo onboarding multiple universities without rebuilding anything. Admins come in two scopes: a `university_admin` moderates only their own university's content, while a `super_admin` (platform-wide) can manage universities themselves — approving new ones, adding allowed email domains, and viewing cross-university stats.

**Roles vs. capabilities:** `seller` and `tutor` are **not** stored roles — they're capabilities derived from usage. Every user is a `student` by default. A user becomes a "seller" the moment they create a row in `listings`, and a "tutor" the moment they create a row in `tutor_profiles`. No explicit role assignment happens for either. This reflects reality: the same student can buy, sell, and tutor interchangeably, so treating those as fixed identities would be artificial. Only `admin` (as `university_admin` or `super_admin`) is a true stored role, since it grants distinct permissions and must be manually assigned. A future "verified tutor" badge (admin-approved, separate from self-listed tutoring) is a candidate v2 feature if a trust/verification layer is needed.

### 3.2 Listings
- Create/edit/delete listings: textbooks, past exam papers
- Categories, condition, price, department/course tag
- All listings scoped to the seller's `university_id` — students only browse listings from their own university
- Search + filters (category, price range, department, keyword)
- Image upload via Cloudinary
- Listing status: available / reserved / sold

### 3.3 Tutoring
- Tutors create tutor profiles (subjects, rate, availability)
- Students browse/search tutors by subject/department, scoped to their own university
- Booking request flow (accept/decline)

### 3.4 Chat / Messaging
- Real-time 1:1 chat between buyer-seller or student-tutor
- Message history persisted in DB
- Online/typing indicators (stretch goal)

### 3.5 Payments
- Chapa integration for tutoring session payments and/or item deposits
- Transaction history per user
- Payment status webhook handling

### 3.6 Admin & Moderation
- University admins: approve/reject flagged listings, ban/suspend users — scoped to their own university
- Super admin: onboard new universities, manage allowed email domains, view cross-university stats
- Reported content queue

### 3.7 Reviews & Ratings (stretch goal)
- Buyers rate sellers, students rate tutors
- Displayed on profile

---

## 4. Database Schema (high level)

- `universities` (id, name, allowed_email_domains[], created_at)
- `users` (id, university_id, name, email, university_id_number, department, role [`student` | `university_admin` | `super_admin`], password_hash, avatar_url, created_at)
- `listings` (id, university_id, seller_id, title, description, category, price, condition, department, status, images[], created_at)
- `tutor_profiles` (id, university_id, user_id, subjects[], hourly_rate, availability, bio)
- `bookings` (id, university_id, student_id, tutor_id, subject, status, scheduled_at)
- `conversations` (id, university_id, participant_ids[], created_at)
- `messages` (id, conversation_id, sender_id, content, sent_at, read_at)
- `transactions` (id, user_id, related_type, related_id, amount, chapa_ref, status, created_at)
- `reports` (id, university_id, reporter_id, target_type, target_id, reason, status, created_at)
- `reviews` (id, reviewer_id, target_user_id, rating, comment, created_at)

*(`university_id` denormalized onto listings/tutor_profiles/bookings/conversations/reports for fast scoped queries, even though it's derivable via the user. Full ERD to be diagrammed in Sprint 1 once schema is finalized.)*

---

## 5. API Modules (REST)

| Module | Base Route | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | register, login, refresh, verify-email |
| Universities | `/api/universities` | list universities, super-admin: create/manage universities & domains |
| Users | `/api/users` | GET/PATCH profile, GET tutor profile |
| Listings | `/api/listings` | CRUD, search/filter (scoped to user's university), upload images |
| Tutoring | `/api/tutors`, `/api/bookings` | list tutors, create/accept/decline booking |
| Chat | `/api/conversations`, WebSocket `/socket` | get conversations, send/receive messages |
| Payments | `/api/payments` | initiate Chapa payment, webhook handler, history |
| Admin | `/api/admin` | university-scoped: manage users/listings/reports; super-admin: cross-university stats |
| Reviews | `/api/reviews` | create/list reviews |

---

## 6. Folder Structure

### Repository layout (monorepo)
```
campus-marketplace/
├── frontend/
├── backend/
├── docs/
│   ├── plan.md
│   ├── proposal.md
│   ├── erd.png
│   └── api-collection.postman.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
└── README.md
```

### Frontend (`frontend/`)
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/          # Button, Input, Modal, Spinner, etc.
│   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   └── listings/        # ListingCard, ListingForm, etc.
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   ├── listings/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   ├── tutoring/
│   │   ├── chat/
│   │   └── admin/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ListingDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── AdminPage.tsx
│   ├── lib/
│   │   ├── api-client.ts    # axios/fetch wrapper
│   │   └── socket.ts        # Socket.io client setup
│   ├── store/                # Zustand stores
│   ├── router/
│   │   └── AppRouter.tsx
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
└── vite.config.ts
```

### Backend (`backend/`)
```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── universities/
│   │   ├── users/
│   │   ├── listings/
│   │   ├── tutoring/
│   │   ├── chat/
│   │   ├── payments/
│   │   └── admin/
│   ├── middleware/
│   │   ├── authenticate.ts   # JWT verification
│   │   ├── authorize.ts      # RBAC / university-scoping checks
│   │   └── errorHandler.ts
│   ├── sockets/
│   │   └── chat.socket.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── cloudinary.ts
│   │   └── chapa.ts
│   ├── config/
│   │   └── env.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

Each backend module folder (`controller` / `service` / `routes` / `validation`) keeps ownership boundaries clean — whoever owns a module works almost entirely within their own folder, minimizing merge conflicts across the team.

---

## 7. Task Organization Strategy

To avoid constant merge conflicts and let each side of the stack develop at full speed, the team splits into two fully independent tracks — **Backend** and **Frontend** — that only integrate at a planned point near the end. Within each track, work is organized as:

1. **Independent Builds** — Frontend and Backend are built completely independently of each other. Frontend develops against an agreed-upon API contract (routes, request/response shapes — see `docs/api-collection.postman.json` and Section 5 above), not the live backend. Integration happens only in the dedicated Integration Phase (Week 7).
2. **Main Trunk (per side)** — Within each track, the core tasks form a single sequential pipeline (Task A → Task B → Task C), where each task is built directly on top of the previous one. This keeps the codebase looking architecturally consistent, as if written by one person, and avoids two people making conflicting structural decisions in the same layer.
3. **Parallel Side-Tasks** — Independent tasks that don't depend on, or get depended on by, the trunk are pulled out and done alongside it, by whichever member has capacity. This keeps the team from being bottlenecked waiting on the trunk to finish before doing anything else.

---

### 7.1 Backend Track (Tesfaye, Robin, Saleamlak)

**Main Trunk (sequential):**

| Step | Task | Owner | Depends On |
|---|---|---|---|
| A | **Core Setup, Schema & Auth** — repo/project scaffold, full Prisma schema (`universities`, `users`, `listings`, `tutor_profiles`, `bookings`, `conversations`, `messages`, `transactions`, `reports`), auth module (register/login/refresh/verify-email), JWT + RBAC middleware, university-scoping middleware pattern | Tesfaye | — (first task) |
| B | **Listings & Search API** — listings CRUD, category/search/filter, Cloudinary image upload | Robin | Task A (needs auth middleware + schema) |
| C | **Chat (Socket.io) & Tutoring/Bookings API** — Socket.io server, conversations/messages persistence, tutor profiles, booking accept/decline logic | Saleamlak | Task B (chat is tied to listings; tutoring reuses the auth/user layer from Task A) |

Each step only starts once the previous is merged to `main`, so the whole backend inherits one consistent set of patterns (error handling, response shape, middleware usage) from Task A onward.

**Parallel Side-Tasks (independent of the trunk, run alongside it):**

| Task | Owner | Why it's independent |
|---|---|---|
| Admin/Moderation endpoints (ban user, delete listing) | Tesfaye | Only needs the `users`/`listings` tables to exist, not their business logic — picked up once Task A is merged, done in parallel while Robin works Task B |
| Payments (Chapa integration) | Robin or Saleamlak | Built against a stubbed `transactions` record and a mock listing/booking ID; doesn't block or get blocked by Tasks B/C, wired to real IDs at integration |
| Seed data & Postman collection | Rotates across all three | Ongoing documentation work, touches no shared code |

---

### 7.2 Frontend Track (Rufta, Yared)

**Main Trunk (sequential):**

| Step | Task | Owner | Depends On |
|---|---|---|---|
| A | **App Shell & Auth UI** — Vite/React/TS/Tailwind scaffold, routing, layout components (Navbar/Sidebar/Footer), design tokens, API client wrapper (built against the agreed API contract, not a live backend), login/signup pages | Rufta | — (first task) |
| B | **Listings UI** — listing card/detail, create/edit form, search/filter UI, seller dashboard | Yared | Task A (needs layout + design system) |
| C | **Chat, Tutoring & Admin Panel UI** — chat window, tutor booking UI, admin panel | Rufta | Task B (chat is tied to a listing's UI context) |

**Parallel Side-Tasks (independent of the trunk, run alongside it):**

| Task | Owner | Why it's independent |
|---|---|---|
| Profile page (view/edit) | Yared | Only needs Task A's auth context and layout shell, not Listings — built in parallel with Task B |
| Reusable UI polish (loading/error/empty states, shared components) | Whoever has slack time | Touches shared `components/common/`, not feature-specific trunk code |

---

### 7.3 Integration Phase

A dedicated stretch near the end of the timeline (see Section 9, Week 7) where:
- Frontend swaps its mocked API calls for the real, now-complete backend endpoints
- Both sides connect the real Socket.io server ↔ client for chat
- Contract mismatches (field names, status codes, edge cases) get fixed collaboratively — this is the one point in the project where backend and frontend owners pair up directly
- End-to-end testing of full user flows (signup → list an item → chat → admin moderates)

---

## 8. Team Roles Summary

| Track | Member | Role |
|---|---|---|
| Backend | Tesfaye Tilahun | Trunk Task A (Core Setup, Schema, Auth) + Admin/Moderation side-task |
| Backend | Robin Mulugeta | Trunk Task B (Listings & Search API) + Payments side-task |
| Backend | Saleamlak Setie | Trunk Task C (Chat/Socket.io server + Tutoring/Bookings API) |
| Frontend | Rufta Gaiem | Trunk Task A (App Shell & Auth UI) + Trunk Task C (Chat, Tutoring & Admin Panel UI) |
| Frontend | Yared Teweldebirhan | Trunk Task B (Listings UI) + Profile page side-task |

**Shared/rotating responsibilities (all members):**
- Code review on each other's pull requests before merging to `main`
- The Backend and Frontend tracks agree on the API contract in Week 1, before either trunk starts, so both sides can build independently without blocking each other
- Each member writes their own module's section of the final README
- Everyone contributes to the Integration Phase, final testing pass, and demo video recording

---

## 9. Milestones / Timeline (suggested 8-week plan)

| Week | Backend Track | Frontend Track |
|---|---|---|
| 1 | Agree on API contract; repo/CI setup; start Trunk Task A (schema + auth) | Agree on API contract; repo/CI setup; start Trunk Task A (app shell + auth UI, built against the contract, not live backend) |
| 2 | Finish Trunk Task A (auth, RBAC, university scoping) | Finish Trunk Task A; start Profile page side-task |
| 3 | Start Trunk Task B (Listings & Search API); Admin/Moderation side-task begins | Start Trunk Task B (Listings UI) |
| 4 | Finish Trunk Task B; start Payments side-task | Finish Trunk Task B |
| 5 | Start Trunk Task C (Chat/Socket.io + Tutoring/Bookings API) | Start Trunk Task C (Chat, Tutoring & Admin Panel UI) — built against mocked socket/API |
| 6 | Finish Trunk Task C; finish Payments side-task | Finish Trunk Task C; UI polish side-tasks |
| 7 | **Integration Phase** — connect real API + Socket.io to frontend, fix contract mismatches, end-to-end testing (both tracks, together) | |
| 8 | Testing, bug fixes, deployment, README + demo video, polish | |

*(Because the two tracks build independently, Backend and Frontend can technically run these weeks in parallel rather than waiting on each other — the only hard sync point is Week 1's contract agreement and Week 7's integration.)*

---

## 10. Deliverables for Portfolio

- Live deployed demo (frontend + backend), seeded with at least one pilot university
- Public GitHub repo with clear README (architecture diagram, setup instructions, screenshots)
- Postman collection
- Seed data / demo account credentials for reviewers, including a second demo university to showcase multi-university support
- Short demo video (2–3 min) walking through core flows

---

## 11. Stretch Goals (if time allows)

- Push notifications for new messages/bookings
- Saved searches / listing alerts
- Multi-language support (English/Amharic)
- Analytics dashboard for admin (charts on listings, revenue, active users)
- Self-service university onboarding request form (university reps request to be added, super-admin approves)
- Dedicated equipment renting service — beyond treating rentals as a plain listing category, add rental-specific flow: due date/return date, deposit amount, availability calendar per item, and automatic "overdue" status/reminders
