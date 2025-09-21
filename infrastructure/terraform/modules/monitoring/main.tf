# Monitoring Module - CloudWatch Dashboards, Alarms, and Log Management
# Provides comprehensive monitoring and alerting for the application infrastructure

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.environment}-alerts"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-alerts-topic"
    Type = "sns-topic"
  })
}

# SNS Topic Subscription for Email Alerts
resource "aws_sns_topic_subscription" "email_alerts" {
  count = var.alert_email != null ? 1 : 0
  
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudWatch Dashboard for Application Overview
resource "aws_cloudwatch_dashboard" "application_overview" {
  dashboard_name = "${var.environment}-application-overview"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", var.alb_arn_suffix],
            [".", "TargetResponseTime", ".", "."],
            [".", "HTTPCode_Target_2XX_Count", ".", "."],
            [".", "HTTPCode_Target_4XX_Count", ".", "."],
            [".", "HTTPCode_Target_5XX_Count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Application Load Balancer Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", var.frontend_service_name, "ClusterName", var.ecs_cluster_name],
            [".", "MemoryUtilization", ".", ".", ".", "."],
            [".", "CPUUtilization", "ServiceName", var.backend_service_name, "ClusterName", var.ecs_cluster_name],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "ECS Service Resource Utilization"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 8
        height = 6
        
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", var.rds_instance_id],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "RDS Performance Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 8
        y      = 6
        width  = 8
        height = 6
        
        properties = {
          metrics = [
            ["AWS/DocDB", "CPUUtilization", "DBClusterIdentifier", var.documentdb_cluster_id],
            [".", "DatabaseConnections", ".", "."],
            [".", "ReadLatency", ".", "."],
            [".", "WriteLatency", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "DocumentDB Performance Metrics"
          period  = 300
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name = "${var.environment}-application-dashboard"
    Type = "cloudwatch-dashboard"
  })
}

# CloudWatch Dashboard for Infrastructure Overview
resource "aws_cloudwatch_dashboard" "infrastructure_overview" {
  dashboard_name = "${var.environment}-infrastructure-overview"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ECS", "RunningTaskCount", "ServiceName", var.frontend_service_name, "ClusterName", var.ecs_cluster_name],
            [".", "PendingTaskCount", ".", ".", ".", "."],
            [".", "RunningTaskCount", "ServiceName", var.backend_service_name, "ClusterName", var.ecs_cluster_name],
            [".", "PendingTaskCount", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "ECS Task Counts"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", var.frontend_target_group_arn_suffix, "LoadBalancer", var.alb_arn_suffix],
            [".", "UnHealthyHostCount", ".", ".", ".", "."],
            [".", "HealthyHostCount", "TargetGroup", var.backend_target_group_arn_suffix, "LoadBalancer", var.alb_arn_suffix],
            [".", "UnHealthyHostCount", ".", ".", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Target Group Health"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 6
        width  = 24
        height = 6
        
        properties = {
          query   = "SOURCE '${var.frontend_log_group_name}' | SOURCE '${var.backend_log_group_name}' | fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 100"
          region  = data.aws_region.current.name
          title   = "Recent Error Logs"
          view    = "table"
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name = "${var.environment}-infrastructure-dashboard"
    Type = "cloudwatch-dashboard"
  })
}

# CloudWatch Alarms for High Error Rate
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.environment}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.error_rate_threshold
  alarm_description   = "This metric monitors high error rate (5xx responses)"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-high-error-rate-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Alarms for High Response Time
resource "aws_cloudwatch_metric_alarm" "high_response_time" {
  alarm_name          = "${var.environment}-high-response-time"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = "300"
  statistic           = "Average"
  threshold           = var.response_time_threshold
  alarm_description   = "This metric monitors high response time"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    LoadBalancer = var.alb_arn_suffix
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-high-response-time-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Alarms for ECS Service CPU Utilization
resource "aws_cloudwatch_metric_alarm" "frontend_high_cpu" {
  alarm_name          = "${var.environment}-frontend-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_utilization_threshold
  alarm_description   = "This metric monitors frontend service CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = var.frontend_service_name
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-high-cpu-alarm"
    Type = "cloudwatch-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "backend_high_cpu" {
  alarm_name          = "${var.environment}-backend-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_utilization_threshold
  alarm_description   = "This metric monitors backend service CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = var.backend_service_name
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-high-cpu-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Alarms for ECS Service Memory Utilization
resource "aws_cloudwatch_metric_alarm" "frontend_high_memory" {
  alarm_name          = "${var.environment}-frontend-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.memory_utilization_threshold
  alarm_description   = "This metric monitors frontend service memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = var.frontend_service_name
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-high-memory-alarm"
    Type = "cloudwatch-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "backend_high_memory" {
  alarm_name          = "${var.environment}-backend-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.memory_utilization_threshold
  alarm_description   = "This metric monitors backend service memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = var.backend_service_name
    ClusterName = var.ecs_cluster_name
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-high-memory-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Alarms for Database Performance
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "${var.environment}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.database_cpu_threshold
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-rds-high-cpu-alarm"
    Type = "cloudwatch-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "rds_high_connections" {
  alarm_name          = "${var.environment}-rds-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.database_connection_threshold
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = var.rds_instance_id
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-rds-high-connections-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Log Insights Queries
resource "aws_cloudwatch_query_definition" "error_analysis" {
  name = "${var.environment}-error-analysis"
  
  log_group_names = [
    var.frontend_log_group_name,
    var.backend_log_group_name
  ]
  
  query_string = <<EOF
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| stats count() by bin(5m)
| sort @timestamp desc
EOF
}

resource "aws_cloudwatch_query_definition" "performance_analysis" {
  name = "${var.environment}-performance-analysis"
  
  log_group_names = [
    var.backend_log_group_name
  ]
  
  query_string = <<EOF
fields @timestamp, @message, @duration
| filter @message like /response_time/
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)
| sort @timestamp desc
EOF
}

resource "aws_cloudwatch_query_definition" "user_activity" {
  name = "${var.environment}-user-activity"
  
  log_group_names = [
    var.backend_log_group_name
  ]
  
  query_string = <<EOF
fields @timestamp, @message, user_id, action
| filter @message like /user_action/
| stats count() by action, bin(1h)
| sort @timestamp desc
EOF
}# Lo
g Group for Centralized Application Logs
resource "aws_cloudwatch_log_group" "application_logs" {
  name              = "/aws/application/${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-application-logs"
    Type = "cloudwatch-log-group"
  })
}

# Log Group for Security Logs
resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/aws/security/${var.environment}"
  retention_in_days = var.security_log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-security-logs"
    Type = "cloudwatch-log-group"
  })
}

