import { ChangePasswordSchema } from './auth.dto';

describe('ChangePasswordSchema', () => {
	it('TC-IAM-02 Password Complexity', () => {
		for (const newPassword of [
			'lowercase1!',
			'UPPERCASE1!',
			'NoNumber!',
			'NoSpecial1',
		]) {
			expect(
				ChangePasswordSchema.safeParse({
					currentPassword: 'OldPass1!',
					newPassword,
				}).success,
			).toBe(false);
		}

		expect(
			ChangePasswordSchema.safeParse({
				currentPassword: 'OldPass1!',
				newPassword: 'NewPass1!',
			}).success,
		).toBe(true);
	});
});
