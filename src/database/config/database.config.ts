import { validateConfig } from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  MONGO_URI: string;

  @IsString()
  @IsNotEmpty()
  MONGO_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  MONGO_PORT: number;

  @IsString()
  @IsNotEmpty()
  MONGO_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  MONGO_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MONGO_DB: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    uri: process.env.MONGO_URI ?? '',
    host: process.env.MONGO_HOST ?? '',
    port: process.env.MONGO_PORT ? parseInt(process.env.MONGO_PORT, 10) : 27017,
    username: process.env.MONGO_USERNAME ?? '',
    password: process.env.MONGO_PASSWORD ?? '',
    dbName: process.env.MONGO_DB ?? '',
  };
});
