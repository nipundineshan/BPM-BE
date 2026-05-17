import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plot, PlotStatus } from '../../entities/plot.entity/plot.entity';
import { PropertyImage } from '../../entities/property-image.entity';
import { LegalDocument } from '../../entities/legal-document.entity';
import { IpfsService } from '../../../ipfs/ipfs.service';
import { User } from '../../../users/entities/user.entity/user.entity';
import { CreatePlotDto } from '../../dto/create-plot.dto/create-plot.dto';
import { UsersService } from '../../../users/services/users/users.service';

@Injectable()
export class PlotsService {
  constructor(
    @InjectRepository(Plot)
    private plotRepository: Repository<Plot>,
    @InjectRepository(PropertyImage)
    private propertyImageRepository: Repository<PropertyImage>,
    @InjectRepository(LegalDocument)
    private legalDocumentRepository: Repository<LegalDocument>,
    private ipfsService: IpfsService,
    private usersService: UsersService,
  ) {}

  private validateFiles(files: {
    propertyImages?: Express.Multer.File[];
    legalDocuments?: Express.Multer.File[];
  }) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedDocTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (files.propertyImages) {
      for (const file of files.propertyImages) {
        if (!allowedImageTypes.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid image type: ${file.mimetype}`);
        }
        if (file.size > maxSize) {
          throw new BadRequestException(`Image too large: ${file.originalname}`);
        }
      }
    }

    if (files.legalDocuments) {
      for (const file of files.legalDocuments) {
        if (!allowedDocTypes.includes(file.mimetype)) {
          throw new BadRequestException(`Invalid document type: ${file.mimetype}`);
        }
        if (file.size > maxSize) {
          throw new BadRequestException(`Document too large: ${file.originalname}`);
        }
      }
    }
  }

  async create(
    createPlotDto: CreatePlotDto,
    user: User,
    files: {
      propertyImages?: Express.Multer.File[];
      legalDocuments?: Express.Multer.File[];
    },
  ): Promise<Plot> {
    this.validateFiles(files);

    const plot = this.plotRepository.create({
      ...createPlotDto,
      owner: user,
      status: PlotStatus.DRAFT,
    });

    const savedPlot = await this.plotRepository.save(plot);

    if (files.propertyImages) {
      for (const file of files.propertyImages) {
        const image = this.propertyImageRepository.create({
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          data: file.buffer,
          plot: savedPlot,
        });
        await this.propertyImageRepository.save(image);
      }
    }

    if (files.legalDocuments) {
      for (const file of files.legalDocuments) {
        const doc = this.legalDocumentRepository.create({
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          data: file.buffer,
          plot: savedPlot,
        });
        await this.legalDocumentRepository.save(doc);
      }
    }

    return this.findOne(savedPlot.id);
  }

  async findAll(): Promise<Plot[]> {
    return await this.plotRepository.find({
      relations: ['owner', 'propertyImages', 'legalDocuments'],
    });
  }

  async findByStatus(status: PlotStatus): Promise<Plot[]> {
    return await this.plotRepository.find({
      where: { status },
      relations: ['owner', 'propertyImages', 'legalDocuments'],
    });
  }

  async findByUser(userId: string): Promise<Plot[]> {
    return await this.plotRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner', 'propertyImages', 'legalDocuments'],
    });
  }

  async findOne(id: string): Promise<Plot> {
    const plot = await this.plotRepository.findOne({
      where: { id },
      relations: ['owner', 'propertyImages', 'legalDocuments'],
    });
    if (!plot) throw new NotFoundException('Plot not found');
    return plot;
  }

  async update(
    id: string,
    updateData: Partial<Plot>,
    userId: string,
    files?: {
      propertyImages?: Express.Multer.File[];
      legalDocuments?: Express.Multer.File[];
    },
  ): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.owner.id !== userId && plot.status !== PlotStatus.DRAFT) {
      throw new BadRequestException('Cannot update plot after submission');
    }

    if (files) {
      this.validateFiles(files);
      if (files.propertyImages && files.propertyImages.length > 0) {
        for (const file of files.propertyImages) {
          const image = this.propertyImageRepository.create({
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            data: file.buffer,
            plot,
          });
          await this.propertyImageRepository.save(image);
        }
      }
      if (files.legalDocuments && files.legalDocuments.length > 0) {
        for (const file of files.legalDocuments) {
          const doc = this.legalDocumentRepository.create({
            fileName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            data: file.buffer,
            plot,
          });
          await this.legalDocumentRepository.save(doc);
        }
      }
    }

    if (updateData && Object.keys(updateData).length > 0) {
      Object.assign(plot, updateData);
    }
    
    await this.plotRepository.save(plot);
    return this.findOne(id);
  }

  async submitForApproval(id: string, userId: string): Promise<Plot> {
    const plot = await this.findOne(id);
    if (plot.owner.id !== userId) {
      throw new BadRequestException('Unauthorized');
    }
    if (
      plot.status !== PlotStatus.DRAFT &&
      plot.status !== PlotStatus.REJECTED
    ) {
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
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    const metadata = {
      name: plot.plotName,
      description: plot.description,
      image: plot.propertyImages?.length > 0 
        ? `${baseUrl}/plots/image/${plot.propertyImages[0].id}`
        : '',
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
        documents: plot.legalDocuments?.map(doc => `${baseUrl}/plots/document/${doc.id}`) || []
      }
    };

    const ipfsCid = await this.ipfsService.uploadJson(metadata);
    plot.ipfsCid = ipfsCid;
    await this.plotRepository.save(plot);

    return ipfsCid;
  }

  async markAsMinted(
    id: string,
    tokenId: string,
    transactionHash: string,
  ): Promise<Plot> {
    const plot = await this.findOne(id);
    plot.status = PlotStatus.MINTED;
    plot.tokenId = tokenId;
    plot.transactionHash = transactionHash;
    return await this.plotRepository.save(plot);
  }

  async findImageById(id: string): Promise<PropertyImage> {
    const image = await this.propertyImageRepository.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async findDocumentById(id: string): Promise<LegalDocument> {
    const doc = await this.legalDocumentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getGlobalStats() {
    const totalPlots = await this.plotRepository.count();
    const approvedPlots = await this.plotRepository.count({
      where: { status: PlotStatus.APPROVED },
    });
    const mintedPlots = await this.plotRepository.count({
      where: { status: PlotStatus.MINTED },
    });

    const totalValueResult = await this.plotRepository
      .createQueryBuilder('plot')
      .select('SUM(plot.marketValue)', 'total')
      .where('plot.status IN (:...statuses)', {
        statuses: [PlotStatus.APPROVED, PlotStatus.MINTED],
      })
      .getRawOne();

    const monthlyActivity = await this.plotRepository
      .createQueryBuilder('plot')
      .select("TO_CHAR(plot.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .limit(6)
      .getRawMany();

    const roleCounts = await this.usersService.getRoleCounts();

    return {
      stats: {
        totalPlots,
        approvedPlots,
        mintedPlots,
        totalMarketValue: parseFloat(totalValueResult.total || '0'),
      },
      monthlyActivity,
      roleCounts,
    };
  }
}
