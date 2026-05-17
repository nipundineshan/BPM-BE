import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { PlotsService } from '../../services/plots/plots.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { CreatePlotDto } from '../../dto/create-plot.dto/create-plot.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { PlotStatus } from '../../entities/plot.entity/plot.entity';
import { UserRole } from '../../../users/entities/user.entity/user.entity';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@ApiTags('Plots')
@Controller('plots')
@UseInterceptors(AuditLogInterceptor)
export class PlotsController {
  constructor(private plotsService: PlotsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new plot' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'propertyImages', maxCount: 10 },
      { name: 'legalDocuments', maxCount: 10 },
    ]),
  )
  async create(
    @Body() createPlotDto: CreatePlotDto,
    @Request() req,
    @UploadedFiles()
    files: {
      propertyImages?: Express.Multer.File[];
      legalDocuments?: Express.Multer.File[];
    },
  ) {
    console.log('createPlotDto');
    console.log(createPlotDto);
    console.log(files);

    return this.plotsService.create(createPlotDto, req.user, files);
  }

  @Get()
  @ApiOperation({ summary: 'List all plots' })
  async findAll() {
    return this.plotsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-plots')
  @ApiOperation({ summary: 'List own plots' })
  async findMyPlots(@Request() req) {
    return this.plotsService.findByUser(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getStats() {
    return this.plotsService.getGlobalStats();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('global-stats')
  @ApiOperation({
    summary: 'Get global platform statistics (Super Admin only)',
  })
  async getGlobalStats() {
    return this.plotsService.getGlobalStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plot details' })
  async findOne(@Param('id') id: string) {
    return this.plotsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update plot' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'propertyImages', maxCount: 10 },
      { name: 'legalDocuments', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req,
    @UploadedFiles()
    files: {
      propertyImages?: Express.Multer.File[];
      legalDocuments?: Express.Multer.File[];
    },
  ) {
    return this.plotsService.update(id, updateData, req.user.id, files);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit plot for approval' })
  async submit(@Param('id') id: string, @Request() req) {
    return this.plotsService.submitForApproval(id, req.user.id);
  }

  @Get('image/:id')
  @ApiOperation({ summary: 'Get property image' })
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const image = await this.plotsService.findImageById(id);
    res.set({
      'Content-Type': image.mimeType,
      'Content-Length': image.data.length,
      'Content-Disposition': `inline; filename="${image.fileName}"`,
    });
    res.send(image.data);
  }

  @Get('document/:id')
  @ApiOperation({ summary: 'Get legal document' })
  async getDocument(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.plotsService.findDocumentById(id);
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Length': doc.data.length,
      'Content-Disposition': `attachment; filename="${doc.fileName}"`,
    });
    res.send(doc.data);
  }
}

@ApiTags('Admin Plot Management')
@Controller('admin/plots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPlotsController {
  constructor(private plotsService: PlotsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List plots pending approval' })
  async findPending() {
    return this.plotsService.findByStatus(PlotStatus.PENDING_APPROVAL);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve plot' })
  async approve(@Param('id') id: string) {
    return this.plotsService.approve(id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject plot' })
  async reject(@Param('id') id: string) {
    return this.plotsService.reject(id);
  }
}
