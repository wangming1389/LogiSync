import { Injectable, Logger } from '@nestjs/common';

export interface RegisteredHealthCheck {
	name: string;
	check: () => Promise<void>;
	required?: boolean;
}

export interface HealthCheckResult {
	name: string;
	healthy: boolean;
	required: boolean;
	error?: Error;
}

@Injectable()
export class HealthRegistryService {
	private readonly logger = new Logger(HealthRegistryService.name);
	private readonly checks = new Map<string, RegisteredHealthCheck>();

	register(check: RegisteredHealthCheck): void {
		this.checks.set(check.name, {
			...check,
			required: check.required ?? false,
		});
	}

	list(): RegisteredHealthCheck[] {
		return Array.from(this.checks.values());
	}

	async runChecks(timeoutMs: number): Promise<HealthCheckResult[]> {
		const checks = this.list();

		return Promise.all(
			checks.map(async (check) => {
				try {
					await this.withTimeout(check.check(), timeoutMs, check.name);
					return {
						name: check.name,
						healthy: true,
						required: check.required ?? false,
					};
				} catch (error) {
					const normalizedError =
						error instanceof Error ? error : new Error(String(error));
					this.logFailure(check.name, check.required ?? false);
					return {
						name: check.name,
						healthy: false,
						required: check.required ?? false,
						error: normalizedError,
					};
				}
			}),
		);
	}

	private logFailure(name: string, required: boolean): void {
		const message = `${name} health check failed`;
		if (required) {
			this.logger.error(message);
			return;
		}
		this.logger.warn(message);
	}

	private withTimeout<T>(
		promise: Promise<T>,
		ms: number,
		label: string,
	): Promise<T> {
		let timer: NodeJS.Timeout;
		const timeout = new Promise<never>((_, reject) => {
			timer = setTimeout(
				() => reject(new Error(`${label} ping timed out after ${ms}ms`)),
				ms,
			);
			timer.unref();
		});

		return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
	}
}
