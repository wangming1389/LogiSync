import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { SessionModule } from '../../core/session/session.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { IamModule } from '../iam/iam.module';
import { QuotationController } from './quotation/quotation.controller';
import { QuotationRepository } from './quotation/quotation.repository';
import { QuotationService } from './quotation/quotation.service';
import { RfqController } from './rfq/rfq.controller';
import { RfqRepository } from './rfq/rfq.repository';
import { RfqService } from './rfq/rfq.service';
import { ProductSearchController } from './search/product-search.controller';
import { ProductSearchRepository } from './search/product-search.repository';
import { ProductSearchService } from './search/product-search.service';

@Module({
	imports: [AuditModule, IamModule, MessageQueueModule, SessionModule],
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
