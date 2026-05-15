import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { UserRole, UserStatus } from '../../entities/user.entity/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private usersService: UsersService) {}

  @Get('users/pending')
  @ApiOperation({ summary: 'Get list of users pending approval' })
  async getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @Post('users/:id/approve')
  @ApiOperation({ summary: 'Approve a user account' })
  async approveUser(@Param('id') id: string, @Request() req) {
    return this.usersService.setStatus(id, UserStatus.APPROVED, req.user.id);
  }

  @Post('users/:id/reject')
  @ApiOperation({ summary: 'Reject a user account' })
  async rejectUser(@Param('id') id: string, @Request() req) {
    return this.usersService.setStatus(id, UserStatus.REJECTED, req.user.id);
  }
}
