# Terraform Infrastructure

This directory contains the Terraform infrastructure code for the User Management System on AWS.

## Directory Structure

```
terraform/
├── environments/           # Environment-specific configurations
│   ├── dev/               # Development environment
│   ├── staging/           # Staging environment
│   └── prod/              # Production environment
├── modules/               # Reusable Terraform modules
│   ├── networking/        # VPC, subnets, security groups
│   ├── compute/           # ECS, ALB, auto-scaling
│   ├── database/          # RDS, DocumentDB
│   ├── security/          # IAM, ACM, Parameter Store
│   └── cicd/              # CodePipeline, CodeBuild, ECR
├── shared/                # Shared configuration
│   ├── backend.tf         # Backend configuration
│   ├── providers.tf       # Provider configuration
│   ├── variables.tf       # Global variables
│   └── versions.tf        # Version constraints
└── scripts/               # Deployment scripts
    ├── setup-backend.sh   # Backend setup script
    └── deploy.sh          # Deployment script
```

## Quick Start

### 1. Prerequisites

- AWS CLI installed and configured
- Terraform >= 1.0 installed
- `jq` installed (for JSON parsing in scripts)
- Appropriate AWS permissions

### 2. Setup Backend Infrastructure

First, create the S3 buckets and DynamoDB table for Terraform state management:

```bash
cd scripts
./setup-backend.sh
```

This script will:
- Create S3 buckets for each environment
- Create DynamoDB table for state locking
- Generate backend configuration files
- Create deployment documentation

### 3. Configure Variables

Update the `terraform.tfvars` file in each environment directory:

```bash
# Update these files with your actual values
environments/dev/terraform.tfvars
environments/staging/terraform.tfvars
environments/prod/terraform.tfvars
```

Key variables to update:
- `github_repo_owner`: Your GitHub username
- `domain_name`: Your actual domain name

### 4. Deploy Infrastructure

Use the deployment script to manage your infrastructure:

```bash
# Development environment
./scripts/deploy.sh dev plan     # Review changes
./scripts/deploy.sh dev apply    # Apply changes

# Staging environment
./scripts/deploy.sh staging plan
./scripts/deploy.sh staging apply

# Production environment
./scripts/deploy.sh prod plan
./scripts/deploy.sh prod apply
```

## Environment Configurations

### Development Environment

- **Purpose**: Development and testing
- **Resources**: Minimal, cost-optimized
- **Features**: Single AZ, smaller instances, spot instances enabled
- **Domain**: `dev.yourdomain.com`

### Staging Environment

- **Purpose**: Pre-production testing
- **Resources**: Production-like but smaller
- **Features**: Multi-AZ, medium instances
- **Domain**: `staging.yourdomain.com`

### Production Environment

- **Purpose**: Live production workloads
- **Resources**: Full scale, high availability
- **Features**: Multi-AZ, deletion protection, performance insights
- **Domain**: `yourdomain.com`

## Module Overview

### Networking Module

Creates secure network infrastructure:
- VPC with public, private, and database subnets
- Internet Gateway and NAT Gateways
- Security groups with least privilege access
- Route tables for proper traffic routing

### Compute Module

Manages containerized applications:
- ECS Fargate cluster for serverless containers
- Application Load Balancer with SSL termination
- Auto-scaling policies based on metrics
- Health checks and service discovery

### Database Module

Provides managed database services:
- RDS PostgreSQL with Multi-AZ (production)
- DocumentDB cluster for MongoDB compatibility
- ~~ElastiCache Redis for caching and sessions~~ (Removed)
- Automated backups and encryption

### Security Module

Implements security controls:
- IAM roles and policies with least privilege
- SSL certificates via AWS Certificate Manager
- Parameter Store for secrets management
- KMS keys for encryption

### CI/CD Module

Automates deployment pipeline:
- ECR repositories for container images
- CodeBuild projects for building and testing
- CodePipeline for orchestration
- GitHub integration with webhooks

## Deployment Commands

### Basic Operations

```bash
# Initialize Terraform
./scripts/deploy.sh dev init

# Validate configuration
./scripts/deploy.sh dev validate

# Format Terraform files
./scripts/deploy.sh dev fmt

# Plan changes
./scripts/deploy.sh dev plan

# Apply changes
./scripts/deploy.sh dev apply

# Show outputs
./scripts/deploy.sh dev output

# Refresh state
./scripts/deploy.sh dev refresh
```

### Advanced Operations

