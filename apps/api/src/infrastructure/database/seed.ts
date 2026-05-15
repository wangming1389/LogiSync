/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDatabase, initializeDatabase, schema } from './index';

// ─── Seed data constants ───

const PLATFORM_ADMIN_EMAIL = 'admin@logisync.vn';
const PLATFORM_ADMIN_PASSWORD = 'password';

const CATALOG_CATEGORIES = [
	{
		name: 'Agricultural Products',
		code: 'AGR',
		description: 'Rice, corn, fertilizers, and other agricultural commodities',
	},
	{
		name: 'Industrial Materials',
		code: 'IND',
		description: 'Steel, cement, chemicals, and raw industrial materials',
	},
	{
		name: 'Consumer Goods',
		code: 'CON',
		description: 'Packaged goods, electronics, and general merchandise',
	},
	{
		name: 'Food & Beverage',
		code: 'FNB',
		description: 'Processed food, beverages, and perishable goods',
	},
] as const;

const UNITS_OF_MEASURE = [
	{ name: 'Kilogram', code: 'kg' },
	{ name: 'Metric Ton', code: 'ton' },
	{ name: 'Piece', code: 'pcs' },
	{ name: 'Box', code: 'box' },
	{ name: 'Liter', code: 'l' },
	{ name: 'Carton', code: 'ctn' },
] as const;

// ─── Seed workspaces ────

async function seedPlatformWorkspace(db: ReturnType<typeof getDatabase>) {
	const existing = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'platform-admin'));

	if (existing.length > 0) {
		console.log('ℹ️ Platform workspace already exists, skipping...');
		return existing[0].id;
	}

	const workspaceId = uuid();
	await db.insert(schema.workspaces).values({
		id: workspaceId,
		name: 'LogiSync Platform',
		slug: 'platform-admin',
		type: 'platform',
		taxId: '0000000000',
		status: 'active',
		registeredIpAddress: '127.0.0.1',
		acceptedTermsVersion: 'v1.0',
		isActive: true,
	});

	console.log('✅ Platform workspace created');
	return workspaceId;
}

async function seedSupplierWorkspace(db: ReturnType<typeof getDatabase>) {
	const existing = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'demo-supplier'));

	if (existing.length > 0) {
		console.log('ℹ️ Demo supplier workspace already exists, skipping...');
		return existing[0].id;
	}

	const workspaceId = uuid();
	await db.insert(schema.workspaces).values({
		id: workspaceId,
		name: 'Demo Supplier Co.',
		slug: 'demo-supplier',
		type: 'supplier',
		taxId: '0123456789',
		status: 'active',
		registeredIpAddress: '127.0.0.1',
		acceptedTermsVersion: 'v1.0',
		isActive: true,
	});

	console.log('✅ Demo supplier workspace created');
	return workspaceId;
}

async function seedBuyerWorkspace(db: ReturnType<typeof getDatabase>) {
	const existing = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'demo-buyer'));

	if (existing.length > 0) {
		console.log('ℹ️ Demo buyer workspace already exists, skipping...');
		return existing[0].id;
	}

	const workspaceId = uuid();
	await db.insert(schema.workspaces).values({
		id: workspaceId,
		name: 'Demo Buyer Corp.',
		slug: 'demo-buyer',
		type: 'buyer',
		taxId: '9876543210',
		status: 'active',
		registeredIpAddress: '127.0.0.1',
		acceptedTermsVersion: 'v1.0',
		isActive: true,
	});

	console.log('✅ Demo buyer workspace created');
	return workspaceId;
}

// ─── Seed users ───

