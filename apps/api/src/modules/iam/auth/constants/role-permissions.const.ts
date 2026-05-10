import { UserRole } from '../enums/user-role.enum';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
	[UserRole.PLATFORM_ADMIN]: ['*'],
	[UserRole.COMPANY_ADMIN]: [
		'workspace:manage',
		'workspace:approve',
		'workspace:suspend',
		'roles:enable',
		'catalog:write',
		'rfq:respond',
		'rfq:create',
		'order:approve',
		'quotation:select',
	],
	[UserRole.SUPPLIER_MANAGER]: [
		'catalog:write',
		'rfq:respond',
		'order:approve',
	],
	[UserRole.SUPPLIER_STAFF]: ['catalog:write', 'rfq:respond'],
	[UserRole.BUYER_MANAGER]: ['rfq:create', 'quotation:select', 'order:confirm'],
	[UserRole.BUYER_STAFF]: ['product:search', 'rfq:create'],
	[UserRole.SUPPLIER_ACCOUNTANT]: ['finance:read', 'finance:write'],
	[UserRole.HR_MANAGER]: ['hr:manage'],
	[UserRole.CARRIER_DISPATCHER]: ['dispatch:manage'],
	[UserRole.DRIVER]: ['delivery:update'],
};
