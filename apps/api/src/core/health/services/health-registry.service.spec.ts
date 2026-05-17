import { HealthRegistryService } from './health-registry.service';

describe('HealthRegistryService', () => {
	let registry: HealthRegistryService;

	beforeEach(() => {
		jest.useRealTimers();
		registry = new HealthRegistryService();
	});

	it('TC-HLT-05 Check Execution', async () => {
		registry.register({
			name: 'database',
			required: true,
			check: jest.fn().mockResolvedValue(undefined),
		});

		await expect(registry.runChecks(100)).resolves.toEqual([
			{ name: 'database', healthy: true, required: true },
		]);
	});

	it('TC-HLT-06 Optional Check Failure', async () => {
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
