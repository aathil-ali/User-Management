# Development Environment Outputs

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = module.compute.load_balancer_dns
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = module.compute.load_balancer_zone_id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.database.rds_endpoint
  sensitive   = true
}

output "documentdb_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = module.database.documentdb_endpoint
  sensitive   = true
}



output "ecr_frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = module.cicd.ecr_frontend_repository_url
}

output "ecr_backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = module.cicd.ecr_backend_repository_url
}

output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = module.cicd.codepipeline_name
}

output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = module.security.ssl_certificate_arn
}

# Environment-specific information
output "environment_info" {
  description = "Development environment information"
  value = {
    environment = "dev"
    region      = var.aws_region
    domain      = var.domain_name
    multi_az    = var.enable_multi_az
  }
}