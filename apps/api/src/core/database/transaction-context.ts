import { ClsService } from 'nestjs-cls';

export const DATABASE_TRANSACTION_KEY = 'databaseTransaction';

export function getActiveTransaction(cls: ClsService): unknown {
	return cls.get(DATABASE_TRANSACTION_KEY) ?? null;
}

export async function runInTransactionContext<T>(
	cls: ClsService,
	tx: any,
	callback: (tx: any) => Promise<T>,
): Promise<T> {
	const run = async () => {
		const previousTx = getActiveTransaction(cls);
		cls.set(DATABASE_TRANSACTION_KEY, tx);

		try {
			return await callback(tx);
		} finally {
			cls.set(DATABASE_TRANSACTION_KEY, previousTx);
		}
	};

	if (cls.isActive()) {
		return run();
	}

	return cls.run(run);
}
