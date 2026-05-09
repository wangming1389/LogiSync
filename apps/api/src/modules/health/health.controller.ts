import { Controller, Get } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';

@Controller('health')
export class HealthController {
	constructor(private healthCheckService: HealthCheckService) {}

	@Get()
	getHealth() {
		return {
			status: this.healthCheckService.isHealthy() ? 'healthy' : 'degraded',
			details: this.healthCheckService.getStatus(),
			timestamp: new Date().toISOString(),
		};
	}

	@Get('ready')
	getReadiness() {
		return {
			ready: this.healthCheckService.isHealthy(),
			timestamp: new Date().toISOString(),
		};
	}

	@Get('live')
	getLiveness() {
		return {
			alive: true,
			timestamp: new Date().toISOString(),
		};
	}
}
