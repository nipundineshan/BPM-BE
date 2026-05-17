import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../entities/user.entity/user.entity';
import { AuditLogsService } from '../../../audit-logs/services/audit-logs.service';
import { RegisterDto } from '../../../auth/dto/register.dto/register.dto';
import * as bcrypt from 'bcrypt';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(AuditLogInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private auditLogsService: AuditLogsService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('pending-approvals')
  @ApiOperation({ summary: 'List users pending approval' })
  async getPendingApprovals() {
    return this.usersService.getPendingUsers();
  }

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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities for the current user' })
  async getActivities(@Request() req) {
    return this.auditLogsService.findByUser(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admins')
  @ApiOperation({ summary: 'List all ADMIN accounts' })
  async findAllAdmins() {
    return this.usersService.findAdmins();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Post('admins')
  @ApiOperation({ summary: 'Create a new administrator account' })
  async createAdmin(@Body() adminData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    return this.usersService.create({
      ...adminData,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
    });
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
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.setStatus(id, status);
  }
}
