import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AuditLoggerService } from "./audit-logger.service";
import { AuditInterceptor } from "./audit.interceptor";

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
