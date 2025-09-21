# Monitoring Module Outputs

# SNS Topic Outputs
output "alerts_topic_arn" {
  description = "ARN of the alerts SNS topic"
  value       = aws_sns_topic.alerts.arn
}

output "alerts_topic_name" {
  description = "Name of the alerts SNS topic"
  value       = aws_sns_topic.alerts.name
}

# CloudWatch Dashboard Outputs
output "application_dashboard_url" {
  description = "URL of the application overview dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.application_overview.dashboard_name}"
}

output "infrastructure_dashboard_url" {
  description = "URL of the infrastructure overview dashboard"
  value       = "https://console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.infrastructure_overview.dashboard_name}"
}

output "application_dashboard_name" {
  description = "Name of the application overview dashboard"
  value       = aws_cloudwatch_dashboard.application_overview.dashboard_name
}

output "infrastructure_dashboard_name" {
  description = "Name of the infrastructure overview dashboard"
  value       = aws_cloudwatch_dashboard.infrastructure_overview.dashboard_name
}

# CloudWatch Alarm Outputs
output "high_error_rate_alarm_arn" {
  description = "ARN of the high error rate alarm"
  value       = aws_cloudwatch_metric_alarm.high_error_rate.arn
}

output "high_response_time_alarm_arn" {
  description = "ARN of the high response time alarm"
  value       = aws_cloudwatch_metric_alarm.high_response_time.arn
}

output "frontend_high_cpu_alarm_arn" {
  description = "ARN of the frontend high CPU alarm"
  value       = aws_cloudwatch_metric_alarm.frontend_high_cpu.arn
}

output "backend_high_cpu_alarm_arn" {
  description = "ARN of the backend high CPU alarm"
  value       = aws_cloudwatch_metric_alarm.backend_high_cpu.arn
}

output "frontend_high_memory_alarm_arn" {
  description = "ARN of the frontend high memory alarm"
  value       = aws_cloudwatch_metric_alarm.frontend_high_memory.arn
}

output "backend_high_memory_alarm_arn" {
  description = "ARN of the backend high memory alarm"
  value       = aws_cloudwatch_metric_alarm.backend_high_memory.arn
}

output "rds_high_cpu_alarm_arn" {
  description = "ARN of the RDS high CPU alarm"
  value       = aws_cloudwatch_metric_alarm.rds_high_cpu.arn
}

output "rds_high_connections_alarm_arn" {
  description = "ARN of the RDS high connections alarm"
  value       = aws_cloudwatch_metric_alarm.rds_high_connections.arn
}

output "high_error_count_alarm_arn" {
  description = "ARN of the high error count alarm"
  value       = aws_cloudwatch_metric_alarm.high_error_count.arn
}

output "suspicious_login_alarm_arn" {
  description = "ARN of the suspicious login activity alarm"
  value       = aws_cloudwatch_metric_alarm.suspicious_login_activity.arn
}

# Log Group Outputs
output "application_log_group_name" {
  description = "Name of the application log group"
  value       = aws_cloudwatch_log_group.application_logs.name
}

output "application_log_group_arn" {
  description = "ARN of the application log group"
  value       = aws_cloudwatch_log_group.application_logs.arn
}

output "security_log_group_name" {
  description = "Name of the security log group"
  value       = aws_cloudwatch_log_group.security_logs.name
}

output "security_log_group_arn" {
  description = "ARN of the security log group"
  value       = aws_cloudwatch_log_group.security_logs.arn
}

output "audit_log_group_name" {
  description = "Name of the audit log group"
  value       = aws_cloudwatch_log_group.audit_logs.name
}

output "audit_log_group_arn" {
  description = "ARN of the audit log group"
  value       = aws_cloudwatch_log_group.audit_logs.arn
}

# Log Stream Outputs
output "application_log_stream_name" {
  description = "Name of the application log stream"
  value       = aws_cloudwatch_log_stream.application_events.name
}

output "security_log_stream_name" {
  description = "Name of the security log stream"
  value       = aws_cloudwatch_log_stream.security_events.name
}

output "audit_log_stream_name" {
  description = "Name of the audit log stream"
  value       = aws_cloudwatch_log_stream.audit_events.name
}

# Log Metric Filter Outputs
output "error_count_metric_filter_name" {
  description = "Name of the error count metric filter"
  value       = aws_cloudwatch_log_metric_filter.error_count.name
}

