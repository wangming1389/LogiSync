import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '../../infrastructure/object-storage/object-storage.module';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';

@Module({
	imports: [ObjectStorageModule],
	controllers: [MediaController],
	providers: [MediaService],
	exports: [MediaService],
})
export class MediaModule {}
