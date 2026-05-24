import { UserRole } from '../../auth/enums/user-role.enum';

export const EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE = {
	supplier: [
		UserRole.SUPPLIER_MANAGER,
		UserRole.SUPPLIER_STAFF,
		UserRole.SUPPLIER_ACCOUNTANT,
		UserRole.HR_MANAGER,
	],
	buyer: [UserRole.BUYER_MANAGER, UserRole.BUYER_STAFF, UserRole.HR_MANAGER],
	carrier: [UserRole.CARRIER_DISPATCHER, UserRole.DRIVER, UserRole.HR_MANAGER],
} as const;

export type EmployeeCreatableWorkspaceType =
	keyof typeof EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE;