async function seedPlatformAdmin(
	db: ReturnType<typeof getDatabase>,
	workspaceId: string,
): Promise<string> {
	const existing = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, PLATFORM_ADMIN_EMAIL));

	if (existing.length > 0) {
		console.log('ℹ️ Platform admin already exists, skipping...');
		return existing[0].id;
	}

	const hashedPassword = await bcrypt.hash(PLATFORM_ADMIN_PASSWORD, 12);
	const userId = uuid();

	await db.insert(schema.users).values({
		id: userId,
		workspaceId,
		email: PLATFORM_ADMIN_EMAIL,
		passwordHash: hashedPassword,
		firstName: 'Platform',
		lastName: 'Admin',
		role: 'platform_admin',
		isActive: true,
	});

	console.log(`✅ Platform admin created`);
	console.log(`   Email   : ${PLATFORM_ADMIN_EMAIL}`);
	console.log(`   Password: ${PLATFORM_ADMIN_PASSWORD}`);
	return userId;
}

async function seedSupplierUsers(
	db: ReturnType<typeof getDatabase>,
	workspaceId: string,
) {
	const users = [
		{
			email: 'supplier@logisync.vn',
			password: 'password',
			firstName: 'Supplier',
			lastName: 'Manager',
			role: 'supplier',
		},
		{
			email: 'supplier.staff@logisync.vn',
			password: 'password',
			firstName: 'Supplier',
			lastName: 'Staff',
			role: 'supplier_staff',
		},
	];

	for (const user of users) {
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, user.email));

		if (existing.length > 0) {
			console.log(`ℹ️ User ${user.email} already exists, skipping...`);
			continue;
		}

		const hashedPassword = await bcrypt.hash(user.password, 12);
		await db.insert(schema.users).values({
			id: uuid(),
			workspaceId,
			email: user.email,
			passwordHash: hashedPassword,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: true,
		});

		console.log(`✅ Supplier user created: ${user.email} (${user.role})`);
	}
}

async function seedBuyerUsers(
	db: ReturnType<typeof getDatabase>,
	workspaceId: string,
) {
	const users = [
		{
			email: 'buyer.admin@logisync.vn',
			password: 'password',
			firstName: 'Buyer',
			lastName: 'Admin',
			role: 'buyer',
		},
		{
			email: 'buyer.staff@logisync.vn',
			password: 'password',
			firstName: 'Buyer',
			lastName: 'Staff',
			role: 'buyer_staff',
		},
	];

	for (const user of users) {
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, user.email));

		if (existing.length > 0) {
			console.log(`ℹ️ User ${user.email} already exists, skipping...`);
			continue;
		}

		const hashedPassword = await bcrypt.hash(user.password, 12);
		await db.insert(schema.users).values({
			id: uuid(),
			workspaceId,
			email: user.email,
			passwordHash: hashedPassword,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: true,
		});

		console.log(`✅ Buyer user created: ${user.email} (${user.role})`);
	}
}

async function seedCarrierWorkspace(db: ReturnType<typeof getDatabase>) {
	const existing = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'demo-carrier'));

	if (existing.length > 0) {
		console.log('ℹ️ Demo carrier workspace already exists, skipping...');
		return existing[0].id;
	}

	const workspaceId = uuid();
	await db.insert(schema.workspaces).values({
		id: workspaceId,
		name: 'Demo Carrier Ltd.',
		slug: 'demo-carrier',
		type: 'carrier',
		taxId: '5555555555',
		status: 'active',
		registeredIpAddress: '127.0.0.1',
		acceptedTermsVersion: 'v1.0',
		isActive: true,
	});

	console.log('✅ Demo carrier workspace created');
	return workspaceId;
}

async function seedCarrierUsers(
	db: ReturnType<typeof getDatabase>,
	workspaceId: string,
) {
	const users = [
		{
			email: 'carrier@logisync.vn',
			password: 'password',
			firstName: 'Carrier',
			lastName: 'Manager',
			role: 'carrier',
		},
	];

	for (const user of users) {
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, user.email));

		if (existing.length > 0) {
			console.log(`ℹ️ User ${user.email} already exists, skipping...`);
			continue;
		}

		const hashedPassword = await bcrypt.hash(user.password, 12);
		await db.insert(schema.users).values({
			id: uuid(),
			workspaceId,
			email: user.email,
			passwordHash: hashedPassword,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: true,
		});

		console.log(`✅ Carrier user created: ${user.email} (${user.role})`);
	}
}

