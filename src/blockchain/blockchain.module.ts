import { Module, Global } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SyncService } from './sync.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from '../plots/entities/plot.entity/plot.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Plot])],
  providers: [BlockchainService, SyncService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
