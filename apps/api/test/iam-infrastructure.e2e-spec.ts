describe.skip('IAM infrastructure test cases from docs/api/iam', () => {
	it('TC-IAM-06 Revocation Guardrail', async () => {
		// Requires a workspace revocation API flow with exact company-name confirmation.
	});

	it('TC-IAM-07 Response Time (Login)', async () => {
		// Requires the full API, database, Redis, and a repeatable timing harness.
	});

	it('TC-IAM-08 Token Blacklisting', async () => {
		// Requires password change through the API plus Redis/JWT checks for other active tokens.
	});

	it('TC-IAM-10 Audit Log Immutability', async () => {
		// Requires a migrated PostgreSQL database with audit_logs UPDATE/DELETE protection enabled.
	});
});
