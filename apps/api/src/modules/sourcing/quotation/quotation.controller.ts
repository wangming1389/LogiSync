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
import {
	AcceptRoundDto,
	NegotiateDto,
	SubmitQuotationDto,
} from './quotation.dto';
import { QuotationService } from './quotation.service';

const BUYER_ROLES = ['buyer_staff', 'buyer_manager', 'company_admin'] as const;
const SUPPLIER_ROLES = [
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;
const ANY_PARTY_ROLES = [
	'buyer_staff',
	'buyer_manager',
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;

@ApiTags('Sourcing - Quotation')
@ApiBearerAuth('access-token')
@Controller()
export class QuotationController {
	constructor(private readonly quotationService: QuotationService) {}

	@Post('rfqs/:rfqId/quotations')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...SUPPLIER_ROLES)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Supplier submits or drafts a quotation for a Child RFQ (US-32)',
	})
	@ApiParam({ name: 'rfqId', type: 'string', format: 'uuid' })
	@ApiBody({ type: SubmitQuotationDto })
	@ApiResponse({ status: 201, description: 'Quotation saved' })
	@ApiResponse({ status: 403, description: 'RFQ not addressed to caller' })
	@ApiResponse({ status: 409, description: 'Quotation locked or RFQ closed' })
	async respond(
		@Param('rfqId', ParseUUIDPipe) rfqId: string,
		@Body() dto: SubmitQuotationDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.quotationService.respondToRfq(
			rfqId,
			dto,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Get('quotations/:id')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...ANY_PARTY_ROLES)
	@ApiOperation({ summary: 'Quotation detail with items and negotiation log' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Quotation detail' })
	@ApiResponse({ status: 404, description: 'Quotation not found' })
	async detail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.quotationService.getQuotationDetail(
			id,
			payload.role,
			payload.workspaceId,
		);
	}

	@Post('quotations/:id/negotiate')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...ANY_PARTY_ROLES)
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Append a turn-based negotiation round (UC30, BR-206)',
		description:
			'Append-only at the DB layer. Returns 409 if it is the same party submitting two consecutive rounds.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: NegotiateDto })
	@ApiResponse({ status: 201, description: 'Round added' })
	@ApiResponse({
		status: 409,
		description: 'Same party twice in a row or quotation locked',
	})
	async negotiate(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: NegotiateDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.quotationService.negotiate(
			id,
			dto,
			payload.sub,
			payload.role,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Patch('quotations/:id/accept-round')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...ANY_PARTY_ROLES)
	@ApiOperation({
		summary: "Accept the opposing party's latest negotiation round (UC31)",
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: AcceptRoundDto })
	@ApiResponse({ status: 200, description: 'Round accepted' })
	@ApiResponse({
		status: 409,
		description: 'Cannot accept own round or round already accepted',
	})
	async acceptRound(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: AcceptRoundDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.quotationService.acceptLatestRound(
			id,
			dto,
			payload.sub,
			payload.role,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Post('quotations/:id/select')
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Roles(...BUYER_ROLES)
	@ApiOperation({
		summary: 'Buyer selects a quotation → atomic PO creation (US-64)',
		description:
			'Single transaction with pessimistic lock. Snapshots price + delivery terms onto the PO, rejects competing quotations, cancels sibling Child RFQs (BR-403), and closes the parent RFQ.',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 201, description: 'Selection succeeded; PO created' })
	@ApiResponse({ status: 409, description: 'Quotation already locked' })
	@HttpCode(HttpStatus.CREATED)
	async select(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.quotationService.selectQuotation(
			id,
			payload.sub,
			payload.role,
			payload.workspaceId,
			getClientIp(req),
		);
	}
}
