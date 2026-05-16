import { UpdateUomSchema } from './uom.dto';

describe('UpdateUomSchema', () => {
	it('TC-MD-04 Status Guard', () => {
		const parsed = UpdateUomSchema.parse({
			name: 'Kilogram',
			isActive: false,
		});

		expect(parsed).toEqual({ name: 'Kilogram' });
		expect(parsed).not.toHaveProperty('isActive');
	});
});
