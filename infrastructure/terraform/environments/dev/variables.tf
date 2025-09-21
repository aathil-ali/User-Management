# Development Environment Variables

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "github_repo_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "your-github-username"  # Update this with actual GitHub username
}

variable "github_repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "user-management-system"
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "dev.yourdomain.com"  # Update this with actual domain
}

# Development-specific overrides
locals {
  # Cost-optimized settings for development
  dev_config = {
    # Compute resources - minimal for cost savings
    frontend_cpu        = 256
    frontend_memory     = 512
    backend_cpu         = 512
    backend_memory      = 1024
    frontend_task_count = 1
    backend_task_count  = 1
    min_capacity        = 1
    max_capacity        = 3
    
    # Database resources - minimal for cost savings
    rds_instance_class         = "db.t3.micro"
    rds_allocated_storage      = 20
    rds_max_allocated_storage  = 100
    rds_multi_az              = false
    rds_backup_retention_period = 1
    rds_deletion_protection    = false
    rds_performance_insights   = false
    rds_monitoring_interval    = 0
    
    documentdb_instance_class   = "db.t3.medium"
    documentdb_instance_count   = 1
    documentdb_backup_retention_period = 1
    documentdb_deletion_protection = false
    documentdb_performance_insights = false
    
    # Cost optimization features
    enable_spot_instances = true
    schedule_shutdown     = true
    
    # KMS settings
    kms_deletion_window = 7  # Shorter window for dev
  }
}