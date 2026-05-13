import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlotDto {
  @ApiProperty({ example: 'Sunset Valley Plot' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'A beautiful residential plot near the valley.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'California, USA' })
  @IsString()
  location: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'https://ipfs.io/ipfs/Qm...', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 'https://ipfs.io/ipfs/Qm...', required: false })
  @IsOptional()
  @IsUrl()
  documentUrl?: string;
}
