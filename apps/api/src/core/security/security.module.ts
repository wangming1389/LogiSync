import { forwardRef, Module } from '@nestjs/common';
import { IamModule } from '../../modules/iam/iam.module';
import { SessionModule } from '../session/session.module';
import { RateLimitGuard } from './rate-limit.guard';
import { RbacGuard } from './rbac.guard';
import { SecurityService } from './security.service';

@Module({
	imports: [forwardRef(() => SessionModule), forwardRef(() => IamModule)],
	providers: [SecurityService, RbacGuard, RateLimitGuard],
	exports: [SecurityService, RbacGuard, RateLimitGuard],
})
export class SecurityModule {}
