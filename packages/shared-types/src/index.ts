// Audit Log Types
export interface AuditLogPayload {
	actorId: string;
	workspaceId: string;
	action: string;
	resourceType: string;
	resourceId?: string;
	changes?: Record<string, any>;
	ipAddress: string;
	userAgent?: string;
	status: 'success' | 'failure';
	errorMessage?: string;
}

export interface AuditLog extends AuditLogPayload {
	id: string;
	timestamp: Date;
}

// User Types
export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
	id: string;
	workspaceId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	role: UserRole;
	isActive: boolean;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

// Workspace Types
export type WorkspaceType = 'supplier' | 'buyer' | 'carrier';

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	type: WorkspaceType;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Session Types
export interface SessionData {
	userId: string;
	workspaceId: string;
	sessionId: string;
	issuedAt: number;
	expiresAt: number;
	ipAddress: string;
	userAgent?: string;
}

// API Response Types
export interface ApiResponse<T> {
	statusCode: number;
	message: string;
	data?: T;
	errors?: Record<string, string[]>;
	timestamp: Date;
}

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

// Error Types
export class ApiError extends Error {
	constructor(
		public statusCode: number,
		message: string,
		public errors?: Record<string, string[]>,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// Permission Types
export type Permission =
	| 'read'
	| 'write'
	| 'delete'
	| 'manage_users'
	| 'manage_workspace'
	| '*';

export interface PermissionMap {
	admin: Permission[];
	manager: Permission[];
	user: Permission[];
}

// Health Check Types
export interface HealthStatus {
	database: boolean;
	redis: boolean;
	fileStorage: boolean;
	timestamp: number;
}

export interface HealthCheckResponse {
	status: 'healthy' | 'degraded' | 'unhealthy';
	details: HealthStatus;
	timestamp: string;
}

// Login/Auth Types
export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	accessToken: string;
	refreshToken?: string;
	user: Omit<User, 'passwordHash'>;
	workspace: Workspace;
}

export interface TokenPayload {
	sub: string; // user id
	email: string;
	workspaceId: string;
	role: UserRole;
	iat: number;
	exp: number;
}
