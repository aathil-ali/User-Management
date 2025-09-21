# Docker Setup for User Management System

This directory contains Docker configurations for both **local development** and **production** deployment.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 8000, 5432, and 27017 available

### Start the Full Stack
```bash
# From the project root directory
./infrastructure/scripts/dev.sh up
```

This will start:
- **Frontend**: React app at http://localhost:3000
- **Backend**: API server at http://localhost:8000  
- **API Docs**: Swagger UI at http://localhost:8000/api-docs
- **PostgreSQL**: Database at localhost:5432
- **MongoDB**: Database at localhost:27017

### Useful Commands
```bash
# View all logs
./infrastructure/scripts/dev.sh logs

# View backend logs only
./infrastructure/scripts/dev.sh logs-be

# View frontend logs only  
./infrastructure/scripts/dev.sh logs-fe

# Stop all services
./infrastructure/scripts/dev.sh down

# Restart all services
./infrastructure/scripts/dev.sh restart

# Open backend shell for debugging
./infrastructure/scripts/dev.sh shell-be

# Run backend tests
./infrastructure/scripts/dev.sh test-be

# Clean up everything (DESTRUCTIVE)
./infrastructure/scripts/dev.sh clean
```

## 📁 File Structure

```
infrastructure/docker/
├── docker-compose.dev.yml     # Local development setup
├── docker-compose.prod.yml    # Production setup
├── .env.dev                   # Development environment variables
├── .env.prod                  # Production environment template
├── nginx/                     # Nginx configuration for production
└── README.md                  # This file
```

## 🔧 Development Setup Details

### Hot Reload
Both frontend and backend support hot reload in development mode:
- **Frontend**: Vite dev server with HMR
- **Backend**: Nodemon watches TypeScript files

### Volume Mounts
Source code is mounted as volumes for live editing:
- `backend/src` → `/app/src` (TypeScript files)
- `frontend/src` → `/app/src` (React components)

### Database Data
Development databases use named volumes:
- `postgres_dev_data` - PostgreSQL data
- `mongo_dev_data` - MongoDB data

Data persists between container restarts but can be cleared with `./infrastructure/scripts/dev.sh clean`.

### Environment Variables
Development uses safe default values in `.env.dev`:
- Database passwords: `password` (local only)
- JWT secrets: Development-only values
- CORS: Allows localhost:3000

## 🏭 Production Setup

### Configuration
1. Copy `.env.prod` to `.env` and update with real values:
   ```bash
   cp .env.prod .env
   # Edit .env with your production secrets
   ```

2. Deploy with production compose file:
   ```bash
   cd infrastructure/docker
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Production Features
- **Multi-stage builds** for optimized images
- **Nginx** serving React build with SSL support
- **Health checks** for all services
- **Non-root users** for security
- **Environment-based configuration**

### SSL/HTTPS
Place SSL certificates in `nginx/ssl/` directory:
- `nginx/ssl/cert.pem`
- `nginx/ssl/key.pem`

Or use Let's Encrypt with the deployment scripts.

## 🐛 Troubleshooting

### Port Conflicts
If ports are already in use:
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000
lsof -i :5432
lsof -i :27017

# Stop conflicting services or change ports in docker-compose.dev.yml
```

### Database Connection Issues
```bash
# Check database health
./infrastructure/scripts/dev.sh status

# View database logs
./infrastructure/scripts/dev.sh logs-db

# Reset databases (DESTRUCTIVE)
./infrastructure/scripts/dev.sh clean
./infrastructure/scripts/dev.sh up
```

### Build Issues
```bash
# Rebuild all images
./infrastructure/scripts/dev.sh build

# Clear Docker cache
docker system prune -a
```

### Backend Not Starting
```bash
# Check backend logs
./infrastructure/scripts/dev.sh logs-be

# Open backend shell for debugging
./infrastructure/scripts/dev.sh shell-be

# Check if databases are ready
docker-compose -f docker-compose.dev.yml ps
```

## 📊 Monitoring

### Health Checks
All services include health checks:
- **Backend**: HTTP health endpoint
- **PostgreSQL**: `pg_isready` command
- **MongoDB**: MongoDB ping command

### Logs
Structured logging with different levels:
- **Development**: `debug` level for detailed logs
- **Production**: `info` level for performance

## 🔒 Security Notes

### Development Security
- Uses default passwords (safe for local development)
- CORS allows localhost connections
- Debug logging enabled

### Production Security
- Requires strong passwords and JWT secrets
- HTTPS enforcement with Nginx
- Non-root container users
- Security headers via Nginx
- Rate limiting on API endpoints

## 🚀 Performance

### Development Performance
- Hot reload for fast development
- Volume mounts for live editing
- Debug mode for detailed logging

### Production Performance
- Multi-stage builds for smaller images
- Nginx for static file serving
- Connection pooling for databases
- Health checks for reliability