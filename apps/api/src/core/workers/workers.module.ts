import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackgroundWorkersService } from './background-workers.service';
import { DatabaseBackupService } from './database-backup.service';

@Module({
	imports: [ScheduleModule.forRoot()],
	providers: [BackgroundWorkersService, DatabaseBackupService],
	exports: [BackgroundWorkersService, DatabaseBackupService],
})
export class WorkersModule {}
