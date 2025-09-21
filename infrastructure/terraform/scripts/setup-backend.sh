#!/bin/bash

# Setup Terraform Backend Infrastructure
# This script creates the S3 bucket and DynamoDB table for Terraform state management

set -e

# Configuration
PROJECT_NAME="user-mgmt"
AWS_REGION="us-east-1"
ENVIRONMENTS=("dev" "staging" "prod")

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

# Check if AWS CLI is installed and configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured. Please run 'aws configure' first."
    fi
    
    log "AWS CLI is properly configured"
}

# Create S3 buckets for Terraform state
create_s3_buckets() {
    log "Creating S3 buckets for Terraform state..."
    
    for env in "${ENVIRONMENTS[@]}"; do
        BUCKET_NAME="${PROJECT_NAME}-terraform-state-${env}"
        
        # Check if bucket already exists
        if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
            warn "S3 bucket $BUCKET_NAME already exists"
        else
            log "Creating S3 bucket: $BUCKET_NAME"
            
            # Create bucket
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$AWS_REGION" \
                --create-bucket-configuration LocationConstraint="$AWS_REGION" 2>/dev/null || \
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --region "$AWS_REGION"
            
            # Enable versioning
            aws s3api put-bucket-versioning \
                --bucket "$BUCKET_NAME" \
                --versioning-configuration Status=Enabled
            
            # Enable server-side encryption
            aws s3api put-bucket-encryption \
                --bucket "$BUCKET_NAME" \
                --server-side-encryption-configuration '{
                    "Rules": [
                        {
                            "ApplyServerSideEncryptionByDefault": {
                                "SSEAlgorithm": "AES256"
                            }
                        }
                    ]
                }'
            
            # Block public access
            aws s3api put-public-access-block \
                --bucket "$BUCKET_NAME" \
                --public-access-block-configuration \
                BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
            
            log "S3 bucket $BUCKET_NAME created and configured"
        fi
    done
}

# Create DynamoDB table for state locking
create_dynamodb_table() {
    TABLE_NAME="${PROJECT_NAME}-terraform-locks"
    
    log "Creating DynamoDB table for state locking..."
    
    # Check if table already exists
    if aws dynamodb describe-table --table-name "$TABLE_NAME" &> /dev/null; then
        warn "DynamoDB table $TABLE_NAME already exists"
    else
        log "Creating DynamoDB table: $TABLE_NAME"
        
        aws dynamodb create-table \
            --table-name "$TABLE_NAME" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --region "$AWS_REGION"
        
        # Wait for table to be created
        log "Waiting for DynamoDB table to be created..."
        aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$AWS_REGION"
        
        log "DynamoDB table $TABLE_NAME created successfully"
    fi
}

# Create backend configuration files
create_backend_configs() {
    log "Creating backend configuration files..."
    
    for env in "${ENVIRONMENTS[@]}"; do
        BUCKET_NAME="${PROJECT_NAME}-terraform-state-${env}"
        CONFIG_FILE="../environments/${env}/backend.hcl"
        
        # Create directory if it doesn't exist
        mkdir -p "../environments/${env}"
        
        # Create backend configuration file
        cat > "$CONFIG_FILE" << EOF
bucket         = "${BUCKET_NAME}"
key            = "${env}/terraform.tfstate"
region         = "${AWS_REGION}"
encrypt        = true
dynamodb_table = "${PROJECT_NAME}-terraform-locks"
EOF
        
        log "Created backend config for $env environment: $CONFIG_FILE"
    done
}

# Generate deployment instructions
generate_instructions() {
    log "Generating deployment instructions..."
    
    cat > "../DEPLOYMENT.md" << 'EOF'
# Terraform Deployment Instructions

## Prerequisites

1. AWS CLI installed and configured
2. Terraform >= 1.0 installed
3. Appropriate AWS permissions

## Backend Setup

The backend infrastructure (S3 buckets and DynamoDB table) has been created by the setup script.

## Environment Deployment

### Development Environment

```bash
cd environments/dev
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

### Staging Environment

```bash
cd environments/staging
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

### Production Environment

```bash
cd environments/prod
terraform init -backend-config=backend.hcl
terraform plan
terraform apply
```

## Important Notes

1. **Update Variables**: Before deploying, update the following in `terraform.tfvars`:
   - `github_repo_owner`: Your GitHub username
   - `domain_name`: Your actual domain name

2. **Secrets Management**: After deployment, manually add secrets to AWS Parameter Store:
   - Database passwords
   - JWT secrets
   - API keys

3. **DNS Configuration**: Update your domain's DNS to point to the load balancer

4. **SSL Certificates**: The ACM certificates will be automatically validated via DNS

## Cleanup

To destroy an environment:

```bash
cd environments/{environment}
terraform destroy
```

**Warning**: Be very careful with the destroy command, especially in production!
EOF
    
    log "Deployment instructions created: ../DEPLOYMENT.md"
}

# Main execution
main() {
    log "Setting up Terraform backend infrastructure..."
    
    check_aws_cli
    create_s3_buckets
    create_dynamodb_table
    create_backend_configs
    generate_instructions
    
    log "Backend setup completed successfully!"
    log "Next steps:"
    log "1. Update terraform.tfvars files with your actual values"
    log "2. Review the DEPLOYMENT.md file for deployment instructions"
    log "3. Deploy your environments starting with dev"
}

# Run main function
main "$@"