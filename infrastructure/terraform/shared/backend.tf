# Backend configuration for Terraform state
# This will be configured per environment
terraform {
  backend "s3" {
    # These values will be provided via backend config files
    # bucket         = "user-mgmt-terraform-state-${environment}"
    # key            = "terraform.tfstate"
    # region         = "us-east-1"
    # encrypt        = true
    # dynamodb_table = "user-mgmt-terraform-locks"
  }
}