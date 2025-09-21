# Monitoring Module Variables

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}

# Alert Configuration
variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = null
}

# ECS Configuration
variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "frontend_service_name" {
  description = "Name of the frontend ECS service"
  type        = string
}

variable "backend_service_name" {
  description = "Name of the backend ECS service"
  type        = string
}

# Load Balancer Configuration
variable "alb_arn_suffix" {
  description = "ARN suffix of the Application Load Balancer"
  type        = string
}

variable "frontend_target_group_arn_suffix" {
  description = "ARN suffix of the frontend target group"
  type        = string
}

variable "backend_target_group_arn_suffix" {
  description = "ARN suffix of the backend target group"
  type        = string
}

# Database Configuration
variable "rds_instance_id" {
  description = "RDS instance identifier"
  type        = string
}

variable "documentdb_cluster_id" {
  description = "DocumentDB cluster identifier"
  type        = string
}



# Log Group Configuration
variable "frontend_log_group_name" {
  description = "Name of the frontend CloudWatch log group"
  type        = string
}

variable "backend_log_group_name" {
  description = "Name of the backend CloudWatch log group"
  type        = string
}

# Log Retention Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch retention period."
  }
}

variable "security_log_retention_days" {
  description = "Security log retention in days"
  type        = number
  default     = 365
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.security_log_retention_days)
    error_message = "Security log retention days must be a valid CloudWatch retention period."
  }
}

variable "audit_log_retention_days" {
  description = "Audit log retention in days"
  type        = number
  default     = 2557  # 7 years
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.audit_log_retention_days)
    error_message = "Audit log retention days must be a valid CloudWatch retention period."
  }
}

variable "log_archive_retention_days" {
  description = "Log archive retention in days for S3"
  type        = number
  default     = 2557  # 7 years
}

# Alarm Thresholds
variable "error_rate_threshold" {
  description = "Threshold for 5xx error rate alarm"
  type        = number
  default     = 10
  
  validation {
    condition     = var.error_rate_threshold > 0
    error_message = "Error rate threshold must be greater than 0."
  }
}

variable "response_time_threshold" {
  description = "Threshold for response time alarm in seconds"
  type        = number
  default     = 2.0
  
  validation {
    condition     = var.response_time_threshold > 0
    error_message = "Response time threshold must be greater than 0."
  }
}

variable "cpu_utilization_threshold" {
  description = "Threshold for CPU utilization alarm"
  type        = number
  default     = 80
  
  validation {
    condition     = var.cpu_utilization_threshold > 0 && var.cpu_utilization_threshold <= 100
    error_message = "CPU utilization threshold must be between 1 and 100."
  }
}

variable "memory_utilization_threshold" {
  description = "Threshold for memory utilization alarm"
  type        = number
  default     = 85
  
  validation {
    condition     = var.memory_utilization_threshold > 0 && var.memory_utilization_threshold <= 100
    error_message = "Memory utilization threshold must be between 1 and 100."
  }
}

variable "database_cpu_threshold" {
  description = "Threshold for database CPU utilization alarm"
  type        = number
  default     = 75
  
  validation {
    condition     = var.database_cpu_threshold > 0 && var.database_cpu_threshold <= 100
    error_message = "Database CPU threshold must be between 1 and 100."
  }
}

variable "database_connection_threshold" {
  description = "Threshold for database connection count alarm"
  type        = number
  default     = 80
  
  validation {
    condition     = var.database_connection_threshold > 0
    error_message = "Database connection threshold must be greater than 0."
  }
}

variable "error_count_threshold" {
  description = "Threshold for application error count alarm"
  type        = number
  default     = 20
  
  validation {
    condition     = var.error_count_threshold > 0
    error_message = "Error count threshold must be greater than 0."
  }
}

variable "failed_login_threshold" {
  description = "Threshold for failed login attempts alarm"
  type        = number
  default     = 10
  
  validation {
    condition     = var.failed_login_threshold > 0
    error_message = "Failed login threshold must be greater than 0."
  }
}

# Advanced Monitoring Features
variable "enable_cross_account_logging" {
  description = "Enable cross-account log sharing"
  type        = bool
  default     = false
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "enable_custom_metrics" {
  description = "Enable custom application metrics"
  type        = bool
  default     = true
}

variable "enable_log_insights" {
  description = "Enable CloudWatch Log Insights queries"
  type        = bool
  default     = true
}

# Dashboard Configuration
variable "dashboard_time_range" {
  description = "Default time range for dashboards"
  type        = string
  default     = "PT3H"  # 3 hours
  
  validation {
    condition = contains([
      "PT1H",   # 1 hour
      "PT3H",   # 3 hours
      "PT6H",   # 6 hours
      "PT12H",  # 12 hours
      "P1D",    # 1 day
      "P3D",    # 3 days
      "P1W",    # 1 week
      "P1M"     # 1 month
    ], var.dashboard_time_range)
    error_message = "Dashboard time range must be a valid ISO 8601 duration."
  }
}

variable "dashboard_refresh_interval" {
  description = "Dashboard auto-refresh interval in seconds"
  type        = number
  default     = 300  # 5 minutes
  
  validation {
    condition     = var.dashboard_refresh_interval >= 60
    error_message = "Dashboard refresh interval must be at least 60 seconds."
  }
}

# Notification Configuration
variable "notification_endpoints" {
  description = "Additional notification endpoints"
  type = list(object({
    protocol = string
    endpoint = string
  }))
  default = []
}

variable "critical_alarm_actions" {
  description = "Actions for critical alarms"
  type        = list(string)
  default     = []
}

variable "warning_alarm_actions" {
  description = "Actions for warning alarms"
  type        = list(string)
  default     = []
}

# Metric Configuration
variable "custom_metrics_namespace" {
  description = "Namespace for custom application metrics"
  type        = string
  default     = "Application"
}

variable "metric_collection_interval" {
  description = "Interval for metric collection in seconds"
  type        = number
  default     = 60
  
  validation {
    condition     = var.metric_collection_interval >= 60
    error_message = "Metric collection interval must be at least 60 seconds."
  }
}

# Cost Optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features"
  type        = bool
  default     = true
}

variable "log_sampling_rate" {
  description = "Log sampling rate for cost optimization (0.0 to 1.0)"
  type        = number
  default     = 1.0
  
  validation {
    condition     = var.log_sampling_rate >= 0.0 && var.log_sampling_rate <= 1.0
    error_message = "Log sampling rate must be between 0.0 and 1.0."
  }
}