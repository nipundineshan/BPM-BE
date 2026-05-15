import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole, UserStatus } from '../../entities/user.entity/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    // Super Admin Seeding
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL') || 'superadmin@bpm.com';
    const superAdminName = this.configService.get<string>('SUPER_ADMIN_NAME') || 'Super Admin';
    const superAdminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD') || 'SuperAdmin@123';
    const superAdminPhone = this.configService.get<string>('SUPER_ADMIN_PHONE');

    const superAdmin = await this.usersService.findByEmail(superAdminEmail);

    if (!superAdmin) {
      this.logger.log('Seeding initial Super Admin...');
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      await this.usersService.create({
        email: superAdminEmail,
        fullName: superAdminName,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.APPROVED,
        phoneNumber: superAdminPhone,
      });
      this.logger.log('Super Admin seeded successfully.');
    }

    // Default Admin Seeding
    const adminEmail = 'admin@bpm.com';
    const admin = await this.usersService.findByEmail(adminEmail);

    if (!admin) {
      this.logger.log('Seeding initial admin...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await this.usersService.create({
        email: adminEmail,
        fullName: 'System Admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.APPROVED,
      });
      this.logger.log('Admin seeded successfully.');
    }
  }
}
