const PASSWORD_CHANGE_KEY = 'logisync_password_change';
const ROLE_SELECTION_KEY = 'logisync_role_selection';

export type PasswordChangeState = {
	changeToken: string;
	expiresIn: number;
	email?: string;
};

export type RoleSelectionState = {
	roleSelectionToken: string;
	roles: string[];
	expiresIn: number;
};

function readSessionValue<T>(key: string) {
	if (typeof window === 'undefined') return null;

	try {
		const raw = window.sessionStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
}

function writeSessionValue(key: string, value: unknown) {
	if (typeof window === 'undefined') return;
	window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function savePasswordChangeState(state: PasswordChangeState) {
	writeSessionValue(PASSWORD_CHANGE_KEY, state);
}

export function getPasswordChangeState() {
	return readSessionValue<PasswordChangeState>(PASSWORD_CHANGE_KEY);
}

export function clearPasswordChangeState() {
	if (typeof window === 'undefined') return;
	window.sessionStorage.removeItem(PASSWORD_CHANGE_KEY);
}

export function saveRoleSelectionState(state: RoleSelectionState) {
	writeSessionValue(ROLE_SELECTION_KEY, state);
}

export function getRoleSelectionState() {
	return readSessionValue<RoleSelectionState>(ROLE_SELECTION_KEY);
}

export function clearRoleSelectionState() {
	if (typeof window === 'undefined') return;
	window.sessionStorage.removeItem(ROLE_SELECTION_KEY);
}
