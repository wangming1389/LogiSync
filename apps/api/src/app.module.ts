import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV_FILE_PATHS } from './config/env-paths';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MessageQueueModule } from './modules/message-queue/message-queue.module';
import { ObjectStorageModule } from './modules/object-storage/object-storage.module';
import { SecurityModule } from './modules/security/security.module';
import { SessionModule } from './modules/session/session.module';
import { WorkersModule } from './modules/workers/workers.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			envFilePath: ENV_FILE_PATHS,
		}),
		ScheduleModule.forRoot(),
		DatabaseModule,
		AuditModule,
		AuthModule,
		SessionModule,
		SecurityModule,
		HealthModule,
		ObjectStorageModule,
		MessageQueueModule,
		WorkersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
