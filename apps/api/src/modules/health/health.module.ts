import { Module } from "@nestjs/common";
import { SessionModule } from "../session/session.module";
import { HealthCheckService } from "./health-check.service";
import { HealthController } from "./health.controller";

@Module({
  imports: [SessionModule],
  providers: [HealthCheckService],
  controllers: [HealthController],
  exports: [HealthCheckService],
})
export class HealthModule {}
