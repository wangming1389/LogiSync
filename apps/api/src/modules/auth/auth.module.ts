import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PermissionService } from './services/permission.service';

@Module({
	providers: [AuthService, PermissionService],
	exports: [AuthService, PermissionService],
})
export class AuthModule {}
