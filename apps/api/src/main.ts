import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ZodValidationPipe } from "nestjs-zod";

function parseCorsOrigins(configService: ConfigService) {
  const configuredOrigins =
    configService.get<string>("CORS_ORIGINS") ??
    configService.get<string>("FRONTEND_URL") ??
    "http://localhost:5173";

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  logger.log("Bootstrapping LogiSync API...");

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>("API_PORT", 3000);
  const corsOrigins = parseCorsOrigins(configService);

  app.enableShutdownHooks();
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  logger.log("Starting HTTP server...");
  await app.listen(port, "0.0.0.0");

  logger.log(`🚀 Backend API running on port ${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/health`);
  logger.log(`🔍 Ready check: http://localhost:${port}/health/ready`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger("Bootstrap");
  logger.error(
    "Failed to start server",
    error instanceof Error ? error.stack : String(error),
  );
  process.exit(1);
});
