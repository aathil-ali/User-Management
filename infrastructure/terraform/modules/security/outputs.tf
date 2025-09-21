# Security Module Outputs

# KMS Key Outputs
output "secrets_kms_key_id" {
  description = "ID of the secrets KMS key"
  value       = aws_kms_key.secrets.key_id
}

output "secrets_kms_key_arn" {
  description = "ARN of the secrets KMS key"
  value       = aws_kms_key.secrets.arn
}

output "secrets_kms_alias_name" {
  description = "Name of the secrets KMS key alias"
  value       = aws_kms_alias.secrets.name
}

# SSL Certificate Outputs
output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}

output "ssl_certificate_domain_name" {
  description = "Domain name of the SSL certificate"
  value       = aws_acm_certificate.main.domain_name
}

output "ssl_certificate_status" {
  description = "Status of the SSL certificate"
  value       = aws_acm_certificate.main.status
}

# IAM Role Outputs
output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

output "codepipeline_role_arn" {
  description = "ARN of the CodePipeline service role"
  value       = aws_iam_role.codepipeline.arn
}

output "codebuild_role_arn" {
  description = "ARN of the CodeBuild service role"
  value       = aws_iam_role.codebuild.arn
}

# Parameter Store Outputs
output "jwt_secret_parameter_name" {
  description = "Parameter Store name for JWT secret"
  value       = aws_ssm_parameter.jwt_secret.name
}

output "jwt_refresh_secret_parameter_name" {
  description = "Parameter Store name for JWT refresh secret"
  value       = aws_ssm_parameter.jwt_refresh_secret.name
}

output "session_secret_parameter_name" {
  description = "Parameter Store name for session secret"
  value       = aws_ssm_parameter.session_secret.name
}

output "app_config_parameter_names" {
  description = "Map of application configuration parameter names"
  value       = { for k, v in aws_ssm_parameter.app_config : k => v.name }
}

# Application Secrets (for ECS task definitions)
output "application_secrets" {
  description = "Application secrets for ECS task definitions"
  value = {
    jwt_secret         = aws_ssm_parameter.jwt_secret.name
    jwt_refresh_secret = aws_ssm_parameter.jwt_refresh_secret.name
    session_secret     = aws_ssm_parameter.session_secret.name
  }
  sensitive = true
}

# Application Environment Variables
output "application_environment" {
  description = "Application environment variables for ECS task definitions"
  value = { for k, v in aws_ssm_parameter.app_config : k => v.name }
}

# Security Configuration Summary
output "security_config" {
  description = "Security configuration summary"
  value = {
    environment           = var.environment
    kms_encryption       = true
    ssl_certificate      = true
    parameter_encryption = true
    iam_roles_created    = [
      "ecs-task-execution",
      "ecs-task",
      "codepipeline",
      "codebuild"
    ]
  }
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}