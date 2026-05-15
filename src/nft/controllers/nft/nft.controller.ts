import { Controller, Post, Param, Get, UseGuards } from '@nestjs/common';
import { NftService } from '../../services/nft/nft.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../../../users/entities/user.entity/user.entity';

@ApiTags('NFT Operations')
@Controller('nfts')
export class NftController {
  constructor(private nftService: NftService) {}

  @Get()
  @ApiOperation({ summary: 'List all minted NFTs' })
  async findAll() {
    return this.nftService.getAllNfts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get NFT details' })
  async findOne(@Param('id') id: string) {
    return this.nftService.getNftById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('mint/:plotId')
  @ApiOperation({ summary: 'Mint a property as an NFT (Admin Only)' })
  async mint(@Param('plotId') plotId: string) {
    return this.nftService.mintPropertyNft(plotId);
  }
}
