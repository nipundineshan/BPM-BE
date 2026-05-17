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
          const pathParts = url.split('/');
          const moduleName = pathParts.includes('v1')
            ? pathParts[pathParts.indexOf('v1') + 1]
            : pathParts[1] || 'unknown';

          this.auditLogRepository
            .insert({
              action: `${method} ${url}`,
              module: moduleName,
              user: { id: user.id },
              ipAddress: ip,
              details: {
                statusCode: context.switchToHttp().getResponse().statusCode,
              },
            })
            .catch((err) => {
              // Silently catch audit log errors to not disrupt main request
              console.error('Failed to save audit log:', err);
            });
        }
      }),
    );
  }
}
