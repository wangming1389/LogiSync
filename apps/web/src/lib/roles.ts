export type WorkspaceType = 'supplier' | 'buyer' | 'carrier';

export type EmployeeRole =
	| 'supplier_manager'
	| 'supplier_staff'
	| 'supplier_accountant'
	| 'buyer_manager'
	| 'buyer_staff'
	| 'carrier_dispatcher'
	| 'driver'
	| 'hr_manager';

export const ROLE_LABELS: Record<string, string> = {
	platform_admin: 'Platform Admin',
	company_admin: 'Company Admin',
	supplier_manager: 'Supplier Manager',
	supplier_staff: 'Supplier Staff',
	supplier_accountant: 'Supplier Accountant',
	buyer_manager: 'Buyer Manager',
	buyer_staff: 'Buyer Staff',
	carrier_dispatcher: 'Dispatcher',
	driver: 'Driver',
	hr_manager: 'Manager HR',
};

export const EMPLOYEE_ROLES_BY_WORKSPACE_TYPE: Record<
	WorkspaceType,
	EmployeeRole[]
> = {
	supplier: [
		'supplier_manager',
		'supplier_staff',
		'supplier_accountant',
		'hr_manager',
	],
	buyer: ['buyer_manager', 'buyer_staff', 'hr_manager'],
	carrier: ['carrier_dispatcher', 'driver', 'hr_manager'],
};

export function getRoleLabel(role: string) {
	return ROLE_LABELS[role] ?? role.replace(/_/g, ' ');
}

export function getEmployeeRoleOptions(workspaceTypes: readonly string[]) {
	const roles = workspaceTypes.flatMap((workspaceType) => {
		if (
			workspaceType === 'supplier' ||
			workspaceType === 'buyer' ||
			workspaceType === 'carrier'
		) {
			return EMPLOYEE_ROLES_BY_WORKSPACE_TYPE[workspaceType];
		}

		return [];
	});

	return Array.from(new Set(roles)).map((value) => ({
		value,
		label: getRoleLabel(value),
	}));
}
