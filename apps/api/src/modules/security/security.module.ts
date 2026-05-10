import { forwardRef, Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { SessionModule } from '../session/session.module';
import { RbacGuard } from './rbac.guard';
import { SecurityService } from './security.service';

@Module({
	imports: [forwardRef(() => SessionModule), forwardRef(() => IamModule)],
	providers: [SecurityService, RbacGuard],
	exports: [SecurityService, RbacGuard],
})
export class SecurityModule {}
