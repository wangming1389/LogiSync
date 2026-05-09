import { Module } from '@nestjs/common';
import { SessionModule } from '../session/session.module';
import { HealthController } from './health.controller';
import { HealthCheckService } from './health-check.service';

@Module({
	imports: [SessionModule],
	providers: [HealthCheckService],
	controllers: [HealthController],
	exports: [HealthCheckService],
})
export class HealthModule {}
