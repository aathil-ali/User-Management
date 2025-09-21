#!/bin/bash

# Terraform Backend Setup Script
# Creates S3 bucket and DynamoDB table for Terraform state management

set -e

ENVIRONMENT=${1:-dev}
AWS_REGION=${2:-us-east-1}

echo "Setting up Terraform backend for environment: $ENVIRONMENT"
echo "Region: $AWS_REGION"

# Create S3 bucket for state
BUCKET_NAME="user-mgmt-terraform-state-${ENVIRONMENT}"
aws s3 mb "s3://${BUCKET_NAME}" --region "${AWS_REGION}" || echo "Bucket may already exist"

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket "${BUCKET_NAME}" \
    --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \
    --bucket "${BUCKET_NAME}" \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }]
    }'

# Create DynamoDB table for locking
aws dynamodb create-table \
    --table-name "user-mgmt-terraform-locks" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region "${AWS_REGION}" || echo "Table may already exist"

echo "Terraform backend setup complete!"
echo "S3 Bucket: ${BUCKET_NAME}"
echo "DynamoDB Table: user-mgmt-terraform-locks"
