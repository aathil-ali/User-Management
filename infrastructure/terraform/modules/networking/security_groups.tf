# Security Groups for Network Access Control
# Implements least privilege access principles

# Security Group for Application Load Balancer
resource "aws_security_group" "alb" {
  name_prefix = "${var.environment}-alb-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Application Load Balancer"

  # HTTP access from internet
  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access from internet
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-alb-sg"
    Type = "security-group"
    Tier = "load-balancer"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for ECS Tasks (Frontend and Backend)
resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.environment}-ecs-tasks-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for ECS tasks"

  # HTTP access from ALB only
  ingress {
    description     = "HTTP from ALB"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Backend API access from ALB only
  ingress {
    description     = "Backend API from ALB"
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Inter-service communication within ECS
  ingress {
    description = "Inter-service communication"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  # All outbound traffic (for API calls, database connections, etc.)
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-tasks-sg"
    Type = "security-group"
    Tier = "application"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for RDS PostgreSQL
resource "aws_security_group" "rds" {
  name_prefix = "${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for RDS PostgreSQL"

  # PostgreSQL access from ECS tasks only
  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # PostgreSQL access from bastion host (if needed for maintenance)
  ingress {
    description     = "PostgreSQL from bastion"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  # No outbound rules needed for RDS

  tags = merge(var.tags, {
    Name = "${var.environment}-rds-sg"
    Type = "security-group"
    Tier = "database"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for DocumentDB
resource "aws_security_group" "documentdb" {
  name_prefix = "${var.environment}-documentdb-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for DocumentDB"

  # MongoDB access from ECS tasks only
  ingress {
    description     = "MongoDB from ECS tasks"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # MongoDB access from bastion host (if needed for maintenance)
  ingress {
    description     = "MongoDB from bastion"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-documentdb-sg"
    Type = "security-group"
    Tier = "database"
  })

  lifecycle {
    create_before_destroy = true
  }
}



# Security Group for Bastion Host (optional, for database maintenance)
resource "aws_security_group" "bastion" {
  name_prefix = "${var.environment}-bastion-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for bastion host"

  # SSH access from specific IP ranges (update with your office/home IPs)
  ingress {
    description = "SSH from trusted IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.trusted_ip_ranges
  }

  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-bastion-sg"
    Type = "security-group"
    Tier = "management"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Security Group for VPC Endpoints (for AWS services)
resource "aws_security_group" "vpc_endpoints" {
  name_prefix = "${var.environment}-vpc-endpoints-"
  vpc_id      = aws_vpc.main.id
  description = "Security group for VPC endpoints"

  # HTTPS access from VPC
  ingress {
    description = "HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  # All outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-vpc-endpoints-sg"
    Type = "security-group"
    Tier = "vpc-endpoints"
  })

  lifecycle {
    create_before_destroy = true
  }
}

# Database Security Group (combined for all databases)
resource "aws_security_group" "database" {
  name_prefix = "${var.environment}-database-"
  vpc_id      = aws_vpc.main.id
  description = "Combined security group for all databases"

  # PostgreSQL access from ECS tasks
  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  # MongoDB access from ECS tasks
  ingress {
    description     = "MongoDB from ECS tasks"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }



  # Database access from bastion host (for maintenance)
  ingress {
    description     = "Database ports from bastion"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  ingress {
    description     = "MongoDB from bastion"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }



  tags = merge(var.tags, {
    Name = "${var.environment}-database-sg"
    Type = "security-group"
    Tier = "database"
  })

  lifecycle {
    create_before_destroy = true
  }
}