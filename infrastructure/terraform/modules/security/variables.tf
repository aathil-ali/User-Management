# Security Module Variables

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

variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
}

variable "kms_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 7
  
  validation {
    condition     = var.kms_deletion_window >= 7 && var.kms_deletion_window <= 30
    error_message = "KMS deletion window must be between 7 and 30 days."
  }
}

# Application Configuration Parameters
variable "app_config_parameters" {
  description = "Map of application configuration parameters"
  type        = map(string)
  default = {
    node_env                = "production"
    jwt_expire             = "1h"
    jwt_refresh_expire     = "7d"
    default_language       = "en"
    supported_languages    = "en,es,fr"
  }
}

variable "rate_limit_window_ms" {
  description = "Rate limiting window in milliseconds"
  type        = number
  default     = 900000  # 15 minutes
}

variable "rate_limit_max_requests" {
  description = "Maximum requests per rate limiting window"
  type        = number
  default     = 100
}

variable "log_level" {
  description = "Application log level"
  type        = string
  default     = "info"
  
  validation {
    condition     = contains(["error", "warn", "info", "debug"], var.log_level)
    error_message = "Log level must be one of: error, warn, info, debug."
  }
}

variable "bcrypt_rounds" {
  description = "Number of bcrypt rounds for password hashing"
  type        = number
  default     = 12
  
  validation {
    condition     = var.bcrypt_rounds >= 10 && var.bcrypt_rounds <= 15
    error_message = "Bcrypt rounds must be between 10 and 15."
  }
}

variable "feature_flags" {
  description = "Feature flags for the application"
  type        = map(bool)
  default = {
    enable_registration     = true
    enable_password_reset   = true
    enable_email_verification = true
    enable_audit_logging    = true
    enable_rate_limiting    = true
  }
}

variable "enable_cloudtrail" {
  description = "Enable CloudTrail for audit logging"
  type        = bool
  default     = true
}

variable "cloudtrail_log_retention_days" {
  description = "CloudTrail log retention in days"
  type        = number
  default     = 90
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}