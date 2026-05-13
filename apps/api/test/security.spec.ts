import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { SecurityService } from '../src/core/security/security.service';
import { getDatabase, schema } from '../src/infrastructure/database';

describe('Security Service', () => {
	let service: SecurityService;
	let db: any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SecurityService],
		}).compile();

		service = module.get<SecurityService>(SecurityService);
		db = getDatabase();
	});

	describe('Password hashing', () => {
		it('should hash passwords securely', async () => {
			const password = 'MySecurePassword123!';
			const hash = await service.hashPassword(password);

			expect(hash).not.toBe(password);
			expect(hash.length).toBeGreaterThan(20); // bcrypt produces ~60 char hashes
		});

		it('should verify correct passwords', async () => {
			const password = 'CorrectPassword123';
			const hash = await service.hashPassword(password);
			const isValid = await service.comparePassword(password, hash);

			expect(isValid).toBe(true);
		});

		it('should reject incorrect passwords', async () => {
			const password = 'CorrectPassword123';
			const hash = await service.hashPassword(password);
			const isValid = await service.comparePassword('WrongPassword', hash);

			expect(isValid).toBe(false);
		});
	});

	describe('Account lockout (15 minutes after 5 failed attempts)', () => {
		it('should lockout account after 5 failed login attempts', async () => {
			const workspaceId = uuid();
			const email = `testuser${uuid().slice(0, 8)}@test.local`;
			const hashedPassword = await service.hashPassword('SecurePassword');

			// Create user
			await db.insert(schema.users).values({
				id: uuid(),
				workspaceId,
				email,
				passwordHash: hashedPassword,
				role: 'user',
				isActive: true,
				failedLoginAttempts: 0,
			});

			// Simulate 5 failed attempts
			for (let i = 0; i < 5; i++) {
				await service.recordFailedLogin(email);
			}

			const isLocked = await service.isAccountLocked(email);
			expect(isLocked).toBe(true);
		});

		it('should reset failed attempts on successful login', async () => {
			const workspaceId = uuid();
			const email = `testuser${uuid().slice(0, 8)}@test.local`;
			const userId = uuid();
			const hashedPassword = await service.hashPassword('SecurePassword');

			// Create user
			await db.insert(schema.users).values({
				id: userId,
				workspaceId,
				email,
				passwordHash: hashedPassword,
				role: 'user',
				isActive: true,
				failedLoginAttempts: 3,
			});

			// Record successful login
			await service.recordSuccessfulLogin(userId);

			const [user] = await db
				.select()
				.from(schema.users)
				.where((t) => t.id === userId);

			expect(user.failedLoginAttempts).toBe(0);
			expect(user.lockoutUntil).toBeNull();
		});
	});

	describe('RBAC Permission Checking', () => {
		it('should grant admin all permissions', async () => {
			const workspaceId = uuid();
			const userId = uuid();
			const hashedPassword = await service.hashPassword('password');

			await db.insert(schema.users).values({
				id: userId,
				workspaceId,
				email: 'admin@test.local',
				passwordHash: hashedPassword,
				role: 'admin',
				isActive: true,
			});

			const hasPermission = await service.hasPermission(
				userId,
				workspaceId,
				'delete:users',
			);

			expect(hasPermission).toBe(true);
		});

		it('should grant user only read and write permissions', async () => {
			const workspaceId = uuid();
			const userId = uuid();
			const hashedPassword = await service.hashPassword('password');

			await db.insert(schema.users).values({
				id: userId,
				workspaceId,
				email: 'user@test.local',
				passwordHash: hashedPassword,
				role: 'user',
				isActive: true,
			});

			const canWrite = await service.hasPermission(
				userId,
				workspaceId,
				'write',
			);
			const canManage = await service.hasPermission(
				userId,
				workspaceId,
				'manage_users',
			);

			expect(canWrite).toBe(true);
			expect(canManage).toBe(false);
		});
	});
});
