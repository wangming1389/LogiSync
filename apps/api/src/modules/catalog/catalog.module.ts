import { Module } from '@nestjs/common';
import { AuditModule } from '../../core/audit/audit.module';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { IamModule } from '../iam/iam.module';
import { MasterDataModule } from '../master-data/master-data.module';
import { MediaModule } from '../media/media.module';
import { ProductController } from './product/product.controller';
import { ProductRepository } from './product/product.repository';
import { ProductService } from './product/product.service';
import { SupplierCategoryController } from './supplier-category/supplier-category.controller';
import { SupplierCategoryRepository } from './supplier-category/supplier-category.repository';
import { SupplierCategoryService } from './supplier-category/supplier-category.service';

@Module({
	imports: [
		AuditModule,
		IamModule,
		MasterDataModule,
		ObjectStorageModule,
		MediaModule,
	],
	controllers: [SupplierCategoryController, ProductController],
	providers: [
		SupplierCategoryService,
		SupplierCategoryRepository,
		ProductService,
		ProductRepository,
	],
	exports: [SupplierCategoryService, ProductService],
})
export class CatalogModule {}
