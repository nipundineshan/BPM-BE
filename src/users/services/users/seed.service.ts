import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '../../entities/user.entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
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
      });
      this.logger.log('Admin seeded successfully.');
    }

    const userEmail = 'user@bpm.com';
    const user = await this.usersService.findByEmail(userEmail);

    if (!user) {
      this.logger.log('Seeding initial user...');
      const hashedPassword = await bcrypt.hash('User@123', 10);
      await this.usersService.create({
        email: userEmail,
        fullName: 'Default User',
        password: hashedPassword,
        role: UserRole.USER,
      });
      this.logger.log('User seeded successfully.');
    }
  }
}
