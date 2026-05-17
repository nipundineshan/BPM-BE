import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 100, // Limit for performance
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async log(action: string, module: string, user: any, details?: any, ipAddress?: string): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      action,
      module,
      user,
      details,
      ipAddress,
    });
    return this.auditLogRepository.save(log);
  }
}
