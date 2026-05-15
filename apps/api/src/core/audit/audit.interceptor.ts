import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditAction, AuditStatus } from './audit.enums';
import { AuditLoggerService } from './audit-logger.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
	constructor(private auditLoggerService: AuditLoggerService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<Request>();

		// Extract metadata
		const user = (request as { user?: { sub: string; workspaceId: string } })
			.user;
		const ipAddress = this.getClientIp(request);
		const userAgent = request.get('user-agent') ?? '';

		return next.handle().pipe(
			tap(() => {
				// Only audit important operations (POST, PUT, DELETE, PATCH)
				if (
					user &&
					['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
				) {
					void this.auditLoggerService.log({
						actorId: user.sub,
						workspaceId: user.workspaceId,
						action: this.resolveAction(request, AuditStatus.SUCCESS),
						resourceType: this.extractResourceType(request.path),
						resourceId: this.extractResourceId(request.path),
						ipAddress,
						userAgent,
						status: AuditStatus.SUCCESS,
					});
				}
			}),
			catchError((error: Error) => {
				if (user) {
					void this.auditLoggerService.log({
						actorId: user.sub,
						workspaceId: user.workspaceId,
						action: this.resolveAction(request, AuditStatus.FAILURE),
						resourceType: this.extractResourceType(request.path),
						ipAddress,
						userAgent,
						status: AuditStatus.FAILURE,
						errorMessage: error.message,
					});
				}

				throw error;
			}),
		);
	}

	private getClientIp(request: Request): string {
		return (
			(request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
			request.socket.remoteAddress ||
			'unknown'
		);
	}

	private extractResourceType(path: string): string {
		const segments = path.split('/').filter((s) => s);
		return segments[0] || 'unknown';
	}

	private extractResourceId(path: string): string | undefined {
		// Extract UUID from the path if present
		const uuidRegex =
			/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
		const match = path.match(uuidRegex);
		return match ? match[0] : undefined;
	}

	private resolveAction(request: Request, status: AuditStatus): AuditAction {
		const method = request.method.toUpperCase();
		const normalizedPath = request.path.replace(
			/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
			':id',
		);
		const success = status === AuditStatus.SUCCESS;

		const routeActions: Record<string, [AuditAction, AuditAction]> = {
			'POST /auth/login': [
				AuditAction.AUTH_LOGIN_SUCCESS,
				AuditAction.AUTH_LOGIN_FAILED,
			],
			'POST /auth/logout': [
				AuditAction.AUTH_LOGOUT_SUCCESS,
				AuditAction.AUTH_LOGOUT_FAILED,
			],
			'POST /auth/refresh': [
				AuditAction.AUTH_REFRESH_TOKEN_SUCCESS,
				AuditAction.AUTH_REFRESH_TOKEN_FAILED,
			],
			'PATCH /auth/change-password': [
				AuditAction.AUTH_CHANGE_PASSWORD_SUCCESS,
				AuditAction.AUTH_CHANGE_PASSWORD_FAILED,
			],
			'POST /workspaces': [
				AuditAction.WORKSPACE_REGISTER_SUCCESS,
				AuditAction.WORKSPACE_REGISTER_FAILED,
			],
			'PATCH /workspaces/:id': [
				AuditAction.WORKSPACE_UPDATE_SUCCESS,
				AuditAction.WORKSPACE_UPDATE_FAILED,
			],
			'PATCH /workspaces/:id/approve': [
				AuditAction.WORKSPACE_APPROVE_SUCCESS,
				AuditAction.WORKSPACE_APPROVE_FAILED,
			],
			'PATCH /workspaces/:id/reject': [
				AuditAction.WORKSPACE_REJECT_SUCCESS,
				AuditAction.WORKSPACE_REJECT_FAILED,
			],
			'PATCH /workspaces/:id/suspend': [
				AuditAction.WORKSPACE_SUSPEND_SUCCESS,
				AuditAction.WORKSPACE_SUSPEND_FAILED,
			],
			'POST /workspaces/:id/roles/enable': [
				AuditAction.WORKSPACE_ENABLE_ROLE_SUCCESS,
				AuditAction.WORKSPACE_ENABLE_ROLE_FAILED,
			],
			'POST /admin/uom': [
				AuditAction.UOM_CREATE_SUCCESS,
				AuditAction.UOM_CREATE_FAILED,
			],
			'PATCH /admin/uom/:id': [
				AuditAction.UOM_UPDATE_SUCCESS,
				AuditAction.UOM_UPDATE_FAILED,
			],
			'PATCH /admin/uom/:id/disable': [
				AuditAction.UOM_DISABLE_SUCCESS,
				AuditAction.UOM_DISABLE_FAILED,
			],
			'PATCH /admin/uom/:id/enable': [
				AuditAction.UOM_ENABLE_SUCCESS,
				AuditAction.UOM_ENABLE_FAILED,
			],
			'POST /admin/catalog-categories': [
				AuditAction.CATALOG_CATEGORY_CREATE_SUCCESS,
				AuditAction.CATALOG_CATEGORY_CREATE_FAILED,
			],
			'PATCH /admin/catalog-categories/:id': [
				AuditAction.CATALOG_CATEGORY_UPDATE_SUCCESS,
				AuditAction.CATALOG_CATEGORY_UPDATE_FAILED,
			],
			'PATCH /admin/catalog-categories/:id/disable': [
				AuditAction.CATALOG_CATEGORY_DISABLE_SUCCESS,
				AuditAction.CATALOG_CATEGORY_DISABLE_FAILED,
			],
			'PATCH /admin/catalog-categories/:id/enable': [
				AuditAction.CATALOG_CATEGORY_ENABLE_SUCCESS,
				AuditAction.CATALOG_CATEGORY_ENABLE_FAILED,
			],
			'POST /catalog/categories': [
				AuditAction.SUPPLIER_CATEGORY_CREATE_SUCCESS,
				AuditAction.SUPPLIER_CATEGORY_CREATE_FAILED,
			],
			'PATCH /catalog/categories/:id': [
				AuditAction.SUPPLIER_CATEGORY_UPDATE_SUCCESS,
				AuditAction.SUPPLIER_CATEGORY_UPDATE_FAILED,
			],
			'DELETE /catalog/categories/:id': [
				AuditAction.SUPPLIER_CATEGORY_SOFT_DELETE_SUCCESS,
				AuditAction.SUPPLIER_CATEGORY_SOFT_DELETE_FAILED,
			],
			'POST /catalog/products': [
				AuditAction.PRODUCT_CREATE_SUCCESS,
				AuditAction.PRODUCT_CREATE_FAILED,
			],
			'PATCH /catalog/products/:id': [
				AuditAction.PRODUCT_UPDATE_SUCCESS,
				AuditAction.PRODUCT_UPDATE_FAILED,
			],
			'PATCH /catalog/products/:id/publish': [
				AuditAction.PRODUCT_PUBLISH_SUCCESS,
				AuditAction.PRODUCT_PUBLISH_FAILED,
			],
			'PATCH /catalog/products/:id/unpublish': [
				AuditAction.PRODUCT_UNPUBLISH_SUCCESS,
				AuditAction.PRODUCT_UNPUBLISH_FAILED,
			],
			'DELETE /catalog/products/:id': [
				AuditAction.PRODUCT_DELETE_SUCCESS,
				AuditAction.PRODUCT_DELETE_FAILED,
			],
			'POST /catalog/products/:id/upload-image': [
				AuditAction.PRODUCT_IMAGE_UPLOAD_SUCCESS,
				AuditAction.PRODUCT_IMAGE_UPLOAD_FAILED,
			],
			'POST /catalog/products/:id/upload-image-url': [
				AuditAction.PRODUCT_IMAGE_BATCH_UPLOAD_FROM_URL_SUCCESS,
				AuditAction.PRODUCT_IMAGE_BATCH_UPLOAD_FROM_URL_FAILED,
			],
			'POST /rfqs': [
				AuditAction.RFQ_CREATE_SUCCESS,
				AuditAction.RFQ_CREATE_FAILED,
			],
			'POST /rfqs/:id/items': [
				AuditAction.RFQ_ITEM_UPSERT_SUCCESS,
				AuditAction.RFQ_ITEM_UPSERT_FAILED,
			],
			'PATCH /rfqs/:id/items/:id': [
				AuditAction.RFQ_ITEM_UPDATE_SUCCESS,
				AuditAction.RFQ_ITEM_UPDATE_FAILED,
			],
			'DELETE /rfqs/:id/items/:id': [
				AuditAction.RFQ_ITEM_DELETE_SUCCESS,
				AuditAction.RFQ_ITEM_DELETE_FAILED,
			],
			'POST /rfqs/:id/submit': [
				AuditAction.RFQ_SUBMIT_SUCCESS,
				AuditAction.RFQ_SUBMIT_FAILED,
			],
			'DELETE /rfqs/:id': [
				AuditAction.RFQ_DELETE_SUCCESS,
				AuditAction.RFQ_DELETE_FAILED,
			],
			'POST /rfqs/:id/quotations': [
				AuditAction.QUOTATION_SUBMIT_SUCCESS,
				AuditAction.QUOTATION_SUBMIT_FAILED,
			],
			'POST /quotations/:id/negotiate': [
				AuditAction.NEGOTIATION_ROUND_SUBMIT_SUCCESS,
				AuditAction.NEGOTIATION_ROUND_SUBMIT_FAILED,
			],
			'PATCH /quotations/:id/accept-round': [
				AuditAction.NEGOTIATION_ROUND_ACCEPT_SUCCESS,
				AuditAction.NEGOTIATION_ROUND_ACCEPT_FAILED,
			],
			'POST /quotations/:id/select': [
				AuditAction.QUOTATION_SELECT_SUCCESS,
				AuditAction.QUOTATION_SELECT_FAILED,
			],
			'PATCH /orders/:id/approve': [
				AuditAction.ORDER_APPROVE_SUCCESS,
				AuditAction.ORDER_APPROVE_FAILED,
			],
			'PATCH /orders/:id/reject': [
				AuditAction.ORDER_REJECT_SUCCESS,
				AuditAction.ORDER_REJECT_FAILED,
			],
			'PATCH /orders/:id/confirm-receipt': [
				AuditAction.GOODS_RECEIPT_CONFIRM_SUCCESS,
				AuditAction.GOODS_RECEIPT_CONFIRM_FAILED,
			],
			'PATCH /orders/:id/assign': [
				AuditAction.ORDER_ASSIGN_SUCCESS,
				AuditAction.ORDER_ASSIGN_FAILED,
			],
			'GET /admin/audit-logs': [
				AuditAction.AUDIT_LOG_QUERY,
				AuditAction.AUDIT_LOG_QUERY_FAILED,
			],
			'GET /admin/audit-logs/export': [
				AuditAction.LOG_EXPORT,
				AuditAction.LOG_EXPORT_FAILED,
			],
		};

		const [successAction, failureAction] =
			routeActions[`${method} ${normalizedPath}`] ??
			([
				AuditAction.UNKNOWN_MUTATION_SUCCESS,
				AuditAction.UNKNOWN_MUTATION_FAILED,
			] as const);

		return success ? successAction : failureAction;
	}
}
