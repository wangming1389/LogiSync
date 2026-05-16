import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
	const healthCheckService = {
		getStatus: jest.fn(),
		isHealthy: jest.fn(),
	};
	const response = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn(),
	};

	let controller: HealthController;

	beforeEach(() => {
		jest.clearAllMocks();
		controller = new HealthController(healthCheckService as never);
		healthCheckService.getStatus.mockReturnValue({
			database: true,
			redis: true,
			objectStorage: true,
			messageQueue: true,
			degraded: false,
			timestamp: Date.now(),
		});
		healthCheckService.isHealthy.mockReturnValue(true);
	});

	it('TC-HLT-01 Database Outage', () => {
		healthCheckService.isHealthy.mockReturnValue(false);

		controller.getReadiness(response as never);

		expect(response.status).toHaveBeenCalledWith(
			HttpStatus.SERVICE_UNAVAILABLE,
		);
		expect(response.json).toHaveBeenCalledWith(
			expect.objectContaining({ ready: false }),
		);
	});

	it('TC-HLT-02 Redis Degraded', () => {
		healthCheckService.getStatus.mockReturnValue({
			database: true,
			redis: false,
			objectStorage: true,
			messageQueue: true,
			degraded: true,
			timestamp: Date.now(),
		});

		controller.getHealth(response as never);

		expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(response.json).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'healthy',
				details: expect.objectContaining({ degraded: true, redis: false }),
			}),
		);

		jest.clearAllMocks();
		controller.getReadiness(response as never);

		expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
		expect(response.json).toHaveBeenCalledWith(
			expect.objectContaining({ ready: true }),
		);
	});
});