```bash
# Destroy environment (dev/staging only)
./scripts/deploy.sh dev destroy

# Manual Terraform commands
cd environments/dev
terraform init -backend-config=backend.hcl
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## Post-Deployment Configuration

### 1. DNS Configuration

After deployment, update your domain's DNS records:

```bash
# Get the load balancer DNS name
./scripts/deploy.sh prod output | grep load_balancer_dns
```

Create CNAME records pointing to the load balancer:
- `yourdomain.com` → `alb-xxxxxxxxx.us-east-1.elb.amazonaws.com`
- `www.yourdomain.com` → `alb-xxxxxxxxx.us-east-1.elb.amazonaws.com`

### 2. Secrets Management

Add application secrets to Parameter Store:

```bash
# Database passwords (auto-generated, retrieve from RDS console)
aws ssm put-parameter --name "/user-mgmt/prod/db/password" --value "your-db-password" --type "SecureString"

# JWT secrets (generate strong random strings)
aws ssm put-parameter --name "/user-mgmt/prod/jwt/secret" --value "your-jwt-secret" --type "SecureString"
aws ssm put-parameter --name "/user-mgmt/prod/jwt/refresh-secret" --value "your-refresh-secret" --type "SecureString"
```

### 3. Container Images

Build and push your application images:

```bash
# Get ECR repository URLs
./scripts/deploy.sh prod output | grep ecr_repository_url

# Build and push images (example)
docker build -t user-mgmt-backend ./backend
docker tag user-mgmt-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/user-mgmt-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/user-mgmt-backend:latest
```

## Monitoring and Maintenance

### CloudWatch Dashboards

Access your monitoring dashboards:
- AWS Console → CloudWatch → Dashboards
- Look for dashboards named `user-mgmt-{environment}-*`

### Log Groups

Application logs are available in CloudWatch:
- `/ecs/user-mgmt-{environment}-frontend`
- `/ecs/user-mgmt-{environment}-backend`

### Alarms

Critical alarms are configured for:
- High error rates (>5%)
- High resource utilization (>80%)
- Database performance issues
- Service health check failures

## Troubleshooting

### Common Issues

1. **Backend Not Found**
   ```bash
   # Run backend setup first
   ./scripts/setup-backend.sh
   ```

2. **Permission Denied**
   ```bash
   # Check AWS credentials
   aws sts get-caller-identity
   ```

3. **Domain Validation Pending**
   ```bash
   # Check ACM certificate status
   aws acm list-certificates --region us-east-1
   ```

4. **ECS Tasks Not Starting**
   ```bash
   # Check ECS service events
   aws ecs describe-services --cluster user-mgmt-prod --services user-mgmt-prod-backend
   ```

### Useful Commands

```bash
# Check Terraform state
terraform state list

# Import existing resources
terraform import aws_instance.example i-1234567890abcdef0

# Remove resources from state
terraform state rm aws_instance.example

# Show resource details
terraform state show aws_instance.example
```

## Security Best Practices

### Implemented Security Measures

- ✅ All resources tagged for tracking
- ✅ Least privilege IAM policies
- ✅ Encryption at rest and in transit
- ✅ Private subnets for applications
- ✅ Security groups with minimal access
- ✅ Secrets stored in Parameter Store
- ✅ SSL/TLS certificates managed by ACM
- ✅ VPC Flow Logs enabled
- ✅ CloudTrail for audit logging

### Additional Recommendations

- Enable AWS Config for compliance monitoring
- Set up AWS GuardDuty for threat detection
- Implement AWS WAF for application protection
- Regular security assessments and penetration testing
- Automated security scanning in CI/CD pipeline

## Cost Optimization

### Implemented Cost Controls

- Environment-specific resource sizing
- Auto-scaling to minimize idle resources
- Spot instances for development
- Scheduled shutdown for dev environments
- Appropriate backup retention periods

### Cost Monitoring

- Resource tagging for cost allocation
- AWS Cost Explorer integration
- Budget alerts configured
- Regular cost optimization reviews

## Support and Maintenance

### Regular Tasks

- [ ] Weekly: Review CloudWatch alarms and logs
- [ ] Monthly: Update Terraform modules and providers
- [ ] Monthly: Review and optimize costs
- [ ] Quarterly: Security assessment and updates
- [ ] Quarterly: Disaster recovery testing

### Emergency Procedures

1. **Service Outage**: Check ECS service health and logs
2. **Database Issues**: Review RDS/DocumentDB metrics and logs
3. **High Costs**: Check auto-scaling policies and resource utilization
4. **Security Incident**: Review CloudTrail logs and disable compromised resources

For additional support, refer to the main project documentation or create an issue in the repository.