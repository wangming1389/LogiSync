import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import {
	getClientIp,
	getRequestUser,
} from '../../../../common/utils/request.utils';
import { Permissions, RbacGuard } from '../../../../core/security/rbac.guard';
import { type JwtPayload } from '../../auth/dtos/auth.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AddEmployeeDto, AddEmployeeResponseDto } from '../dtos/employee.dto';
import { EmployeeService } from '../services/employee.service';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
	constructor(private readonly employeeService: EmployeeService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseGuards(JwtAuthGuard, RbacGuard)
	@Permissions(['hr:manage'])
	@ApiBearerAuth('access-token')
	@ApiOperation({
		summary: 'HR creates a new employee account',
		description: `Provisions a workspace user with a temporary password and \`mustChangePassword=true\`.
The temporary password is delivered to the new employee asynchronously via the \`account.created\` queue (with DLQ).
Requires permission \`hr:manage\` (granted to \`hr_manager\` role).`,
	})
	@ApiBody({ type: AddEmployeeDto })
	@ApiResponse({
		status: 201,
		description: 'Employee account created',
		type: AddEmployeeResponseDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Email already in use across workspaces',
	})
	@ApiResponse({ status: 403, description: 'Missing hr:manage permission' })
	async addEmployee(@Body() dto: AddEmployeeDto, @Req() req: Request) {
		const actor = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.employeeService.addEmployee(dto, actor, ipAddress, userAgent);
	}
}
