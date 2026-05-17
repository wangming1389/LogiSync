import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';

@ApiTags('System')
@Controller('metrics')
export class MetricsController extends PrometheusController {
	@ApiOperation({
		summary: 'Prometheus metrics endpoint',
		description:
			'Returns all application metrics in Prometheus text exposition format. ' +
			'This endpoint is scraped by Prometheus every 15 seconds to collect ' +
			'HTTP request counts, latency histograms, and business KPIs.',
	})
	@ApiResponse({
		status: 200,
		description: 'Metrics in Prometheus text format',
	})
	@Get()
	async index(@Res({ passthrough: false }) response: Response) {
		return super.index(response);
	}
}
