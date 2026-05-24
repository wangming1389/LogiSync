import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
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
import type { IMulterFile } from '../../../media/services/media.service';
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
	@UseInterceptors(FileInterceptor('avatar'))
	@Permissions(['hr:manage'])
	@ApiBearerAuth('access-token')
	@ApiConsumes('multipart/form-data')
	@ApiOperation({
		summary: 'Create a new employee account',
		description: `Provisions a workspace user with a temporary password and \`mustChangePassword=true\`.
			The temporary password is delivered to the new employee asynchronously via the \`account.created\` queue (with DLQ).
			Requires permission \`hr:manage\` (granted to \`company_admin\` and \`hr_manager\` roles).`,
	})
	@ApiBody({
		schema: {
			type: 'object',
			required: [
				'fullName',
				'email',
				'phoneNumber',
				'idCard',
				'avatar',
				'role',
				'department',
				'dateOfBirth',
			],
			properties: {
				fullName: { type: 'string' },
				email: { type: 'string', format: 'email' },
				phoneNumber: { type: 'string' },
				idCard: { type: 'string' },
				avatar: { type: 'string', format: 'binary' },
				role: { type: 'string' },
				department: { type: 'string' },
				dateOfBirth: { type: 'string', format: 'date' },
				vehicleTypePreference: { type: 'string' },
				firstName: { type: 'string' },
				lastName: { type: 'string' },
			},
		},
	})
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
	async addEmployee(
		@Body() dto: AddEmployeeDto,
		@UploadedFile() avatar: IMulterFile,
		@Req() req: Request,
	) {
		const actor = getRequestUser<JwtPayload>(req);
		const ipAddress = getClientIp(req);
		const userAgent = req.get('user-agent');

		return this.employeeService.addEmployee(
			dto,
			avatar,
			actor,
			ipAddress,
			userAgent,
		);
	}
}
