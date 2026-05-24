import { forwardRef, Module } from '@nestjs/common';
import { EmailModule } from '../../infrastructure/email/email.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { IamModule } from '../iam/iam.module';
import { AccountCreatedConsumer } from './consumers/account-created.consumer';
import { WorkspacePendingConsumer } from './consumers/workspace-pending.consumer';
import { NotificationController } from './controllers/notification.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';

@Module({
	imports: [EmailModule, MessageQueueModule, forwardRef(() => IamModule)],
	controllers: [NotificationController],
	providers: [
		NotificationRepository,
		NotificationService,
		WorkspacePendingConsumer,
		AccountCreatedConsumer,
	],
	exports: [NotificationService],
})
export class NotificationModule {}
