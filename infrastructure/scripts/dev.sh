#!/bin/bash

# Local Development Script for User Management System
# This script helps you run the full stack locally with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  up          Start all services (databases, backend, frontend)"
    echo "  down        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show logs from all services"
    echo "  logs-be     Show backend logs only"
    echo "  logs-fe     Show frontend logs only"
    echo "  logs-db     Show database logs only"
    echo "  build       Rebuild all Docker images"
    echo "  clean       Stop services and remove volumes (DESTRUCTIVE)"
    echo "  status      Show status of all services"
    echo "  shell-be    Open shell in backend container"
    echo "  shell-fe    Open shell in frontend container"
    echo "  test-be     Run backend tests"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 up                    # Start the full stack"
    echo "  $0 logs-be               # Watch backend logs"
    echo "  $0 shell-be              # Debug backend container"
}

# Change to docker directory
cd "$(dirname "$0")/../docker"

case "${1:-help}" in
    up)
        print_status "Starting User Management System (Development Mode)..."
        print_status "This will start: PostgreSQL, MongoDB, Backend API, Frontend React App"
        docker compose -f docker-compose.dev.yml --env-file .env.dev up -d
        print_success "All services started!"
        echo ""
        print_status "🌐 Frontend: http://localhost:3000"
        print_status "🔧 Backend API: http://localhost:8000"
        print_status "📊 API Docs: http://localhost:8000/api-docs"
        print_status "🐘 PostgreSQL: localhost:5432"
        print_status "🍃 MongoDB: localhost:27017"
        echo ""
        print_status "Use '$0 logs' to see all logs or '$0 logs-be' for backend only"
        ;;
    
    down)
        print_status "Stopping all services..."
        docker compose -f docker-compose.dev.yml down
        print_success "All services stopped!"
        ;;
    
    restart)
        print_status "Restarting all services..."
        docker compose -f docker-compose.dev.yml restart
        print_success "All services restarted!"
        ;;
    
    logs)
        print_status "Showing logs from all services (Ctrl+C to exit)..."
        docker compose -f docker-compose.dev.yml logs -f
        ;;
    
    logs-be)
        print_status "Showing backend logs (Ctrl+C to exit)..."
        docker compose -f docker-compose.dev.yml logs -f backend
        ;;
    
    logs-fe)
        print_status "Showing frontend logs (Ctrl+C to exit)..."
        docker compose -f docker-compose.dev.yml logs -f frontend
        ;;
    
    logs-db)
        print_status "Showing database logs (Ctrl+C to exit)..."
        docker compose -f docker-compose.dev.yml logs -f postgres mongodb
        ;;
    
    build)
        print_status "Rebuilding all Docker images..."
        docker compose -f docker-compose.dev.yml build --no-cache
        print_success "All images rebuilt!"
        ;;
    
    clean)
        print_warning "This will DESTROY all data in development databases!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Stopping services and removing volumes..."
            docker compose -f docker-compose.dev.yml down -v
            docker system prune -f
            print_success "Cleanup complete!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;
    
    status)
        print_status "Service Status:"
        docker compose -f docker-compose.dev.yml ps
        ;;
    
    shell-be)
        print_status "Opening shell in backend container..."
        docker compose -f docker-compose.dev.yml exec backend sh
        ;;
    
    shell-fe)
        print_status "Opening shell in frontend container..."
        docker compose -f docker-compose.dev.yml exec frontend sh
        ;;
    
    test-be)
        print_status "Running backend tests..."
        docker compose -f docker-compose.dev.yml exec backend npm test
        ;;
    
    help)
        show_usage
        ;;
    
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac