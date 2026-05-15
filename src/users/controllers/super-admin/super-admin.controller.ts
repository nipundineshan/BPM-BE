import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { UserRole, UserStatus } from '../../entities/user.entity/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';

@ApiTags('Super Admin')
@Controller('super-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private usersService: UsersService) {}

  @Post('admins')
  @ApiOperation({ summary: 'Create a new ADMIN account' })
  async createAdmin(@Body() adminData: any) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    return this.usersService.create({
      ...adminData,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
    });
  }

  @Get('admins')
  @ApiOperation({ summary: 'List all ADMIN accounts' })
  async findAllAdmins() {
    return this.usersService.findByRole(UserRole.ADMIN);
  }

  @Patch('admins/:id/status')
  @ApiOperation({ summary: 'Activate/Deactivate ADMIN account' })
  async updateAdminStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.toggleActive(id, isActive);
  }
}
