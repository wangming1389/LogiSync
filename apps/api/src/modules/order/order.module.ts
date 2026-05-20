import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { IamModule } from '../iam/iam.module';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { OrderExportService } from './services/order-export.service';
import { OrderStateTransitionService } from './services/order-state-transition.service';

@Module({
	imports: [AuditModule, IamModule, MessageQueueModule, ObjectStorageModule],
	controllers: [OrderController],
	providers: [
		OrderService,
		OrderRepository,
		OrderStateTransitionService,
		OrderExportService,
	],
	exports: [OrderService, OrderRepository],
})
export class OrderModule {}
