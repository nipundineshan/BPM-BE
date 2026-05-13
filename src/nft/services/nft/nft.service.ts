import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { BlockchainService } from '../../../blockchain/blockchain.service';
import { PlotsService } from '../../../plots/services/plots/plots.service';
import { ethers } from 'ethers';

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);

  constructor(
    private blockchainService: BlockchainService,
    private plotsService: PlotsService,
  ) {}

  async mintPropertyNft(plotId: string) {
    const plot = await this.plotsService.findOne(plotId);
    
    if (plot.isMinted) {
      throw new BadRequestException('Property already minted as NFT');
    }

    if (!plot.ipfsHash) {
      throw new BadRequestException('Property metadata must be uploaded to IPFS before minting');
    }

    if (!plot.owner.walletAddress) {
      throw new BadRequestException('Owner wallet address is missing');
    }

    try {
      this.logger.log(`Minting NFT for plot ${plotId} to ${plot.owner.walletAddress}`);
      
      const receipt = await this.blockchainService.mintProperty(
        plot.owner.walletAddress,
        `ipfs://${plot.ipfsHash}`
      );

      if (!receipt) {
        throw new Error('Transaction failed or was dropped');
      }

      return {
        message: 'Minting transaction successful',
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      this.logger.error('Error minting property NFT', error);
      throw error;
    }
  }

  // Verification and Transfer logic removed to align with existing contract ABI
  // If the contract is updated with these functions, they can be re-added.
}
