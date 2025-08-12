// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AuthModule } from './apis/auth/auth.module';
import { MailModule } from './email/mail.module';
import { UserModule } from './apis/user/user.module';
import appConfig from './config/app-config';
import databaseConfig from './database/config/database.config';
import mailConfig from './email/config/mail.config';
import authConfig from './apis/auth/config/auth-config';
import { BullModule } from '@nestjs/bullmq';
import { ProductsModule } from './apis/product/product.module';
import { OrderModule } from './apis/order/order.module';
import { CartModule } from './apis/cart/cart.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, mailConfig, authConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),

    
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: 3600,
      }),
      inject: [ConfigService],
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),


    AuthModule,
    MailModule,
    UserModule,
    ProductsModule,
    OrderModule,
    CartModule
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}