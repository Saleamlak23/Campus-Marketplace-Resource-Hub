# Docker Containerization Setup

This guide walks through the complete containerized deployment of the Campus Marketplace application with three separate containers: **frontend**, **backend**, and **database** (PostgreSQL).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│  (containerization-frontend-backend-db_default)             │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │   Frontend       │  │   Backend        │  │ PostgreSQL │ │
│  │   (React/Vite)   │  │  (Node/Express)  │  │  Database  │ │
│  │                  │  │                  │  │            │ │
│  │  Port: 5173      │  │  Port: 5000      │  │  Port:5432 │ │
│  │  Host: 0.0.0.0   │  │  Host: 0.0.0.0   │  │            │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│         │                      │                     │        │
│         └──────────┬───────────┴─────────────────────┘        │
│                    │                                           │
└────────────────────┼───────────────────────────────────────────┘
                     │
                localhost:5173, localhost:5000, localhost:5432
                   (Host Machine)
```

### Service Details

| Service | Container | Image | Port | Role |
|---------|-----------|-------|------|------|
| **db** | campus-marketplace-db | postgres:16-alpine | 5432 | PostgreSQL database |
| **backend** | campus-marketplace-backend | node:20-alpine | 5000 | Express API server |
| **frontend** | campus-marketplace-frontend | node:20-alpine | 5173 | React/Vite dev server |

## Quick Start

### Prerequisites

- **Docker** (v24+)
- **Docker Compose** (v2+)
- Windows users: Docker Desktop with WSL 2 backend recommended

### Starting the Stack

```bash
# Build images and start all services
docker compose up --build

# Or start without rebuilding (after first run)
docker compose up

# Start in detached mode (background)
docker compose up -d
```

**Expected output:**
```
[+] Running 3/3
 ✔ Container campus-marketplace-db       Healthy ...
 ✔ Container campus-marketplace-backend  Started ...
 ✔ Container campus-marketplace-frontend Started ...
```

### Accessing the Application

Once all containers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Database**: postgres://postgres:postgres@localhost:5432/campus_marketplace

### Stopping the Stack

```bash
# Stop all services
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove containers + volumes
docker compose down -v
```

## Configuration Details

### Environment Variables

#### Backend (`backend` service)

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/campus_marketplace?schema=public
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
EMAIL_FROM=noreply@campusmarketplace.com
```

**Key points:**
- `DATABASE_URL` uses the service name `db` as hostname (Docker DNS)
- `FRONTEND_URL` points to the frontend container for CORS

#### Frontend (`frontend` service)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_USE_MOCK_API=false
VITE_CLOUDINARY_CLOUD_NAME=""
VITE_CLOUDINARY_UPLOAD_PRESET=""
```

**Key points:**
- `VITE_API_BASE_URL` and `VITE_SOCKET_URL` point to backend on `localhost:5000` (from browser perspective)
- Set Cloudinary credentials for image upload features

#### Database (`db` service)

```env
POSTGRES_DB=campus_marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### Volume Management

Volumes persist data between container restarts:

| Volume | Mount Path | Purpose |
|--------|-----------|---------|
| `postgres_data` | `/var/lib/postgresql/data` | PostgreSQL data persistence |
| `./backend` | `/usr/src/app` | Backend source code (dev mode) |
| `./frontend` | `/app` | Frontend source code (dev mode) |

Node modules are mounted as anonymous volumes to optimize performance:
- `/usr/src/app/node_modules` (backend)
- `/app/node_modules` (frontend)

## Networking

### Inter-Container Communication

Services communicate by **service name** within the Docker network:

- **Frontend → Backend**: `http://backend:5000` (inside container)
- **Backend → Database**: `postgresql://db:5432` (inside container)

### Host Communication

From your machine (localhost):
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Database: `localhost:5432`

### CORS Configuration

The backend is configured to accept requests from:
```
Origin: http://localhost:5173
```

If you change the frontend port, update `docker-compose.yml`:
```yaml
environment:
  FRONTEND_URL: http://localhost:YOUR_NEW_PORT
```

## Database Setup

### Initial Setup

On first run, the backend container:
1. Generates Prisma client
2. Runs pending migrations
3. Starts in development mode with hot reload

```bash
# View the process
docker compose logs backend
```

### Accessing the Database

#### Via psql (CLI)

```bash
# From host machine
psql -h localhost -U postgres -d campus_marketplace
```

#### Via Prisma Studio

```bash
# Open Prisma Studio GUI
docker compose exec backend npx prisma studio
# Then visit http://localhost:5555
```

#### Via Docker

```bash
# Run psql inside the db container
docker compose exec db psql -U postgres -d campus_marketplace

# Example queries
\dt                    # List all tables
SELECT * FROM users;   # Query users
\q                     # Exit
```

### Seeding the Database

```bash
# Run the seed script
docker compose exec backend npm run prisma:seed

# View logs
docker compose logs backend
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload during development:

- **Frontend**: Edit files in `./frontend/src/` → changes appear instantly
- **Backend**: Edit files in `./backend/src/` → nodemon restarts the server

### Viewing Logs

```bash
# All services
docker compose logs

