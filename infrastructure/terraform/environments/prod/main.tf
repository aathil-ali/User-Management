# Production Environment Configuration
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket         = "user-mgmt-terraform-state-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "user-mgmt-terraform-locks"
  }
}

# Local variables for production environment
locals {
  environment = "prod"
  
  # Production configuration - full scale and high availability
  config = {
    # Networking
    vpc_cidr           = "10.2.0.0/16"
    availability_zones = ["us-east-1a", "us-east-1b"]
    
    # Compute - production-sized instances
    ecs_cluster_name    = "user-mgmt-prod"
    frontend_task_count = 3
    backend_task_count  = 3
    frontend_cpu        = 1024
    frontend_memory     = 2048
    backend_cpu         = 2048
    backend_memory      = 4096
    
    # Database - production instances with high availability
    rds_instance_class        = "db.t3.medium"
    rds_allocated_storage     = 100
    documentdb_instance_class = "db.t3.medium"
    documentdb_instance_count = 3

    
    # Scaling
    min_capacity = 3
    max_capacity = 10
    
    # Production settings
    enable_spot_instances = false
    schedule_shutdown     = false
    
    # Domain
    domain_name = "yourdomain.com"
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
  
  # RDS Configuration - Production settings
  rds_instance_class         = local.config.rds_instance_class
  rds_allocated_storage      = local.config.rds_allocated_storage
  rds_multi_az              = true
  rds_backup_retention_period = 7
  rds_deletion_protection    = true
  rds_performance_insights   = true
  
  # DocumentDB Configuration
  documentdb_instance_class = local.config.documentdb_instance_class
  documentdb_instance_count = local.config.documentdb_instance_count
  documentdb_backup_retention_period = 7
  

  
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
  github_branch     = "main"  # Use main branch for production
  
  tags = {
    Environment = local.environment
    Project     = "user-management-system"
  }
}