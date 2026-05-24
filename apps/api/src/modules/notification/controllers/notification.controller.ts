import {
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
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { getRequestUser } from '../../../common/utils/request.utils';
import type { JwtPayload } from '../../iam/auth/dtos/auth.dto';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import {
	NotificationListQueryDto,
	NotificationListResponseDto,
} from '../dtos/notification.dto';
import { NotificationService } from '../services/notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'List notifications for the current user',
		description:
			'Returns paginated notifications delivered to the authenticated user. `onlyUnread=true` filters to undismissed entries.',
	})
	@ApiResponse({
		status: 200,
		description: 'Paginated notifications',
		type: NotificationListResponseDto,
	})
	async list(@Req() req: Request, @Query() query: NotificationListQueryDto) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.notificationService.listForUser(payload.sub, {
			page: query.page,
			limit: query.limit,
			onlyUnread: query.onlyUnread,
		});
	}

	@Patch(':id/read')
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Mark a single notification as read',
	})
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Notification marked as read' })
	@ApiResponse({
		status: 404,
		description: 'Notification not found or already read',
	})
	async markAsRead(
		@Req() req: Request,
		@Param('id', ParseUUIDPipe) notificationId: string,
	) {
		const payload = getRequestUser<JwtPayload>(req);
		await this.notificationService.markAsRead(payload.sub, notificationId);
		return { message: 'Notification marked as read' };
	}

	@Post('read-all')
	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'Mark all notifications of the current user as read',
	})
	@ApiResponse({
		status: 200,
		description: 'All notifications marked as read',
	})
	async markAllAsRead(@Req() req: Request) {
		const payload = getRequestUser<JwtPayload>(req);
		return this.notificationService.markAllAsRead(payload.sub);
	}
}
