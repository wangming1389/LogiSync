import { z } from 'zod';

export const HealthDetailsSchema = z.object({
	database: z.boolean(),
	redis: z.boolean(),
	objectStorage: z.boolean(),
	messageQueue: z.boolean(),
	timestamp: z.number().optional(),
	degraded: z.boolean().optional(),
});

export const HealthStatusSchema = z.object({
	status: z.string(),
	details: HealthDetailsSchema,
	timestamp: z.string(),
});

export const ReadyStatusSchema = z.object({
	ready: z.boolean(),
	timestamp: z.string(),
});

export const LiveStatusSchema = z.object({
	alive: z.boolean(),
	timestamp: z.string(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
export type ReadyStatus = z.infer<typeof ReadyStatusSchema>;
export type LiveStatus = z.infer<typeof LiveStatusSchema>;