# Log Group for Audit Logs
resource "aws_cloudwatch_log_group" "audit_logs" {
  name              = "/aws/audit/${var.environment}"
  retention_in_days = var.audit_log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-audit-logs"
    Type = "cloudwatch-log-group"
  })
}

# Log Metric Filter for Error Count
resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "${var.environment}-error-count"
  log_group_name = var.backend_log_group_name
  pattern        = "[timestamp, request_id, level=\"ERROR\", ...]"
  
  metric_transformation {
    name      = "ErrorCount"
    namespace = "Application/${var.environment}"
    value     = "1"
  }
}

# Log Metric Filter for Warning Count
resource "aws_cloudwatch_log_metric_filter" "warning_count" {
  name           = "${var.environment}-warning-count"
  log_group_name = var.backend_log_group_name
  pattern        = "[timestamp, request_id, level=\"WARN\", ...]"
  
  metric_transformation {
    name      = "WarningCount"
    namespace = "Application/${var.environment}"
    value     = "1"
  }
}

# Log Metric Filter for Response Time
resource "aws_cloudwatch_log_metric_filter" "response_time" {
  name           = "${var.environment}-response-time"
  log_group_name = var.backend_log_group_name
  pattern        = "[timestamp, request_id, level, message, duration]"
  
  metric_transformation {
    name      = "ResponseTime"
    namespace = "Application/${var.environment}"
    value     = "$duration"
    unit      = "Milliseconds"
  }
}

# Log Metric Filter for User Login Events
resource "aws_cloudwatch_log_metric_filter" "user_logins" {
  name           = "${var.environment}-user-logins"
  log_group_name = var.backend_log_group_name
  pattern        = "[timestamp, request_id, level, message=\"USER_LOGIN\", ...]"
  
  metric_transformation {
    name      = "UserLogins"
    namespace = "Application/${var.environment}"
    value     = "1"
  }
}

# Log Metric Filter for Failed Login Attempts
resource "aws_cloudwatch_log_metric_filter" "failed_logins" {
  name           = "${var.environment}-failed-logins"
  log_group_name = var.backend_log_group_name
  pattern        = "[timestamp, request_id, level, message=\"LOGIN_FAILED\", ...]"
  
  metric_transformation {
    name      = "FailedLogins"
    namespace = "Application/${var.environment}"
    value     = "1"
  }
}

