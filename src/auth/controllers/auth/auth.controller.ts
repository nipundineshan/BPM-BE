import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterDto } from '../../dto/register.dto/register.dto';
import { LoginDto } from '../../dto/login.dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get JWT' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
