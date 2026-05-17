/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { getClientIp } from '../../../../common/utils/request.utils';
import { RbacGuard } from '../../../../core/security/rbac.guard';
import type { JwtPayload } from '../../../iam/auth/dtos/auth.dto';
import { JwtAuthGuard } from '../../../iam/auth/guards/jwt-auth.guard';
import type { IMulterFile } from '../../../media/services/media.service';
import {
	CreateProductDto,
	ListProductsQueryDto,
	UpdateProductDto,
	UploadProductImageFromUrlDto,
} from '../dtos/product.dto';
import { ProductService } from '../services/product.service';

@ApiTags('Products')
@Controller('catalog/products')
@ApiBearerAuth('access-token')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Create a product - status defaults to draft',
	})
	@ApiBody({ type: CreateProductDto })
	@ApiResponse({ status: 201, description: 'Product created' })
	@ApiResponse({
		status: 400,
		description: 'UoM not found or inactive',
	})
	@ApiResponse({ status: 409, description: 'Duplicate SKU' })
	async create(@Body() dto: CreateProductDto, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.productService.create(
			dto,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'List products in the caller workspace with filters + pagination',
	})
	@ApiQuery({ name: 'keyword', required: false, type: 'string' })
	@ApiQuery({ name: 'categoryId', required: false, type: 'string' })
	@ApiQuery({
		name: 'status',
		required: false,
		enum: ['draft', 'active', 'inactive'],
	})
	@ApiQuery({ name: 'minPrice', required: false, type: 'number' })
	@ApiQuery({ name: 'maxPrice', required: false, type: 'number' })
	@ApiQuery({
		name: 'sortBy',
		required: false,
		enum: ['name', 'price', 'updatedAt'],
	})
	@ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
	@ApiQuery({ name: 'limit', required: false, type: 'number' })
	@ApiQuery({ name: 'offset', required: false, type: 'number' })
	@ApiResponse({
		status: 200,
		description: 'Paginated list of products',
	})
	async findAll(@Query() query: ListProductsQueryDto) {
		return this.productService.findAll(query);
	}

	@Get('check-sku')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Real-time unique SKU check',
	})
	@ApiQuery({ name: 'sku', type: 'string', required: true })
	@ApiResponse({
		status: 200,
		description: 'SKU availability result',
	})
	async checkSku(@Query('sku') sku: string) {
		return this.productService.checkSkuAvailability(sku);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({ summary: 'Get product detail' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Product details' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		return this.productService.findById(id);
	}

	@Get(':id/price-history')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Retrieve price change history',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({
		status: 200,
		description: 'Price history list',
	})
	@ApiResponse({ status: 404, description: 'Product not found' })
	async getPriceHistory(@Param('id', ParseUUIDPipe) id: string) {
		return this.productService.getPriceHistory(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Update product details (omits sku, status)',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateProductDto })
	@ApiResponse({ status: 200, description: 'Product updated' })
	@ApiResponse({ status: 404, description: 'Product not found' })
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateProductDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.productService.update(
			id,
			dto,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Patch(':id/publish')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Transition draft → active or inactive → active',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Product published' })
	@ApiResponse({
		status: 400,
		description: 'Invalid status transition',
	})
	@ApiResponse({ status: 404, description: 'Product not found' })
	async publish(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.productService.publish(
			id,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Patch(':id/unpublish')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Transition active → inactive',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Product unpublished' })
	@ApiResponse({
		status: 400,
		description: 'Only active products can be unpublished',
	})
	@ApiResponse({ status: 404, description: 'Product not found' })
	async unpublish(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.productService.unpublish(
			id,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Post(':id/upload-image')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({ summary: 'Upload product image from file' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiConsumes('multipart/form-data')
	@ApiQuery({
		name: 'replaceExisting',
		required: false,
		type: 'boolean',
		description:
			'If true, delete all old images and replace with new one. If false (default), append to existing images',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiResponse({ status: 201, description: 'Product image uploaded' })
	@UseInterceptors(FileInterceptor('file'))
	async uploadProductImage(
		@Param('id', ParseUUIDPipe) id: string,
		@UploadedFile() file: IMulterFile,
		@Req() req: Request,
		@Query('replaceExisting') replaceExisting?: string,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		// Convert query string 'true'/'false' to boolean
		const replace = replaceExisting === 'true';
		return this.productService.uploadProductImage(
			id,
			file,
			payload.sub,
			payload.workspaceId,
			ipAddress,
			replace,
		);
	}

	@Post(':id/upload-image-url')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({ summary: 'Batch upload product images from URLs' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UploadProductImageFromUrlDto })
	@ApiResponse({
		status: 201,
		description: 'Product images batch uploaded from URLs',
	})
	async uploadProductImageFromUrl(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UploadProductImageFromUrlDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		// Batch upload with parallel Promise.all (efficient for multiple URLs)
		// If replaceExisting=true, old images are deleted before uploading
		return this.productService.uploadProductImageFromUrl(
			id,
			dto.urls,
			payload.sub,
			payload.workspaceId,
			ipAddress,
			dto.folder,
			dto.replaceExisting || false,
		);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Hard delete - only allowed when status = draft',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Product deleted' })
	@ApiResponse({
		status: 409,
		description: 'Only draft products can be deleted',
	})
	@ApiResponse({ status: 404, description: 'Product not found' })
	async deleteProduct(
		@Param('id', ParseUUIDPipe) id: string,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.productService.deleteProduct(
			id,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}
}
