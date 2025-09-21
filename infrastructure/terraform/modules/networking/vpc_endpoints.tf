# VPC Endpoints for AWS Services
# Provides private connectivity to AWS services without internet gateway

# S3 Gateway Endpoint (for ECR, CodePipeline artifacts)
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.s3"
  
  vpc_endpoint_type = "Gateway"
  route_table_ids = concat(
    [aws_route_table.public.id],
    aws_route_table.private[*].id,
    [aws_route_table.database.id]
  )

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::*"
        ]
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-s3-endpoint"
    Type = "vpc-endpoint"
  })
}

# DynamoDB Gateway Endpoint (for Terraform state locking)
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  
  vpc_endpoint_type = "Gateway"
  route_table_ids = concat(
    [aws_route_table.public.id],
    aws_route_table.private[*].id,
    [aws_route_table.database.id]
  )

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-dynamodb-endpoint"
    Type = "vpc-endpoint"
  })
}

# ECR API Interface Endpoint
resource "aws_vpc_endpoint" "ecr_api" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ecr-api-endpoint"
    Type = "vpc-endpoint"
  })
}

# ECR DKR Interface Endpoint
resource "aws_vpc_endpoint" "ecr_dkr" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ecr-dkr-endpoint"
    Type = "vpc-endpoint"
  })
}

# CloudWatch Logs Interface Endpoint
resource "aws_vpc_endpoint" "logs" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-logs-endpoint"
    Type = "vpc-endpoint"
  })
}

# CloudWatch Monitoring Interface Endpoint
resource "aws_vpc_endpoint" "monitoring" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.monitoring"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-monitoring-endpoint"
    Type = "vpc-endpoint"
  })
}

# SSM Interface Endpoint (for Parameter Store)
resource "aws_vpc_endpoint" "ssm" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ssm"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ssm-endpoint"
    Type = "vpc-endpoint"
  })
}

# ECS Interface Endpoint
resource "aws_vpc_endpoint" "ecs" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-endpoint"
    Type = "vpc-endpoint"
  })
}

# ECS Agent Interface Endpoint
resource "aws_vpc_endpoint" "ecs_agent" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecs-agent"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-agent-endpoint"
    Type = "vpc-endpoint"
  })
}

# ECS Telemetry Interface Endpoint
resource "aws_vpc_endpoint" "ecs_telemetry" {
  count = var.enable_vpc_endpoints ? 1 : 0
  
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ecs-telemetry"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true

  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-telemetry-endpoint"
    Type = "vpc-endpoint"
  })
}

# Data source for current AWS region
data "aws_region" "current" {}