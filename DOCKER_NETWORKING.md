# Docker Networking & Inter-Container Communication Guide

This document explains how services communicate with each other in the containerized setup.

## Docker Network

All services are connected via the default Docker Compose network: `containerization-frontend-backend-db_default`

This network is automatically created when you run `docker compose up`.

## Service-to-Service Communication

### 1. Frontend → Backend

**Location**: Frontend browser or Node.js environment

```
Browser (on host)
    ↓
http://localhost:5000  (from your computer)
    ↓
Docker Port Mapping (5000:5000)
    ↓
Backend Container (listening on 0.0.0.0:5000)
```

**Configuration in docker-compose.yml:**
```yaml
frontend:
  environment:
    VITE_API_BASE_URL: http://localhost:5000
    VITE_SOCKET_URL: http://localhost:5000
```

**Code example (frontend/src/lib/api-client.ts):**
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, requestInit);
  // ...
}
```

✅ **This works because**: 
- Frontend runs in browser on host machine
- Uses localhost:5000 which Docker maps to backend container
- Backend container listens on all interfaces (0.0.0.0:5000)

### 2. Backend → Database

**Location**: Backend Node.js process inside container

```
Backend Container (Node.js)
    ↓
DATABASE_URL=postgresql://db:5432/...
    ↓
Docker DNS Resolution: "db" → 172.20.0.2 (db container IP)
    ↓
Database Container (PostgreSQL listening on 5432)
```

**Configuration in docker-compose.yml:**
```yaml
backend:
  environment:
    DATABASE_URL: postgresql://postgres:postgres@db:5432/campus_marketplace?schema=public
  depends_on:
    db:
      condition: service_healthy
```

**Code example (backend/src/lib/prisma.ts):**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Reads DATABASE_URL from environment
  // PostgreSQL client connects to "db:5432" via Docker DNS
});
```

✅ **This works because**:
- Backend container can resolve "db" to database container's IP
- Docker Compose automatically sets up DNS for service names
- Database listens on port 5432 in its container

### 3. Frontend → Database (Direct) - NOT RECOMMENDED

**Why you shouldn't do this:**
```
Frontend (browser)
    ↓
PostgreSQL protocol (5432) - NOT HTTP-compatible
    ↗ Frontend runs in browser which only speaks HTTP/WebSocket
    ✗ SQL Injection risks
    ✗ Database credentials exposed in browser code
```

**Solution**: Always route through Backend API
```
Frontend (HTTP requests)
    ↓
Backend API (HTTP)
    ↓
Backend → Database (PostgreSQL protocol)
```

## Service Discovery

### Service Names as Hostnames

Inside Docker containers, service names resolve to container IPs:

```bash
# From backend container
docker compose exec backend ping db
# PING db (172.20.0.2) 56 data bytes
# 64 bytes from 172.20.0.2: seq=0 ttl=64 time=0.1 ms

# From frontend container
docker compose exec frontend wget -O- http://backend:5000/health
# Will successfully fetch from backend
```

### DNS Resolution

Docker Compose embeds DNS servers in containers:

```bash
# View nameservers in container
docker compose exec backend cat /etc/resolv.conf
# nameserver 127.0.0.11  (embedded DNS server)
```

The embedded DNS resolver:
- Maps service names (db, backend, frontend) to their IPs
- Works instantly once containers start
- Survives container restarts (IPs might change, names stay same)

## Port Mapping vs Service Names

### From Host Machine (Your Computer)

```
http://localhost:5000   ← Use localhost with host port
http://localhost:5173   ← Not the container name
http://localhost:5432   ← Direct PostgreSQL access
```

Port mapping in docker-compose.yml:
```yaml
backend:
  ports:
    - "5000:5000"      # Host port : Container port
```

### From Inside Containers

```
Backend container → http://db:5432      ← Use service name, container port
Frontend container → http://backend:5000 ← Use service name, container port
From browser → http://localhost:5000     ← Use localhost, host port
```

## Health Checks

The database has a health check configured:

```yaml
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d campus_marketplace"]
    interval: 10s
    timeout: 5s
    retries: 5
```

The backend waits for it:

```yaml
backend:
  depends_on:
    db:
      condition: service_healthy  # Waits for health check to pass
```

### Checking Health Manually

```bash
# View health status
docker compose ps
# Shows "healthy" or "starting" for db

# Run health check manually
docker compose exec db pg_isready -U postgres -d campus_marketplace
# Exit code 0 = success, 1-3 = failure

# View detailed logs
docker compose logs db | grep -i health
```

## Common Communication Issues & Fixes

### Issue 1: "Frontend can't reach backend"

**Symptoms:**
```
GET http://localhost:5000/api/auth → Error: Network error
```

