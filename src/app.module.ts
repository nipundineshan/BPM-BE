import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PlotsModule } from './plots/plots.module';
import { NftModule } from './nft/nft.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IpfsModule } from './ipfs/ipfs.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { TransactionsModule } from './transactions/transactions.module';
import { StorageModule } from './storage/storage.module';

import { User } from './users/entities/user.entity/user.entity';
import { Plot } from './plots/entities/plot.entity/plot.entity';
import { PropertyImage } from './plots/entities/property-image.entity';
import { LegalDocument } from './plots/entities/legal-document.entity';
import { Notification } from './notifications/entities/notification.entity';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { Transaction } from './transactions/entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
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
        entities: [
          User,
          Plot,
          PropertyImage,
          LegalDocument,
          Notification,
          AuditLog,
          Transaction,
        ],
        synchronize: true, // Set to false in production
      }),
    }),
    TypeOrmModule.forFeature([Plot]),
    AuthModule,
    PlotsModule,
    NftModule,
    BlockchainModule,
    IpfsModule,
    UsersModule,
    NotificationsModule,
    AuditLogsModule,
    TransactionsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
