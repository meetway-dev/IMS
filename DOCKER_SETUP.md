# Docker Setup Guide

This guide provides comprehensive instructions for setting up and managing the IMS application using Docker.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Scaling](#scaling)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ims

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Change JWT secrets in production!
```

### 2. Start Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| API Docs | http://localhost:3000/docs |
| Database | localhost:5432 |
| Redis | localhost:6379 |

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network                        │
│                      ims-network                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐ │
│  │   Frontend   │    │     API      │    │   Redis     │ │
│  │  (Next.js)   │───▶│  (NestJS)    │───▶│   (Cache)   │ │
│  │   Port:3001  │    │   Port:3000  │    │   Port:6379 │ │
│  └──────────────┘    └──────┬───────┘    └─────────────┘ │
│                             │                               │
│                             ▼                               │
│                      ┌──────────────┐                       │
│                      │  PostgreSQL  │                       │
│                      │   Port:5432  │                       │
│                      └──────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Features

- **Multi-stage builds** for optimized image sizes
- **Health checks** for automatic service monitoring
- **Resource limits** for predictable performance
- **Custom networking** for secure inter-service communication
- **Persistent volumes** for data durability
- **Non-root users** for enhanced security
- **Graceful shutdowns** with proper signal handling

## Services

### Database (PostgreSQL)

**Image:** `postgres:17-alpine`

**Configuration:**
- Port: 5432
- User: `ims`
- Password: `ims`
- Database: `ims`

**Features:**
- Automatic health checks
- Persistent data volume
- Custom initialization scripts
- UTF-8 encoding

**Access:**
```bash
# Connect to database
docker-compose exec db psql -U ims -d ims

# Backup database
docker-compose exec db pg_dump -U ims ims > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U ims ims
```

### Redis Cache

**Image:** `redis:7-alpine`

**Configuration:**
- Port: 6379
- Max memory: 256MB
- Eviction policy: allkeys-lru
- AOF persistence enabled

**Features:**
- Session management
- API response caching
- Rate limiting
- Health monitoring

**Access:**
```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# Monitor commands
docker-compose exec redis redis-cli monitor

# Check memory usage
docker-compose exec redis redis-cli info memory
```

### Backend API (NestJS)

**Image:** Custom build from `api/Dockerfile`

**Configuration:**
- Port: 3000
- Node.js: 20-alpine
- Multi-stage build
- Non-root user

**Features:**
- Prisma ORM
- JWT authentication
- RBAC (Role-Based Access Control)
- Health checks
- Automatic migrations

**Access:**
```bash
# View logs
docker-compose logs -f api

# Execute commands
docker-compose exec api sh

# Restart service
docker-compose restart api
```

### Frontend (Next.js)

**Image:** Custom build from `frontend/Dockerfile`

**Configuration:**
- Port: 3001
- Node.js: 20-alpine
- Standalone mode
- SWC minification

**Features:**
- Server-side rendering
- Static optimization
- Image optimization
- Health checks

**Access:**
```bash
# View logs
docker-compose logs -f frontend

# Execute commands
docker-compose exec frontend sh

# Restart service
docker-compose restart frontend
```

### Nginx (Production Only)

**Image:** `nginx:alpine`

**Configuration:**
- HTTP Port: 80
- HTTPS Port: 443
- Reverse proxy
- Rate limiting
- Gzip compression

**Features:**
- SSL/TLS termination
- Load balancing
- Static file serving
- Security headers

**Access:**
```bash
# Start with production profile
docker-compose --profile production up -d

# View Nginx logs
docker-compose logs -f nginx

# Test configuration
docker-compose exec nginx nginx -t
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
POSTGRES_USER=ims
POSTGRES_PASSWORD=ims
POSTGRES_DB=ims
DB_PORT=5432

# Redis
REDIS_PORT=6379

# API
API_PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001

# JWT (IMPORTANT: Change in production!)
JWT_ACCESS_SECRET=change-me-please-use-32-chars-min-16
JWT_REFRESH_SECRET=change-me-please-use-32-chars-min-16
JWT_ACCESS_TTL_SECONDS=900
JWT_REFRESH_TTL_DAYS=30

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info

# Nginx (Production)
NGINX_PORT=80
NGINX_SSL_PORT=443
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32

# Generate SSL certificates (for production)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem
```

## Development Workflow

### Local Development with Docker

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build api

# Run commands in container
docker-compose exec api npm run test
docker-compose exec frontend npm run lint
```

### Hot Reload Development

For development with hot reload, run services locally:

```bash
# Terminal 1: Start database and Redis
docker-compose up -d db redis

# Terminal 2: Start API locally
cd api
npm install
npm run start:dev

# Terminal 3: Start frontend locally
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# Create migration
docker-compose exec api npx prisma migrate dev --name migration_name

# Apply migrations (production)
docker-compose exec api npx prisma migrate deploy

# Reset database (WARNING: deletes data)
docker-compose exec api npx prisma migrate reset

# Open Prisma Studio
docker-compose exec api npx prisma studio
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Update all environment variables
- [ ] Generate secure JWT secrets
- [ ] Configure SSL/TLS certificates
- [ ] Set up proper CORS origins
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Review resource limits
- [ ] Test health checks
- [ ] Configure logging
- [ ] Set up CI/CD pipeline

### Deployment Steps

```bash
# 1. Prepare environment
cp .env.example .env
# Edit .env with production values

# 2. Build and start services
docker-compose --profile production up -d --build

# 3. Verify deployment
docker-compose ps
docker-compose logs -f

# 4. Test health endpoints
curl http://localhost/health
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3001

# 5. Check resource usage
docker stats
```

### Production Configuration

#### Resource Limits

```yaml
# In docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

#### Logging

```yaml
# In docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "50m"
    max-file: "10"
```

#### Health Checks

```yaml
# In docker-compose.yml
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health/live || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

## Scaling

### Horizontal Scaling

```bash
# Scale API instances
docker-compose up -d --scale api=3

# Scale frontend instances
docker-compose up -d --scale frontend=2

# Scale both
docker-compose up -d --scale api=3 --scale frontend=2
```

### Load Balancing

With Nginx in production mode, requests are automatically distributed across scaled instances.

### Database Scaling

For database scaling, consider:
- Read replicas
- Connection pooling (PgBouncer)
- Database sharding
- Caching layer (Redis)

## Monitoring

### Container Monitoring

```bash
# View resource usage
docker stats

# View container details
docker inspect ims-api

# Check health status
docker inspect --format='{{.State.Health.Status}}' ims-api
```

### Log Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api

# View last 100 lines
docker-compose logs --tail=100

# Follow logs with timestamps
docker-compose logs -f --timestamps
```

### Health Monitoring

```bash
# Check all service health
docker-compose ps

# Check specific service
docker-compose ps api

# Manual health check
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3001
curl http://localhost/health
```

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check resource usage
docker stats

# Restart service
docker-compose restart <service-name>

# Rebuild service
docker-compose up -d --build <service-name>
```

#### Database Connection Issues

```bash
# Check database health
docker-compose exec db pg_isready -U ims

# Verify network
docker network inspect ims-network

# Check environment variables
docker-compose exec api env | grep DATABASE

# Test connection
docker-compose exec api sh
# Inside container:
# nc -zv db 5432
```

#### Build Failures

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check disk space
docker system df

# Clean up unused images
docker image prune -a
```

#### Port Conflicts

```bash
# Check what's using the port
netstat -ano | findstr :3000

# Change port in .env
API_PORT=3001

# Or stop conflicting service
docker-compose down
```

#### Health Check Failures

```bash
# Check health status
docker inspect --format='{{json .State.Health}}' ims-api

# Manual health check
curl http://localhost:3000/api/v1/health/live

# View health check logs
docker-compose logs api | grep health

# Increase timeout in docker-compose.yml
healthcheck:
  timeout: 30s
  retries: 5
```

### Performance Issues

```bash
# Check resource usage
docker stats

# View container limits
docker inspect ims-api | grep -A 10 Resources

# Increase limits in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

## Best Practices

### Security

1. **Always use non-root users in containers**
2. **Rotate secrets regularly**
3. **Use HTTPS in production**
4. **Implement rate limiting**
5. **Keep images updated**
6. **Scan images for vulnerabilities**
7. **Use secrets management**
8. **Enable audit logging**

### Performance

1. **Use multi-stage builds**
2. **Leverage layer caching**
3. **Optimize .dockerignore files**
4. **Use Alpine Linux images**
5. **Set appropriate resource limits**
6. **Enable health checks**
7. **Use persistent volumes for data**
8. **Implement caching strategies**

### Operations

1. **Use version control for Docker files**
2. **Document all configurations**
3. **Implement CI/CD pipelines**
4. **Monitor container health**
5. **Set up automated backups**
6. **Use logging aggregation**
7. **Implement disaster recovery**
8. **Regular security audits**

### Development

1. **Use Docker for local development**
2. **Separate dev and prod configurations**
3. **Use environment-specific variables**
4. **Test in Docker before deployment**
5. **Use docker-compose for orchestration**
6. **Keep images small**
7. **Use health checks**
8. **Document all changes**

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## Support

For issues and questions:
- Open an issue on GitHub
- Check the main README
- Review troubleshooting section
- Consult documentation
