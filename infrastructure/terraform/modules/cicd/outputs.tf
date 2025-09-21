# CI/CD Module Outputs

# ECR Repository Outputs
output "frontend_ecr_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "frontend_ecr_repository_arn" {
  description = "ARN of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.arn
}

output "frontend_ecr_repository_name" {
  description = "Name of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.name
}

output "backend_ecr_repository_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "backend_ecr_repository_arn" {
  description = "ARN of the backend ECR repository"
  value       = aws_ecr_repository.backend.arn
}

output "backend_ecr_repository_name" {
  description = "Name of the backend ECR repository"
  value       = aws_ecr_repository.backend.name
}

# S3 Bucket Outputs
output "codepipeline_artifacts_bucket_name" {
  description = "Name of the CodePipeline artifacts S3 bucket"
  value       = aws_s3_bucket.codepipeline_artifacts.bucket
}

output "codepipeline_artifacts_bucket_arn" {
  description = "ARN of the CodePipeline artifacts S3 bucket"
  value       = aws_s3_bucket.codepipeline_artifacts.arn
}

# CodeBuild Project Outputs
output "frontend_codebuild_project_name" {
  description = "Name of the frontend CodeBuild project"
  value       = aws_codebuild_project.frontend.name
}

output "frontend_codebuild_project_arn" {
  description = "ARN of the frontend CodeBuild project"
  value       = aws_codebuild_project.frontend.arn
}

output "backend_codebuild_project_name" {
  description = "Name of the backend CodeBuild project"
  value       = aws_codebuild_project.backend.name
}

output "backend_codebuild_project_arn" {
  description = "ARN of the backend CodeBuild project"
  value       = aws_codebuild_project.backend.arn
}

# CodePipeline Outputs
output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = aws_codepipeline.main.name
}

output "codepipeline_arn" {
  description = "ARN of the CodePipeline"
  value       = aws_codepipeline.main.arn
}

output "codepipeline_id" {
  description = "ID of the CodePipeline"
  value       = aws_codepipeline.main.id
}

# CloudWatch Log Groups
output "frontend_codebuild_log_group_name" {
  description = "Name of the frontend CodeBuild CloudWatch log group"
  value       = aws_cloudwatch_log_group.codebuild_frontend.name
}

output "backend_codebuild_log_group_name" {
  description = "Name of the backend CodeBuild CloudWatch log group"
  value       = aws_cloudwatch_log_group.codebuild_backend.name
}

# SNS Topic Outputs
output "pipeline_notifications_topic_arn" {
  description = "ARN of the pipeline notifications SNS topic"
  value       = var.enable_notifications ? aws_sns_topic.pipeline_notifications[0].arn : null
}

output "pipeline_notifications_topic_name" {
  description = "Name of the pipeline notifications SNS topic"
  value       = var.enable_notifications ? aws_sns_topic.pipeline_notifications[0].name : null
}

# CloudWatch Alarm Outputs
output "pipeline_failure_alarm_arn" {
  description = "ARN of the pipeline failure CloudWatch alarm"
  value       = var.enable_pipeline_monitoring ? aws_cloudwatch_metric_alarm.pipeline_failures[0].arn : null
}

output "frontend_build_failure_alarm_arn" {
  description = "ARN of the frontend build failure CloudWatch alarm"
  value       = var.enable_pipeline_monitoring ? aws_cloudwatch_metric_alarm.frontend_build_failures[0].arn : null
}

output "backend_build_failure_alarm_arn" {
  description = "ARN of the backend build failure CloudWatch alarm"
  value       = var.enable_pipeline_monitoring ? aws_cloudwatch_metric_alarm.backend_build_failures[0].arn : null
}

# Container Image Information
output "container_images" {
  description = "Container image information for deployment"
  value = {
    frontend = {
      repository_url = aws_ecr_repository.frontend.repository_url
      image_tag      = "latest"
      full_image_uri = "${aws_ecr_repository.frontend.repository_url}:latest"
    }
    backend = {
      repository_url = aws_ecr_repository.backend.repository_url
      image_tag      = "latest"
      full_image_uri = "${aws_ecr_repository.backend.repository_url}:latest"
    }
  }
}

# Build Information
output "build_projects" {
  description = "Build project information"
  value = {
    frontend = {
      name         = aws_codebuild_project.frontend.name
      arn          = aws_codebuild_project.frontend.arn
      service_role = var.codebuild_role_arn
    }
    backend = {
      name         = aws_codebuild_project.backend.name
      arn          = aws_codebuild_project.backend.arn
      service_role = var.codebuild_role_arn
    }
  }
}

# Pipeline Configuration
output "pipeline_configuration" {
  description = "Pipeline configuration information"
  value = {
    name         = aws_codepipeline.main.name
    arn          = aws_codepipeline.main.arn
    service_role = var.codepipeline_role_arn
    source = {
      owner  = var.github_owner
      repo   = var.github_repo
      branch = var.github_branch
    }
    artifact_store = {
      bucket = aws_s3_bucket.codepipeline_artifacts.bucket
      type   = "S3"
    }
  }
  sensitive = true
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information for applications"
  value = {
    cluster_name = var.ecs_cluster_name
    services = {
      frontend = var.frontend_service_name
      backend  = var.backend_service_name
    }
    pipeline_name = aws_codepipeline.main.name
  }
}

# Monitoring Information
output "monitoring_info" {
  description = "Monitoring and alerting information"
  value = {
    log_groups = {
      frontend_build = aws_cloudwatch_log_group.codebuild_frontend.name
      backend_build  = aws_cloudwatch_log_group.codebuild_backend.name
    }
    notifications_enabled = var.enable_notifications
    monitoring_enabled    = var.enable_pipeline_monitoring
    sns_topic_arn        = var.enable_notifications ? aws_sns_topic.pipeline_notifications[0].arn : null
  }
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}