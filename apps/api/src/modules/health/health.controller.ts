import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	HealthResponseDto,
	LivenessResponseDto,
	ReadinessResponseDto,
} from './dto/health.dto';
import { HealthCheckService } from './health-check.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
	constructor(private healthCheckService: HealthCheckService) {}

	@ApiOperation({
		summary: 'Get system health status',
		description:
			'Returns the overall health status of all critical services including database, Redis, MinIO, and RabbitMQ.',
	})
	@ApiResponse({
		status: 200,
		description: 'Health status retrieved successfully',
		type: HealthResponseDto,
	})
	@Get()
	getHealth() {
		return {
			status: this.healthCheckService.isHealthy() ? 'healthy' : 'degraded',
			details: this.healthCheckService.getStatus(),
			timestamp: new Date().toISOString(),
		};
	}

	@ApiOperation({
		summary: 'Check service readiness',
		description:
			'Kubernetes-style readiness probe. Returns true only when all critical services are operational and ready to serve requests.',
	})
	@ApiResponse({
		status: 200,
		description: 'Readiness status retrieved successfully',
		type: ReadinessResponseDto,
	})
	@Get('ready')
	getReadiness() {
		return {
			ready: this.healthCheckService.isHealthy(),
			timestamp: new Date().toISOString(),
		};
	}

	@ApiOperation({
		summary: 'Check service liveness',
		description:
			'Kubernetes-style liveness probe. Returns true if the service is running and responsive.',
	})
	@ApiResponse({
		status: 200,
		description: 'Liveness status retrieved successfully',
		type: LivenessResponseDto,
	})
	@Get('live')
	getLiveness() {
		return {
			alive: true,
			timestamp: new Date().toISOString(),
		};
	}
}
