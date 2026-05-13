import { Controller, Get, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { UsersService } from '../../services/users/users.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('User Profile')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('wallet')
  @ApiOperation({ summary: 'Update user wallet address' })
  @ApiBody({ schema: { properties: { walletAddress: { type: 'string', example: '0x123...' } } } })
  updateWallet(@Request() req, @Body('walletAddress') walletAddress: string) {
    return this.usersService.updateWallet(req.user.userId, walletAddress);
  }
}
