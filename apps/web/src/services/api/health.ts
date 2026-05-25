import { api } from '@/lib/api';
import {
	type HealthStatus,
	HealthStatusSchema,
	type LiveStatus,
	LiveStatusSchema,
	type ReadyStatus,
	ReadyStatusSchema,
} from '@/schemas/health';

function unwrapApiEnvelope<T>(response: unknown): T {
	let payload = response as any;
	if (payload?.data !== undefined) payload = payload.data;
	if (payload?.success !== undefined && payload?.data !== undefined) {
		payload = payload.data;
	}
	return payload as T;
}

export async function getHealthStatus() {
	const response = await api.get('/health');
	return HealthStatusSchema.parse(unwrapApiEnvelope<HealthStatus>(response));
}

export async function getReadyStatus() {
	const response = await api.get('/health/ready');
	return ReadyStatusSchema.parse(unwrapApiEnvelope<ReadyStatus>(response));
}

export async function getLiveStatus() {
	const response = await api.get('/health/live');
	return LiveStatusSchema.parse(unwrapApiEnvelope<LiveStatus>(response));
}
