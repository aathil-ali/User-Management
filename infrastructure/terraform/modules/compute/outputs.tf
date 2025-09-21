# Compute Module Outputs

# ECS Cluster Outputs
output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

# Application Load Balancer Outputs
output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_hosted_zone_id" {
  description = "Hosted zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

# Target Group Outputs
output "frontend_target_group_arn" {
  description = "ARN of the frontend target group"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "ARN of the backend target group"
  value       = aws_lb_target_group.backend.arn
}

# ECS Service Outputs
output "frontend_service_name" {
  description = "Name of the frontend ECS service"
  value       = aws_ecs_service.frontend.name
}

output "frontend_service_arn" {
  description = "ARN of the frontend ECS service"
  value       = aws_ecs_service.frontend.id
}

output "backend_service_name" {
  description = "Name of the backend ECS service"
  value       = aws_ecs_service.backend.name
}

output "backend_service_arn" {
  description = "ARN of the backend ECS service"
  value       = aws_ecs_service.backend.id
}

# Task Definition Outputs
output "frontend_task_definition_arn" {
  description = "ARN of the frontend task definition"
  value       = aws_ecs_task_definition.frontend.arn
}

output "frontend_task_definition_family" {
  description = "Family of the frontend task definition"
  value       = aws_ecs_task_definition.frontend.family
}

output "frontend_task_definition_revision" {
  description = "Revision of the frontend task definition"
  value       = aws_ecs_task_definition.frontend.revision
}

output "backend_task_definition_arn" {
  description = "ARN of the backend task definition"
  value       = aws_ecs_task_definition.backend.arn
}

output "backend_task_definition_family" {
  description = "Family of the backend task definition"
  value       = aws_ecs_task_definition.backend.family
}

output "backend_task_definition_revision" {
  description = "Revision of the backend task definition"
  value       = aws_ecs_task_definition.backend.revision
}

# Auto Scaling Outputs
output "frontend_autoscaling_target_arn" {
  description = "ARN of the frontend auto-scaling target"
  value       = aws_appautoscaling_target.frontend.arn
}

output "backend_autoscaling_target_arn" {
  description = "ARN of the backend auto-scaling target"
  value       = aws_appautoscaling_target.backend.arn
}

# CloudWatch Log Groups
output "frontend_log_group_name" {
  description = "Name of the frontend CloudWatch log group"
  value       = aws_cloudwatch_log_group.frontend.name
}

output "backend_log_group_name" {
  description = "Name of the backend CloudWatch log group"
  value       = aws_cloudwatch_log_group.backend.name
}

output "ecs_exec_log_group_name" {
  description = "Name of the ECS Exec CloudWatch log group"
  value       = aws_cloudwatch_log_group.ecs_exec.name
}

# Application URLs
output "application_url" {
  description = "URL of the application"
  value       = "https://${var.domain_name}"
}

output "api_url" {
  description = "URL of the API"
  value       = "https://${var.domain_name}/api"
}

# Load Balancer Listener Outputs
output "https_listener_arn" {
  description = "ARN of the HTTPS listener"
  value       = aws_lb_listener.https.arn
}

output "http_listener_arn" {
  description = "ARN of the HTTP listener"
  value       = aws_lb_listener.http.arn
}

# CloudWatch Alarm Outputs
output "frontend_target_health_alarm_arn" {
  description = "ARN of the frontend target health alarm"
  value       = aws_cloudwatch_metric_alarm.frontend_target_health.arn
}

output "backend_target_health_alarm_arn" {
  description = "ARN of the backend target health alarm"
  value       = aws_cloudwatch_metric_alarm.backend_target_health.arn
}

# Service Discovery (for future use)
output "service_discovery_info" {
  description = "Service discovery information"
  value = {
    cluster_name = aws_ecs_cluster.main.name
    services = {
      frontend = {
        name = aws_ecs_service.frontend.name
        port = 80
      }
      backend = {
        name = aws_ecs_service.backend.name
        port = 8000
      }
    }
  }
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information for CI/CD"
  value = {
    cluster_name = aws_ecs_cluster.main.name
    services = {
      frontend = {
        name               = aws_ecs_service.frontend.name
        task_definition    = aws_ecs_task_definition.frontend.family
        container_name     = "frontend"
        container_port     = 80
      }
      backend = {
        name               = aws_ecs_service.backend.name
        task_definition    = aws_ecs_task_definition.backend.family
        container_name     = "backend"
        container_port     = 8000
      }
    }
    load_balancer = {
      dns_name = aws_lb.main.dns_name
      zone_id  = aws_lb.main.zone_id
    }
  }
  sensitive = true
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}