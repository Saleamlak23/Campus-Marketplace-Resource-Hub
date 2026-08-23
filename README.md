# Campus Marketplace & Resource Hub

> A trusted, university-scoped marketplace and resource hub for buying, selling,
> tutoring, messaging, and sharing academic resources.

Campus Marketplace & Resource Hub brings the everyday exchange of textbooks,
equipment, past exam papers, and tutoring into one searchable platform. Users
join through their university email, interact with people from their own
university, and communicate through built-in real-time chat.

## What It Showcases

- University email-based registration and verification
- JWT access and refresh tokens with persisted frontend sessions
- Role-based access for students, university admins, and super admins
- Multi-university data isolation through university scoping
- Marketplace listings with search, filters, images, conditions, and availability
- Personal dashboard for managing listings
- Tutor profiles, subject discovery, rates, availability, and bookings
- Conversation history and real-time Socket.io messaging
- Reviews and ratings for community trust
- User and content reports for moderation
- Admin user management, listing deletion, report review, ban, and unban flows
- Immediate logout and access rejection for banned accounts, including active sessions
- Chapa payment initiation, webhook handling, payment history, and transaction lookup
- Cloudinary-compatible listing image uploads with a base64 fallback for development

## Product Experience

### For Students

1. Register with an approved university email domain.
2. Browse listings from the student's university.
3. Search by keyword, category, department, price, seller, or status.
4. Publish textbook, equipment, past-exam, or other resource listings.
5. Contact sellers and tutors through persistent real-time conversations.
6. Create a tutor profile or request a tutoring booking.
7. Leave reviews after a completed interaction.

### For University Admins

University admins moderate their own university's community. They can inspect
users, ban or unban users in their scope, remove listings, and manage reports.

### For Super Admins

Super admins have platform-wide visibility and can inspect users and
universities across the system. University admins cannot manage users or
content belonging to another university.

## Architecture

```text
React + TypeScript + Vite
	|
	| REST API                 WebSocket
	v                         v
Express + Prisma ------------ Socket.io
	|
	v
PostgreSQL
	|
	+-- Cloudinary (listing images)
	+-- Chapa (payments)
```

The application is organized as a small monorepo:

```text
Campus-Marketplace-Resource-Hub/
├── frontend/                    React SPA
│   ├── src/components/           Shared UI and layout components
│   ├── src/features/             Feature APIs and hooks
│   ├── src/pages/                Route-level screens
│   ├── src/lib/                  API, socket, upload, and mock helpers
│   ├── src/router/               Public, protected, and admin routes
│   └── src/store/                Zustand auth and filter state
├── backend/                     Express API and Socket.io server
│   ├── prisma/                   Schema, migrations, and seed data
│   ├── src/modules/              Auth, users, listings, chat, tutoring, etc.
│   ├── src/middleware/           Authentication, authorization, scoping, errors
│   ├── src/sockets/              Real-time chat gateway
│   └── src/lib/                  Prisma, Cloudinary, and Chapa clients
├── docs/                         Proposal, plan, standards, and API collection
└── README.md
```

## Technology Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Frontend state | TanStack Query, Zustand |
| Frontend routing | React Router |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Real-time | Socket.io and socket.io-client |
| Authentication | JWT access and refresh tokens, bcrypt |
| Media | Cloudinary |
| Payments | Chapa |
| Quality | TypeScript, ESLint, Prettier |
| API testing | Postman collection and PowerShell test scripts |

## Local Development

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
- A database named `campus_marketplace`
- Cloudinary credentials for hosted image uploads (optional during basic development)
- Chapa credentials for payment flows (optional)

### 1. Install dependencies

Run each package install from its own directory:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and set the required values:

```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campus_marketplace"
JWT_ACCESS_SECRET="replace-with-a-long-access-secret"
JWT_REFRESH_SECRET="replace-with-a-long-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
FRONTEND_URL="http://localhost:5173"
PORT="5000"
NODE_ENV="development"
```

Optional integrations use these additional variables:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CHAPA_SECRET_KEY=
CHAPA_WEBHOOK_SECRET=
EMAIL_FROM="noreply@campusmarketplace.com"
RESEND_API_KEY=
```

### 3. Prepare the database

```powershell
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

The seed command creates the configured demonstration data. Prisma Studio is
available for inspecting the database:

```powershell
npm run prisma:studio
```

