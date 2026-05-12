import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { MessageQueueModule } from '../../infrastructure/message-queue/message-queue.module';
import { IamModule } from '../iam/iam.module';
import { CatalogCategoryController } from './catalog-category/catalog-category.controller';
import { CatalogCategoryRepository } from './catalog-category/catalog-category.repository';
import { CatalogCategoryService } from './catalog-category/catalog-category.service';
import { UomController } from './uom/uom.controller';
import { UomRepository } from './uom/uom.repository';
import { UomService } from './uom/uom.service';

@Module({
	imports: [AuditModule, MessageQueueModule, IamModule],
	controllers: [CatalogCategoryController, UomController],
	providers: [
		CatalogCategoryService,
		CatalogCategoryRepository,
		UomService,
		UomRepository,
	],
	exports: [CatalogCategoryService, UomService],
})
export class MasterDataModule {}
