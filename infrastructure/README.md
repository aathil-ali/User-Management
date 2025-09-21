# Infrastructure Documentation

## Overview

This directory contains infrastructure configurations for the User Management System, supporting both Docker Compose and Kubernetes deployments.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Frontend    │    │     Backend     │
│   (Nginx/ALB)   │────│   (React SPA)   │────│  (Node.js API)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │

                                                        │
                       ┌─────────────────┐             │
                       │   PostgreSQL    │─────────────┤
                       │     (Auth)      │             │
                       └─────────────────┘             │
                                                        │
                       ┌─────────────────┐             │
                       │    MongoDB      │─────────────┘
                       │   (Profiles)    │
                       └─────────────────┘
```

## Deployment Options

### 1. Docker Compose (Recommended for Development/Small Production)

**Pros:**
- Simple setup and management
- Cost-effective for small to medium loads
- Easy to understand and debug

**Cons:**
- Limited scalability
- Single point of failure
- Manual scaling required

**Usage:**
```bash
# Quick deployment
./infrastructure/scripts/deploy.sh prod deploy

# Manual deployment
cd infrastructure/docker
cp .env.prod .env
# Edit .env with your values
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Kubernetes (Recommended for Production/Scale)

**Pros:**
- Auto-scaling capabilities
- High availability
- Rolling updates
- Service discovery

**Cons:**
- More complex setup
- Higher resource requirements
- Steeper learning curve

**Usage:**
```bash
# Deploy to Kubernetes
./infrastructure/scripts/deploy.sh k8s deploy

# Manual deployment
cd infrastructure/kubernetes
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f persistent-volumes.yaml
kubectl apply -f deployments.yaml
kubectl apply -f services.yaml
kubectl apply -f ingress.yaml
```

## Configuration

### Environment Variables

Update the following files with your actual values:

1. **Docker Compose**: `infrastructure/docker/.env`
2. **Kubernetes**: `infrastructure/kubernetes/secrets.yaml` (base64 encoded)

### Required Secrets

```bash
# Generate strong passwords
POSTGRES_PASSWORD=<strong-password>
MONGO_PASSWORD=<strong-password>


# Generate JWT secrets (256-bit minimum)
JWT_SECRET=<256-bit-random-string>
JWT_REFRESH_SECRET=<256-bit-random-string>
```

### SSL/TLS Configuration

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install cert-manager for Kubernetes
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# For Docker Compose, use certbot
certbot certonly --standalone -d yourdomain.com
```

#### Option 2: Custom Certificates
Place your certificates in:
- Docker: `infrastructure/docker/ssl/`
- Kubernetes: Update `secrets.yaml` with base64 encoded cert/key

## Monitoring and Logging

### Health Checks
- Backend: `http://your-domain/health`
- Database connectivity is verified on startup

### Logging
- Application logs: Winston logger with configurable levels
- Access logs: Nginx access logs
- Error tracking: Centralized error logging

### Recommended Monitoring Stack
```bash
# Add to your deployment
- Prometheus (metrics collection)
- Grafana (visualization)
- AlertManager (alerting)
- ELK Stack (log aggregation)
```

## Scaling Guidelines

### Horizontal Scaling
```bash
# Docker Compose
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Kubernetes
kubectl scale deployment backend-deployment --replicas=3 -n user-management
```

### Vertical Scaling
Update resource limits in:
- Docker: `docker-compose.prod.yml`
- Kubernetes: `deployments.yaml`

## Backup Strategy

### Database Backups
```bash
# PostgreSQL
pg_dump -h localhost -U postgres user_management > backup.sql

# MongoDB
mongodump --host localhost:27017 --db user_profiles --out backup/
```

### Automated Backups
Consider implementing:
- Daily database backups
- Weekly full system backups
- Off-site backup storage
- Backup restoration testing

## Security Considerations

### Network Security
- All services communicate within private networks
- Only necessary ports are exposed
- Rate limiting on API endpoints
- HTTPS enforcement

### Data Security
- Passwords hashed with bcrypt
- JWT tokens with short expiration
- Environment variables for secrets
- Database connection encryption

### Infrastructure Security
- Regular security updates
- Firewall configuration
- Access logging and monitoring
- Principle of least privilege

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   docker-compose logs postgres
   kubectl logs deployment/postgres-deployment -n user-management
   ```

2. **Frontend Not Loading**
   ```bash
   # Check nginx configuration
   docker-compose logs frontend
   kubectl describe ingress app-ingress -n user-management
   ```

3. **API Errors**
   ```bash
   # Check backend logs
   docker-compose logs backend
   kubectl logs deployment/backend-deployment -n user-management
   ```

### Performance Tuning

1. **Database Optimization**
   - Add indexes for frequently queried fields
   - Configure connection pooling
   - Monitor query performance

2. **Application Optimization**
   - ~~Enable Redis caching~~ (Removed - not used in application)
   - Optimize API response sizes
   - Implement request compression

3. **Infrastructure Optimization**
   - Configure resource limits appropriately
   - Use CDN for static assets
   - Implement load balancing

## Cost Optimization

### Development Environment
- Use single-node setup
- Reduce resource allocations
- Use local storage

### Production Environment
- Right-size your instances
- Use managed databases for critical data
- Implement auto-scaling policies
- Monitor and optimize resource usage

## Migration Guide

### From Development to Production
1. Update environment variables
2. Configure SSL certificates
3. Set up monitoring and logging
4. Implement backup strategy
5. Configure domain and DNS

### From Docker to Kubernetes
1. Build and push images to registry
2. Update image references in K8s manifests
3. Configure persistent storage
4. Set up ingress controller
5. Migrate data if necessary

## Support and Maintenance

### Regular Tasks
- [ ] Security updates (monthly)
- [ ] Backup verification (weekly)
- [ ] Performance monitoring (daily)
- [ ] Log rotation (automated)
- [ ] Certificate renewal (automated)

### Emergency Procedures
- Database recovery process
- Application rollback procedure
- Incident response plan
- Contact information for critical issues

---

For additional support or questions, refer to the main project documentation or create an issue in the repository.