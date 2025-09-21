# Compute Module Variables

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

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for ECS services"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for Application Load Balancer"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS services"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}

# IAM Role ARNs
variable "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

# KMS and Security
variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

# Container Images
variable "frontend_image_uri" {
  description = "URI of the frontend container image"
  type        = string
  default     = "nginx"
}

variable "frontend_image_tag" {
  description = "Tag of the frontend container image"
  type        = string
  default     = "latest"
}

variable "backend_image_uri" {
  description = "URI of the backend container image"
  type        = string
  default     = "node"
}

variable "backend_image_tag" {
  description = "Tag of the backend container image"
  type        = string
  default     = "18-alpine"
}

# ECS Configuration
variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "enable_ecs_exec" {
  description = "Enable ECS Exec for debugging"
  type        = bool
  default     = false
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch retention period."
  }
}

# Frontend Configuration
variable "frontend_cpu" {
  description = "CPU units for frontend tasks (1024 = 1 vCPU)"
  type        = number
  default     = 256
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.frontend_cpu)
    error_message = "Frontend CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "frontend_memory" {
  description = "Memory for frontend tasks in MB"
  type        = number
  default     = 512
  
  validation {
    condition     = var.frontend_memory >= 512 && var.frontend_memory <= 30720
    error_message = "Frontend memory must be between 512 and 30720 MB."
  }
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
  
  validation {
    condition     = var.frontend_desired_count >= 1
    error_message = "Frontend desired count must be at least 1."
  }
}

variable "frontend_min_capacity" {
  description = "Minimum number of frontend tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "frontend_max_capacity" {
  description = "Maximum number of frontend tasks for auto-scaling"
  type        = number
  default     = 10
}

variable "frontend_cpu_target" {
  description = "Target CPU utilization for frontend auto-scaling"
  type        = number
  default     = 70
  
  validation {
    condition     = var.frontend_cpu_target > 0 && var.frontend_cpu_target <= 100
    error_message = "Frontend CPU target must be between 1 and 100."
  }
}

variable "frontend_memory_target" {
  description = "Target memory utilization for frontend auto-scaling"
  type        = number
  default     = 80
  
  validation {
    condition     = var.frontend_memory_target > 0 && var.frontend_memory_target <= 100
    error_message = "Frontend memory target must be between 1 and 100."
  }
}

# Backend Configuration
variable "backend_cpu" {
  description = "CPU units for backend tasks (1024 = 1 vCPU)"
  type        = number
  default     = 512
  
  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.backend_cpu)
    error_message = "Backend CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "backend_memory" {
  description = "Memory for backend tasks in MB"
  type        = number
  default     = 1024
  
  validation {
    condition     = var.backend_memory >= 512 && var.backend_memory <= 30720
    error_message = "Backend memory must be between 512 and 30720 MB."
  }
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
  
  validation {
    condition     = var.backend_desired_count >= 1
    error_message = "Backend desired count must be at least 1."
  }
}

variable "backend_min_capacity" {
  description = "Minimum number of backend tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum number of backend tasks for auto-scaling"
  type        = number
  default     = 20
}

variable "backend_cpu_target" {
  description = "Target CPU utilization for backend auto-scaling"
  type        = number
  default     = 70
  
  validation {
    condition     = var.backend_cpu_target > 0 && var.backend_cpu_target <= 100
    error_message = "Backend CPU target must be between 1 and 100."
  }
}

variable "backend_memory_target" {
  description = "Target memory utilization for backend auto-scaling"
  type        = number
  default     = 80
  
  validation {
    condition     = var.backend_memory_target > 0 && var.backend_memory_target <= 100
    error_message = "Backend memory target must be between 1 and 100."
  }
}

# Application Configuration
variable "app_environment_variables" {
  description = "Environment variables for the application"
  type        = map(string)
  default     = {}
}

variable "app_secrets" {
  description = "Secret parameter names for the application"
  type        = map(string)
  default     = {}
}

# Database Connection Parameters
variable "jwt_secret_parameter_name" {
  description = "Parameter Store name for JWT secret"
  type        = string
}

variable "jwt_refresh_secret_parameter_name" {
  description = "Parameter Store name for JWT refresh secret"
  type        = string
}

variable "session_secret_parameter_name" {
  description = "Parameter Store name for session secret"
  type        = string
}

variable "rds_connection_string_parameter_name" {
  description = "Parameter Store name for RDS connection string"
  type        = string
}

variable "documentdb_connection_string_parameter_name" {
  description = "Parameter Store name for DocumentDB connection string"
  type        = string
}



# ALB Configuration
variable "enable_deletion_protection" {
  description = "Enable deletion protection for ALB"
  type        = bool
  default     = false
}

variable "alb_access_logs_bucket" {
  description = "S3 bucket for ALB access logs (optional)"
  type        = string
  default     = null
}

# Monitoring and Alerting
variable "alarm_notification_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms"
  type        = string
  default     = null
}