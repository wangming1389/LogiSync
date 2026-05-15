import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLogController } from './audit-log.controller';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLoggerService } from './audit-logger.service';

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
