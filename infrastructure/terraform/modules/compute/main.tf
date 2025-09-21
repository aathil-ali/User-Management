# Compute Module - ECS Cluster, Services, and Application Load Balancer
# Provides container orchestration and load balancing for the application

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# CloudWatch Log Groups for ECS services
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.environment}-frontend"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-logs"
    Type = "cloudwatch-log-group"
  })
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.environment}-backend"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-logs"
    Type = "cloudwatch-log-group"
  })
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-cluster"
  
  configuration {
    execute_command_configuration {
      kms_key_id = var.kms_key_id
      logging    = "OVERRIDE"
      
      log_configuration {
        cloud_watch_encryption_enabled = true
        cloud_watch_log_group_name     = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }
  
  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-cluster"
    Type = "ecs-cluster"
  })
}

# CloudWatch Log Group for ECS Exec
resource "aws_cloudwatch_log_group" "ecs_exec" {
  name              = "/aws/ecs/exec/${var.environment}"
  retention_in_days = var.log_retention_days
  
  tags = merge(var.tags, {
    Name = "${var.environment}-ecs-exec-logs"
    Type = "cloudwatch-log-group"
  })
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids
  
  enable_deletion_protection = var.enable_deletion_protection
  
  access_logs {
    bucket  = var.alb_access_logs_bucket
    prefix  = "${var.environment}-alb"
    enabled = var.alb_access_logs_bucket != null
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-alb"
    Type = "application-load-balancer"
  })
}

# ALB Target Group for Frontend
resource "aws_lb_target_group" "frontend" {
  name        = "${var.environment}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-target-group"
    Type = "alb-target-group"
  })
}

# ALB Target Group for Backend API
resource "aws_lb_target_group" "backend" {
  name        = "${var.environment}-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"
  
  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-target-group"
    Type = "alb-target-group"
  })
}

# ALB Listener for HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.ssl_certificate_arn
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-https-listener"
    Type = "alb-listener"
  })
}

# ALB Listener for HTTP (redirect to HTTPS)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"
  
  default_action {
    type = "redirect"
    
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-http-listener"
    Type = "alb-listener"
  })
}

# ALB Listener Rule for Backend API
resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100
  
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
  
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-api-rule"
    Type = "alb-listener-rule"
  })
}

# ECS Task Definition for Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.environment}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn           = var.ecs_task_role_arn
  
  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${var.frontend_image_uri}:${var.frontend_image_tag}"
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment == "prod" ? "production" : var.environment
        },
        {
          name  = "API_URL"
          value = "https://${var.domain_name}/api"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-task-definition"
    Type = "ecs-task-definition"
  })
}

# ECS Task Definition for Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn           = var.ecs_task_role_arn
  
  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.backend_image_uri}:${var.backend_image_tag}"
      
      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]
      
      environment = concat([
        {
          name  = "NODE_ENV"
          value = var.environment == "prod" ? "production" : var.environment
        },
        {
          name  = "PORT"
          value = "8000"
        }
      ], [
        for k, v in var.app_environment_variables : {
          name  = k
          value = v
        }
      ])
      
      secrets = concat([
        {
          name      = "JWT_SECRET"
          valueFrom = var.jwt_secret_parameter_name
        },
        {
          name      = "JWT_REFRESH_SECRET"
          valueFrom = var.jwt_refresh_secret_parameter_name
        },
        {
          name      = "SESSION_SECRET"
          valueFrom = var.session_secret_parameter_name
        },
        {
          name      = "DATABASE_URL"
          valueFrom = var.rds_connection_string_parameter_name
        },
        {
          name      = "MONGODB_URL"
          valueFrom = var.documentdb_connection_string_parameter_name
        },

      ], [
        for k, v in var.app_secrets : {
          name      = k
          valueFrom = v
        }
      ])
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
      
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8000/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
      
      essential = true
    }
  ])
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-task-definition"
    Type = "ecs-task-definition"
  })
}
# 
ECS Service for Frontend
resource "aws_ecs_service" "frontend" {
  name            = "${var.environment}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets         = var.private_subnet_ids
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }
  
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
  
  enable_execute_command = var.enable_ecs_exec
  
  depends_on = [aws_lb_listener.https]
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-service"
    Type = "ecs-service"
  })
}

# ECS Service for Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.environment}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"
  
  network_configuration {
    security_groups  = [var.ecs_security_group_id]
    subnets         = var.private_subnet_ids
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }
  
  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }
  
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }
  
  enable_execute_command = var.enable_ecs_exec
  
  depends_on = [aws_lb_listener.https]
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-service"
    Type = "ecs-service"
  })
}

# Auto Scaling Target for Frontend
resource "aws_appautoscaling_target" "frontend" {
  max_capacity       = var.frontend_max_capacity
  min_capacity       = var.frontend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.frontend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-autoscaling-target"
    Type = "autoscaling-target"
  })
}

# Auto Scaling Target for Backend
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.backend_max_capacity
  min_capacity       = var.backend_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-autoscaling-target"
    Type = "autoscaling-target"
  })
}

# Auto Scaling Policy for Frontend - CPU
resource "aws_appautoscaling_policy" "frontend_cpu" {
  name               = "${var.environment}-frontend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.frontend_cpu_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# Auto Scaling Policy for Frontend - Memory
resource "aws_appautoscaling_policy" "frontend_memory" {
  name               = "${var.environment}-frontend-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.frontend.resource_id
  scalable_dimension = aws_appautoscaling_target.frontend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.frontend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.frontend_memory_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# Auto Scaling Policy for Backend - CPU
resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "${var.environment}-backend-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = var.backend_cpu_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# Auto Scaling Policy for Backend - Memory
resource "aws_appautoscaling_policy" "backend_memory" {
  name               = "${var.environment}-backend-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.backend_memory_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 300
  }
}

# CloudWatch Alarms for ALB Target Health
resource "aws_cloudwatch_metric_alarm" "frontend_target_health" {
  alarm_name          = "${var.environment}-frontend-unhealthy-targets"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors frontend target health"
  alarm_actions       = var.alarm_notification_topic_arn != null ? [var.alarm_notification_topic_arn] : []
  
  dimensions = {
    TargetGroup  = aws_lb_target_group.frontend.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-frontend-target-health-alarm"
    Type = "cloudwatch-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "backend_target_health" {
  alarm_name          = "${var.environment}-backend-unhealthy-targets"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "HealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "1"
  alarm_description   = "This metric monitors backend target health"
  alarm_actions       = var.alarm_notification_topic_arn != null ? [var.alarm_notification_topic_arn] : []
  
  dimensions = {
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
    LoadBalancer = aws_lb.main.arn_suffix
  }
  
  tags = merge(var.tags, {
    Name = "${var.environment}-backend-target-health-alarm"
    Type = "cloudwatch-alarm"
  })
}