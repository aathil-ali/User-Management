#!/bin/bash

# User Management System Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh prod deploy

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-deploy}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [[ "$ENVIRONMENT" == "k8s" ]] && ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
    fi
    
    log "Prerequisites check passed"
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    
    # Build backend
    log "Building backend image..."
    cd "$PROJECT_ROOT/backend"
    docker build -t user-management-backend:latest -f Dockerfile.prod .
    
    # Build frontend
    log "Building frontend image..."
    cd "$PROJECT_ROOT/frontend"
    docker build -t user-management-frontend:latest -f Dockerfile.prod .
    
    log "Docker images built successfully"
}

# Deploy with Docker Compose
deploy_docker() {
    log "Deploying with Docker Compose..."
    
    cd "$PROJECT_ROOT/infrastructure/docker"
    
    if [[ ! -f .env ]]; then
        warn ".env file not found, copying from .env.prod"
        cp .env.prod .env
        warn "Please update .env file with your actual values before running again"
        exit 1
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log "Deployment successful! Application is running at http://localhost"
    else
        error "Deployment failed - health check failed"
    fi
}

# Deploy to Kubernetes
deploy_k8s() {
    log "Deploying to Kubernetes..."
    
    cd "$PROJECT_ROOT/infrastructure/kubernetes"
    
    # Create namespace
    kubectl apply -f namespace.yaml
    
    # Apply configurations
    kubectl apply -f configmap.yaml
    kubectl apply -f secrets.yaml
    kubectl apply -f persistent-volumes.yaml
    kubectl apply -f deployments.yaml
    kubectl apply -f services.yaml
    kubectl apply -f ingress.yaml
    
    log "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment --all -n user-management
    
    log "Kubernetes deployment completed"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    if [[ "$ENVIRONMENT" == "k8s" ]]; then
        kubectl delete namespace user-management --ignore-not-found=true
    else
        cd "$PROJECT_ROOT/infrastructure/docker"
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
    fi
    
    log "Cleanup completed"
}

# Main execution
main() {
    log "Starting deployment for environment: $ENVIRONMENT, action: $ACTION"
    
    case $ACTION in
        "deploy")
            check_prerequisites
            build_images
            
            if [[ "$ENVIRONMENT" == "k8s" ]]; then
                deploy_k8s
            else
                deploy_docker
            fi
            ;;
        "cleanup")
            cleanup
            ;;
        *)
            error "Unknown action: $ACTION. Use 'deploy' or 'cleanup'"
            ;;
    esac
    
    log "Operation completed successfully"
}

# Run main function
main "$@"