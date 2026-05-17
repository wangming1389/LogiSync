/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { getDatabase } from '../../infrastructure/database';
import { getActiveTransaction } from './transaction-context';

@Injectable()
export abstract class BaseRepository {
	protected constructor(protected readonly cls: ClsService) {}

	// Returns the active CLS transaction when available, otherwise the main DB.
	protected get db() {
		return (
			(getActiveTransaction(this.cls) as ReturnType<
				typeof getDatabase
			> | null) ?? getDatabase()
		);
	}

	/**
	 * Extracts workspaceId from the Async Local Storage (ClsService).
	 * Use this for strictly protected routes where workspaceId is required.
	 * @throws UnauthorizedException if workspaceId is not present.
	 */
	protected getRequiredWorkspaceId(): string {
		const workspaceId = this.cls.get('workspaceId');
		if (!workspaceId) {
			throw new UnauthorizedException(
				'Missing workspaceId in execution context',
			);
		}
		return workspaceId;
	}

	/**
	 * Extracts workspaceId from the Async Local Storage (ClsService) optionally.
	 * Use this for public routes or mixed-access routes.
	 * @returns workspaceId or null if not present.
	 */
	protected getOptionalWorkspaceId(): string | null {
		const workspaceId = this.cls.get('workspaceId');
		return workspaceId ?? null;
	}
}
