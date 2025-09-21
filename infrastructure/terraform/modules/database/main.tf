# Database Module - RDS PostgreSQL, DocumentDB
# Provides managed database services with high availability and security

# Random password for RDS
resource "random_password" "rds_password" {
  length  = 16
  special = true
}

# Random password for DocumentDB
resource "random_password" "documentdb_password" {
  length  = 16
  special = true
}

# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.environment}-docdb-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.environment}-docdb-subnet-group"
    Type = "docdb-subnet-group"
  })
}

# DocumentDB Cluster Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family = "docdb5.0"
  name   = "${var.environment}-docdb-params"

  parameter {
    name  = "audit_logs"
    value = "enabled"
  }

  parameter {
    name  = "profiler"
    value = "enabled"
  }

  parameter {
    name  = "profiler_threshold_ms"
    value = "100"
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-docdb-params"
    Type = "docdb-parameter-group"
  })
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${var.environment}-docdb-cluster"
  engine                 = "docdb"
  engine_version         = var.documentdb_engine_version
  
  # Database configuration
  master_username = var.documentdb_username
  master_password = random_password.documentdb_password.result
  port           = 27017
  
  # Network configuration
  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = [var.database_security_group_id]
  
  # Backup configuration
  backup_retention_period = var.documentdb_backup_retention_period
  preferred_backup_window = var.documentdb_backup_window
  preferred_maintenance_window = var.documentdb_maintenance_window
  
  # Security configuration
  storage_encrypted = true
  kms_key_id       = aws_kms_key.database.arn
  
  # Parameter group
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name
  
  # Deletion protection
  deletion_protection = var.documentdb_deletion_protection
  skip_final_snapshot = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? null : "${var.environment}-docdb-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  
  # Enable automated minor version upgrades
  auto_minor_version_upgrade = true
  
  # Enable CloudWatch logs
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]
  
  tags = merge(var.tags, {
    Name = "${var.environment}-docdb-cluster"
    Type = "docdb-cluster"
  })
  
  lifecycle {
    ignore_changes = [
      master_password,
      final_snapshot_identifier
    ]
  }
}

# DocumentDB Cluster Instances
resource "aws_docdb_cluster_instance" "cluster_instances" {
  count              = var.documentdb_instance_count
  identifier         = "${var.environment}-docdb-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.documentdb_instance_class
  
  # Performance monitoring
  performance_insights_enabled = var.documentdb_performance_insights
  
  tags = merge(var.tags, {
    Name = "${var.environment}-docdb-instance-${count.index + 1}"
    Type = "docdb-instance"
  })
}

# Store DocumentDB password in Parameter Store
resource "aws_ssm_parameter" "documentdb_password" {
  name  = "/${var.environment}/database/documentdb/password"
  type  = "SecureString"
  value = random_password.documentdb_password.result
  
  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-password"
    Type = "ssm-parameter"
  })
}

# Store DocumentDB connection details in Parameter Store
resource "aws_ssm_parameter" "documentdb_endpoint" {
  name  = "/${var.environment}/database/documentdb/endpoint"
  type  = "String"
  value = aws_docdb_cluster.main.endpoint
  
  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-endpoint"
    Type = "ssm-parameter"
  })
}

resource "aws_ssm_parameter" "documentdb_port" {
  name  = "/${var.environment}/database/documentdb/port"
  type  = "String"
  value = tostring(aws_docdb_cluster.main.port)
  
  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-port"
    Type = "ssm-parameter"
  })
}

resource "aws_ssm_parameter" "documentdb_username" {
  name  = "/${var.environment}/database/documentdb/username"
  type  = "String"
  value = aws_docdb_cluster.main.master_username
  
  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-username"
    Type = "ssm-parameter"
  })
}

# KMS Key for database encryption
resource "aws_kms_key" "database" {
  description             = "KMS key for database encryption in ${var.environment}"
  deletion_window_in_days = var.kms_deletion_window

  tags = merge(var.tags, {
    Name = "${var.environment}-database-kms-key"
    Type = "kms-key"
  })
}

resource "aws_kms_alias" "database" {
  name          = "alias/${var.environment}-database"
  target_key_id = aws_kms_key.database.key_id
}

# DB Subnet Group for RDS
resource "aws_db_subnet_group" "rds" {
  name       = "${var.environment}-rds-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-subnet-group"
    Type = "db-subnet-group"
  })
}

# DB Parameter Group for PostgreSQL optimization
resource "aws_db_parameter_group" "postgres" {
  family = "postgres15"
  name   = "${var.environment}-postgres-params"

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-postgres-params"
    Type = "db-parameter-group"
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier = "${var.environment}-postgres"

  # Engine configuration
  engine         = "postgres"
  engine_version = var.postgres_engine_version
  instance_class = var.rds_instance_class

  # Storage configuration
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id           = aws_kms_key.database.arn

  # Database configuration
  db_name  = var.postgres_db_name
  username = var.postgres_username
  password = random_password.rds_password.result

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [var.database_security_group_id]
  publicly_accessible    = false
  port                   = 5432

  # High availability and backup
  multi_az               = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period
  backup_window          = var.rds_backup_window
  maintenance_window     = var.rds_maintenance_window
  delete_automated_backups = false
  deletion_protection    = var.rds_deletion_protection

  # Performance and monitoring
  performance_insights_enabled = var.rds_performance_insights
  monitoring_interval         = var.rds_monitoring_interval
  monitoring_role_arn        = var.rds_monitoring_interval > 0 ? aws_iam_role.rds_monitoring[0].arn : null

  # Parameter and option groups
  parameter_group_name = aws_db_parameter_group.postgres.name

  # Maintenance
  auto_minor_version_upgrade = true
  apply_immediately         = false

  # Final snapshot
  skip_final_snapshot       = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? null : "${var.environment}-postgres-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = merge(var.tags, {
    Name = "${var.environment}-postgres"
    Type = "rds-instance"
  })

  lifecycle {
    ignore_changes = [
      password,
      final_snapshot_identifier
    ]
  }
}

# IAM Role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_monitoring" {
  count = var.rds_monitoring_interval > 0 ? 1 : 0
  name  = "${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-monitoring-role"
    Type = "iam-role"
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count      = var.rds_monitoring_interval > 0 ? 1 : 0
  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Store RDS password in Parameter Store
resource "aws_ssm_parameter" "rds_password" {
  name  = "/${var.environment}/database/postgres/password"
  type  = "SecureString"
  value = random_password.rds_password.result

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-password"
    Type = "ssm-parameter"
  })
}

# Store RDS connection details in Parameter Store
resource "aws_ssm_parameter" "rds_endpoint" {
  name  = "/${var.environment}/database/postgres/endpoint"
  type  = "String"
  value = aws_db_instance.postgres.endpoint

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-endpoint"
    Type = "ssm-parameter"
  })
}

resource "aws_ssm_parameter" "rds_port" {
  name  = "/${var.environment}/database/postgres/port"
  type  = "String"
  value = tostring(aws_db_instance.postgres.port)

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-port"
    Type = "ssm-parameter"
  })
}

resource "aws_ssm_parameter" "rds_database" {
  name  = "/${var.environment}/database/postgres/database"
  type  = "String"
  value = aws_db_instance.postgres.db_name

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-database"
    Type = "ssm-parameter"
  })
}

resource "aws_ssm_parameter" "rds_username" {
  name  = "/${var.environment}/database/postgres/username"
  type  = "String"
  value = aws_db_instance.postgres.username

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-username"
    Type = "ssm-parameter"
  })
}