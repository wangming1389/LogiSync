import { RegisterWorkspaceSchema } from './workspace.dto';

const validWorkspaceRegistration = {
	name: 'Acme Logistics',
	slug: 'acme-logistics',
	types: ['supplier'],
	taxId: '0123456789',
	acceptedTermsVersion: 'v1',
	adminEmail: 'admin@acme.test',
	adminPassword: 'StrongPass1!',
};

describe('RegisterWorkspaceSchema', () => {
	it('TC-IAM-01 Tax ID Validation', () => {
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '12345',
			}).success,
		).toBe(false);
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '12345678901234',
			}).success,
		).toBe(false);
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '1234567890',
			}).success,
		).toBe(true);
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '12345678901',
			}).success,
		).toBe(true);
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '123456789012',
			}).success,
		).toBe(true);
		expect(
			RegisterWorkspaceSchema.safeParse({
				...validWorkspaceRegistration,
				taxId: '1234567890123',
			}).success,
		).toBe(true);
	});

	it('TC-IAM-02 Password Complexity', () => {
		for (const adminPassword of [
			'lowercase1!',
			'UPPERCASE1!',
			'NoNumber!',
			'NoSpecial1',
		]) {
			expect(
				RegisterWorkspaceSchema.safeParse({
					...validWorkspaceRegistration,
					adminPassword,
				}).success,
			).toBe(false);
		}

		expect(
			RegisterWorkspaceSchema.safeParse(validWorkspaceRegistration).success,
		).toBe(true);
	});
});
