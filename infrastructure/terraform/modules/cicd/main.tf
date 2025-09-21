# CI/CD Module - ECR, CodeBuild, CodePipeline
# Provides container registry and automated deployment pipeline

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# S3 Bucket for CodePipeline Artifacts
resource "aws_s3_bucket" "codepipeline_artifacts" {
  bucket        = "${var.environment}-codepipeline-artifacts-${random_id.bucket_suffix.hex}"
  force_destroy = var.environment != "prod"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-codepipeline-artifacts"
    Type = "s3-bucket"
  })
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "codepipeline_artifacts" {
  bucket = aws_s3_bucket.codepipeline_artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "codepipeline_artifacts" {
  bucket = aws_s3_bucket.codepipeline_artifacts.id
  
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = var.kms_key_arn
      sse_algorithm     = "aws:kms"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "codepipeline_artifacts" {
  bucket = aws_s3_bucket.codepipeline_artifacts.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "codepipeline_artifacts" {
  bucket = aws_s3_bucket.codepipeline_artifacts.id
  
  rule {
    id     = "delete_old_artifacts"
    status = "Enabled"
    
    expiration {
      days = var.artifact_retention_days
    }
    
    noncurrent_version_expiration {
      noncurrent_days = 7
    }
  }
}

# ECR Repository for Frontend
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.environment}/frontend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = var.enable_image_scanning
  }
  
  encryption_configuration {
    encryption_type = "KMS"
    kms_key        = var.kms_key_arn
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-ecr"
    Type = "ecr-repository"
  })
}

# ECR Repository for Backend
resource "aws_ecr_repository" "backend" {
  name                 = "${var.environment}/backend"
  image_tag_mutability = "MUTABLE"
  
  image_scanning_configuration {
    scan_on_push = var.enable_image_scanning
  }
  
  encryption_configuration {
    encryption_type = "KMS"
    kms_key        = var.kms_key_arn
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-ecr"
    Type = "ecr-repository"
  })
}

# ECR Lifecycle Policy for Frontend
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.ecr_image_count} images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = var.ecr_image_count
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ECR Lifecycle Policy for Backend
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name
  
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.ecr_image_count} images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = var.ecr_image_count
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# CloudWatch Log Group for CodeBuild Frontend
resource "aws_cloudwatch_log_group" "codebuild_frontend" {
  name              = "/aws/codebuild/${var.environment}-frontend-build"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-codebuild-frontend-logs"
    Type = "cloudwatch-log-group"
  })
}

# CloudWatch Log Group for CodeBuild Backend
resource "aws_cloudwatch_log_group" "codebuild_backend" {
  name              = "/aws/codebuild/${var.environment}-backend-build"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-codebuild-backend-logs"
    Type = "cloudwatch-log-group"
  })
}

# CodeBuild Project for Frontend
resource "aws_codebuild_project" "frontend" {
  name          = "${var.environment}-frontend-build"
  description   = "Build project for ${var.environment} frontend"
  service_role  = var.codebuild_role_arn
  
  artifacts {
    type = "CODEPIPELINE"
  }
  
  environment {
    compute_type                = var.codebuild_compute_type
    image                      = var.codebuild_image
    type                       = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode            = true
    
    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = data.aws_region.current.name
    }
    
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    
    environment_variable {
      name  = "IMAGE_REPO_NAME"
      value = aws_ecr_repository.frontend.name
    }
    
    environment_variable {
      name  = "IMAGE_TAG"
      value = "latest"
    }
    
    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment
    }
  }
  
  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild_frontend.name
    }
  }
  
  source {
    type = "CODEPIPELINE"
    buildspec = "frontend/buildspec.yml"
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-codebuild"
    Type = "codebuild-project"
  })
}

