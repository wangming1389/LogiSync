/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
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
import { Roles } from '../../../common/decorators/roles.decorator';
import { getClientIp } from '../../../common/utils/request.utils';
import { RbacGuard } from '../../../core/security/rbac.guard';
import type { JwtPayload } from '../../iam/auth/auth.dto';
import { JwtAuthGuard } from '../../iam/auth/jwt-auth.guard';
import { CreateUomDto, UpdateUomDto } from './uom.dto';
import { UomService } from './uom.service';

@ApiTags('Units of Measure')
@Controller()
export class UomController {
	constructor(private readonly uomService: UomService) {}

	// POST /admin/uom (PLATFORM_ADMIN)
	@Post('admin/uom')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@HttpCode(HttpStatus.CREATED)
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Create new uom' })
	@ApiBody({ type: CreateUomDto })
	@ApiResponse({ status: 201, description: 'UoM created' })
	@ApiResponse({ status: 409, description: 'Duplicate name or code' })
	async create(@Body() dto: CreateUomDto, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.uomService.create(dto, payload.sub, ipAddress);
	}

	// GET /admin/uom (PLATFORM_ADMIN)
	@Get('admin/uom')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List uom (including inactive)',
	})
	@ApiResponse({
		status: 200,
		description: 'List of all units of measure',
	})
	async findAll() {
		return this.uomService.findAll();
	}

	// GET /admin/uom/:id (PLATFORM_ADMIN)
	@Get('admin/uom/:id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Get uom by ID' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'UoM details' })
	@ApiResponse({ status: 404, description: 'UoM not found' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		return this.uomService.findById(id);
	}

	// PATCH /admin/uom/:id (PLATFORM_ADMIN)
	@Patch('admin/uom/:id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Update uom name / code' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateUomDto })
	@ApiResponse({ status: 200, description: 'UoM updated' })
	@ApiResponse({ status: 404, description: 'UoM not found' })
	@ApiResponse({ status: 409, description: 'Duplicate name or code' })
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateUomDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.uomService.update(id, dto, payload.sub, ipAddress);
	}

	// PATCH /admin/uom/:id/disable (PLATFORM_ADMIN)
	@Patch('admin/uom/:id/disable')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Soft-disable uom',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'UoM disabled' })
	@ApiResponse({ status: 404, description: 'UoM not found' })
	async disable(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.uomService.disable(id, payload.sub, ipAddress);
	}

	// PATCH /admin/uom/:id/enable (PLATFORM_ADMIN)
	@Patch('admin/uom/:id/enable')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles('platform_admin')
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Re-enable disabled uom',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'UoM re-enabled' })
	@ApiResponse({ status: 404, description: 'UoM not found' })
	async enable(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.uomService.enable(id, payload.sub, ipAddress);
	}

	// GET /uom (Any authenticated user - active only)
	@Get('uom')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List active uom (for dropdowns)',
	})
	@ApiResponse({
		status: 200,
		description: 'List of active units of measure',
	})
	async findAllActive() {
		return this.uomService.findAllActive();
	}
}
