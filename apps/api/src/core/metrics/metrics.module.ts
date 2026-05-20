import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import {
	loginFailedProvider,
	orderApprovedProvider,
	orderRejectedProvider,
	rfqCreatedProvider,
} from './business-metrics.providers';
import { MetricsController } from './controllers/metrics.controller';
import { HttpMetricsInterceptor } from './interceptors/http-metrics.interceptor';
import {
	httpRequestDurationProvider,
	httpRequestsTotalProvider,
} from './metrics.providers';

/* Responsibilities:
 *  1. Registers the /metrics endpoint for Prometheus scraping (via PrometheusModule)
 *  2. Provides technical HTTP metrics (Counter + Histogram)
 *  3. Provides business KPI metrics (login_failed, rfq_created, order_approved/rejected)
 *  4. Registers HttpMetricsInterceptor globally via APP_INTERCEPTOR
 */
@Global()
@Module({
	imports: [
		PrometheusModule.register({
			defaultMetrics: { enabled: true },
			controller: MetricsController,
		}),
	],
	providers: [
		// Technical HTTP metrics
		httpRequestsTotalProvider,
		httpRequestDurationProvider,

		// Business KPI metrics
		loginFailedProvider,
		rfqCreatedProvider,
		orderApprovedProvider,
		orderRejectedProvider,

		// Global interceptor — auto-instruments all HTTP endpoints
		{
			provide: APP_INTERCEPTOR,
			useClass: HttpMetricsInterceptor,
		},
	],
	exports: [
		loginFailedProvider,
		rfqCreatedProvider,
		orderApprovedProvider,
		orderRejectedProvider,
	],
})
export class MetricsModule {}
