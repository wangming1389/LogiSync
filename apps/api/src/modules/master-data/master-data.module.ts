import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { IamModule } from '../iam/iam.module';
import { CatalogCategoryController } from './catalog-category/controllers/catalog-category.controller';
import { CatalogCategoryRepository } from './catalog-category/repositories/catalog-category.repository';
import { CatalogCategoryService } from './catalog-category/services/catalog-category.service';
import { UomController } from './uom/controllers/uom.controller';
import { UomRepository } from './uom/repositories/uom.repository';
import { UomService } from './uom/services/uom.service';

@Module({
	imports: [AuditModule, MessageQueueModule, IamModule],
	controllers: [CatalogCategoryController, UomController],
	providers: [
		CatalogCategoryService,
		CatalogCategoryRepository,
		UomService,
		UomRepository,
	],
	exports: [
		CatalogCategoryService,
		CatalogCategoryRepository,
		UomService,
		UomRepository,
	],
})
export class MasterDataModule {}
