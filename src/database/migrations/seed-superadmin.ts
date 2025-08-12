
import { User } from '@/apis/user/schemas/user.schema';
import { AuthProviderType, ROLE } from '@/constants/entity-enum.constant';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from '../../apis/auth/schemas/role.schema';
import { AppModule } from '../../app.module';
import * as dotenv from 'dotenv';
import { Types } from 'mongoose';
import { AuthProvider } from '@/apis/auth/schemas/auth-provider.schema';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.createApplicationContext(AppModule);

  const roleModel = app.get(getModelToken(Role.name));
  const userModel = app.get(getModelToken(User.name));
  const authProviderModel = app.get(getModelToken(AuthProvider.name));

  const roleIds: Record<string, Types.ObjectId> = {};

  // Seed tất cả role từ enum
  for (const roleName of Object.values(ROLE)) {
    let role = await roleModel.findOne({ rolename: roleName });
    if (!role) {
      role = await roleModel.create({
        rolename: roleName,
        description: `${roleName} role`,
      });
      console.log(`Created role: ${roleName}`);
    }
    roleIds[roleName] = role._id;
  }
  
  // Lấy thông tin admin từ biến môi trường
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || '123456';
  
  // Seed user superadmin nếu chưa tồn tại
  let user = await userModel.findOne({ email: superAdminEmail });
  
  if (!user) {

    const authProvider = await authProviderModel.create({
        providerType: AuthProviderType.EMAIL_PASSWORD,
        email: superAdminEmail,
        password: superAdminPassword,
    });
    
    user = await userModel.create({
      name: superAdminName,
      email: superAdminEmail,
      authProviderId: authProvider._id,
      roles: [roleIds[ROLE.SUPER_ADMIN]],
      isVerify: true,
      isActive: true,
    });
    console.log(`Created superadmin user: ${user.email}`);
  }

  await app.close();
}

bootstrap();