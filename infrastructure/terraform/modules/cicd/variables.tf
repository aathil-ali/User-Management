# CI/CD Module Variables

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

# IAM Role ARNs
variable "codepipeline_role_arn" {
  description = "ARN of the CodePipeline service role"
  type        = string
}

variable "codebuild_role_arn" {
  description = "ARN of the CodeBuild service role"
  type        = string
}

# KMS Configuration
variable "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  type        = string
}

# ECR Configuration
variable "enable_image_scanning" {
  description = "Enable image scanning for ECR repositories"
  type        = bool
  default     = true
}

variable "ecr_image_count" {
  description = "Number of images to keep in ECR repositories"
  type        = number
  default     = 10
  
  validation {
    condition     = var.ecr_image_count > 0 && var.ecr_image_count <= 1000
    error_message = "ECR image count must be between 1 and 1000."
  }
}

# S3 Configuration
variable "artifact_retention_days" {
  description = "Number of days to retain CodePipeline artifacts"
  type        = number
  default     = 30
  
  validation {
    condition     = var.artifact_retention_days > 0 && var.artifact_retention_days <= 365
    error_message = "Artifact retention days must be between 1 and 365."
  }
}

# CodeBuild Configuration
variable "codebuild_compute_type" {
  description = "CodeBuild compute type"
  type        = string
  default     = "BUILD_GENERAL1_SMALL"
  
  validation {
    condition = contains([
      "BUILD_GENERAL1_SMALL",
      "BUILD_GENERAL1_MEDIUM",
      "BUILD_GENERAL1_LARGE",
      "BUILD_GENERAL1_2XLARGE"
    ], var.codebuild_compute_type)
    error_message = "CodeBuild compute type must be a valid AWS CodeBuild compute type."
  }
}

variable "codebuild_image" {
  description = "CodeBuild Docker image"
  type        = string
  default     = "aws/codebuild/standard:5.0"
}

# GitHub Configuration
variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to track"
  type        = string
  default     = "main"
}

variable "github_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
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

# Monitoring and Notifications
variable "enable_webhook_trigger" {
  description = "Enable webhook trigger for pipeline"
  type        = bool
  default     = true
}

variable "enable_notifications" {
  description = "Enable SNS notifications for pipeline events"
  type        = bool
  default     = true
}

variable "enable_pipeline_monitoring" {
  description = "Enable CloudWatch monitoring for pipeline"
  type        = bool
  default     = true
}

variable "notification_email" {
  description = "Email address for pipeline notifications"
  type        = string
  default     = null
}

# Logging Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be a valid CloudWatch retention period."
  }
}

# Build Configuration
variable "build_timeout" {
  description = "Build timeout in minutes"
  type        = number
  default     = 60
  
  validation {
    condition     = var.build_timeout >= 5 && var.build_timeout <= 480
    error_message = "Build timeout must be between 5 and 480 minutes."
  }
}

variable "concurrent_build_limit" {
  description = "Maximum number of concurrent builds"
  type        = number
  default     = 1
  
  validation {
    condition     = var.concurrent_build_limit >= 1 && var.concurrent_build_limit <= 100
    error_message = "Concurrent build limit must be between 1 and 100."
  }
}

# Security Configuration
variable "enable_privileged_mode" {
  description = "Enable privileged mode for CodeBuild (required for Docker builds)"
  type        = bool
  default     = true
}

variable "vpc_config" {
  description = "VPC configuration for CodeBuild projects"
  type = object({
    vpc_id             = string
    subnets            = list(string)
    security_group_ids = list(string)
  })
  default = null
}

# Environment Variables for Build
variable "build_environment_variables" {
  description = "Additional environment variables for CodeBuild projects"
  type        = map(string)
  default     = {}
}

# Pipeline Configuration
variable "pipeline_type" {
  description = "Type of pipeline (V1 or V2)"
  type        = string
  default     = "V2"
  
  validation {
    condition     = contains(["V1", "V2"], var.pipeline_type)
    error_message = "Pipeline type must be V1 or V2."
  }
}

variable "enable_pipeline_execution_history" {
  description = "Enable pipeline execution history"
  type        = bool
  default     = true
}

# Deployment Configuration
variable "deployment_timeout" {
  description = "Deployment timeout in minutes"
  type        = number
  default     = 15
  
  validation {
    condition     = var.deployment_timeout >= 1 && var.deployment_timeout <= 60
    error_message = "Deployment timeout must be between 1 and 60 minutes."
  }
}

variable "enable_blue_green_deployment" {
  description = "Enable blue/green deployment strategy"
  type        = bool
  default     = false
}

variable "rollback_on_failure" {
  description = "Enable automatic rollback on deployment failure"
  type        = bool
  default     = true
}