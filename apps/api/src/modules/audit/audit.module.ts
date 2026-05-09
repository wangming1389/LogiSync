import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';
import { AuditLoggerService } from './audit-logger.service';

@Module({
	providers: [
		AuditLoggerService,
		AuditInterceptor,
		{
			provide: APP_INTERCEPTOR,
			useExisting: AuditInterceptor,
		},
	],
	exports: [AuditLoggerService, AuditInterceptor],
})
export class AuditModule {}
