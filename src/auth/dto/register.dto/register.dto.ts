import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../../../users/entities/user.entity/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '0x123...', required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiProperty({ example: 'Aadhaar123', required: false })
  @IsString()
  @IsOptional()
  governmentId?: string;

  @ApiProperty({ example: '123 Main St, City, Country', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
