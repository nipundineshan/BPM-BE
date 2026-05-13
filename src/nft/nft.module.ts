import { Module } from '@nestjs/common';
import { NftService } from './services/nft/nft.service';
import { NftController } from './controllers/nft/nft.controller';
import { PlotsModule } from '../plots/plots.module';

@Module({
  imports: [PlotsModule],
  controllers: [NftController],
  providers: [NftService],
})
export class NftModule {}
