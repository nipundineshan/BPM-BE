import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PlotsService } from '../../services/plots/plots.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { CreatePlotDto } from '../../dto/create-plot.dto/create-plot.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Properties (Plots)')
@Controller('plots')
export class PlotsController {
  constructor(private plotsService: PlotsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new property plot' })
  async create(@Body() createPlotDto: CreatePlotDto, @Request() req) {
    return this.plotsService.create(createPlotDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all property plots' })
  async findAll() {
    return this.plotsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific plot' })
  async findOne(@Param('id') id: string) {
    return this.plotsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/ipfs')
  @ApiOperation({ summary: 'Generate and upload metadata to IPFS for a plot' })
  async uploadToIpfs(@Param('id') id: string) {
    return this.plotsService.uploadMetadataToIpfs(id);
  }
}
