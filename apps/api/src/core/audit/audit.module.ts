import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuditLogController } from './controllers/audit-log.controller';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditLogQueryService } from './services/audit-log-query.service';
import { AuditLoggerService } from './services/audit-logger.service';

@Module({
	imports: [PassportModule],
	controllers: [AuditLogController],
	providers: [
		AuditLoggerService,
		AuditLogQueryService,
		AuditInterceptor,
		{
			provide: APP_INTERCEPTOR,
			useExisting: AuditInterceptor,
		},
	],
	exports: [AuditLoggerService, AuditLogQueryService, AuditInterceptor],
})
export class AuditModule {}
