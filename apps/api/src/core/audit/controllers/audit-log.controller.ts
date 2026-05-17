import {
	Controller,
	ForbiddenException,
	Get,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import {
	getClientIp,
	getRequestUser,
} from '../../../common/utils/request.utils';
import type { JwtPayload } from '../../../modules/iam/auth/dtos/auth.dto';
import { UserRole } from '../../../modules/iam/auth/enums/user-role.enum';
import { AuditLogQueryDto } from '../dtos/audit-log-query.dto';
import { AuditLogQueryService } from '../services/audit-log-query.service';

@ApiTags('Platform Admin Audit Logs')
@ApiBearerAuth('access-token')
@Controller('admin/audit-logs')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
	constructor(private readonly auditLogQueryService: AuditLogQueryService) {}

	@Get()
	@ApiOperation({
		summary: 'List audit logs',
	})
	@ApiQuery({ name: 'actorId', required: false, type: 'string' })
	@ApiQuery({ name: 'workspaceId', required: false, type: 'string' })
	@ApiQuery({ name: 'action', required: false, type: 'string' })
	@ApiQuery({ name: 'from', required: false, type: 'string' })
	@ApiQuery({ name: 'to', required: false, type: 'string' })
	@ApiQuery({ name: 'page', required: false, type: 'number' })
	@ApiQuery({ name: 'limit', required: false, type: 'number' })
	@ApiResponse({ status: 200, description: 'Paginated audit logs' })
	async findAll(@Query() query: AuditLogQueryDto, @Req() req: Request) {
		const payload = this.requirePlatformAdmin(req);
		return this.auditLogQueryService.findAll(
			query,
			payload,
			getClientIp(req),
			req.get('user-agent'),
		);
	}

	@Get('export')
	@ApiOperation({
		summary: 'Stream audit logs as CSV',
	})
	@ApiResponse({ status: 200, description: 'CSV stream' })
	async exportCsv(
		@Query() query: AuditLogQueryDto,
		@Req() req: Request,
		@Res() response: Response,
	) {
		const payload = this.requirePlatformAdmin(req);
		await this.auditLogQueryService.streamCsv(
			query,
			payload,
			getClientIp(req),
			req.get('user-agent'),
			response,
		);
	}

	private requirePlatformAdmin(request: Request): JwtPayload {
		const payload = getRequestUser<JwtPayload>(request);
		if (payload.role !== (UserRole.PLATFORM_ADMIN as unknown)) {
			throw new ForbiddenException('Only PLATFORM_ADMIN can access audit logs');
		}
		return payload;
	}
}
