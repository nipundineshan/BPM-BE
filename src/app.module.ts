import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlotsModule } from './plots/plots.module';
import { NftModule } from './nft/nft.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity/user.entity';
import { Plot } from './plots/entities/plot.entity/plot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Plot],
        synchronize: true, // Set to false in production
      }),
    }),
    AuthModule,
    PlotsModule,
    NftModule,
    BlockchainModule,
    IpfsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
