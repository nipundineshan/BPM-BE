import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot } from '../../entities/plot.entity/plot.entity';
import { IpfsService } from '../../../ipfs/ipfs.service';
import { User } from '../../../users/entities/user.entity/user.entity';
import { CreatePlotDto } from '../../dto/create-plot.dto/create-plot.dto';

@Injectable()
export class PlotsService {
  constructor(
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
    private ipfsService: IpfsService,
  ) {}

  async create(createPlotDto: CreatePlotDto, user: User) {
    const plot = this.plotRepository.create({
      ...createPlotDto,
      owner: user,
    });
    return await this.plotRepository.save(plot);
  }

  async findAll() {
    return await this.plotRepository.find({ relations: ['owner'] });
  }

  async findOne(id: string) {
    const plot = await this.plotRepository.findOne({ 
      where: { id }, 
      relations: ['owner'] 
    });
    if (!plot) throw new NotFoundException('Plot not found');
    return plot;
  }

  async uploadMetadataToIpfs(id: string): Promise<{ ipfsHash: string; metadata: Record<string, unknown> }> {
    const plot = await this.findOne(id);
    
    const metadata: Record<string, unknown> = {
      name: plot.title,
      description: plot.description,
      image: plot.imageUrl,
      attributes: [
        { trait_type: 'Location', value: plot.location },
        { trait_type: 'Price', value: plot.price.toString() },
        { trait_type: 'Property ID', value: plot.id },
        { trait_type: 'Verification Status', value: plot.verificationStatus },
      ],
      properties: {
        documentUrl: plot.documentUrl,
        ownerEmail: plot.owner.email,
        walletAddress: plot.owner.walletAddress
      }
    };

    const ipfsHash = await this.ipfsService.uploadJson(metadata);
    plot.ipfsHash = ipfsHash;
    await this.plotRepository.save(plot);
    
    return { ipfsHash, metadata };
  }

  async updateStatus(id: string, status: string, tokenId?: number) {
    const plot = await this.findOne(id);
    plot.verificationStatus = status;
    if (tokenId !== undefined) {
      plot.tokenId = tokenId;
      plot.isMinted = true;
    }
    return await this.plotRepository.save(plot);
  }
}
