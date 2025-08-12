import { QueueName } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthProvider, AuthProviderSchema } from '../auth/schemas/auth-provider.schema';
import { Role, RoleSchema } from '../auth/schemas/role.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AuthProvider.name, schema: AuthProviderSchema },
    ]),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
