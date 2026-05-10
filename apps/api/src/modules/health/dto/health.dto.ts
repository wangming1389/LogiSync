import { ApiProperty } from '@nestjs/swagger';

export class HealthStatusDto {
	@ApiProperty({
		example: true,
		description: 'PostgreSQL database connection status',
	})
	database!: boolean;

	@ApiProperty({
		example: true,
		description: 'Redis cache connection status',
	})
	redis!: boolean;

	@ApiProperty({
		example: true,
		description: 'MinIO object storage connection status',
	})
	objectStorage!: boolean;

	@ApiProperty({
		example: true,
		description: 'RabbitMQ message queue connection status',
	})
	messageQueue!: boolean;

	@ApiProperty({
		example: 1715339400000,
		description: 'Timestamp of the health check in milliseconds',
	})
	timestamp!: number;
}

export class HealthResponseDto {
	@ApiProperty({
		enum: ['healthy', 'degraded'],
		example: 'healthy',
		description: 'Overall health status of the system',
	})
	status!: 'healthy' | 'degraded';

	@ApiProperty({
		type: HealthStatusDto,
		description: 'Detailed status of each service',
	})
	details!: HealthStatusDto;

	@ApiProperty({
		example: '2026-05-10T10:00:00.000Z',
		description: 'ISO 8601 timestamp of the response',
	})
	timestamp!: string;
}

export class ReadinessResponseDto {
	@ApiProperty({
		example: true,
		description: 'True if all critical services are ready to accept requests',
	})
	ready!: boolean;

	@ApiProperty({
		example: '2026-05-10T10:00:00.000Z',
		description: 'ISO 8601 timestamp of the response',
	})
	timestamp!: string;
}

export class LivenessResponseDto {
	@ApiProperty({
		example: true,
		description: 'True if the service is running and responsive',
	})
	alive!: boolean;

	@ApiProperty({
		example: '2026-05-10T10:00:00.000Z',
		description: 'ISO 8601 timestamp of the response',
	})
	timestamp!: string;
}
