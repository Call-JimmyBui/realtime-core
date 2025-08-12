import { QueueName } from '@/constants/job.constant';
import { RedisService } from '@/redis/redis.service';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { redisStore } from 'cache-manager-ioredis-yet';
import { User, UserSchema } from '../user/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthProvider, AuthProviderSchema } from './schemas/auth-provider.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    //DB
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AuthProvider.name, schema: AuthProviderSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    //JWT-AUTH
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    //EMAIL
    BullModule.registerQueue({
      name: QueueName.EMAIL,
    }),
    //REDIS
    CacheModule.registerAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),

    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisService, JwtStrategy],
  exports:[AuthService]
})
export class AuthModule {}