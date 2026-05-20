import { RejectOrderSchema } from './order.dto';

describe('Order DTO schemas', () => {
	it('TC-ORD-02 Rejection Reason', () => {
		expect(RejectOrderSchema.safeParse({ rejectionReason: '' }).success).toBe(
			false,
		);
		expect(
			RejectOrderSchema.safeParse({ rejectionReason: '   ' }).success,
		).toBe(false);
		expect(
			RejectOrderSchema.safeParse({
				rejectionReason: 'Supplier cannot fulfill',
			}).success,
		).toBe(true);
	});
});
