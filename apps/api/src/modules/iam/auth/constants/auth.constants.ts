export const SESSION_TTL_SECONDS = 1800;
export const JWT_EXPIRATION_SECONDS = 1800;
export const CLOCK_SKEW_TOLERANCE_SECONDS = 30;
export const SESSION_WARNING_SECONDS = 120;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
export const MAX_FAILED_ATTEMPTS = 5;
export const OTP_TTL_SECONDS = 300;
export const SIGNED_URL_TTL_SECONDS = 3600;
export const PASSWORD_COMPLEXITY_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
export const CHANGE_TOKEN_TYPE = 'complete-registration';
export const CHANGE_TOKEN_TTL_SECONDS = 15 * 60;
export const CHANGE_TOKEN_BLACKLIST_PREFIX = 'change-token:used:';
export const ROLE_SELECTION_TOKEN_TYPE = 'role-selection';
export const ROLE_SELECTION_TOKEN_TTL_SECONDS = 5 * 60;
