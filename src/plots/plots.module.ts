import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './entities/plot.entity/plot.entity';
import { PropertyImage } from './entities/property-image.entity';
import { LegalDocument } from './entities/legal-document.entity';
import { PlotsService } from './services/plots/plots.service';
import {
  PlotsController,
  AdminPlotsController,
} from './controllers/plots/plots.controller';
import { IpfsModule } from '../ipfs/ipfs.module';
import { UsersModule } from '../users/users.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plot, PropertyImage, LegalDocument]),
    IpfsModule,
    UsersModule,
    AuditLogsModule,
  ],
  providers: [PlotsService],
  controllers: [PlotsController, AdminPlotsController],
  exports: [PlotsService],
})
export class PlotsModule {}
