export const WORKSPACE_TYPES = ['supplier', 'buyer', 'carrier'] as const;
export const WORKSPACE_STATUSES = [
	'pending',
	'active',
	'suspended',
	'revoked',
] as const;

export const WORKSPACE_ENABLEABLE_ROLES = [
	'company_admin',
	'supplier_manager',
	'supplier_staff',
	'supplier_accountant',
	'buyer_manager',
	'buyer_staff',
	'carrier_dispatcher',
	'driver',
	'hr_manager',
] as const;
