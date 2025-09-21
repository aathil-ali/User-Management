# Database Module Variables

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "database_subnet_ids" {
  description = "List of database subnet IDs"
  type        = list(string)
}

variable "database_security_group_id" {
  description = "ID of the database security group"
  type        = string
}

# KMS Configuration
variable "kms_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 7
}

# RDS PostgreSQL Configuration
variable "postgres_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for RDS in GB"
  type        = number
  default     = 100
}

variable "postgres_db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "user_management"
}

variable "postgres_username" {
  description = "PostgreSQL master username"
  type        = string
  default     = "postgres"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment for RDS"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
  
  validation {
    condition     = var.rds_backup_retention_period >= 0 && var.rds_backup_retention_period <= 35
    error_message = "Backup retention period must be between 0 and 35 days."
  }
}

variable "rds_backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "rds_maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = false
}

variable "rds_performance_insights" {
  description = "Enable Performance Insights for RDS"
  type        = bool
  default     = false
}

variable "rds_monitoring_interval" {
  description = "Enhanced monitoring interval in seconds (0, 1, 5, 10, 15, 30, 60)"
  type        = number
  default     = 0
  
  validation {
    condition     = contains([0, 1, 5, 10, 15, 30, 60], var.rds_monitoring_interval)
    error_message = "Monitoring interval must be one of: 0, 1, 5, 10, 15, 30, 60."
  }
}

# DocumentDB Configuration
variable "documentdb_engine_version" {
  description = "DocumentDB engine version"
  type        = string
  default     = "5.0.0"
}

variable "documentdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "documentdb_instance_count" {
  description = "Number of DocumentDB instances"
  type        = number
  default     = 1
  
  validation {
    condition     = var.documentdb_instance_count >= 1 && var.documentdb_instance_count <= 16
    error_message = "DocumentDB instance count must be between 1 and 16."
  }
}

variable "documentdb_username" {
  description = "DocumentDB master username"
  type        = string
  default     = "docdbadmin"
}

variable "documentdb_backup_retention_period" {
  description = "DocumentDB backup retention period in days"
  type        = number
  default     = 7
  
  validation {
    condition     = var.documentdb_backup_retention_period >= 1 && var.documentdb_backup_retention_period <= 35
    error_message = "DocumentDB backup retention period must be between 1 and 35 days."
  }
}

variable "documentdb_backup_window" {
  description = "DocumentDB preferred backup window"
  type        = string
  default     = "02:00-03:00"
}

variable "documentdb_maintenance_window" {
  description = "DocumentDB preferred maintenance window"
  type        = string
  default     = "sun:03:00-sun:04:00"
}

variable "documentdb_deletion_protection" {
  description = "Enable deletion protection for DocumentDB"
  type        = bool
  default     = false
}

variable "documentdb_performance_insights" {
  description = "Enable Performance Insights for DocumentDB"
  type        = bool
  default     = false
}



variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}