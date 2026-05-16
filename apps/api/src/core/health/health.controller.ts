import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import {
	HealthResponseDto,
	LivenessResponseDto,
	ReadinessResponseDto,
} from './health.dto';
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
	getHealth(@Res() res: Response) {
		const status = this.healthCheckService.getStatus();
		const healthy = this.healthCheckService.isHealthy();

		return res
			.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
			.json({
				status: healthy
					? 'healthy'
					: status.degraded
						? 'degraded'
						: 'unhealthy',
				details: status,
				timestamp: new Date().toISOString(),
			});
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
	getReadiness(@Res() res: Response) {
		const ready = this.healthCheckService.isHealthy();

		return res
			.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
			.json({
				ready,
				timestamp: new Date().toISOString(),
			});
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