**Causes & Fixes:**

1. **Backend container not running**
   ```bash
   docker compose ps
   # Check if backend has status "Up"
   ```

2. **Wrong BASE_URL in frontend**
   ```bash
   # Check VITE_API_BASE_URL
   docker compose exec frontend env | grep VITE_API_BASE_URL
   # Should be http://localhost:5000
   ```

3. **Port 5000 not forwarded**
   ```bash
   # Edit docker-compose.yml
   # Ensure backend has: ports: ["5000:5000"]
   ```

4. **CORS not configured**
   ```bash
   # Check backend CORS settings
   docker compose logs backend | grep cors
   # Should show: origin: http://localhost:5173
   ```

**Solution:**
```bash
# 1. Verify backend is running
docker compose up -d backend

# 2. Test from frontend container
docker compose exec frontend curl http://backend:5000/health

# 3. Test from host
curl http://localhost:5000/health

# 4. View logs
docker compose logs -f backend
```

### Issue 2: "Backend can't reach database"

**Symptoms:**
```
Error: connect ECONNREFUSED db:5432
```

**Causes & Fixes:**

1. **Database container not running**
   ```bash
   docker compose ps
   docker compose up -d db
   ```

2. **Database not healthy yet**
   ```bash
   # Wait for healthy status
   docker compose ps
   # Status should be "Healthy", not "starting"
   ```

3. **DATABASE_URL uses wrong host**
   ```bash
   docker compose exec backend env | grep DATABASE_URL
   # Should contain: "db:5432" not "localhost:5432"
   ```

**Solution:**
```bash
# 1. Start database and wait for health
docker compose up -d db

# 2. Wait 10-20 seconds for PostgreSQL to start
sleep 20

# 3. Verify database is responding
docker compose exec db pg_isready -U postgres -d campus_marketplace

# 4. Then start backend
docker compose up -d backend
```

### Issue 3: "Containers can't resolve service names"

**Symptoms:**
```
Error: getaddrinfo ENOTFOUND db
Error: getaddrinfo ENOTFOUND backend
```

**Causes & Fixes:**

1. **Network not created**
   ```bash
   docker network ls | grep containerization
   # Should show the compose network
   ```

2. **Services on different networks**
   ```bash
   # Verify all services are on same network
   docker network inspect containerization-frontend-backend-db_default
   # Should list all 3 containers
   ```

**Solution:**
```bash
# Recreate the network
docker compose down -v
docker compose up -d

# Verify connectivity
docker compose exec backend ping db
docker compose exec frontend wget -O- http://backend:5000/health
```

## Testing Connectivity

### From Frontend Container

```bash
# Test backend connectivity
docker compose exec frontend wget -O- http://backend:5000/health

# Expected response:
# {"status":"ok","environment":"development","timestamp":"2026-08-21T08:15:23.123Z"}
```

### From Backend Container

```bash
# Test database connectivity
docker compose exec backend psql -h db -U postgres -d campus_marketplace -c "SELECT 1"

# Expected output:
#  ?column? 
# ----------
#         1
# (1 row)
```

### From Host Machine

```bash
# Test frontend
curl http://localhost:5173

# Test backend
curl http://localhost:5000/health

# Test database (with psql)
psql -h localhost -U postgres -d campus_marketplace -c "SELECT 1"
```

## Environment Variables Reference

### For Backend to Find Database

```yaml
DATABASE_URL=postgresql://postgres:postgres@db:5432/campus_marketplace?schema=public
                                                  ↑
                                    Service name in Docker network
```

### For Frontend to Find Backend

```yaml
VITE_API_BASE_URL=http://localhost:5000
                       ↑
         Host port as seen from browser/host machine
```

### Key Differences

| Context | Backend | Frontend | Database |
|---------|---------|----------|----------|
| Backend to DB | `db:5432` | N/A | N/A |
| Frontend to Backend | N/A | `localhost:5000` | N/A |
| Host to Services | `localhost:5000` | `localhost:5173` | `localhost:5432` |

## Advanced: Custom Networks

For more complex setups, create explicit networks:

```yaml
networks:
  backend-network:
    driver: bridge
  frontend-network:
    driver: bridge

services:
  backend:
    networks:
      - backend-network
  
  db:
    networks:
      - backend-network
  
  frontend:
    networks:
      - frontend-network
```

This is **not needed** for the current setup (single default network works fine).

## Conclusion

- ✅ Frontend → Backend: Use `http://localhost:5000` (from browser)
- ✅ Backend → Database: Use `db:5432` (Docker service name)
- ✅ Host → Services: Use `localhost:PORT`
- ✅ Container → Container: Use `service-name:PORT`
- ❌ Frontend → Database: Avoid direct connections
