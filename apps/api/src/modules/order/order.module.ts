import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { IamModule } from '../iam/iam.module';
import { OrderController } from './controllers/order.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';

@Module({
	imports: [AuditModule, IamModule, MessageQueueModule],
	controllers: [OrderController],
	providers: [OrderService, OrderRepository],
	exports: [OrderService, OrderRepository],
})
export class OrderModule {}
