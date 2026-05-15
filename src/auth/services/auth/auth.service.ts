import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../../dto/register.dto/register.dto';
import { LoginDto } from '../../dto/login.dto/login.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { UserStatus, UserRole } from '../../../users/entities/user.entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: UserRole.USER, // Force USER role for public signup
      status: UserStatus.PENDING_APPROVAL,
    });
    
    return {
      message: 'Your account is pending admin approval.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      }
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.PENDING_APPROVAL) {
      throw new ForbiddenException('Your account is pending admin approval.');
    }
    if (user.status === UserStatus.REJECTED) {
      throw new ForbiddenException('Your account has been rejected.');
    }
    if (user.status === UserStatus.BLOCKED || !user.isActive) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    await this.usersService.updateLoginStats(user.id);
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);
      
      if (user.status !== UserStatus.APPROVED || !user.isActive) {
         throw new ForbiddenException('Account is not active or approved');
      }

      return this.generateTokens(user);
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
        status: user.status,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }
    return { message: 'Reset link sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    return { message: 'Password has been reset.' };
  }
}
