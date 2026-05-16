describe.skip('Order infrastructure test cases from docs/api/order', () => {
	it('TC-ORD-03 Status History Immutability', async () => {
		// Requires migrated PostgreSQL triggers enforcing append-only order_status_history.
	});

	it('TC-ORD-06 Atomic Transactions', async () => {
		// Requires a DB-backed status update flow and an injected failure to verify rollback.
	});

	it('TC-ORD-09 Tenant Isolation', async () => {
		// Requires authenticated API requests from separate buyer/supplier workspaces.
	});
});
