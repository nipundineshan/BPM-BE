import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot, PlotStatus } from '../../entities/plot.entity/plot.entity';
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

  async create(createPlotDto: CreatePlotDto, user: User): Promise<Plot> {
    const plot = this.plotRepository.create({
      ...createPlotDto,
      owner: user,
      status: PlotStatus.DRAFT,
    });
    return await this.plotRepository.save(plot);
  }

  async findAll(): Promise<Plot[]> {
    return await this.plotRepository.find({ relations: ['owner'] });
  }

  async findByStatus(status: PlotStatus): Promise<Plot[]> {
    return await this.plotRepository.find({ where: { status }, relations: ['owner'] });
  }

  async findByUser(userId: string): Promise<Plot[]> {
    return await this.plotRepository.find({ 
      where: { owner: { id: userId } },
      relations: ['owner']
    });
  }

  async findOne(id: string): Promise<Plot> {
    const plot = await this.plotRepository.findOne({ 
      where: { id }, 
      relations: ['owner'] 
    });
    if (!plot) throw new NotFoundException('Plot not found');
    return plot;
  }

  async update(id: string, updateData: Partial<Plot>, userId: string): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.owner.id !== userId && plot.status !== PlotStatus.DRAFT) {
      throw new BadRequestException('Cannot update plot after submission');
    }
    Object.assign(plot, updateData);
    return await this.plotRepository.save(plot);
  }

  async submitForApproval(id: string, userId: string): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.owner.id !== userId) {
      throw new BadRequestException('Unauthorized');
    }
    if (plot.status !== PlotStatus.DRAFT && plot.status !== PlotStatus.REJECTED) {
      throw new BadRequestException('Plot already submitted or processed');
    }
    plot.status = PlotStatus.SUBMITTED;
    return await this.plotRepository.save(plot);
  }

  async approve(id: string): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.status !== PlotStatus.SUBMITTED) {
      throw new BadRequestException('Plot not in submitted state');
    }
    plot.status = PlotStatus.APPROVED;
    return await this.plotRepository.save(plot);
  }

  async reject(id: string): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.status !== PlotStatus.SUBMITTED) {
      throw new BadRequestException('Plot not in submitted state');
    }
    plot.status = PlotStatus.REJECTED;
    return await this.plotRepository.save(plot);
  }

  async uploadMetadataToIpfs(id: string): Promise<string> {
    const plot = await this.findOne(id);
    
    if (plot.status !== PlotStatus.APPROVED) {
      throw new BadRequestException('Plot must be approved before IPFS upload');
    }

    const metadata = {
      name: plot.plotName,
      description: plot.description,
      image: plot.propertyImages?.[0] || '',
      attributes: [
        { trait_type: 'Survey Number', value: plot.surveyNumber },
        { trait_type: 'Area Size', value: plot.areaSize },
        { trait_type: 'Location', value: plot.address },
        { trait_type: 'Market Value', value: plot.marketValue.toString() },
        { trait_type: 'Registration Number', value: plot.registrationNumber },
      ],
      properties: {
        owner: plot.owner.fullName,
        ownerWallet: plot.owner.walletAddress,
        documents: plot.legalDocuments
      }
    };

    const ipfsCid = await this.ipfsService.uploadJson(metadata);
    plot.ipfsCid = ipfsCid;
    await this.plotRepository.save(plot);
    
    return ipfsCid;
  }

  async markAsMinted(id: string, tokenId: string, transactionHash: string): Promise<Plot> {
    const plot = await this.findOne(id);
    plot.status = PlotStatus.MINTED;
    plot.tokenId = tokenId;
    plot.transactionHash = transactionHash;
    return await this.plotRepository.save(plot);
  }
}
