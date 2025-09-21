#!/bin/bash

# Terraform Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Example: ./deploy.sh dev plan
# Example: ./deploy.sh prod apply

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Validate inputs
validate_inputs() {
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        error "Invalid environment: $ENVIRONMENT. Must be one of: dev, staging, prod"
    fi
    
    if [[ ! "$ACTION" =~ ^(init|plan|apply|destroy|output|validate|fmt|refresh)$ ]]; then
        error "Invalid action: $ACTION. Must be one of: init, plan, apply, destroy, output, validate, fmt, refresh"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v terraform &> /dev/null; then
        error "Terraform is not installed"
    fi
    
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured. Run 'aws configure' first."
    fi
    
    # Check Terraform version
    TERRAFORM_VERSION=$(terraform version -json | jq -r '.terraform_version')
    log "Using Terraform version: $TERRAFORM_VERSION"
    
    # Check AWS CLI version
    AWS_VERSION=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    log "Using AWS CLI version: $AWS_VERSION"
}

# Initialize Terraform
terraform_init() {
    log "Initializing Terraform for $ENVIRONMENT environment..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    # Check if backend config exists
    if [[ ! -f "backend.hcl" ]]; then
        warn "Backend config not found. Run setup-backend.sh first."
        return 1
    fi
    
    terraform init -backend-config=backend.hcl -upgrade
    
    log "Terraform initialized successfully"
}

# Validate Terraform configuration
terraform_validate() {
    log "Validating Terraform configuration..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    terraform validate
    
    log "Terraform configuration is valid"
}

# Format Terraform files
terraform_fmt() {
    log "Formatting Terraform files..."
    
    cd "$SCRIPT_DIR/.."
    
    terraform fmt -recursive
    
    log "Terraform files formatted"
}

# Plan Terraform changes
terraform_plan() {
    log "Planning Terraform changes for $ENVIRONMENT environment..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    # Create plan file
    PLAN_FILE="terraform-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).tfplan"
    
    terraform plan -out="$PLAN_FILE" -var-file="terraform.tfvars"
    
    log "Terraform plan created: $PLAN_FILE"
    log "Review the plan above before applying changes"
}

# Apply Terraform changes
terraform_apply() {
    log "Applying Terraform changes for $ENVIRONMENT environment..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    # Check if there's a recent plan file
    LATEST_PLAN=$(ls -t terraform-$ENVIRONMENT-*.tfplan 2>/dev/null | head -n1 || echo "")
    
    if [[ -n "$LATEST_PLAN" && -f "$LATEST_PLAN" ]]; then
        info "Found recent plan file: $LATEST_PLAN"
        read -p "Do you want to apply this plan? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform apply "$LATEST_PLAN"
        else
            log "Creating new plan and applying..."
            terraform apply -var-file="terraform.tfvars"
        fi
    else
        log "No recent plan found. Creating and applying new plan..."
        terraform apply -var-file="terraform.tfvars"
    fi
    
    log "Terraform apply completed successfully"
    
    # Show important outputs
    log "Important outputs:"
    terraform output
}

# Destroy Terraform resources
terraform_destroy() {
    warn "You are about to DESTROY all resources in the $ENVIRONMENT environment!"
    warn "This action cannot be undone!"
    
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        error "Destruction of production environment is not allowed via script. Use Terraform directly if needed."
    fi
    
    read -p "Are you absolutely sure you want to destroy the $ENVIRONMENT environment? Type 'yes' to confirm: " -r
    if [[ $REPLY != "yes" ]]; then
        log "Destruction cancelled"
        exit 0
    fi
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    terraform destroy -var-file="terraform.tfvars"
    
    log "Environment $ENVIRONMENT destroyed"
}

# Show Terraform outputs
terraform_output() {
    log "Showing Terraform outputs for $ENVIRONMENT environment..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    terraform output
}

# Refresh Terraform state
terraform_refresh() {
    log "Refreshing Terraform state for $ENVIRONMENT environment..."
    
    cd "$SCRIPT_DIR/../environments/$ENVIRONMENT"
    
    terraform refresh -var-file="terraform.tfvars"
    
    log "Terraform state refreshed"
}

# Show usage information
show_usage() {
    echo "Usage: $0 [environment] [action]"
    echo ""
    echo "Environments:"
    echo "  dev      - Development environment"
    echo "  staging  - Staging environment"
    echo "  prod     - Production environment"
    echo ""
    echo "Actions:"
    echo "  init     - Initialize Terraform"
    echo "  plan     - Create execution plan"
    echo "  apply    - Apply changes"
    echo "  destroy  - Destroy resources"
    echo "  output   - Show outputs"
    echo "  validate - Validate configuration"
    echo "  fmt      - Format Terraform files"
    echo "  refresh  - Refresh state"
    echo ""
    echo "Examples:"
    echo "  $0 dev plan"
    echo "  $0 staging apply"
    echo "  $0 prod output"
}

# Main execution
main() {
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_usage
        exit 0
    fi
    
    validate_inputs
    check_prerequisites
    
    log "Starting Terraform $ACTION for $ENVIRONMENT environment"
    
    case $ACTION in
        "init")
            terraform_init
            ;;
        "validate")
            terraform_init
            terraform_validate
            ;;
        "fmt")
            terraform_fmt
            ;;
        "plan")
            terraform_init
            terraform_validate
            terraform_plan
            ;;
        "apply")
            terraform_init
            terraform_validate
            terraform_apply
            ;;
        "destroy")
            terraform_init
            terraform_destroy
            ;;
        "output")
            terraform_output
            ;;
        "refresh")
            terraform_init
            terraform_refresh
            ;;
        *)
            error "Unknown action: $ACTION"
            ;;
    esac
    
    log "Terraform $ACTION completed successfully for $ENVIRONMENT environment"
}

# Run main function
main "$@"