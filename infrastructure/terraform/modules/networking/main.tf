# Networking Module - VPC and Subnets
# Creates secure network infrastructure with public, private, and database subnets

# Data source for availability zones
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.environment}-vpc"
    Type = "vpc"
  })
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.environment}-igw"
    Type = "internet-gateway"
  })
}

# Public Subnets (for Load Balancers)
resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.environment}-public-subnet-${count.index + 1}"
    Type = "public-subnet"
    Tier = "public"
    AZ   = var.availability_zones[count.index]
  })
}

# Private Subnets (for Applications)
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name = "${var.environment}-private-subnet-${count.index + 1}"
    Type = "private-subnet"
    Tier = "private"
    AZ   = var.availability_zones[count.index]
  })
}

# Database Subnets (for RDS, DocumentDB)
resource "aws_subnet" "database" {
  count = length(var.availability_zones)

  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, {
    Name = "${var.environment}-database-subnet-${count.index + 1}"
    Type = "database-subnet"
    Tier = "database"
    AZ   = var.availability_zones[count.index]
  })
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count = length(var.availability_zones)

  domain = "vpc"
  
  depends_on = [aws_internet_gateway.main]

  tags = merge(var.tags, {
    Name = "${var.environment}-nat-eip-${count.index + 1}"
    Type = "elastic-ip"
    AZ   = var.availability_zones[count.index]
  })
}

# NAT Gateways (one per AZ for high availability)
resource "aws_nat_gateway" "main" {
  count = length(var.availability_zones)

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  depends_on = [aws_internet_gateway.main]

  tags = merge(var.tags, {
    Name = "${var.environment}-nat-gateway-${count.index + 1}"
    Type = "nat-gateway"
    AZ   = var.availability_zones[count.index]
  })
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-public-rt"
    Type = "route-table"
    Tier = "public"
  })
}

# Route Tables for Private Subnets (one per AZ)
resource "aws_route_table" "private" {
  count = length(var.availability_zones)

  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(var.tags, {
    Name = "${var.environment}-private-rt-${count.index + 1}"
    Type = "route-table"
    Tier = "private"
    AZ   = var.availability_zones[count.index]
  })
}

# Route Table for Database Subnets
resource "aws_route_table" "database" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.environment}-database-rt"
    Type = "route-table"
    Tier = "database"
  })
}

# Route Table Associations - Public Subnets
resource "aws_route_table_association" "public" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Table Associations - Private Subnets
resource "aws_route_table_association" "private" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Route Table Associations - Database Subnets
resource "aws_route_table_association" "database" {
  count = length(var.availability_zones)

  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database.id
}

# VPC Flow Logs for security monitoring
resource "aws_flow_log" "vpc" {
  iam_role_arn    = aws_iam_role.flow_log.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_log.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
}

# CloudWatch Log Group for VPC Flow Logs
resource "aws_cloudwatch_log_group" "vpc_flow_log" {
  name              = "/aws/vpc/flowlogs/${var.environment}"
  retention_in_days = 30

  tags = merge(var.tags, {
    Name = "${var.environment}-vpc-flow-logs"
    Type = "log-group"
  })
}

# IAM Role for VPC Flow Logs
resource "aws_iam_role" "flow_log" {
  name = "${var.environment}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "vpc-flow-logs.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-vpc-flow-log-role"
    Type = "iam-role"
  })
}

# IAM Policy for VPC Flow Logs
resource "aws_iam_role_policy" "flow_log" {
  name = "${var.environment}-vpc-flow-log-policy"
  role = aws_iam_role.flow_log.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}