describe.skip('Core infrastructure test cases from docs/api/core', () => {
	it('TC-HLT-03 Alert Trigger', async () => {
		// Requires the full docker-compose stack plus a test SMTP inbox.
	});

	it('TC-AUD-02 Transaction Rollback', async () => {
		// Requires a real business transaction such as PO approval and database rollback assertions.
	});

	it('TC-AUD-04 Immutability', async () => {
		// Requires a migrated PostgreSQL database with the append-only audit trigger enabled.
	});

	it('TC-AUD-05 Workspace Isolation', async () => {
		// Requires authenticated users in separate workspaces and the full API/RLS stack.
	});

	it('TC-SEC-02 Session Revocation', async () => {
		// Requires the full API auth stack, JWT strategy, and Redis session registry.
	});

	it('TC-SEC-03 Password Change', async () => {
		// Requires authenticated API calls plus Redis and database assertions.
	});
});
