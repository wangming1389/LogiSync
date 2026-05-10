import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	// eslint-disable-next-line @typescript-eslint/require-await
	async hashPassword(password: string): Promise<string> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		return bcrypt.hash(password, 12);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async comparePassword(password: string, hash: string): Promise<boolean> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
		return bcrypt.compare(password, hash);
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async login(email: string, password: string): Promise<boolean> {
		// TODO: Implement login logic
		// - Check if user exists
		// - Compare password
		// - Check if account is locked
		// - Record failed/successful login
		void email;
		void password;
		return true;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async refreshToken(token: string): Promise<string> {
		// TODO: Implement refresh token logic
		return token;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	async validateUser(userId: string): Promise<boolean> {
		// TODO: Implement user validation logic
		void userId;
		return true;
	}
}
