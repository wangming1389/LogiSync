import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditModule } from '../../core/audit/audit.module';
import { SecurityModule } from '../../core/security/security.module';
import { SessionModule } from '../../core/session/session.module';
import { JWT_EXPIRATION_SECONDS } from './auth/constants/auth.constants';
import { AuthController } from './auth/controllers/auth.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserRepository } from './auth/repositories/user.repository';
import { AuthService } from './auth/services/auth.service';
import { PermissionService } from './auth/services/permission.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { WorkspaceController } from './workspace/controllers/workspace.controller';
import { WorkspaceRepository } from './workspace/repositories/workspace.repository';
import { WorkspaceService } from './workspace/services/workspace.service';

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: {
					expiresIn: JWT_EXPIRATION_SECONDS,
				},
			}),
			inject: [ConfigService],
		}),
		SessionModule,
		forwardRef(() => SecurityModule),
		AuditModule,
	],
	controllers: [AuthController, WorkspaceController],
	providers: [
		AuthService,
		JwtStrategy,
		JwtAuthGuard,
		PermissionService,
		WorkspaceService,
		UserRepository,
		WorkspaceRepository,
	],
	exports: [
		AuthService,
		JwtAuthGuard,
		JwtStrategy,
		PermissionService,
		PassportModule,
		WorkspaceRepository,
		WorkspaceService,
	],
})
export class IamModule {}
