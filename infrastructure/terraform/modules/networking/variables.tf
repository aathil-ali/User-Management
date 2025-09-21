# Networking Module Variables

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
  
  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
  
  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones must be specified for high availability."
  }
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "enable_vpn_gateway" {
  description = "Enable VPN Gateway"
  type        = bool
  default     = false
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in VPC"
  type        = bool
  default     = true
}

variable "enable_dns_support" {
  description = "Enable DNS support in VPC"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "flow_log_retention_days" {
  description = "Retention period for VPC Flow Logs in days"
  type        = number
  default     = 30
  
  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.flow_log_retention_days)
    error_message = "Flow log retention days must be a valid CloudWatch Logs retention period."
  }
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {}
}

variable "trusted_ip_ranges" {
  description = "List of trusted IP ranges for bastion host access"
  type        = list(string)
  default     = ["10.0.0.0/8"]  # Default to private networks only
}

variable "enable_bastion_host" {
  description = "Enable bastion host security group"
  type        = bool
  default     = false
}

variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints for AWS services"
  type        = bool
  default     = true
}

# Subnet CIDR calculations
locals {
  # Calculate subnet CIDRs based on VPC CIDR
  # Public subnets: 10.x.1.0/24, 10.x.2.0/24
  # Private subnets: 10.x.10.0/24, 10.x.20.0/24  
  # Database subnets: 10.x.100.0/24, 10.x.200.0/24
  
  public_subnet_cidrs = [
    for i in range(length(var.availability_zones)) :
    cidrsubnet(var.vpc_cidr, 8, i + 1)
  ]
  
  private_subnet_cidrs = [
    for i in range(length(var.availability_zones)) :
    cidrsubnet(var.vpc_cidr, 8, i + 10)
  ]
  
  database_subnet_cidrs = [
    for i in range(length(var.availability_zones)) :
    cidrsubnet(var.vpc_cidr, 8, i + 100)
  ]
}