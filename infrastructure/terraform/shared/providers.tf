provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "user-management-system"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.project_owner
    }
  }
}

# Provider for ACM certificates (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "user-management-system"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.project_owner
    }
  }
}