import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { AuditLoggerService } from "./audit-logger.service";
import { Request } from "express";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditLoggerService: AuditLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const startTime = Date.now();

    // Extract metadata
    const user = (request as any).user;
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get("user-agent");

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;

        // Only audit important operations (POST, PUT, DELETE, PATCH)
        if (user && ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
          this.auditLoggerService.log({
            actorId: user.sub,
            workspaceId: user.workspaceId,
            action: `${request.method}_${request.path}`,
            resourceType: this.extractResourceType(request.path),
            resourceId: this.extractResourceId(request.path),
            ipAddress,
            userAgent,
            status: "success",
          });
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;

        if (user) {
          this.auditLoggerService.log({
            actorId: user.sub,
            workspaceId: user.workspaceId,
            action: `${request.method}_${request.path}`,
            resourceType: this.extractResourceType(request.path),
            ipAddress,
            userAgent,
            status: "failure",
            errorMessage: error.message,
          });
        }

        throw error;
      }),
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      request.socket.remoteAddress ||
      "unknown"
    );
  }

  private extractResourceType(path: string): string {
    const segments = path.split("/").filter((s) => s);
    return segments[0] || "unknown";
  }

  private extractResourceId(path: string): string | undefined {
    // Extract UUID from path like /api/orders/{id}
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = path.match(uuidRegex);
    return match ? match[0] : undefined;
  }
}
