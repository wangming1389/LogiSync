import { Module } from '@nestjs/common';
import { RbacGuard } from './rbac.guard';
import { SecurityService } from './security.service';

@Module({
	providers: [SecurityService, RbacGuard],
	exports: [SecurityService, RbacGuard],
})
export class SecurityModule {}
