import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users/controllers/users/users.controller';
import { UsersService } from './users/services/users/users.service';
import { PlotsController } from './plots/controllers/plots/plots.controller';
import { PlotsService } from './plots/services/plots/plots.service';
import { NftController } from './nft/controllers/nft/nft.controller';
import { NftService } from './nft/services/nft/nft.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController, UsersController, PlotsController, NftController],
  providers: [AppService, UsersService, PlotsService, NftService],
})
export class AppModule {}
