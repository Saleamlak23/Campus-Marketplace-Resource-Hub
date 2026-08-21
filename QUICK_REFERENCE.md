# Docker Quick Reference

## Start Everything

```bash
docker compose up --build
```

Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/health
- Database: localhost:5432

---

## Essential Commands

| Command | What it does |
|---------|-------------|
| `docker compose up` | Start all services |
| `docker compose up -d` | Start in background |
| `docker compose down` | Stop and remove containers |
| `docker compose down -v` | Stop and remove everything (including data) |
| `docker compose logs -f` | View live logs |
| `docker compose ps` | List running containers |
| `docker compose build` | Rebuild images |

---

## Service-Specific Commands

### Backend
```bash
# View logs
docker compose logs -f backend

# Run migrations
docker compose exec backend npx prisma migrate dev

# Open Prisma Studio
docker compose exec backend npx prisma studio

# Run npm command
docker compose exec backend npm list
```

### Frontend
```bash
# View logs
docker compose logs -f frontend

# Run linter
docker compose exec frontend npm run lint

# Install package
docker compose exec frontend npm install package-name
```

### Database
```bash
# Connect with psql
docker compose exec db psql -U postgres -d campus_marketplace

# Run query
docker compose exec db psql -U postgres -d campus_marketplace -c "SELECT * FROM users LIMIT 5;"

# Check if ready
docker compose exec db pg_isready -U postgres -d campus_marketplace
```

---

## Troubleshooting

### Services won't start
```bash
# Check what's running
docker compose ps

# View errors
docker compose logs

# Start fresh
docker compose down -v
docker compose up --build
```

### Backend stuck on migrations
```bash
# Check what's happening
docker compose logs backend

# Reset database
docker compose down -v
docker compose up -d
```

### Can't connect to database
```bash
# Verify it's healthy
docker compose ps

# Test connection
docker compose exec db pg_isready -U postgres -d campus_marketplace

# View logs
docker compose logs db
```

### Frontend can't reach backend
```bash
# Test from frontend container
docker compose exec frontend curl http://backend:5000/health

# Test from host
curl http://localhost:5000/health

# Check backend logs
docker compose logs backend
```

---

## Port Mapping

| Service | Host Port | Container Port | URL |
|---------|-----------|-----------------|-----|
| Frontend | 5173 | 5173 | http://localhost:5173 |
| Backend | 5000 | 5000 | http://localhost:5000 |
| Database | 5432 | 5432 | localhost:5432 |

---

## Development Workflow

1. **Make code changes** → Files are auto-synced (volumes)
2. **Frontend changes** → Auto-reload in browser (Vite)
3. **Backend changes** → Nodemon restarts server automatically
4. **Database changes** → Edit schema in `backend/prisma/schema.prisma`, then run migration

---

## Database Credentials

```
Host: localhost (from host) or db (from containers)
Port: 5432
User: postgres
Password: postgres
Database: campus_marketplace
```

---

## Environment Files

- Backend: `backend/.env`
- Frontend: `frontend/.env.local`
- Template: `.env.docker` (in root)

---

## Key Files

```
.
├── docker-compose.yml          # Main configuration
├── DOCKER_SETUP.md             # Complete guide
├── DOCKER_NETWORKING.md        # Networking guide
├── backend/Dockerfile          # Backend image
├── frontend/Dockerfile         # Frontend image
├── backend/.dockerignore       # Files to exclude
└── frontend/.dockerignore      # Files to exclude
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :5173` to find what's using it, or change port in docker-compose.yml |
| Can't reach localhost:5000 | Run `docker compose up` and wait for "Service running" message |
| Database won't start | Check disk space: `docker system prune` |
| "Service healthy" never completes | Wait 30s, check `docker compose logs db` |
| Hot reload not working | Restart container: `docker compose restart backend` |

---

## Network Map

```
Your Computer
    ↓
localhost:5173 (Frontend)
    ↓
localhost:5000 (Backend)
    ↓
localhost:5432 (Database)

Inside Docker Network
    ↓
frontend:5173 (calls backend:5000)
    ↓
backend:5000 (calls db:5432)
    ↓
db:5432
```

---

## When in Doubt

```bash
# This usually fixes things:
docker compose down -v
docker compose up --build
```

## Documentation Files

- **DOCKER_SETUP.md** - Complete setup & reference guide
- **DOCKER_NETWORKING.md** - How services communicate
- **QUICK_REFERENCE.md** - This file!
