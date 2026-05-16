import { Module } from '@nestjs/common';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { SessionModule } from '../session/session.module';
import { HealthController } from './controllers/health.controller';
import { HealthCheckService } from './services/health-check.service';
import { HealthRegistryService } from './services/health-registry.service';

@Module({
	imports: [SessionModule, ObjectStorageModule, MessageQueueModule],
	providers: [HealthCheckService, HealthRegistryService],
	controllers: [HealthController],
	exports: [HealthCheckService, HealthRegistryService],
})
export class HealthModule {}
