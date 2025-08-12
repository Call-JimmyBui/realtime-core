
import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MailConfig } from './mail-config.type';
import { validateConfig } from '@/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  EMAIL_SERVICE_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  EMAIL_SERVICE_PORT: number;

  @IsString()
  @IsOptional()
  EMAIL_SERVICE_USER: string;

  @IsString()
  @IsOptional()
  EMAIL_SERVICE_PASS: string;

  @IsBoolean()
  @IsOptional()
  MAIL_IGNORE_TLS: boolean;

  @IsBoolean()
  EMAIL_SERVICE_SECURE: boolean;

  @IsBoolean()
  @IsOptional()
  MAIL_REQUIRE_TLS: boolean;

  @IsEmail()
  @IsNotEmpty()
  EMAIL_FROM: string;
}

export default registerAs<MailConfig>('mail', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    host: process.env.EMAIL_SERVICE_HOST,
    port: process.env.EMAIL_SERVICE_PORT ? parseInt(process.env.EMAIL_SERVICE_PORT, 10) : 587,
    user: process.env.EMAIL_SERVICE_USER,
    password: process.env.EMAIL_SERVICE_PASS,

    ignoreTLS: process.env.MAIL_IGNORE_TLS === 'true',
    secure: process.env.EMAIL_SERVICE_SECURE === 'true',
    requireTLS: process.env.MAIL_REQUIRE_TLS === 'true',
    
    defaultEmail: process.env.EMAIL_FROM,
    defaultName: process.env.EMAIL_FROM,
  };
});