import { Module } from '@nestjs/common';
import { PlotsService } from './services/plots/plots.service';
import { PlotsController } from './controllers/plots/plots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './entities/plot.entity/plot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plot])],
  controllers: [PlotsController],
  providers: [PlotsService],
  exports: [PlotsService],
})
export class PlotsModule {}
