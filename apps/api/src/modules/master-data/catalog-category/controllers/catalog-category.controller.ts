/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiParam,
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
	CreateCatalogCategoryDto,
	UpdateCatalogCategoryDto,
} from '../dtos/catalog-category.dto';
import { CatalogCategoryService } from '../services/catalog-category.service';

@ApiTags('Catalog Categories')
@Controller()
export class CatalogCategoryController {
	constructor(
		private readonly catalogCategoryService: CatalogCategoryService,
	) {}

	// POST /admin/catalog-categories (PLATFORM_ADMIN)
	@Post('admin/catalog-categories')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Create new catalog category' })
	@ApiBody({ type: CreateCatalogCategoryDto })
	@ApiResponse({ status: 201, description: 'Category created' })
	@ApiResponse({
		status: 409,
		description: 'Duplicate name or code',
	})
	@SkipGlobalAudit()
	async create(@Body() dto: CreateCatalogCategoryDto, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.catalogCategoryService.create(dto, payload.sub, ipAddress);
	}

	// GET /admin/catalog-categories (PLATFORM_ADMIN)
	@Get('admin/catalog-categories')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List catalog categories (including inactive)',
	})
	@ApiResponse({
		status: 200,
		description: 'List of all catalog categories',
	})
	async findAll() {
		return this.catalogCategoryService.findAll();
	}

	// GET /admin/catalog-categories/:id (PLATFORM_ADMIN)
	@Get('admin/catalog-categories/:id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Get a single catalog category by ID' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Category details' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		return this.catalogCategoryService.findById(id);
	}

	// PATCH /admin/catalog-categories/:id (PLATFORM_ADMIN)
	@Patch('admin/catalog-categories/:id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Update catalog category name / description / code',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateCatalogCategoryDto })
	@ApiResponse({ status: 200, description: 'Category updated' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@ApiResponse({ status: 409, description: 'Duplicate name or code' })
	@SkipGlobalAudit()
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateCatalogCategoryDto,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.catalogCategoryService.update(id, dto, payload.sub, ipAddress);
	}

	// PATCH /admin/catalog-categories/:id/disable (PLATFORM_ADMIN)
	@Patch('admin/catalog-categories/:id/disable')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Soft-disable a catalog category',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Category disabled' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@SkipGlobalAudit()
	async disable(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.catalogCategoryService.disable(id, payload.sub, ipAddress);
	}

	// PATCH /admin/catalog-categories/:id/enable (PLATFORM_ADMIN)
	@Patch('admin/catalog-categories/:id/enable')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Re-enable disabled catalog category',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Category re-enabled' })
	@ApiResponse({ status: 404, description: 'Category not found' })
	@SkipGlobalAudit()
	async enable(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.catalogCategoryService.enable(id, payload.sub, ipAddress);
	}

	// GET /catalog-categories (Any authenticated user - active only)
	@Get('catalog-categories')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List active catalog categories (for dropdowns)',
	})
	@ApiResponse({
		status: 200,
		description: 'List of active catalog categories',
	})
	async findAllActive() {
		return this.catalogCategoryService.findAllActive();
	}
}
