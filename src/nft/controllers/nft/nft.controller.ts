import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { NftService } from '../../services/nft/nft.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('NFT Operations')
@Controller('nft')
export class NftController {
  constructor(private nftService: NftService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('mint/:plotId')
  @ApiOperation({ summary: 'Mint a property as an NFT on Sepolia' })
  async mint(@Param('plotId') plotId: string) {
    return this.nftService.mintPropertyNft(plotId);
  }
}
