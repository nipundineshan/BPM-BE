import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreatePlotDto {
  @ApiProperty({ example: 'Sunshine Valley' })
  @IsString()
  @IsNotEmpty()
  plotName: string;

  @ApiProperty({ example: 'A beautiful residential plot with mountain views.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'SN-12345' })
  @IsString()
  @IsNotEmpty()
  surveyNumber: string;

  @ApiProperty({ example: '1200 sq ft' })
  @IsString()
  @IsNotEmpty()
  areaSize: string;

  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ example: '123 MG Road' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @IsNotEmpty()
  marketValue: number;

  @ApiProperty({ example: 'REG-98765' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: ['http://image1.com', 'http://image2.com'], required: false })
  @IsArray()
  @IsOptional()
  propertyImages?: string[];

  @ApiProperty({ example: ['http://doc1.com'], required: false })
  @IsArray()
  @IsOptional()
  legalDocuments?: string[];
}
