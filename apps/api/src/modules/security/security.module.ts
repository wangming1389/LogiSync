import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionModule } from '../session/session.module';
import { RbacGuard } from './rbac.guard';
import { SecurityService } from './security.service';

@Module({
	imports: [forwardRef(() => SessionModule), AuthModule],
	providers: [SecurityService, RbacGuard],
	exports: [SecurityService, RbacGuard],
})
export class SecurityModule {}
