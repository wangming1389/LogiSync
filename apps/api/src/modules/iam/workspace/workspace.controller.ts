/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { getClientIp } from '../../../common/utils/request.utils';
import type { JwtPayload } from '../auth/auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
	EnableRoleDto,
	RegisterWorkspaceDto,
	RejectWorkspaceDto,
	UpdateWorkspaceDto,
	WorkspaceFilterDto,
} from './workspace.dto';
import { WorkspaceService } from './workspace.service';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspaceController {
	constructor(private readonly workspaceService: WorkspaceService) {}

	// POST /workspaces (Public)
	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Register new workspace',
		description: `Create new workspace with "pending" status and admin user.
      **Requirements:**
      - Valid tax ID (10 or 13 digits) and not duplicate
      - Unique slug containing only lowercase letters, numbers, and hyphens
      - Admin email not already in use
      - Must accept terms of service (acceptedTermsVersion)`,
	})
	@ApiBody({ type: RegisterWorkspaceDto })
	@ApiResponse({
		status: 201,
		description: 'Workspace created (status: pending)',
	})
	@ApiResponse({ status: 409, description: 'Duplicate taxId, slug, or email' })
	async register(@Body() dto: RegisterWorkspaceDto, @Req() req: Request) {
		const ipAddress = getClientIp(req);
		return this.workspaceService.register(dto, ipAddress);
	}

	// GET /workspaces (PLATFORM_ADMIN)
	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List workspaces',
		description:
			'Get list of workspaces with status filter and pagination. PLATFORM_ADMIN only.',
	})
	@ApiQuery({
		name: 'status',
		required: false,
		enum: ['pending', 'active', 'suspended', 'revoked'],
	})
	@ApiQuery({ name: 'page', required: false, type: Number })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiResponse({
		status: 200,
		description: 'List of workspaces with pagination',
	})
	async findAll(@Query() filter: WorkspaceFilterDto) {
		return this.workspaceService.findAll(filter);
	}

	// GET /workspaces/:id (PLATFORM_ADMIN)
	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Workspace details',
		description:
			'Get detailed information about a workspace by ID. PLATFORM_ADMIN only.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Workspace information' })
	@ApiResponse({ status: 404, description: 'Workspace does not exist' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		return this.workspaceService.findById(id);
	}

	// PATCH /workspaces/:id (PLATFORM_ADMIN)
	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Update workspace',
		description:
			'Update basic information (name) of workspace. PLATFORM_ADMIN only.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateWorkspaceDto })
	@ApiResponse({ status: 200, description: 'Workspace updated' })
	@ApiResponse({ status: 404, description: 'Workspace does not exist' })
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateWorkspaceDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.workspaceService.update(id, dto, payload.sub, ipAddress);
	}

	// PATCH /workspaces/:id/approve (PLATFORM_ADMIN)
	@Patch(':id/approve')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Approve workspace',
		description:
			'Change workspace from "pending" → "active". PLATFORM_ADMIN only.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Workspace approved' })
	@ApiResponse({
		status: 409,
		description: 'Workspace is not in pending status',
	})
	async approve(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.workspaceService.approve(id, payload.sub, ipAddress);
	}

	// PATCH /workspaces/:id/reject (PLATFORM_ADMIN)
	@Patch(':id/reject')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Reject workspace',
		description:
			'Change workspace from "pending" → "rejected". Rejection reason required.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: RejectWorkspaceDto })
	@ApiResponse({ status: 200, description: 'Workspace rejected' })
	@ApiResponse({
		status: 409,
		description: 'Workspace is not in pending status',
	})
	async reject(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: RejectWorkspaceDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.workspaceService.reject(id, dto, payload.sub, ipAddress);
	}

	// PATCH /workspaces/:id/suspend (PLATFORM_ADMIN)
	@Patch(':id/suspend')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Suspend workspace',
		description: `Change workspace → "suspended" and **force logout all sessions** within 10-30 seconds.
      All currently active JWTs of users in this workspace will be invalidated immediately via Redis session revocation.`,
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({
		status: 200,
		description: 'Workspace suspended, sessions revoked',
	})
	@ApiResponse({ status: 409, description: 'Workspace is already suspended' })
	async suspend(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.workspaceService.suspend(id, payload.sub, ipAddress);
	}

	// POST /workspaces/:id/roles/enable (COMPANY_ADMIN)

	@Post(':id/roles/enable')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Enable role for workspace',
		description:
			'Add new role to allowed roles list of workspace. COMPANY_ADMIN only.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: EnableRoleDto })
	@ApiResponse({ status: 201, description: 'Role enabled' })
	@ApiResponse({ status: 409, description: 'Role already enabled' })
	async enableRole(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: EnableRoleDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		const ipAddress = getClientIp(req);
		return this.workspaceService.enableRole(id, dto, payload.sub, ipAddress);
	}
}
