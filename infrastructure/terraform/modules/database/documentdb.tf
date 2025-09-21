# DocumentDB Cluster for MongoDB compatibility

# DocumentDB Subnet Group
resource "aws_docdb_subnet_group" "main" {
  name       = "${var.environment}-documentdb-subnet-group"
  subnet_ids = var.database_subnet_ids

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-subnet-group"
    Type = "docdb-subnet-group"
  })
}

# DocumentDB Cluster Parameter Group
resource "aws_docdb_cluster_parameter_group" "main" {
  family = "docdb5.0"
  name   = "${var.environment}-documentdb-params"

  parameter {
    name  = "tls"
    value = "enabled"
  }

  parameter {
    name  = "ttl_monitor"
    value = "enabled"
  }

  parameter {
    name  = "audit_logs"
    value = "enabled"
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-params"
    Type = "docdb-parameter-group"
  })
}

# DocumentDB Cluster
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${var.environment}-documentdb"
  engine                 = "docdb"
  engine_version         = var.documentdb_engine_version
  master_username        = var.documentdb_username
  master_password        = random_password.documentdb_password.result
  
  # Network configuration
  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = [var.database_security_group_id]
  port                   = 27017

  # Backup configuration
  backup_retention_period = var.documentdb_backup_retention_period
  preferred_backup_window = var.documentdb_backup_window
  preferred_maintenance_window = var.documentdb_maintenance_window

  # Security
  storage_encrypted = true
  kms_key_id       = aws_kms_key.database.arn

  # Parameter group
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.main.name

  # Deletion protection
  deletion_protection = var.documentdb_deletion_protection
  skip_final_snapshot = var.environment == "dev" ? true : false
  final_snapshot_identifier = var.environment == "dev" ? null : "${var.environment}-documentdb-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Enable logging
  enabled_cloudwatch_logs_exports = ["audit", "profiler"]

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb"
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
resource "aws_docdb_cluster_instance" "main" {
  count              = var.documentdb_instance_count
  identifier         = "${var.environment}-documentdb-${count.index + 1}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = var.documentdb_instance_class

  # Performance monitoring
  performance_insights_enabled = var.documentdb_performance_insights
  
  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-${count.index + 1}"
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

resource "aws_ssm_parameter" "documentdb_reader_endpoint" {
  name  = "/${var.environment}/database/documentdb/reader_endpoint"
  type  = "String"
  value = aws_docdb_cluster.main.reader_endpoint

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-reader-endpoint"
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