# CloudWatch Alarm for High Error Count
resource "aws_cloudwatch_metric_alarm" "high_error_count" {
  alarm_name          = "${var.environment}-high-error-count"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "Application/${var.environment}"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.error_count_threshold
  alarm_description   = "This metric monitors application error count"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
  
  tags = merge(var.tags, {
    Name = "${var.environment}-high-error-count-alarm"
    Type = "cloudwatch-alarm"
  })
}

# CloudWatch Alarm for Failed Login Attempts
resource "aws_cloudwatch_metric_alarm" "suspicious_login_activity" {
  alarm_name          = "${var.environment}-suspicious-login-activity"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FailedLogins"
  namespace           = "Application/${var.environment}"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.failed_login_threshold
  alarm_description   = "This metric monitors suspicious login activity"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  tags = merge(var.tags, {
    Name = "${var.environment}-suspicious-login-alarm"
    Type = "cloudwatch-alarm"
  })
}

# Log Stream for Application Events
resource "aws_cloudwatch_log_stream" "application_events" {
  name           = "${var.environment}-application-events"
  log_group_name = aws_cloudwatch_log_group.application_logs.name
}

# Log Stream for Security Events
resource "aws_cloudwatch_log_stream" "security_events" {
  name           = "${var.environment}-security-events"
  log_group_name = aws_cloudwatch_log_group.security_logs.name
}

# Log Stream for Audit Events
resource "aws_cloudwatch_log_stream" "audit_events" {
  name           = "${var.environment}-audit-events"
  log_group_name = aws_cloudwatch_log_group.audit_logs.name
}

# CloudWatch Log Destination for Cross-Account Log Sharing (if needed)
resource "aws_cloudwatch_log_destination" "cross_account_logs" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  name       = "${var.environment}-cross-account-logs"
  role_arn   = aws_iam_role.log_destination[0].arn
  target_arn = aws_kinesis_firehose_delivery_stream.log_stream[0].arn
  
  tags = merge(var.tags, {
    Name = "${var.environment}-log-destination"
    Type = "cloudwatch-log-destination"
  })
}

# IAM Role for Log Destination
resource "aws_iam_role" "log_destination" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  name = "${var.environment}-log-destination-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "logs.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name = "${var.environment}-log-destination-role"
    Type = "iam-role"
  })
}

# Kinesis Firehose for Log Streaming
resource "aws_kinesis_firehose_delivery_stream" "log_stream" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  name        = "${var.environment}-log-stream"
  destination = "s3"
  
  s3_configuration {
    role_arn   = aws_iam_role.firehose_delivery[0].arn
    bucket_arn = aws_s3_bucket.log_archive[0].arn
    prefix     = "logs/year=!{timestamp:yyyy}/month=!{timestamp:MM}/day=!{timestamp:dd}/hour=!{timestamp:HH}/"
    
    buffer_size     = 5
    buffer_interval = 300
    
    compression_format = "GZIP"
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-log-firehose"
    Type = "kinesis-firehose"
  })
}

# S3 Bucket for Log Archive
resource "aws_s3_bucket" "log_archive" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  bucket        = "${var.environment}-log-archive-${random_id.log_bucket_suffix[0].hex}"
  force_destroy = var.environment != "prod"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-log-archive"
    Type = "s3-bucket"
  })
}

resource "random_id" "log_bucket_suffix" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  byte_length = 4
}

# S3 Bucket Lifecycle Configuration for Log Archive
resource "aws_s3_bucket_lifecycle_configuration" "log_archive" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  bucket = aws_s3_bucket.log_archive[0].id
  
  rule {
    id     = "log_lifecycle"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    
    expiration {
      days = var.log_archive_retention_days
    }
  }
}

# IAM Role for Firehose Delivery
resource "aws_iam_role" "firehose_delivery" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  name = "${var.environment}-firehose-delivery-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "firehose.amazonaws.com"
        }
      }
    ]
  })
  
  tags = merge(var.tags, {
    Name = "${var.environment}-firehose-delivery-role"
    Type = "iam-role"
  })
}

# IAM Policy for Firehose Delivery
resource "aws_iam_role_policy" "firehose_delivery" {
  count = var.enable_cross_account_logging ? 1 : 0
  
  name = "${var.environment}-firehose-delivery-policy"
  role = aws_iam_role.firehose_delivery[0].id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:AbortMultipartUpload",
          "s3:GetBucketLocation",
          "s3:GetObject",
          "s3:ListBucket",
          "s3:ListBucketMultipartUploads",
          "s3:PutObject"
        ]
        Resource = [
          aws_s3_bucket.log_archive[0].arn,
          "${aws_s3_bucket.log_archive[0].arn}/*"
        ]
      }
    ]
  })
}