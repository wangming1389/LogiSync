import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderModule } from '../../modules/order/order.module';
import { BackgroundWorkersService } from './background-workers.service';
import { DatabaseBackupService } from './database-backup.service';

@Module({
	imports: [ScheduleModule.forRoot(), OrderModule],
	providers: [BackgroundWorkersService, DatabaseBackupService],
	exports: [BackgroundWorkersService, DatabaseBackupService],
})
export class WorkersModule {}
