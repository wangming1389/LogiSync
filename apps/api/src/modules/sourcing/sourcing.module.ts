import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { SessionModule } from '../../core/session/session.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { IamModule } from '../iam/iam.module';
import { QuotationController } from './quotation/controllers/quotation.controller';
import { QuotationRepository } from './quotation/repositories/quotation.repository';
import { QuotationService } from './quotation/services/quotation.service';
import { RfqController } from './rfq/controllers/rfq.controller';
import { RfqRepository } from './rfq/repositories/rfq.repository';
import { RfqService } from './rfq/services/rfq.service';
import { ProductSearchController } from './search/controllers/product-search.controller';
import { ProductSearchRepository } from './search/repositories/product-search.repository';
import { ProductSearchService } from './search/services/product-search.service';

@Module({
	imports: [
		AuditModule,
		IamModule,
		MessageQueueModule,
		ObjectStorageModule,
		SessionModule,
	],
	controllers: [ProductSearchController, RfqController, QuotationController],
	providers: [
		ProductSearchService,
		ProductSearchRepository,
		RfqService,
		RfqRepository,
		QuotationService,
		QuotationRepository,
	],
	exports: [RfqService, QuotationService, ProductSearchService],
})
export class SourcingModule {}
