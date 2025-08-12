import { validateConfig } from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthConfig } from './auth-config.type';
import { IsMs } from '@/decorators/validators/is-ms.decorator';
import { Logger } from '@/helpers/loggerHelper';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  AUTH_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  AUTH_CONFIRM_EMAIL_SECRET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;

}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    secret: process.env.AUTH_JWT_SECRET ?? '',
    expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN ?? '',
    refreshSecret: process.env.AUTH_REFRESH_SECRET ?? '',
    refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN ?? '',
    confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET ?? '',
    confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN ?? '',
  };
});