async function seedHRWorkspace(db: ReturnType<typeof getDatabase>) {
	const existing = await db
		.select()
		.from(schema.workspaces)
		.where(eq(schema.workspaces.slug, 'demo-hr'));

	if (existing.length > 0) {
		console.log('ℹ️ Demo HR workspace already exists, skipping...');
		return existing[0].id;
	}

	const workspaceId = uuid();
	await db.insert(schema.workspaces).values({
		id: workspaceId,
		name: 'Demo HR Inc.',
		slug: 'demo-hr',
		type: 'supplier',
		taxId: '3333333333',
		status: 'active',
		registeredIpAddress: '127.0.0.1',
		acceptedTermsVersion: 'v1.0',
		isActive: true,
	});

	console.log('✅ Demo HR workspace created');
	return workspaceId;
}

async function seedHRUsers(
	db: ReturnType<typeof getDatabase>,
	workspaceId: string,
) {
	const users = [
		{
			email: 'hr@logisync.vn',
			password: 'password',
			firstName: 'HR',
			lastName: 'Manager',
			role: 'hr',
		},
	];

	for (const user of users) {
		const existing = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.email, user.email));

		if (existing.length > 0) {
			console.log(`ℹ️ User ${user.email} already exists, skipping...`);
			continue;
		}

		const hashedPassword = await bcrypt.hash(user.password, 12);
		await db.insert(schema.users).values({
			id: uuid(),
			workspaceId,
			email: user.email,
			passwordHash: hashedPassword,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			isActive: true,
		});

		console.log(`✅ HR user created: ${user.email} (${user.role})`);
	}
}

// ─── Seed master data ───

async function seedCatalogCategories(
	db: ReturnType<typeof getDatabase>,
	adminUserId: string,
) {
	for (const cat of CATALOG_CATEGORIES) {
		const existing = await db
			.select()
			.from(schema.catalogCategories)
			.where(eq(schema.catalogCategories.code, cat.code));

		if (existing.length > 0) {
			console.log(
				`ℹ️ Catalog category "${cat.name}" already exists, skipping...`,
			);
			continue;
		}

		await db.insert(schema.catalogCategories).values({
			id: uuid(),
			name: cat.name,
			code: cat.code,
			description: cat.description,
			isActive: true,
			createdBy: adminUserId,
		});

		console.log(`✅ Catalog category created: ${cat.name} (${cat.code})`);
	}
}

async function seedUnitsOfMeasure(
	db: ReturnType<typeof getDatabase>,
	adminUserId: string,
) {
	for (const uom of UNITS_OF_MEASURE) {
		const existing = await db
			.select()
			.from(schema.unitsOfMeasure)
			.where(eq(schema.unitsOfMeasure.code, uom.code));

		if (existing.length > 0) {
			console.log(`ℹ️ UoM "${uom.name}" already exists, skipping...`);
			continue;
		}

		await db.insert(schema.unitsOfMeasure).values({
			id: uuid(),
			name: uom.name,
			code: uom.code,
			isActive: true,
			createdBy: adminUserId,
		});

		console.log(`✅ Unit of measure created: ${uom.name} (${uom.code})`);
	}
}

// ─── Seed demo supplier data ────

