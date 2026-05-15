import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsModule } from '../../audit-logs/audit-logs.module';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    return next.handle().pipe(
      tap((data) => {
        if (method !== 'GET' && user) {
          this.auditLogRepository.save({
            action: `${method} ${url}`,
            module: url.split('/')[2] || 'unknown',
            user: user,
            ipAddress: ip,
            details: { response: data },
          });
        }
      }),
    );
  }
}
