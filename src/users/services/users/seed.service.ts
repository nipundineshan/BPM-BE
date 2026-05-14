import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmins();
  }

  async seedAdmins() {
    const admins = [
      {
        email: 'nipundineshan@gmail.com',
        password: 'nipundineshan@gmail.com',
        name: 'admin',
        role: 'admin',
      },
      {
        email: 'nipundineshan1@gmail.com',
        password: 'nipundineshan1@gmail.com',
        name: 'admin1',
        role: 'admin',
      },
    ];

    for (const adminData of admins) {
      const existingUser = await this.userRepository.findOne({
        where: { email: adminData.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const admin = this.userRepository.create({
          ...adminData,
          password: hashedPassword,
        });
        await this.userRepository.save(admin);
        this.logger.log(`Seeded admin user: ${adminData.email}`);
      } else {
        this.logger.debug(`Admin user already exists: ${adminData.email}`);
      }
    }
  }
}
