# Parameter Store for Application Secrets and Configuration

# Generate JWT secrets
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = false
}

# JWT Secret
resource "aws_ssm_parameter" "jwt_secret" {
  name  = "/${var.environment}/app/jwt/secret"
  type  = "SecureString"
  value = random_password.jwt_secret.result
  key_id = aws_kms_key.main.key_id

  tags = merge(var.tags, {
    Name = "${var.environment}-jwt-secret"
    Type = "ssm-parameter"
  })
}

# JWT Refresh Secret
resource "aws_ssm_parameter" "jwt_refresh_secret" {
  name  = "/${var.environment}/app/jwt/refresh_secret"
  type  = "SecureString"
  value = random_password.jwt_refresh_secret.result
  key_id = aws_kms_key.main.key_id

  tags = merge(var.tags, {
    Name = "${var.environment}-jwt-refresh-secret"
    Type = "ssm-parameter"
  })
}

# Application Configuration Parameters
resource "aws_ssm_parameter" "app_config" {
  for_each = var.app_config_parameters

  name  = "/${var.environment}/app/config/${each.key}"
  type  = "String"
  value = each.value

  tags = merge(var.tags, {
    Name = "${var.environment}-app-config-${each.key}"
    Type = "ssm-parameter"
  })
}

# Environment-specific configuration
resource "aws_ssm_parameter" "environment_config" {
  name = "/${var.environment}/app/config/environment"
  type = "String"
  value = jsonencode({
    environment = var.environment
    region      = data.aws_region.current.name
    domain      = var.domain_name
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-environment-config"
    Type = "ssm-parameter"
  })
}

# CORS Configuration
resource "aws_ssm_parameter" "cors_origin" {
  name  = "/${var.environment}/app/config/cors_origin"
  type  = "String"
  value = var.environment == "prod" ? "https://${var.domain_name}" : "https://${var.environment}.${var.domain_name}"

  tags = merge(var.tags, {
    Name = "${var.environment}-cors-origin"
    Type = "ssm-parameter"
  })
}

# Rate Limiting Configuration
resource "aws_ssm_parameter" "rate_limit_config" {
  name = "/${var.environment}/app/config/rate_limit"
  type = "String"
  value = jsonencode({
    window_ms     = var.rate_limit_window_ms
    max_requests  = var.rate_limit_max_requests
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-rate-limit-config"
    Type = "ssm-parameter"
  })
}

# Logging Configuration
resource "aws_ssm_parameter" "log_config" {
  name = "/${var.environment}/app/config/logging"
  type = "String"
  value = jsonencode({
    level = var.log_level
    format = "json"
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-log-config"
    Type = "ssm-parameter"
  })
}

# Encryption Configuration
resource "aws_ssm_parameter" "encryption_config" {
  name = "/${var.environment}/app/config/encryption"
  type = "String"
  value = jsonencode({
    bcrypt_rounds = var.bcrypt_rounds
  })

  tags = merge(var.tags, {
    Name = "${var.environment}-encryption-config"
    Type = "ssm-parameter"
  })
}

# Feature Flags
resource "aws_ssm_parameter" "feature_flags" {
  name = "/${var.environment}/app/config/feature_flags"
  type = "String"
  value = jsonencode(var.feature_flags)

  tags = merge(var.tags, {
    Name = "${var.environment}-feature-flags"
    Type = "ssm-parameter"
  })
}