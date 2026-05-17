import { SetMetadata } from '@nestjs/common';

export const SKIP_GLOBAL_AUDIT_KEY = 'skipGlobalAudit';

/**
 * Marks a controller method to skip the global AuditInterceptor's success logging.
 *
 * Use this when the Service layer already writes a detailed audit log entry
 * (including `changes` JSONB) within the business transaction. The interceptor
 * will still capture failure/error logs via its `catchError` block.
 */
export const SkipGlobalAudit = () => SetMetadata(SKIP_GLOBAL_AUDIT_KEY, true);
