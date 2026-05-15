import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot, PlotStatus } from '../plots/entities/plot.entity/plot.entity';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private blockchainService: BlockchainService,
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
  ) {}

  onModuleInit() {
    this.listenToEvents();
  }

  private listenToEvents() {
    const contract = this.blockchainService.getContract();
    if (!contract) return;

    this.logger.log('Starting blockchain event listener...');

    contract.on('Transfer', async (from: string, to: string, tokenId: bigint) => {
      this.logger.log(`Event Transfer: TokenID ${tokenId} from ${from} to ${to}`);
      
      if (from === '0x0000000000000000000000000000000000000000') {
        // This is a Mint event
        try {
          const tokenURI = await contract.getFunction('tokenURI')(tokenId);
          const ipfsCid = tokenURI.replace('ipfs://', '');
          const plot = await this.plotRepository.findOne({ where: { ipfsCid } });
          
          if (plot) {
            plot.tokenId = tokenId.toString();
            plot.status = PlotStatus.MINTED;
            await this.plotRepository.save(plot);
            this.logger.log(`Updated plot ${plot.id} with TokenID ${tokenId}`);
          }
        } catch (error) {
          this.logger.error(`Error processing mint event for TokenID ${tokenId}`, error);
        }
      }
    });
  }
}