# CodeBuild Project for Backend
resource "aws_codebuild_project" "backend" {
  name          = "${var.environment}-backend-build"
  description   = "Build project for ${var.environment} backend"
  service_role  = var.codebuild_role_arn
  
  artifacts {
    type = "CODEPIPELINE"
  }
  
  environment {
    compute_type                = var.codebuild_compute_type
    image                      = var.codebuild_image
    type                       = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode            = true
    
    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = data.aws_region.current.name
    }
    
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    
    environment_variable {
      name  = "IMAGE_REPO_NAME"
      value = aws_ecr_repository.backend.name
    }
    
    environment_variable {
      name  = "IMAGE_TAG"
      value = "latest"
    }
    
    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment
    }
  }
  
  logs_config {
    cloudwatch_logs {
      group_name = aws_cloudwatch_log_group.codebuild_backend.name
    }
  }
  
  source {
    type = "CODEPIPELINE"
    buildspec = "backend/buildspec.yml"
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-codebuild"
    Type = "codebuild-project"
  })
}# CodePipeli
ne
resource "aws_codepipeline" "main" {
  name     = "${var.environment}-pipeline"
  role_arn = var.codepipeline_role_arn
  
  artifact_store {
    location = aws_s3_bucket.codepipeline_artifacts.bucket
    type     = "S3"
    
    encryption_key {
      id   = var.kms_key_arn
      type = "KMS"
    }
  }
  
  stage {
    name = "Source"
    
    action {
      name             = "Source"
      category         = "Source"
      owner            = "ThirdParty"
      provider         = "GitHub"
      version          = "1"
      output_artifacts = ["source_output"]
      
      configuration = {
        Owner      = var.github_owner
        Repo       = var.github_repo
        Branch     = var.github_branch
        OAuthToken = var.github_token
      }
    }
  }
  
  stage {
    name = "Build"
    
    action {
      name             = "BuildFrontend"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["frontend_build_output"]
      version          = "1"
      run_order        = 1
      
      configuration = {
        ProjectName = aws_codebuild_project.frontend.name
      }
    }
    
    action {
      name             = "BuildBackend"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      input_artifacts  = ["source_output"]
      output_artifacts = ["backend_build_output"]
      version          = "1"
      run_order        = 1
      
      configuration = {
        ProjectName = aws_codebuild_project.backend.name
      }
    }
  }
  
  stage {
    name = "Deploy"
    
    action {
      name            = "DeployFrontend"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ECS"
      input_artifacts = ["frontend_build_output"]
      version         = "1"
      run_order       = 1
      
      configuration = {
        ClusterName = var.ecs_cluster_name
        ServiceName = var.frontend_service_name
        FileName    = "imagedefinitions.json"
      }
    }
    
    action {
      name            = "DeployBackend"
      category        = "Deploy"
      owner           = "AWS"
      provider        = "ECS"
      input_artifacts = ["backend_build_output"]
      version         = "1"
      run_order       = 1
      
      configuration = {
        ClusterName = var.ecs_cluster_name
        ServiceName = var.backend_service_name
        FileName    = "imagedefinitions.json"
      }
    }
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-codepipeline"
    Type = "codepipeline"
  })
}

# CloudWatch Event Rule for Pipeline Trigger
resource "aws_cloudwatch_event_rule" "pipeline_trigger" {
  count = var.enable_webhook_trigger ? 1 : 0
  
  name        = "${var.environment}-pipeline-trigger"
  description = "Trigger pipeline on GitHub push"
  
  event_pattern = jsonencode({
    source      = ["aws.codepipeline"]
    detail-type = ["CodePipeline Pipeline Execution State Change"]
    detail = {
      state = ["FAILED"]
      pipeline = [aws_codepipeline.main.name]
    }
  })
  
  tags = merge(var.tags, {
    Name = "${var.environment}-pipeline-trigger"
    Type = "cloudwatch-event-rule"
  })
}

# SNS Topic for Pipeline Notifications
resource "aws_sns_topic" "pipeline_notifications" {
  count = var.enable_notifications ? 1 : 0
  
  name = "${var.environment}-pipeline-notifications"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-pipeline-notifications"
    Type = "sns-topic"
  })
}

# CloudWatch Event Target for Pipeline Notifications
resource "aws_cloudwatch_event_target" "pipeline_notifications" {
  count = var.enable_notifications ? 1 : 0
  
  rule      = aws_cloudwatch_event_rule.pipeline_trigger[0].name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.pipeline_notifications[0].arn
}

# SNS Topic Policy
resource "aws_sns_topic_policy" "pipeline_notifications" {
  count = var.enable_notifications ? 1 : 0
  
  arn = aws_sns_topic.pipeline_notifications[0].arn
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.pipeline_notifications[0].arn
      }
    ]
  })
}

# CloudWatch Alarms for Pipeline Monitoring
resource "aws_cloudwatch_metric_alarm" "pipeline_failures" {
  count = var.enable_pipeline_monitoring ? 1 : 0
  
  alarm_name          = "${var.environment}-pipeline-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "PipelineExecutionFailure"
  namespace           = "AWS/CodePipeline"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors pipeline failures"
  alarm_actions       = var.enable_notifications ? [aws_sns_topic.pipeline_notifications[0].arn] : []
  
  dimensions = {
    PipelineName = aws_codepipeline.main.name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-pipeline-failure-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CodeBuild Failure Alarms
resource "aws_cloudwatch_metric_alarm" "frontend_build_failures" {
  count = var.enable_pipeline_monitoring ? 1 : 0
  
  alarm_name          = "${var.environment}-frontend-build-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FailedBuilds"
  namespace           = "AWS/CodeBuild"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors frontend build failures"
  alarm_actions       = var.enable_notifications ? [aws_sns_topic.pipeline_notifications[0].arn] : []
  
  dimensions = {
    ProjectName = aws_codebuild_project.frontend.name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-build-failure-alarm"
    Type = "cloudwatch-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "backend_build_failures" {
  count = var.enable_pipeline_monitoring ? 1 : 0
  
  alarm_name          = "${var.environment}-backend-build-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FailedBuilds"
  namespace           = "AWS/CodeBuild"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors backend build failures"
  alarm_actions       = var.enable_notifications ? [aws_sns_topic.pipeline_notifications[0].arn] : []
  
  dimensions = {
    ProjectName = aws_codebuild_project.backend.name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-build-failure-alarm"
    Type = "cloudwatch-alarm"
  })
}