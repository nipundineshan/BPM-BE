import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity/user.entity';
import { UsersService } from './services/users/users.service';
import { UsersController, AdminUsersController } from './controllers/users/users.controller';
import { SuperAdminController } from './controllers/super-admin/super-admin.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { SeedService } from './services/users/seed.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuditLogsModule],
  providers: [UsersService, SeedService],
  controllers: [
    UsersController, 
    AdminUsersController, 
    SuperAdminController, 
    AdminController
  ],
  exports: [UsersService],
})
export class UsersModule {}
