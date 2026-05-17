import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  UserStatus,
  UserRole,
} from '../../entities/user.entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new BadRequestException('Email is required');
    }
    if (!userData.fullName) {
      throw new BadRequestException('Full name is required');
    }

    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.userRepository.find({ where: { role } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['plots'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    if (!updateData || Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }
    const user = await this.findOne(id);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async setStatus(
    id: string,
    status: UserStatus,
    approvedBy?: string,
  ): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    if (status === UserStatus.APPROVED) {
      user.approvedAt = new Date();
      user.approvedBy = approvedBy || null;
    }
    return this.userRepository.save(user);
  }

  async toggleActive(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async updateLoginStats(id: string): Promise<void> {
    await this.userRepository.increment({ id }, 'loginCount', 1);
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }

  async getPendingUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: UserStatus.PENDING_APPROVAL, role: UserRole.USER },
    });
  }

  async getRoleCounts(): Promise<Record<string, number>> {
    const counts = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const result = {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 0,
      [UserRole.SUPER_ADMIN]: 0,
    };

    counts.forEach((c) => {
      result[c.role] = parseInt(c.count);
    });

    return result;
  }

  async findAdmins(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.ADMIN },
    });
  }
}
