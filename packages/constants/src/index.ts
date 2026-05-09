// Security Constants
export const SECURITY = {
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_HASH_ROUNDS: 10,
	MAX_FAILED_LOGIN_ATTEMPTS: 5,
	ACCOUNT_LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
	SESSION_TIMEOUT_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// API Constants
export const API = {
	DEFAULT_PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100,
	DEFAULT_TIMEOUT_MS: 30000,
	RESPONSE_TIME_TARGET_MS: 500,
};

// Business Logic Constants
export const BUSINESS = {
	AUTO_SETTLE_DELAY_HOURS: 48,
	REPUTATION_CHECK_INTERVAL_MINUTES: 60,
	EPOS_COMPRESSION_CHECK_INTERVAL_HOURS: 6,
	SESSION_CLEANUP_INTERVAL_HOURS: 24,
	BACKUP_INTERVAL_HOURS: 24,
};

// Database Constants
export const DATABASE = {
	CONNECTION_TIMEOUT_MS: 2000,
	IDLE_TIMEOUT_MS: 30000,
	MAX_CONNECTIONS: 20,
	AUDIT_LOG_RETENTION_DAYS: 365 * 5, // 5 years
};

// Monitoring Constants
export const MONITORING = {
	HEALTH_CHECK_INTERVAL_MS: 15000, // 15 seconds
	ALERT_EMAIL_DELAY_MS: 60000, // 1 minute
	UPTIME_TARGET_PERCENTAGE: 95,
	RTO_HOURS: 24,
	RPO_HOURS: 24,
};

// Error Messages
export const ERROR_MESSAGES = {
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden',
	NOT_FOUND: 'Not found',
	VALIDATION_ERROR: 'Validation error',
	INTERNAL_SERVER_ERROR: 'Internal server error',
	DATABASE_ERROR: 'Database error',
	ACCOUNT_LOCKED: 'Account is locked. Try again later.',
	INVALID_CREDENTIALS: 'Invalid email or password',
	WORKSPACE_NOT_FOUND: 'Workspace not found',
	USER_NOT_FOUND: 'User not found',
	EMAIL_ALREADY_EXISTS: 'Email already exists',
	WEAK_PASSWORD: `Password must be at least ${SECURITY.PASSWORD_MIN_LENGTH} characters`,
};

// Success Messages
export const SUCCESS_MESSAGES = {
	LOGIN_SUCCESS: 'Login successful',
	LOGOUT_SUCCESS: 'Logout successful',
	USER_CREATED: 'User created successfully',
	USER_UPDATED: 'User updated successfully',
	WORKSPACE_CREATED: 'Workspace created successfully',
};

// HTTP Status Codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
} as const;

// Roles & Permissions
export const ROLES = {
	ADMIN: 'admin',
	MANAGER: 'manager',
	USER: 'user',
} as const;

export const PERMISSIONS_BY_ROLE = {
	admin: ['*'],
	manager: ['read', 'write', 'manage_users'],
	user: ['read', 'write'],
} as const;
