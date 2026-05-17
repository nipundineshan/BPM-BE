import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BlockchainService } from '../../../blockchain/blockchain.service';
import { PlotsService } from '../../../plots/services/plots/plots.service';
import { PlotStatus } from '../../../plots/entities/plot.entity/plot.entity';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    private blockchainService: BlockchainService,
    private plotsService: PlotsService,
  ) {}

  async mintPropertyNft(plotId: string) {
    const plot = await this.plotsService.findOne(plotId);

    if (plot.status === PlotStatus.MINTED) {
      throw new BadRequestException('Property already minted as NFT');
    }

    if (plot.status !== PlotStatus.APPROVED) {
      throw new BadRequestException('Property must be approved before minting');
    }

    if (!plot.owner.walletAddress) {
      throw new BadRequestException('Owner wallet address is missing');
    }

    try {
      // 1. Upload metadata to IPFS if not already done
      let ipfsCid = plot.ipfsCid;
      if (!ipfsCid) {
        ipfsCid = await this.plotsService.uploadMetadataToIpfs(plotId);
      }

      this.logger.log(
        `Minting NFT for plot ${plotId} to ${plot.owner.walletAddress}`,
      );

      // 2. Call smart contract
      const receipt = await this.blockchainService.mintProperty(
        plot.owner.walletAddress,
        `ipfs://${ipfsCid}`,
      );

      if (!receipt) {
        throw new Error('Transaction failed or was dropped');
      }

      // 3. Extract Token ID from receipt (event Transfer)
      // For simplicity, let's assume we can get it or just use the counter
      const tokenId = await this.blockchainService.getTokenCounter();

      // 4. Update plot status
      await this.plotsService.markAsMinted(
        plotId,
        (tokenId - 1n).toString(),
        receipt.hash,
      );

      return {
        message: 'Minting transaction successful',
        transactionHash: receipt.hash,
        tokenId: (tokenId - 1n).toString(),
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error('Error minting property NFT', error);
      throw error;
    }
  }

  async getAllNfts() {
    // In a real app, you might fetch from blockchain or just query minted plots
    return this.plotsService.findByStatus(PlotStatus.MINTED);
  }

  async getNftById(id: string) {
    const plot = await this.plotsService.findOne(id);
    if (plot.status !== PlotStatus.MINTED) {
      throw new NotFoundException('NFT not found');
    }
    return plot;
  }
}
