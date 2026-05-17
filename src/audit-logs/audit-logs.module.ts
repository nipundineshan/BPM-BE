import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogsService],
  controllers: [AuditLogsController],
  exports: [TypeOrmModule, AuditLogsService],
})
export class AuditLogsModule {}
