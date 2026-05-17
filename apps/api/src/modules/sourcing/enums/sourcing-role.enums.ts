export const SOURCING_BUYER_ROLES = [
	'buyer_staff',
	'buyer_manager',
	'company_admin',
] as const;

export const SOURCING_SUPPLIER_ROLES = [
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;

export const SOURCING_ANY_PARTY_ROLES = [
	'buyer_staff',
	'buyer_manager',
	'supplier_staff',
	'supplier_manager',
	'company_admin',
] as const;
