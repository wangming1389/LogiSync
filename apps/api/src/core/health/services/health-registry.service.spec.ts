import { HealthRegistryService } from './health-registry.service';

describe('HealthRegistryService', () => {
	let registry: HealthRegistryService;

	beforeEach(() => {
		jest.useRealTimers();
		registry = new HealthRegistryService();
	});

	it('runs registered health checks', async () => {
		registry.register({
			name: 'database',
			required: true,
			check: jest.fn().mockResolvedValue(undefined),
		});

		await expect(registry.runChecks(100)).resolves.toEqual([
			{ name: 'database', healthy: true, required: true },
		]);
	});

	it('returns failed optional checks without throwing', async () => {
		registry.register({
			name: 'redis',
			check: jest.fn().mockRejectedValue(new Error('down')),
		});

		const [result] = await registry.runChecks(100);

		expect(result).toMatchObject({
			name: 'redis',
			healthy: false,
			required: false,
		});
		expect(result?.error).toBeInstanceOf(Error);
	});
});