# Specific service (follow in real-time)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Last 50 lines
docker compose logs --tail=50 backend
```

### Rebuilding Services

```bash
# Rebuild all images
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache backend

# Apply changes and restart
docker compose up -d --no-deps --build backend
```

### Executing Commands in Containers

```bash
# Run arbitrary commands
docker compose exec backend npm list
docker compose exec frontend npm run lint
docker compose exec db psql -U postgres -d campus_marketplace

# Interactive shell
docker compose exec -it backend sh
docker compose exec -it frontend sh
docker compose exec -it db bash
```

## Troubleshooting

### Backend won't start (stuck on migrations)

```bash
# Check backend logs
docker compose logs backend

# If stuck, reset the database
docker compose down -v
docker compose up -d

# Or manually fix the migration
docker compose exec backend npx prisma migrate resolve --rolled-back migration_name
```

### Frontend can't reach backend

1. Verify backend is running:
   ```bash
   docker compose exec frontend curl http://backend:5000/health
   ```

2. Check CORS settings in `backend/src/app.ts`:
   ```typescript
   cors({ origin: config.frontendUrl, credentials: true })
   ```

3. Verify `FRONTEND_URL` in docker-compose.yml matches your frontend URL

### Database connection refused

```bash
# Verify database is healthy
docker compose ps

# Check if db is ready
docker compose exec db pg_isready -U postgres -d campus_marketplace

# View database logs
docker compose logs db

# Reset database
docker compose down -v
docker compose up -d db
# Wait for healthy status, then start other services
docker compose up -d
```

### Port conflicts (address already in use)

```bash
# Find what's using a port
netstat -ano | findstr :5173   # Windows
lsof -i :5173                  # macOS/Linux

# Change port in docker-compose.yml
# From: "5173:5173"
# To:   "3000:5173"
# Then restart
docker compose down && docker compose up -d
```

### Out of disk space

```bash
# Clean up unused Docker images/volumes
docker system prune

# Remove all stopped containers and dangling volumes
docker system prune -a --volumes
```

## Production Considerations

This setup is optimized for **local development**. For production:

1. **Use production-grade images** instead of node:alpine
2. **Remove volume mounts** for application code (use COPY instead)
3. **Set NODE_ENV=production** in backend
4. **Use environment files** (`.env.production`) instead of hardcoding
5. **Disable hot reload** and run `npm run build` before starting
6. **Use managed database** (AWS RDS, DigitalOcean, etc.) instead of containerized Postgres
7. **Add reverse proxy** (nginx) for routing and SSL termination
8. **Implement health checks** and restart policies
9. **Use secrets management** for sensitive data (API keys, JWT secrets)
10. **Multi-stage builds** to reduce image sizes

Example production docker-compose.yml pattern:
```yaml
services:
  backend:
    build:
      context: ./backend
      target: production  # Multi-stage build target
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}  # From .env file
    restart: always
    # Remove volumes - use COPY in Dockerfile instead
```

## Docker Files Overview

### Dockerfile (Backend)
- **Base**: node:20-alpine (lightweight, ~150MB)
- **Process**: Copy package.json → npm install → Copy source → Run migrations → Start dev server
- **Ports**: 5000

### Dockerfile (Frontend)
- **Base**: node:20-alpine
- **Process**: Copy package.json → npm install → Copy source → Start Vite dev server
- **Ports**: 5173

### .dockerignore Files
Excludes unnecessary files from Docker build context:
- `node_modules` (rebuilt in container)
- `.git` (unnecessary in image)
- `.env` (use compose env vars instead)

## Common Tasks

### Add a new npm package

```bash
# Backend
docker compose exec backend npm install package-name
docker compose up -d --no-deps --build backend  # Rebuild if needed

# Frontend
docker compose exec frontend npm install package-name
docker compose up -d --no-deps --build frontend
```

### Update environment variables

1. Edit `docker-compose.yml`
2. Restart the service:
   ```bash
   docker compose up -d backend  # or frontend
   ```

### Run migrations

```bash
# Create and run new migration
docker compose exec backend npx prisma migrate dev --name migration_name

# Apply pending migrations
docker compose exec backend npx prisma migrate deploy

# Reset database and re-run all migrations
docker compose exec backend npx prisma migrate reset
```

### View database schema

```bash
# Open Prisma Studio GUI
docker compose exec backend npx prisma studio
# Visit http://localhost:5555 in browser

# Or view schema.prisma directly
cat backend/prisma/schema.prisma
```

## Performance Tips

1. **Use `.dockerignore`** to exclude unnecessary files
2. **Layer caching**: Put stable commands (install) before changing code
3. **Anonymous volumes** for `node_modules` improve performance
4. **Bind mounts** for source code enable hot reload
5. **Alpine images** reduce image size (~40% smaller)
6. **Multi-stage builds** (for production) reduce final image size

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Vite Development Server](https://vitejs.dev/guide/)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)
