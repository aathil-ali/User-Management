# Database Module Outputs

# KMS Key Outputs
output "database_kms_key_id" {
  description = "ID of the database KMS key"
  value       = aws_kms_key.database.key_id
}

output "database_kms_key_arn" {
  description = "ARN of the database KMS key"
  value       = aws_kms_key.database.arn
}

# RDS PostgreSQL Outputs
output "rds_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.postgres.id
}

output "rds_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.postgres.arn
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.postgres.db_name
}

output "rds_username" {
  description = "RDS master username"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}

output "rds_password_parameter_name" {
  description = "Parameter Store name for RDS password"
  value       = aws_ssm_parameter.rds_password.name
}

# DocumentDB Outputs
output "documentdb_cluster_id" {
  description = "DocumentDB cluster ID"
  value       = aws_docdb_cluster.main.id
}

output "documentdb_cluster_arn" {
  description = "DocumentDB cluster ARN"
  value       = aws_docdb_cluster.main.arn
}

output "documentdb_endpoint" {
  description = "DocumentDB cluster endpoint"
  value       = aws_docdb_cluster.main.endpoint
}

output "documentdb_reader_endpoint" {
  description = "DocumentDB cluster reader endpoint"
  value       = aws_docdb_cluster.main.reader_endpoint
}

output "documentdb_port" {
  description = "DocumentDB cluster port"
  value       = aws_docdb_cluster.main.port
}

output "documentdb_username" {
  description = "DocumentDB master username"
  value       = aws_docdb_cluster.main.master_username
  sensitive   = true
}

output "documentdb_password_parameter_name" {
  description = "Parameter Store name for DocumentDB password"
  value       = aws_ssm_parameter.documentdb_password.name
}



# Connection URLs for applications
output "postgres_connection_url" {
  description = "PostgreSQL connection URL (without password)"
  value       = "postgresql://${aws_db_instance.postgres.username}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
  sensitive   = true
}

output "documentdb_connection_url" {
  description = "DocumentDB connection URL (without password)"
  value       = "mongodb://${aws_docdb_cluster.main.master_username}@${aws_docdb_cluster.main.endpoint}:${aws_docdb_cluster.main.port}/?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
  sensitive   = true
}



# Subnet Groups
output "rds_subnet_group_name" {
  description = "RDS subnet group name"
  value       = aws_db_subnet_group.rds.name
}

output "documentdb_subnet_group_name" {
  description = "DocumentDB subnet group name"
  value       = aws_docdb_subnet_group.main.name
}



# Parameter Groups
output "postgres_parameter_group_name" {
  description = "PostgreSQL parameter group name"
  value       = aws_db_parameter_group.postgres.name
}

output "documentdb_parameter_group_name" {
  description = "DocumentDB parameter group name"
  value       = aws_docdb_cluster_parameter_group.main.name
}



# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

# Database status information
output "database_status" {
  description = "Database deployment status"
  value = {
    rds_status       = aws_db_instance.postgres.status
    documentdb_status = aws_docdb_cluster.main.status
  }
}