import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const QuotationItemSchema = z.object({
	rfqItemId: z.string().uuid(),
	unitPrice: z.number().int().positive(),
	quantity: z.number().int().positive(),
});

export const SubmitQuotationSchema = z.object({
	mode: z.enum(['draft', 'submit']).default('submit'),
	unitPrice: z.number().int().positive('unitPrice must be a positive integer'),
	estimatedDeliveryDate: z.coerce.date(),
	deliveryTerms: z.string().min(1, 'deliveryTerms is required').max(2000),
	note: z.string().max(2000).optional(),
	items: z.array(QuotationItemSchema).min(1, 'At least one item is required'),
});
export class SubmitQuotationDto extends createZodDto(SubmitQuotationSchema) {}

export const NegotiateSchema = z.object({
	proposedPrice: z.number().int().positive(),
	proposedDeliveryDays: z.number().int().positive(),
	note: z.string().max(2000).optional(),
});
export class NegotiateDto extends createZodDto(NegotiateSchema) {}

export const AcceptRoundSchema = z.object({
	roundId: z.string().uuid().optional(),
});
export class AcceptRoundDto extends createZodDto(AcceptRoundSchema) {}