output "warning_count_metric_filter_name" {
  description = "Name of the warning count metric filter"
  value       = aws_cloudwatch_log_metric_filter.warning_count.name
}

output "response_time_metric_filter_name" {
  description = "Name of the response time metric filter"
  value       = aws_cloudwatch_log_metric_filter.response_time.name
}

output "user_logins_metric_filter_name" {
  description = "Name of the user logins metric filter"
  value       = aws_cloudwatch_log_metric_filter.user_logins.name
}

output "failed_logins_metric_filter_name" {
  description = "Name of the failed logins metric filter"
  value       = aws_cloudwatch_log_metric_filter.failed_logins.name
}

# Log Insights Query Outputs
output "error_analysis_query_name" {
  description = "Name of the error analysis Log Insights query"
  value       = aws_cloudwatch_query_definition.error_analysis.name
}

output "performance_analysis_query_name" {
  description = "Name of the performance analysis Log Insights query"
  value       = aws_cloudwatch_query_definition.performance_analysis.name
}

output "user_activity_query_name" {
  description = "Name of the user activity Log Insights query"
  value       = aws_cloudwatch_query_definition.user_activity.name
}

# Cross-Account Logging Outputs (conditional)
output "log_destination_arn" {
  description = "ARN of the log destination for cross-account logging"
  value       = var.enable_cross_account_logging ? aws_cloudwatch_log_destination.cross_account_logs[0].arn : null
}

output "log_archive_bucket_name" {
  description = "Name of the log archive S3 bucket"
  value       = var.enable_cross_account_logging ? aws_s3_bucket.log_archive[0].bucket : null
}

output "log_firehose_delivery_stream_name" {
  description = "Name of the Kinesis Firehose delivery stream"
  value       = var.enable_cross_account_logging ? aws_kinesis_firehose_delivery_stream.log_stream[0].name : null
}

# Monitoring Configuration Summary
output "monitoring_configuration" {
  description = "Summary of monitoring configuration"
  value = {
    environment = var.environment
    dashboards = {
      application_overview    = aws_cloudwatch_dashboard.application_overview.dashboard_name
      infrastructure_overview = aws_cloudwatch_dashboard.infrastructure_overview.dashboard_name
    }
    log_groups = {
      application = aws_cloudwatch_log_group.application_logs.name
      security    = aws_cloudwatch_log_group.security_logs.name
      audit       = aws_cloudwatch_log_group.audit_logs.name
    }
    alerts_topic = aws_sns_topic.alerts.arn
    cross_account_logging_enabled = var.enable_cross_account_logging
  }
}

# Alarm Summary
output "alarm_summary" {
  description = "Summary of all CloudWatch alarms"
  value = {
    application_alarms = {
      high_error_rate     = aws_cloudwatch_metric_alarm.high_error_rate.arn
      high_response_time  = aws_cloudwatch_metric_alarm.high_response_time.arn
      high_error_count    = aws_cloudwatch_metric_alarm.high_error_count.arn
      suspicious_logins   = aws_cloudwatch_metric_alarm.suspicious_login_activity.arn
    }
    infrastructure_alarms = {
      frontend_high_cpu    = aws_cloudwatch_metric_alarm.frontend_high_cpu.arn
      frontend_high_memory = aws_cloudwatch_metric_alarm.frontend_high_memory.arn
      backend_high_cpu     = aws_cloudwatch_metric_alarm.backend_high_cpu.arn
      backend_high_memory  = aws_cloudwatch_metric_alarm.backend_high_memory.arn
    }
    database_alarms = {
      rds_high_cpu         = aws_cloudwatch_metric_alarm.rds_high_cpu.arn
      rds_high_connections = aws_cloudwatch_metric_alarm.rds_high_connections.arn
    }
  }
}

# Metric Namespaces
output "custom_metric_namespaces" {
  description = "Custom metric namespaces used"
  value = [
    "Application/${var.environment}"
  ]
}

# Log Insights Information
output "log_insights_info" {
  description = "CloudWatch Log Insights query information"
  value = {
    queries = {
      error_analysis      = aws_cloudwatch_query_definition.error_analysis.name
      performance_analysis = aws_cloudwatch_query_definition.performance_analysis.name
      user_activity       = aws_cloudwatch_query_definition.user_activity.name
    }
    log_groups = [
      var.frontend_log_group_name,
      var.backend_log_group_name,
      aws_cloudwatch_log_group.application_logs.name
    ]
  }
}

# Environment information
output "environment" {
  description = "Environment name"
  value       = var.environment
}