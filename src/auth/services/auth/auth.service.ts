import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../../dto/register.dto/register.dto';
import { LoginDto } from '../../dto/login.dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, walletAddress, role } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      walletAddress,
      role: role || 'user',
    });

    await this.userRepository.save(user);
    return this.login({ email, password });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'walletAddress']
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress
        }
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
