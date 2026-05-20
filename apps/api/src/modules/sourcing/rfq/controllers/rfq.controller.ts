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
	SOURCING_ANY_PARTY_ROLES,
	SOURCING_BUYER_ROLES,
} from '../../enums/sourcing-role.enums';
import {
	AddRfqItemDto,
	CreateRfqDto,
	ListRfqQueryDto,
	UpdateRfqItemDto,
} from '../dtos/rfq.dto';
import { RfqService } from '../services/rfq.service';

@ApiTags('Sourcing - RFQ')
@Controller('rfqs')
@ApiBearerAuth('access-token')
export class RfqController {
	constructor(private readonly rfqService: RfqService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Create draft RFQ (US-62)' })
	@ApiBody({ type: CreateRfqDto })
	@ApiResponse({ status: 201, description: 'Draft RFQ created' })
	@SkipGlobalAudit()
	async create(@Body() dto: CreateRfqDto, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		return this.rfqService.createDraft(
			dto,
			payload.sub,
			payload.workspaceId,
			ipAddress,
		);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_ANY_PARTY_ROLES)
	@ApiOperation({
		summary: 'List RFQs visible to the caller',
		description:
			'Buyers see RFQs owned by their workspace. Suppliers see only Child RFQs explicitly addressed to their workspace.',
	})
	@ApiQuery({ name: 'status', required: false, type: 'string' })
	@ApiQuery({ name: 'limit', required: false, type: 'number' })
	@ApiQuery({ name: 'offset', required: false, type: 'number' })
	@ApiResponse({ status: 200, description: 'Paginated RFQ list' })
	async list(@Query() query: ListRfqQueryDto, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.listAccessible(query, payload.role);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_ANY_PARTY_ROLES)
	@ApiOperation({ summary: 'Get RFQ detail with items' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'RFQ detail' })
	@ApiResponse({ status: 404, description: 'RFQ not found' })
	async detail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.getRfqDetail(id, payload.role);
	}

	@Post(':id/items')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Add an item to draft RFQ (BR-387)',
		description:
			'Only Buyers can add items to the RFQ, and only while it is in Draft status. ' +
			'If the same product is added multiple times, it will be merged into a single line item with aggregated quantity. ' +
			'The RFQ is locked for editing once a quotation has been submitted against it by a Supplier.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: AddRfqItemDto })
	@ApiResponse({ status: 201, description: 'RFQ item added or merged' })
	@ApiResponse({
		status: 400,
		description: 'Product invalid or 200-item cap exceeded',
	})
	@ApiResponse({ status: 409, description: 'RFQ is locked or not draft' })
	@SkipGlobalAudit()
	async addItem(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: AddRfqItemDto,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.addItem(
			id,
			dto,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Patch(':id/items/:itemId')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@ApiOperation({ summary: 'Update item in draft RFQ' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiParam({ name: 'itemId', type: 'string', format: 'uuid' })
	@ApiBody({ type: UpdateRfqItemDto })
	@ApiResponse({ status: 200, description: 'RFQ item updated' })
	@ApiResponse({ status: 409, description: 'RFQ is locked or not draft' })
	@SkipGlobalAudit()
	async updateItem(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('itemId', ParseUUIDPipe) itemId: string,
		@Body() dto: UpdateRfqItemDto,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.updateItem(
			id,
			itemId,
			dto,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Delete(':id/items/:itemId')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@ApiOperation({ summary: 'Remove item from draft RFQ' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiParam({ name: 'itemId', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'RFQ item deleted' })
	@ApiResponse({ status: 409, description: 'RFQ is locked or not draft' })
	@SkipGlobalAudit()
	async deleteItem(
		@Param('id', ParseUUIDPipe) id: string,
		@Param('itemId', ParseUUIDPipe) itemId: string,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.deleteItem(
			id,
			itemId,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Post(':id/submit')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@ApiOperation({
		summary: 'Submit draft RFQ → split into per-supplier Child RFQs (US-63)',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Submitted; child RFQs created' })
	@ApiResponse({
		status: 400,
		description: 'Draft RFQ has no items',
	})
	@ApiResponse({ status: 409, description: 'RFQ is not a draft' })
	@SkipGlobalAudit()
	async submit(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.submitRfq(
			id,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_BUYER_ROLES)
	@ApiOperation({
		summary: 'Delete an RFQ - only while status = draft and unlocked',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'RFQ deleted' })
	@ApiResponse({
		status: 409,
		description: 'Only unlocked draft RFQs can be deleted',
	})
	@SkipGlobalAudit()
	async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.deleteDraft(
			id,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Get(':rfqId/quotations')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SOURCING_ANY_PARTY_ROLES)
	@ApiOperation({ summary: 'List quotations received for RFQ' })
	@ApiParam({ name: 'rfqId', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'List of quotations' })
	async listQuotations(
		@Param('rfqId', ParseUUIDPipe) rfqId: string,
		@Req() req: Request,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.rfqService.listQuotationsForRfq(rfqId, payload.role);
	}
}
