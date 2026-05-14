/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
	Body,
	Controller,
	Get,
	Header,
	Param,
	ParseUUIDPipe,
	Patch,
	Query,
	Req,
	Res,
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
import type { Request, Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { getClientIp } from '../../common/utils/request.utils';
import { RbacGuard } from '../../core/security/rbac.guard';
import type { JwtPayload } from '../iam/auth/auth.dto';
import { JwtAuthGuard } from '../iam/auth/jwt-auth.guard';
import {
	AssignOrderDto,
	ExportOrdersQueryDto,
	ListOrdersQueryDto,
	RejectOrderDto,
} from './order.dto';
import { OrderService } from './order.service';

const ORDER_READ_ROLES = [
	'buyer_staff',
	'buyer_manager',
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;
const MANAGER_ROLES = ['buyer_manager', 'supplier_manager'] as const;

@ApiTags('Order Management')
@ApiBearerAuth('access-token')
@Controller('orders')
@UseGuards(JwtAuthGuard, RbacGuard)
export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	@Get()
	@Roles(...ORDER_READ_ROLES)
	@ApiOperation({ summary: 'List orders with role-based workspace scope' })
	@ApiQuery({ name: 'status', required: false, type: 'string' })
	@ApiQuery({ name: 'limit', required: false, type: 'number' })
	@ApiQuery({ name: 'offset', required: false, type: 'number' })
	@ApiResponse({ status: 200, description: 'Paginated order list' })
	async list(@Query() query: ListOrdersQueryDto, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.listOrders(
			query,
			payload.sub,
			payload.role,
			payload.workspaceId,
		);
	}

	@Get('export')
	@Roles(...MANAGER_ROLES)
	@Header('Cache-Control', 'no-store')
	@ApiOperation({ summary: 'Export order history as XLSX or PDF' })
	@ApiQuery({ name: 'start_date', required: true, type: 'string' })
	@ApiQuery({ name: 'end_date', required: true, type: 'string' })
	@ApiQuery({ name: 'format', required: true, enum: ['xlsx', 'pdf'] })
	@ApiResponse({ status: 200, description: 'Order export file' })
	@ApiResponse({ status: 400, description: 'Invalid date range' })
	async export(
		@Query() query: ExportOrdersQueryDto,
		@Req() req: Request,
		@Res() res: Response,
	) {
		const payload = (req as any).user as JwtPayload;
		const file = await this.orderService.exportOrders(
			query,
			payload.role,
			payload.workspaceId,
		);
		res.setHeader('Content-Type', file.contentType);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${file.filename}"`,
		);
		return res.send(file.buffer);
	}

	@Get(':id')
	@Roles(...ORDER_READ_ROLES)
	@ApiOperation({ summary: 'Get order detail including status history' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Order detail' })
	@ApiResponse({ status: 404, description: 'Order not found' })
	async detail(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.getOrderDetail(
			id,
			payload.sub,
			payload.role,
			payload.workspaceId,
		);
	}

	@Patch(':id/approve')
	@Roles('supplier_staff')
	@ApiOperation({ summary: 'Approve purchase order (US-25)' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Order approved' })
	@ApiResponse({ status: 409, description: 'Order is not pending approval' })
	async approve(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.approveOrder(
			id,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Patch(':id/reject')
	@Roles('supplier_staff')
	@ApiOperation({
		summary: 'Reject purchase order (US-26)',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: RejectOrderDto })
	@ApiResponse({ status: 200, description: 'Order rejected' })
	@ApiResponse({ status: 400, description: 'rejectionReason is required' })
	async reject(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: RejectOrderDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.rejectOrder(
			id,
			dto,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Patch(':id/confirm-receipt')
	@Roles('buyer_staff')
	@ApiOperation({ summary: 'Confirm goods received manually (US-73)' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Goods receipt confirmed' })
	async confirmReceipt(
		@Param('id', ParseUUIDPipe) id: string,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.confirmReceiptManually(
			id,
			payload.sub,
			payload.workspaceId,
			getClientIp(req),
		);
	}

	@Patch(':id/assign')
	@Roles(...MANAGER_ROLES)
	@ApiOperation({
		summary: 'Assign or reassign an order to staff',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiBody({ type: AssignOrderDto })
	@ApiResponse({ status: 200, description: 'Order assigned' })
	async assign(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: AssignOrderDto,
		@Req() req: Request,
	) {
		const payload = (req as any).user as JwtPayload;
		return this.orderService.assignOrder(
			id,
			dto,
			payload.sub,
			payload.role,
			payload.workspaceId,
			getClientIp(req),
		);
	}
}
