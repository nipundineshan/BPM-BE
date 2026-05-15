import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './entities/plot.entity/plot.entity';
import { PlotsService } from './services/plots/plots.service';
import { PlotsController, AdminPlotsController } from './controllers/plots/plots.controller';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plot]), IpfsModule],
  providers: [PlotsService],
  controllers: [PlotsController, AdminPlotsController],
  exports: [PlotsService],
})
export class PlotsModule {}
