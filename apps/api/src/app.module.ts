import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV_FILE_PATHS } from './config/env-paths';
import { AuditModule } from './core/audit/audit.module';
import { HealthModule } from './core/health/health.module';
import { SecurityModule } from './core/security/security.module';
import { SessionModule } from './core/session/session.module';
import { WorkersModule } from './core/workers/workers.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { MessageQueueModule } from './infrastructure/message-queue/message-queue.module';
import { ObjectStorageModule } from './infrastructure/object-storage/object-storage.module';
import { IamModule } from './modules/iam/iam.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

@Module({
	imports: [
		ClsModule.forRoot({
			global: true,
			middleware: { mount: true },
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			envFilePath: ENV_FILE_PATHS,
		}),
		ScheduleModule.forRoot(),
		DatabaseModule,
		AuditModule,
		IamModule,
		SessionModule,
		SecurityModule,
		HealthModule,
		ObjectStorageModule,
		MessageQueueModule,
		WorkersModule,
		MasterDataModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
