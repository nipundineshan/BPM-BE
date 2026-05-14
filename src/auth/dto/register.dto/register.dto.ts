import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '0x123...', required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiProperty({ enum: ['user', 'admin'], default: 'user', required: false })
  @IsString()
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string = 'user';
}
