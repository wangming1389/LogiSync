import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { HealthCheckService } from './health-check.service';

jest.mock('nodemailer', () => ({
	createTransport: jest.fn(),
}));

describe('HealthCheckService', () => {
	const sendMail = jest.fn();
	const databaseService = { ping: jest.fn() };
	const sessionRegistryService = { ping: jest.fn() };
	const objectStorageService = { ping: jest.fn() };
	const messageQueueService = { ping: jest.fn() };
	const configService = { get: jest.fn() };

	let service: HealthCheckService;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
		databaseService.ping.mockResolvedValue(undefined);
		sessionRegistryService.ping.mockResolvedValue(undefined);
		objectStorageService.ping.mockResolvedValue(undefined);
		messageQueueService.ping.mockResolvedValue(undefined);
		configService.get.mockImplementation((key: string, fallback?: unknown) => {
			const values: Record<string, unknown> = {
				ALERT_EMAIL_TO: 'ops@logisync.test',
				SMTP_HOST: 'smtp.logisync.test',
				SMTP_PORT: 587,
				SMTP_USER: 'alerts@logisync.test',
				SMTP_PASS: 'secret',
			};
			return values[key] ?? fallback;
		});
		(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
		sendMail.mockResolvedValue(undefined);

		service = new HealthCheckService(
			databaseService as never,
			sessionRegistryService as never,
			objectStorageService as never,
			messageQueueService as never,
			configService as unknown as ConfigService,
		);
	});

	it('TC-HLT-04 Alert Cooldown', async () => {
		jest.useFakeTimers().setSystemTime(new Date('2026-05-16T00:00:00.000Z'));
		objectStorageService.ping.mockRejectedValue(new Error('minio down'));

		await service.performHealthCheck();
		await service.performHealthCheck();

		expect(sendMail).toHaveBeenCalledTimes(1);

		jest.setSystemTime(new Date('2026-05-16T00:02:01.000Z'));
		await service.performHealthCheck();

		expect(sendMail).toHaveBeenCalledTimes(2);
	});
});