### 4. Configure the frontend

Copy `frontend/.env.example` to `frontend/.env`:

```dotenv
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_USE_MOCK_API=false
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

Set `VITE_USE_MOCK_API=true` only when developing against the frontend mock
handlers instead of the live backend.

### 5. Start the application

Open two terminals:

```powershell
# Terminal 1
cd backend
npm run dev
```

```powershell
# Terminal 2
cd frontend
npm run dev
```

Then open `http://localhost:5173`. The API runs at `http://localhost:5000`.
Health checks are available at `/health`, `/api/health`, and `/api/test`.

## API Overview

All protected endpoints use:

```http
Authorization: Bearer <accessToken>
```

| Module | Base path | Available operations |
| --- | --- | --- |
| Auth | `/api/auth` | Register, login, refresh, verify email |
| Users | `/api/users` | Read and update the current profile |
| Universities | `/api/universities` | List universities and read one university |
| Listings | `/api/listings` | Create, browse, search, update, delete |
| Tutoring | `/api/tutors`, `/api/bookings` | Manage tutor profiles and bookings |
| Chat | `/api/conversations` | Create conversations, read history, send messages |
| Reports | `/api/reports` | Create reports and view the current user's reports |
| Reviews | `/api/reviews` | Create and read user reviews |
| Payments | `/api/payments` | Initiate, verify through webhook, and view transactions |
| Uploads | `/api/uploads` | Upload listing images |
| Admin | `/api/admin` | Manage users, bans, listings, reports, and universities |

The complete request and response contract is in
[`docs/api-contract.md`](docs/api-contract.md), and an importable Postman
collection is in [`docs/api-collection.postman.json`](docs/api-collection.postman.json).

## Security and Data Boundaries

- Public registration assigns the `STUDENT` role; administrative roles are not
  self-selectable.
- JWT claims identify the user, university, and role.
- Every authenticated API request rechecks that the user still exists and is
  not banned, so an active token cannot outlive a ban.
- Chat socket handshakes apply the same ban check before joining a socket session.
- University admins are restricted to their own university.
- Super admins are the only role allowed to manage platform-wide university data.
- Passwords are stored as bcrypt hashes, never plaintext.
- Login, refresh, and protected routes reject banned accounts.

## Available Scripts

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with nodemon and tsx |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Create/apply a development migration |
| `npm run prisma:seed` | Insert seed data |
| `npm run prisma:studio` | Open Prisma Studio |

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Frontend Routes

| Route | Access | Screen |
| --- | --- | --- |
| `/` | Public | Marketplace home |
| `/login` | Guest | Sign in |
| `/register` | Guest | Create account |
| `/dashboard` | Student | Dashboard |
| `/listings` | Student | Browse listings |
| `/listings/new` | Student | Create listing |
| `/listings/:id` | Student | Listing details |
| `/listings/:id/edit` | Student | Edit listing |
| `/dashboard/listings` | Student | My listings |
| `/profile` | Authenticated | Profile |
| `/chat` | Authenticated | Conversations |
| `/tutoring` | Authenticated | Tutors and bookings |
| `/admin` | Admin | Moderation panel |

## Testing and Verification

The backend includes PowerShell smoke-test scripts:

```powershell
cd backend
./test-auth.ps1
./test-all-features.ps1
```

For a manual ban check, authenticate a user, ban that user from the admin panel,
then make another protected request with the old access token. The API should
return `401`, the frontend should clear the persisted session, and the user
should be redirected to `/login`.

## Project Documentation

- [`docs/proposal.md`](docs/proposal.md) - Problem statement, goals, scope, and team context
- [`docs/plan.md`](docs/plan.md) - Architecture, phased delivery plan, and ownership
- [`docs/api-contract.md`](docs/api-contract.md) - REST and WebSocket contract
- [`docs/standards.md`](docs/standards.md) - Coding, Git, and collaboration standards
- [`docs/api-collection.postman.json`](docs/api-collection.postman.json) - API request collection

## Team

Campus Marketplace & Resource Hub was developed by:

- Saleamlak Setie
- Rufta Gaiem
- Tesfaye Tilahun
- Robin Mulugeta
- Yared Teweldebirhan

The project was designed as a collaborative full-stack portfolio application,
with separate frontend and backend tracks and a planned integration workflow.

## License

No license has been declared for this repository yet.
