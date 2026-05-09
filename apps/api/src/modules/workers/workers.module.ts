import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { BackgroundWorkersService } from "./background-workers.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [BackgroundWorkersService],
  exports: [BackgroundWorkersService],
})
export class WorkersModule {}
