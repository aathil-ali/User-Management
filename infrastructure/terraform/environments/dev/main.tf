# Development Environment Configuration
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket         = "user-mgmt-terraform-state-dev"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "user-mgmt-terraform-locks"
  }
}

# Include shared configuration
module "shared" {
  source = "../../shared"
}

# Local variables for development environment
locals {
  environment = "dev"
  
  # Development-specific configuration
  config = {
    # Networking
    vpc_cidr           = "10.0.0.0/16"
    availability_zones = ["us-east-1a", "us-east-1b"]
    
    # Compute - smaller instances for dev
    ecs_cluster_name    = "user-mgmt-dev"
    frontend_task_count = 1
    backend_task_count  = 1
    frontend_cpu        = 256
    frontend_memory     = 512
    backend_cpu         = 512
    backend_memory      = 1024
    
    # Database - smaller instances for dev
    rds_instance_class        = "db.t3.micro"
    rds_allocated_storage     = 20
    documentdb_instance_class = "db.t3.medium"
    documentdb_instance_count = 1

    
    # Scaling
    min_capacity = 1
    max_capacity = 3
    
    # Cost optimization
    enable_spot_instances = true
    schedule_shutdown     = true
    
    # Domain (use subdomain for dev)
    domain_name = "dev.yourdomain.com"
  }
}

# Networking Module
module "networking" {
  source = "../../modules/networking"
  
  environment        = local.environment
  vpc_cidr          = local.config.vpc_cidr
  availability_zones = local.config.availability_zones
  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}

# Security Module
module "security" {
  source = "../../modules/security"
  
  environment = local.environment
  vpc_id      = module.networking.vpc_id
  domain_name = local.config.domain_name
  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  environment                   = local.environment
  vpc_id                       = module.networking.vpc_id
  database_subnet_ids          = module.networking.database_subnet_ids
  database_security_group_id   = module.security.database_security_group_id
  
  # RDS Configuration
  rds_instance_class    = local.config.rds_instance_class
  rds_allocated_storage = local.config.rds_allocated_storage
  
  # DocumentDB Configuration
  documentdb_instance_class = local.config.documentdb_instance_class
  documentdb_instance_count = local.config.documentdb_instance_count
  

  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}

# Compute Module
module "compute" {
  source = "../../modules/compute"
  
  environment = local.environment
  vpc_id      = module.networking.vpc_id
  
  # Subnets
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  
  # Security Groups
  alb_security_group_id = module.security.alb_security_group_id
  ecs_security_group_id = module.security.ecs_security_group_id
  
  # SSL Certificate
  ssl_certificate_arn = module.security.ssl_certificate_arn
  
  # ECS Configuration
  cluster_name        = local.config.ecs_cluster_name
  frontend_task_count = local.config.frontend_task_count
  backend_task_count  = local.config.backend_task_count
  frontend_cpu        = local.config.frontend_cpu
  frontend_memory     = local.config.frontend_memory
  backend_cpu         = local.config.backend_cpu
  backend_memory      = local.config.backend_memory
  
  # Scaling Configuration
  min_capacity = local.config.min_capacity
  max_capacity = local.config.max_capacity
  
  # Database Endpoints
  rds_endpoint      = module.database.rds_endpoint
  documentdb_endpoint = module.database.documentdb_endpoint

  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}

# CI/CD Module
module "cicd" {
  source = "../../modules/cicd"
  
  environment = local.environment
  
  # ECS Configuration
  ecs_cluster_name    = module.compute.ecs_cluster_name
  frontend_service_name = module.compute.frontend_service_name
  backend_service_name  = module.compute.backend_service_name
  
  # Repository Configuration
  github_repo_owner = "your-github-username"  # Update this
  github_repo_name  = "user-management-system"
  github_branch     = "develop"  # Use develop branch for dev environment
  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}