import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './services/audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all audit logs (Super Admin only)' })
  async findAll() {
    return this.auditLogsService.findAll();
  }
}
