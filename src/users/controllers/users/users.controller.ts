import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../entities/user.entity/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@Request() req, @Body() updateData: any) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }
}

@ApiTags('Admin User Management')
@Controller('admin/users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.setStatus(id, status);
  }
}
