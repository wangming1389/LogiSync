import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuditModule } from '../audit/audit.module';
import { SecurityModule } from '../security/security.module';
import { SessionModule } from '../session/session.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JWT_EXPIRATION_SECONDS } from './auth/constants/auth.constants';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PermissionService } from './auth/permission.service';
import { WorkspaceController } from './workspace/workspace.controller';
import { WorkspaceService } from './workspace/workspace.service';

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
	],
	exports: [
		AuthService,
		JwtAuthGuard,
		JwtStrategy,
		PermissionService,
		PassportModule,
	],
})
export class IamModule {}
