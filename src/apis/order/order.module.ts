import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { ProductsModule } from '../product/product.module';
import { RedisService } from '@/redis/redis.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),

    //REDIS
    CacheModule.registerAsync({
      imports: [ConfigModule], 
        useFactory: async (configService: ConfigService) => ({
            store: redisStore,
            url: configService.get('REDIS_URL'),
        }),
        inject: [ConfigService],
    }),

    ProductsModule, 
  ],
  controllers: [OrderController],
  providers: [OrderService, RedisService],
  exports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
})
export class OrderModule {}
