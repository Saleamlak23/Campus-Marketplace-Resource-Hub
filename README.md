# Campus Marketplace & Resource Hubss

A full-stack web platform for university students to buy and sell textbooks,
find tutors, and share past exam papers — built to support multiple
universities from day one.

## Structure
- `frontend/` — React + TypeScript + Vite + Tailwind
- `backend/` — Node.js + Express + PostgreSQL + Prisma
- `docs/` — project plan, proposal, ERD, API contract/Postman collection

See `docs/plan.md` for the full project plan, folder structure rationale,
and task organization strategy, and `docs/standards.md` for team coding
and Git conventions.

## Getting Started
1. Clone the repo
2. Set up the backend: see `backend/README.md` (to be added)
3. Set up the frontend: see `frontend/README.md` (to be added)

## Docker Containerization

This project is fully containerized with three services running in separate Docker containers:

### Services
- **Frontend** (React + Vite) — Port 5173
- **Backend** (Node + Express + Socket.io) — Port 5000
- **Database** (PostgreSQL) — Port 5432

### Quick Start

```bash
# Build and start all services
docker compose up --build

# Or just start (if already built)
docker compose up

# Stop everything
docker compose down
```

Once running:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Documentation

- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** — Complete Docker guide with architecture, troubleshooting, and production tips
- **[DOCKER_NETWORKING.md](./DOCKER_NETWORKING.md)** — How containers communicate with each other
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — Command cheat sheet for everyday tasks

### How It Works

```
Browser (Your Computer)
    ↓
http://localhost:5173 ← Frontend Container
    ↓
http://localhost:5000 ← Backend Container
    ↓
postgresql://db:5432 ← Database Container (PostgreSQL)
```

Inside the Docker network:
- Frontend calls `http://backend:5000` → Backend
- Backend calls `postgresql://db:5432` → Database
- All containers share the same Docker network for inter-service communication
