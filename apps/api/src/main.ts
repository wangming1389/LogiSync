import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	logger.log('Bootstrapping LogiSync API...');

	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get<number>('API_PORT', 9751);

	const corsOrigins = (
		configService.get<string>('CORS_ORIGINS') ??
		configService.get<string>('FRONTEND_URL') ??
		'http://localhost:5173'
	)
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean);

	app.enableShutdownHooks();
	app.useGlobalPipes(new ZodValidationPipe());
	app.enableCors({ origin: corsOrigins, credentials: true });

	// Swagger documentation
	const swaggerConfig = new DocumentBuilder()
		.setTitle('LogiSync API')
		.setDescription('B2B Logistics Platform')
		.setVersion('1.0.0')
		.setLicense('MIT', 'https://opensource.org/licenses/MIT')
		.addBearerAuth(
			{ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			'access-token',
		)
		.addTag('System', 'System health and monitoring endpoints')
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);

	// Scalar UI at /docs
	app.use(
		'/docs',
		apiReference({
			content: document,
			theme: 'default',
		}),
	);

	SwaggerModule.setup('docs/swagger', app, document);

	await app.listen(port, '0.0.0.0');

	logger.log(`🔗 API Base URL: http://localhost:${port}`);
	logger.log(`📚 API Documentation: http://localhost:${port}/docs`);
	logger.log(`❤️  Health Check: http://localhost:${port}/health`);
	logger.log(`🔍 Liveness Probe: http://localhost:${port}/health/live`);
	logger.log(`📊 Metrics (Prometheus): http://localhost:${port}/metrics`);
	logger.log(`🔥 Prometheus UI: http://localhost:9090`);
	logger.log(`📈 Grafana Dashboard: http://localhost:3001`);
}

bootstrap().catch((err: unknown) => {
	new Logger('Bootstrap').error(
		'Failed to start server',
		err instanceof Error ? err.stack : String(err),
	);
	process.exit(1);
});
