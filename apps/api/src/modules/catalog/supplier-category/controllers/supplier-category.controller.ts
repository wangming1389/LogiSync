/* eslint-disable @typescript-eslint/no-unsafe-return */
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
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { SkipGlobalAudit } from '../../../../common/decorators/skip-audit.decorator';
import {
	getClientIp,
	getRequestUser,
} from '../../../../common/utils/request.utils';
import { RbacGuard } from '../../../../core/security/rbac.guard';
import type { JwtPayload } from '../../../iam/auth/dtos/auth.dto';
import { JwtAuthGuard } from '../../../iam/auth/guards/jwt-auth.guard';
import {
	CreateSupplierCategoryDto,
	UpdateSupplierCategoryDto,
} from '../dtos/supplier-category.dto';
import { SupplierCategoryService } from '../services/supplier-category.service';

@ApiTags('Supplier Categories')
@Controller('catalog/categories')
@ApiBearerAuth('access-token')
export class SupplierCategoryController {
	constructor(
		private readonly supplierCategoryService: SupplierCategoryService,
	) {}

	@Post()
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create supplier category' })
	@ApiBody({ type: CreateSupplierCategoryDto })
	@ApiResponse({ status: 201, description: 'Category created' })
	@ApiResponse({
		status: 400,
		description: 'Catalog category not found or inactive',
	})
	@ApiResponse({ status: 409, description: 'Duplicate name' })
	@SkipGlobalAudit()
	async create(@Body() dto: CreateSupplierCategoryDto, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.supplierCategoryService.create(
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
		summary: 'List supplier categories in the caller workspace',
	})
	@ApiResponse({
		status: 200,
		description: 'List of active supplier categories',
	})
	async findAll() {
		return this.supplierCategoryService.findAll();
	}

	@Get('check-name')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Real-time unique name check (BR-152)',
	})
	@ApiQuery({ name: 'name', type: 'string', required: true })
	@ApiResponse({
		status: 200,
		description: 'Name availability result',
	})
	async checkName(@Query('name') name: string) {
		return this.supplierCategoryService.checkNameAvailability(name);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({ summary: 'Get supplier category detail' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Category details' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		return this.supplierCategoryService.findById(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary: 'Update supplier category name, description',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateSupplierCategoryDto })
	@ApiResponse({ status: 200, description: 'Category updated' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@ApiResponse({ status: 409, description: 'Duplicate name' })
	@SkipGlobalAudit()
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateSupplierCategoryDto,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.supplierCategoryService.update(
			id,
			dto,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('supplier_staff', 'supplier_manager', 'company_admin')
	@ApiOperation({
		summary:
			'Soft-delete supplier category - sets is_active = false (blocked if products exist)',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Category soft-deleted' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@ApiResponse({
		status: 409,
		description: 'Cannot delete category with linked products',
	})
	@SkipGlobalAudit()
	async softDelete(
		@Param('id', ParseUUIDPipe) id: string,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.supplierCategoryService.softDelete(
			id,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}
}
