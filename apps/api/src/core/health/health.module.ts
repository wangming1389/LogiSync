import { Module } from '@nestjs/common';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { SessionModule } from '../session/session.module';
import { HealthController } from './controllers/health.controller';
import { HealthCheckService } from './services/health-check.service';

@Module({
	imports: [SessionModule, ObjectStorageModule, MessageQueueModule],
	providers: [HealthCheckService],
	controllers: [HealthController],
	exports: [HealthCheckService],
})
export class HealthModule {}