async function seedDemoSupplierData(
	db: ReturnType<typeof getDatabase>,
	supplierWorkspaceId: string,
	supplierUserId: string,
) {
	// Use catalog category and UoM created
	const [agrCategory] = await db
		.select()
		.from(schema.catalogCategories)
		.where(eq(schema.catalogCategories.code, 'AGR'));

	const [kgUom] = await db
		.select()
		.from(schema.unitsOfMeasure)
		.where(eq(schema.unitsOfMeasure.code, 'kg'));

	const [tonUom] = await db
		.select()
		.from(schema.unitsOfMeasure)
		.where(eq(schema.unitsOfMeasure.code, 'ton'));

	if (!agrCategory || !kgUom || !tonUom) {
		console.log('⚠️ Master data not found, skipping demo supplier data...');
		return;
	}

	// Create supplier category
	const existingCat = await db
		.select()
		.from(schema.supplierCategories)
		.where(eq(schema.supplierCategories.workspaceId, supplierWorkspaceId));

	let supplierCategoryId: string;

	if (existingCat.length > 0) {
		console.log('ℹ️ Demo supplier categories already exist, skipping...');
		supplierCategoryId = existingCat[0].id;
	} else {
		supplierCategoryId = uuid();
		await db.insert(schema.supplierCategories).values({
			id: supplierCategoryId,
			workspaceId: supplierWorkspaceId,
			catalogCategoryId: agrCategory.id,
			name: 'Premium Rice',
			description: 'High-quality rice varieties',
			isActive: true,
			createdBy: supplierUserId,
		});
		console.log('✅ Demo supplier category created: Premium Rice');
	}

	// Create demo products
	const demoProducts = [
		{
			sku: 'RICE-001',
			name: 'Jasmine Rice 5% Broken',
			description: 'Premium jasmine rice, 5% broken, origin Mekong Delta',
			unitPrice: 12000,
			uomId: kgUom.id,
			minOrderQty: 1000,
		},
		{
			sku: 'RICE-002',
			name: 'ST25 Rice',
			description: 'Award-winning ST25 fragrant rice',
			unitPrice: 18000,
			uomId: kgUom.id,
			minOrderQty: 500,
		},
		{
			sku: 'RICE-BULK-001',
			name: 'White Rice Bulk',
			description: 'Standard white rice, bulk export grade',
			unitPrice: 9500000,
			uomId: tonUom.id,
			minOrderQty: 1,
		},
	];

	for (const product of demoProducts) {
		const existing = await db
			.select()
			.from(schema.products)
			.where(eq(schema.products.sku, product.sku));

		if (existing.length > 0) {
			console.log(`ℹ️ Product ${product.sku} already exists, skipping...`);
			continue;
		}

		await db.insert(schema.products).values({
			id: uuid(),
			workspaceId: supplierWorkspaceId,
			supplierCategoryId,
			uomId: product.uomId,
			sku: product.sku,
			name: product.name,
			description: product.description,
			unitPrice: product.unitPrice,
			minOrderQty: product.minOrderQty,
			status: 'active',
			createdBy: supplierUserId,
		});

		console.log(`✅ Demo product created: ${product.name} (${product.sku})`);
	}
}

// ─── Main ───

async function seed() {
	initializeDatabase();
	const db = getDatabase();

	console.log('\n🌱 Starting database seed...\n');

	// 1. Workspaces
	console.log('── Workspaces ──');
	const platformWorkspaceId = await seedPlatformWorkspace(db);
	const supplierWorkspaceId = await seedSupplierWorkspace(db);
	const buyerWorkspaceId = await seedBuyerWorkspace(db);
	const carrierWorkspaceId = await seedCarrierWorkspace(db);
	const hrWorkspaceId = await seedHRWorkspace(db);

	// 2. Users
	console.log('\n── Users ──');
	const adminUserId = await seedPlatformAdmin(db, platformWorkspaceId);
	await seedSupplierUsers(db, supplierWorkspaceId);
	await seedBuyerUsers(db, buyerWorkspaceId);
	await seedCarrierUsers(db, carrierWorkspaceId);
	await seedHRUsers(db, hrWorkspaceId);

	// 3. Master data
	console.log('\n── Master Data ──');
	await seedCatalogCategories(db, adminUserId);
	await seedUnitsOfMeasure(db, adminUserId);

	// 4. Demo supplier data
	console.log('\n── Demo Supplier Data ──');
	const [supplierStaffUser] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, 'supplier.staff@logisync.local'));

	if (supplierStaffUser) {
		await seedDemoSupplierData(db, supplierWorkspaceId, supplierStaffUser.id);
	}

	// 5. Summary
	console.log('✅ Database seed completed!');

	process.exit(0);
}

seed().catch((err: unknown) => {
	console.error('❌ Seed failed:', err);
	process.exit(1);
});
